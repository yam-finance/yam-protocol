pragma solidity 0.5.17;

import "../lib/SafeMath.sol";

contract Rebaser {

    using SafeMath for uint256;

    struct Transaction {
        bool enabled;
        address destination;
        bytes data;
    }

    event TransactionFailed(address indexed destination, uint index, bytes data);

    /**
     * @notice Sets the market buy slippage max
     */
    event NewMaxSlippageFactor(uint256 oldSlippageFactor, uint256 newSlippageFactor);


    /**
     * @notice Sets the reserve contract
     */
    event NewReserveContract(address oldReserveContract, address newReserveContract);

    // Stable ordering is not guaranteed.
    Transaction[] public transactions;


    /// @notice Governance address
    address public gov;

    // If the current exchange rate is within this fractional distance from the target, no supply
    // update is performed. Fixed point number--same format as the rate.
    // (ie) abs(rate - targetRate) / targetRate < deviationThreshold, then no supply change.
    // DECIMALS Fixed point number.
    uint256 public deviationThreshold;

    // More than this much time must pass between rebase operations.
    uint256 public minRebaseTimeIntervalSec;

    // Block timestamp of last rebase operation
    uint256 public lastRebaseTimestampSec;

    // The rebase window begins this many seconds into the minRebaseTimeInterval period.
    // For example if minRebaseTimeInterval is 24hrs, it represents the time of day in seconds.
    uint256 public rebaseWindowOffsetSec;

    // The length of the time window where a rebase operation is allowed to execute, in seconds.
    uint256 public rebaseWindowLengthSec;

    // The number of rebase cycles since inception
    uint256 public epoch;

    // rebasing is not active initially. It can be activated at T+12 hours from
    // deployment time
    bool public rebasingActive;

    // delays rebasing activation to facilitate liquidity
    uint256 public constant rebaseDelay = 12 hours;

    // Time of TWAP initialization
    uint256 public timeOfTWAPInit;

    // YAM token address
    address public yamAddress;

    // reserve token
    address public reserveToken;

    // Reserves vault contract
    address public reservesContract;

    // pair for reserveToken <> YAM
    address public uniswap_pair;

    // last TWAP update time
    uint32 private blockTimestampLast;

    // last TWAP cumulative price;
    uint256 public priceCumulativeLast;

    // Max slippage factor when buying reserve token. Magic number based on
    // the fact that uniswap is a constant product. Therefore,
    // targeting a % max slippage can be achieved by using a single precomputed
    // number. i.e. 2.5% slippage is always equal to some f(maxSlippageFactor, reserves)
    uint256 public maxSlippageFactor;

    // This token is first in uniswap YAM<>Reserve pair
    bool public isToken0;

    constructor(
        address yamAddress_,
        address reserveToken_,
        address uniswap_factory,
        address reservesContract_,
        /* uint256 maxSlippageFactor_, */
        address gov_
    )
        public
    {
          minRebaseTimeIntervalSec = 12 hours;
          rebaseWindowOffsetSec = 36000;
          reservesContract = reservesContract_;
          (address token0, address token1) = sortTokens(yamAddress_, reserveToken_);

          // used for interacting with uniswap
          if (token0 == yamAddress_) {
              isToken0 = true;
          } else {
              isToken0 = false;
          }
          // uniswap YAM<>Reserve pair
          uniswap_pair = pairFor(uniswap_factory, token0, token1);

          // Reserves contract is mutable
          reservesContract = reservesContract_;

          // Reserve token is not mutable. Must deploy a new rebaser to update it
          reserveToken = reserveToken_;

          yamAddress = yamAddress_;

          gov = gov_;

          // target 2.5% slippage
          maxSlippageFactor = 1273937 * 10**10;
    }

    /** @notice Updates slippage factor
    *
    */
    function setMaxSlippageFactor(uint256 maxSlippageFactor_)
        public
        onlyGov
    {
        uint256 oldSlippageFactor = maxSlippageFactor_;
        maxSlippageFactor = maxSlippageFactor_;
        emit NewSlippageFactor(oldSlippageFactor, maxSlippageFactor_);
    }


    /** @notice Updates reserve contract
    *
    */
    function setReserveContract(address reservesContract_)
        public
        onlyGov
    {
        uint256 oldReservesContract = reservesContract;
        reservesContract = reservesContract_;
        emit NewReserveContract(oldReservesContract, reservesContract_);
    }

    /** @notice Initializes TWAP start point, starts countdown to first rebase
    *
    */
    function init_twap()
        public
    {
        require(timeOfTWAPInit == 0, "already activated");
        (uint priceCumulative, uint32 blockTimestamp) =
           UniswapV2OracleLibrary.currentCumulativePrices(uniswap_pair, isToken0);
        require(blockTimestamp > 0, "no trades");
        blockTimestampLast = blockTimestamp;
        priceCumulativeLast = priceCumulative;
        timeOfTWAPInit = blockTimestamp;
    }

    /** @notice Activates rebasing
    *   @dev One way function, cannot be undone, callable by anyone
    */
    function activate_rebasing()
        public
    {
        // cannot enable prior to end of rebaseDelay
        require(now >= timeOfTWAPInit + rebaseDelay, "!end_delay");
        // sanity check in case liquidity hasn't entered or no trades
        require(IUniswapV2Pair(uniswap_pair).price0CumulativeLast() > 0, "!liquid");
        // init price

        rebasingActive = true;
    }

    /**
     * @notice Initiates a new rebase operation, provided the minimum time period has elapsed.
     *
     * @dev The supply adjustment equals (_totalSupply * DeviationFromTargetRate) / rebaseLag
     *      Where DeviationFromTargetRate is (MarketOracleRate - targetRate) / targetRate
     *      and targetRate is CpiOracleRate / baseCpi
     */
    function rebase()
        public
    {
        require(inRebaseWindow());

        // This comparison also ensures there is no reentrancy.
        require(lastRebaseTimestampSec.add(minRebaseTimeIntervalSec) < now);

        // Snap the rebase time to the start of this window.
        lastRebaseTimestampSec = now.sub(
            now.mod(minRebaseTimeIntervalSec)).add(rebaseWindowOffsetSec);

        epoch = epoch.add(1);

        // get twap from uniswap v2;
        uint256 exchangeRate = getTWAP();

        // calculates % change to supply
        (uint256 indexDelta, bool positive) = computeSupplyDelta(exchangeRate);

        // Apply the Dampening factor.
        indexDelta = supplyDelta.div(rebaseLag);

        // cap to max scaling
        if (positive && YAM(yamAddress).yamsScalingFactor() + indexDelta < YAM(yamAddress).maxScalingFactor()) {
            indexDelta = YAM(yamAddress).maxScalingFactor() - YAM(yamAddress).yamsScalingFactor();
        }

        // preform actions before rebase
        beforeRebase(indexDelta, positive, exchangeRate);

        // rebase
        uint256 supplyAfterRebase = YAM(yamAddress).rebase(epoch, supplyDelta);
        assert(YAM(yamAddress).yamsScalingFactor() <= MAX_SCALING);
        emit Rebase(epoch, exchangeRate, supplyDelta, now);

        // perform actions after rebase
        afterRebase(supplyAfterRebase, indexDelta, positive, exchangeRate);
    }


    function uniswapV2Call(
        address sender,
        uint256 amount0,
        uint256 amount1,
        bytes calldata data
    )
        public
    {
        // enforce that it is coming from uniswap
        require(msg.sender == pair, "bad msg.sender");
        // enforce that this contract call uniswap
        require(sender == address(this), "bad origin");
        (uint256 yamsToUni, uint256 amountFromReserves, uint256 mintToReserves) = abi.decode(data, (uint256, uint256, uint256));

        YAM yam = YAM(yamAddress);

        if (amountFromReserves > 0) {
            // transfer from reserves and mint to uniswap
            yam.transferFrom(reservesContract, uniswap_pair, amountFromReserves);
            yam.mint(pair, yamsToUni - amountFromReserves);
        } else {
            // mint to uniswap
            yam.mint(pair, yamsToUni);
        }

        // mint unsold to reserves
        if (mintToReserves > 0) {
            yam.mint(reservesContract, mintToReserves);
        }
    }

    function buyReserveAndTransfer(
        uint256 indexDelta,
        bool positive,
        uint256 exchangeRate
    )
        internal
    {
        UniswapPair pair = UniswapPair(uniswap_pair);

        YAM yam = YAM(yamAddress);

        // get reserves
        (uint256 token0Reserves, uint256 token1Reserves, ) = pair.getReserves();

        // % of % change
        uint256 perc_mint = indexDelta.mul(rebaseMintPerc).div(10**18);

        uint256 totalSupply = yam.totalSupply();

        uint256 mintAmount = totalSupply.mul(perc_mint).div(10**18);

        // check if protocol has excess yam in the reserve
        uint256 excess = yam.balanceOf(reservesContract);

        uint256 tokens_to_max_slippage = uniswapMaxSlippage(token0Reserves, token1Reserves);


        // tries to sell all mint + excess
        // falls back to selling some of mint and all of excess
        // sells portion of excess
        if (isToken0) {
            if (tokens_to_max_slippage > mintAmount + excess) {
                // can handle all of reserves and mint
                uint256 buyTokens = getAmountOut(mintAmount + excess, token0Reserves, token1Reserves);

                // call swap using entire mint amount and excess; mint 0 to reserves
                pair.swap(0, buyTokens, abi.encode(mintAmount + excess, excess, 0));
            } else {
                if (tokens_to_max_slippage > excess) {
                    // uniswap can handle entire reserves
                    uint256 fromMint = tokens_to_max_slippage - excess;
                    uint256 buyTokens = getAmountOut(tokens_to_max_slippage, token0Reserves, token1Reserves);

                    // swap up to slippage limit, taking entire yam reserves, and minting part of total
                    pair.swap(0, buyTokens, abi.encode(tokens_to_max_slippage, excess, mintAmount - fromMint));
                } else {
                    // uniswap cant handle all of excess
                    uint256 remainingExcess = excess - tokens_to_max_slippage;
                    uint256 buyTokens = getAmountOut(tokens_to_max_slippage, token0Reserves, token1Reserves);

                    // swap up to slippage limit, taking excess - remainingExcess from reserves, and minting full amount
                    // to reserves
                    pair.swap(0, buyTokens, abi.encode(tokens_to_max_slippage, excess - remainingExcess, mintAmount));
                }
            }
        } else {
            if (tokens_to_max_slippage > mintAmount + excess) {
                // can handle all of reserves and mint
                uint256 buyTokens = getAmountOut(mintAmount + excess, token1Reserves, token0Reserves);

                // call swap using entire mint amount and excess; mint 0 to reserves
                pair.swap(buyTokens, 0, abi.encode(mintAmount + excess, excess, 0));
            } else {
                if (tokens_to_max_slippage > excess) {
                    // uniswap can handle entire reserves
                    uint256 fromMint = tokens_to_max_slippage - excess;
                    uint256 buyTokens = getAmountOut(tokens_to_max_slippage, token1Reserves, token0Reserves);

                    // swap up to slippage limit, taking entire yam reserves, and minting part of total
                    pair.swap(buyTokens, 0, abi.encode(tokens_to_max_slippage, excess, mintAmount - fromMint));
                } else {
                    // uniswap cant handle all of excess
                    uint256 remainingExcess = excess - tokens_to_max_slippage;
                    uint256 buyTokens = getAmountOut(tokens_to_max_slippage, token1Reserves, token0Reserves);
                    // swap up to slippage limit, taking excess - remainingExcess from reserves, and minting full amount
                    // to reserves
                    pair.swap(buyTokens, 0, abi.encode(tokens_to_max_slippage, excess - remainingExcess, mintAmount));
                }
            }
        }
    }

    function uniswapMaxSlippage(
        uint256 token0,
        uint256 token1
    )
      internal
      returns (uint256)
    {
        if (isToken0) {
          return token0.mul(maxSlippageFactor).div(10**18)
        } else {
          return token1.mul(maxSlippageFactor).div(10**18)
        }
    }

    // given an input amount of an asset and pair reserves, returns the maximum output amount of the other asset
   function getAmountOut(
        uint amountIn,
        uint reserveIn,
        uint reserveOut
    )
        internal
        pure
        returns (uint amountOut)
    {
       require(amountIn > 0, 'UniswapV2Library: INSUFFICIENT_INPUT_AMOUNT');
       require(reserveIn > 0 && reserveOut > 0, 'UniswapV2Library: INSUFFICIENT_LIQUIDITY');
       uint amountInWithFee = amountIn.mul(997);
       uint numerator = amountInWithFee.mul(reserveOut);
       uint denominator = reserveIn.mul(1000).add(amountInWithFee);
       amountOut = numerator / denominator;
   }


    function beforeRebase(
        uint256 indexDelta,
        bool positive,
        uint256 exchangeRate
    )
        internal
    {
        if (positive) {
            buyReserveAndTransfer(
                supplyDelta,
                positive,
                exchangeRate
            );
        }
    }


    function afterRebase(
        uint256 supplyAfterRebase,
        int256 supplyDelta,
        uint256 exchangeRate
    )
        internal
    {
        for (uint i = 0; i < transactions.length; i++) {
            Transaction storage t = transactions[i];
            if (t.enabled) {
                bool result =
                    externalCall(t.destination, t.data);
                if (!result) {
                    emit TransactionFailed(t.destination, i, t.data);
                    revert("Transaction Failed");
                }
            }
        }
    }


    /**
     * @notice Calculates TWAP from uniswap
     *
     * @dev When liquidity is low, this can be manipulated by an end of block -> next block
     *      attack. We delay the activation of rebases 12 hours after liquidity incentives
     *      to reduce this attack vector. Additional there is very little supply
     *      to be able to manipulate this during that time period of highest vuln.
     */
    function getTWAP()
        internal
        returns (uint256)
    {
      (uint priceCumulative, uint32 blockTimestamp) =
         UniswapV2OracleLibrary.currentCumulativePrices(uniswap_pair, isToken0);
       uint32 timeElapsed = blockTimestamp - blockTimestampLast; // overflow is desired

       // no period check as is done in isRebaseWindow

       // overflow is desired, casting never truncates
        // cumulative price is in (uq112x112 price * seconds) units so we simply wrap it after division by time elapsed
        FixedPoint.uq112x112 memory priceAverage = FixedPoint.uq112x112(uint224((priceCumulative - priceCumulativeLast) / timeElapsed));

        priceCumulativeLast = price0Cumulative;
        blockTimestampLast = blockTimestamp;

        return priceAverage.decode();
    }

    /**
     * @notice Sets the deviation threshold fraction. If the exchange rate given by the market
     *         oracle is within this fractional distance from the targetRate, then no supply
     *         modifications are made. DECIMALS fixed point number.
     * @param deviationThreshold_ The new exchange rate threshold fraction.
     */
    function setDeviationThreshold(uint256 deviationThreshold_)
        external
        onlyGov
    {
        deviationThreshold = deviationThreshold_;
    }

    /**
     * @notice Sets the rebase lag parameter.
               It is used to dampen the applied supply adjustment by 1 / rebaseLag
               If the rebase lag R, equals 1, the smallest value for R, then the full supply
               correction is applied on each rebase cycle.
               If it is greater than 1, then a correction of 1/R of is applied on each rebase.
     * @param rebaseLag_ The new rebase lag parameter.
     */
    function setRebaseLag(uint256 rebaseLag_)
        external
        onlyGov
    {
        require(rebaseLag_ > 0);
        rebaseLag = rebaseLag_;
    }

    /**
     * @notice Sets the parameters which control the timing and frequency of
     *         rebase operations.
     *         a) the minimum time period that must elapse between rebase cycles.
     *         b) the rebase window offset parameter.
     *         c) the rebase window length parameter.
     * @param minRebaseTimeIntervalSec_ More than this much time must pass between rebase
     *        operations, in seconds.
     * @param rebaseWindowOffsetSec_ The number of seconds from the beginning of
              the rebase interval, where the rebase window begins.
     * @param rebaseWindowLengthSec_ The length of the rebase window in seconds.
     */
    function setRebaseTimingParameters(
        uint256 minRebaseTimeIntervalSec_,
        uint256 rebaseWindowOffsetSec_,
        uint256 rebaseWindowLengthSec_)
        external
        onlyGov
    {
        require(minRebaseTimeIntervalSec_ > 0);
        require(rebaseWindowOffsetSec_ < minRebaseTimeIntervalSec_);

        minRebaseTimeIntervalSec = minRebaseTimeIntervalSec_;
        rebaseWindowOffsetSec = rebaseWindowOffsetSec_;
        rebaseWindowLengthSec = rebaseWindowLengthSec_;
    }

    /**
     * @return If the latest block timestamp is within the rebase time window it, returns true.
     *         Otherwise, returns false.
     */
    function inRebaseWindow() public view returns (bool) {

        // rebasing is delayed until there is a liquid market
        if (!rebasingActive) {
          return false;
        }

        return (
             now.mod(minRebaseTimeIntervalSec) >= rebaseWindowOffsetSec
             && now.mod(minRebaseTimeIntervalSec) < (rebaseWindowOffsetSec.add(rebaseWindowLengthSec))

        );
    }

    /**
     * @return Computes the total supply adjustment in response to the exchange rate
     *         and the targetRate.
     */
    function computeSupplyDelta(uint256 rate)
        private
        view
        returns (uint256, bool)
    {
        if (withinDeviationThreshold(rate, targetRate)) {
            return 0;
        }

        // indexDelta =  (rate - targetRate) / targetRate
        int256 targetRateSigned = targetRate.toInt256Safe();
        if (rate > targetRate) {
          return (rate.sub(targetRate).mul(10**18).div(targetRate), true);
        } else {
          return (targetRate.sub(rate).mul(10**18).div(targetRate), false);
        }
    }

    /**
     * @param rate The current exchange rate, an 18 decimal fixed point number.
     * @param targetRate The target exchange rate, an 18 decimal fixed point number.
     * @return If the rate is within the deviation threshold from the target rate, returns true.
     *         Otherwise, returns false.
     */
    function withinDeviationThreshold(uint256 rate)
        private
        view
        returns (bool)
    {
        uint256 absoluteDeviationThreshold = targetRate.mul(deviationThreshold)
            .div(10 ** DECIMALS);

        return (rate >= targetRate && rate.sub(targetRate) < absoluteDeviationThreshold)
            || (rate < targetRate && targetRate.sub(rate) < absoluteDeviationThreshold);
    }

    /* - Constructor Helpers - */

    // calculates the CREATE2 address for a pair without making any external calls
    function pairFor(
        address factory,
        address token0,
        address token1
    )
        internal
        pure
        returns (address pair)
    {
        pair = address(uint(keccak256(abi.encodePacked(
                hex'ff',
                factory,
                keccak256(abi.encodePacked(token0, token1)),
                hex'96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f' // init code hash
            ))));
    }

    // returns sorted token addresses, used to handle return values from pairs sorted in this order
    function sortTokens(
        address tokenA,
        address tokenB
    )
        internal
        pure
        returns (address token0, address token1)
    {
        require(tokenA != tokenB, 'UniswapV2Library: IDENTICAL_ADDRESSES');
        (token0, token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        require(token0 != address(0), 'UniswapV2Library: ZERO_ADDRESS');
    }

    /* -- Rebase helpers -- */

    /**
     * @notice Adds a transaction that gets called for a downstream receiver of rebases
     * @param destination Address of contract destination
     * @param data Transaction data payload
     */
    function addTransaction(address destination, bytes data)
        external
        onlyGov
    {
        transactions.push(Transaction({
            enabled: true,
            destination: destination,
            data: data
        }));
    }


    /**
     * @param index Index of transaction to remove.
     *              Transaction ordering may have changed since adding.
     */
    function removeTransaction(uint index)
        external
        onlyGov
    {
        require(index < transactions.length, "index out of bounds");

        if (index < transactions.length - 1) {
            transactions[index] = transactions[transactions.length - 1];
        }

        transactions.length--;
    }

    /**
     * @param index Index of transaction. Transaction ordering may have changed since adding.
     * @param enabled True for enabled, false for disabled.
     */
    function setTransactionEnabled(uint index, bool enabled)
        external
        onlyGov
    {
        require(index < transactions.length, "index must be in range of stored tx list");
        transactions[index].enabled = enabled;
    }

    /**
     * @dev wrapper to call the encoded transactions on downstream consumers.
     * @param destination Address of destination contract.
     * @param data The encoded data payload.
     * @return True on success
     */
    function externalCall(address destination, bytes data)
        internal
        returns (bool)
    {
        bool result;
        assembly {  // solhint-disable-line no-inline-assembly
            // "Allocate" memory for output
            // (0x40 is where "free memory" pointer is stored by convention)
            let outputAddress := mload(0x40)

            // First 32 bytes are the padded length of data, so exclude that
            let dataAddress := add(data, 32)

            result := call(
                // 34710 is the value that solidity is currently emitting
                // It includes callGas (700) + callVeryLow (3, to pay for SUB)
                // + callValueTransferGas (9000) + callNewAccountGas
                // (25000, in case the destination address does not exist and needs creating)
                sub(gas, 34710),


                destination,
                0, // transfer value in wei
                dataAddress,
                mload(data),  // Size of the input, in bytes. Stored in position 0 of the array.
                outputAddress,
                0  // Output is ignored, therefore the output size is zero
            )
        }
        return result;
    }
}
