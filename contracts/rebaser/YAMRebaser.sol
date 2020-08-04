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
        uint256 max_slippage_factor_
    )
        public
    {
          minRebaseTimeIntervalSec = 12 hours;
          rebaseWindowOffsetSec = 36000;
          reservesContract = reservesContract_;
          (address token0, address token1) = sortTokens(yamAddress_, reserveToken_);

          if (token0 == yamAddress_) {
              isToken0 = true;
          } else {
              isToken0 = false;
          }

          uniswap_pair = pairFor(uniswap_factory, token0, token1);

          // Reserves contract is upgradable
          reservesContract = reservesContract_;

          // Reserve token is not. Must deploy a new rebaser to update it
          reserveToken = reserveToken_;

          yamAddress = yamAddress_;
    }

    /** @notice Updates slippage factor
    *
    */
    function setMaxSlippageFactor(uint256 max_slippage_factor_)
        public
        onlyGov
    {
        uint256 oldSlippageFactor = max_slippage_factor;
        max_slippage_factor = max_slippage_factor_;
        emit NewSlippageFactor(oldSlippageFactor, max_slippage_factor_);
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

        int256 supplyDelta = computeSupplyDelta(exchangeRate);

        // Apply the Dampening factor.
        supplyDelta = supplyDelta.div(rebaseLag.toInt256Safe());

        if (supplyDelta > 0 && yamFrags.totalSupply().add(uint256(supplyDelta)) > MAX_SUPPLY) {
            supplyDelta = (MAX_SUPPLY.sub(yamFrags.totalSupply())).toInt256Safe();
        }

        beforeRebase(supplyDelta, exchangeRate);

        uint256 supplyAfterRebase = yamFrags.rebase(epoch, supplyDelta);
        assert(supplyAfterRebase <= MAX_SUPPLY);
        emit Rebase(epoch, exchangeRate, supplyDelta, now);

        afterRebase(supplyAfterRebase, supplyDelta, exchangeRate);
    }


    function buyReserveAndTransfer()
        internal
    {
        UniswapPair pair = UniswapPair(uniswap_pair);
        (uint256 token0Reserves, uint256 token1Reserves, ) = pair.getReserves();
        if (isToken0) {
          uint256 max_rebase_buy = _totalSupply * rebase_buy_factor;
          uint256 excess = YAM(yamAddress).balanceOf(reserveContract);
          if (excess > 0) {
              max_rebase_buy += excess;
          }
          uint256 max_uni_buy = token0Reserves * maxSlippageFactor;
          uint256 rebase_amt = min(max_rebase_buy, max_uni_buy);
          uint256 excess_to_reserves = max_rebase_buy - rebase_amt - excess;
        } else {

        }
    }

    function beforeRebase(
        int256 supplyDelta,
        uint256 exchangeRate
    )
        internal
    {
        buyReserveAndTransfer();

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
        returns (int256)
    {
        if (withinDeviationThreshold(rate, targetRate)) {
            return 0;
        }

        // supplyDelta = totalSupply * (rate - targetRate) / targetRate
        int256 targetRateSigned = targetRate.toInt256Safe();
        return yamFrags.totalSupply().toInt256Safe()
            .mul(rate.toInt256Safe().sub(targetRateSigned))
            .div(targetRateSigned);
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
