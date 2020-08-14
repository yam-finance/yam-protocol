# 🍖  HAM Protocol  🍖
## The Protocol
Ham is an experimental protocol building upon the most exciting innovations in programmable money and governance. Built by a team of DeFi natives, it seeks to create:

•	an elastic supply to seek eventual price stability<br/>
•	a governable treasury to further support stability<br/>
•	fully on-chain governance to enable decentralized control and evolution from Day 1<br/>
•	a fair distribution mechanism that incentivizes key community members to actively take the reins of governance

At its core, HAM is an elastic supply cryptocurrency, which expands and contracts its supply in response to market conditions, initially targeting 1 USD per HAM. This stability mechanism includes one key addition to existing elastic supply models such as Ampleforth: a portion of each supply expansion is used to buy yCurve (a high-yield USD-denominated stablecoin) and add it to the Ham treasury, which is controlled via Ham community governance.

We have built Ham to be a minimally viable monetary experiment, and at launch there will be zero value in the HAM token. After deployment, it is entirely dependent upon HAM holders to determine its value and future development. We have employed a fork of the Compound governance module, which will ensure all updates to the Ham protocol happen entirely on-chain through community voting.

## Audits

None. Contributors have given their best efforts to ensure the security of these contracts, but make no guarantees. It has been spot checked by just a few pairs of eyes. It is a probability - not just a possibility - that there are bugs. That said, minimal changes were made to the staking/distribution contracts that have seen hundreds of millions flow through them via SNX, YFI, and YFI derivatives. The reserve contract is excessively simple as well. We prioritized staked assets' security first and foremost.

The original devs encourage governance to fund a bug bounty/security audit

The token itself is largely based on COMP and Ampleforth which have undergone audits - but we made non-trivial changes.

The rebaser may also have bugs - but has been tested in multiple scenarios. It is restricted to Externally Owned Accounts (EOAs) calling the rebase function for added security. SafeMath is used everywhere.

If you feel uncomfortable with these disclousures, don't stake or hold HAM. If the community votes to fund an audit, or the community is gifted an audit, there is no assumption that the original devs will be around to implement fixes, and is entirely at their discretion.

## The Token
The core HAM token uses yCRV as the reserve currency, which is roughly a $1 peg. Each supply expansion (referred to as an inflating rebase), a portion of tokens is minted and used to build up the treasury. This treasury is then in complete ownership of HAM holders via governance.


## Distribution
Rather than allocating a portion of the supply to the founding team, HAM is being distributed in the spirit of YFI: no premine, no founder shares, no VC interests — simply equal-opportunity staking distribution to attract a broad and vision-aligned community to steward the future of the protocol and token.

The initial distribution of HAM will be evenly distributed across eight staking pools: WETH, YFI, MKR, LEND, LINK, SNX, COMP, and ETH/APML Uniswap v2 LP tokens. These pools were chosen intentionally to reach a broad swath of the overall DeFi community, as well as specific communities with a proven commitment to active governance and an understanding of complex tokenomics.

Following the launch of the initial distribution pools, a second distribution wave will be incentivized through a HAM/yCRV Uniswap pool. This pool will allow Uniswap's TWAP-based oracle to provide necessary input as the basis for rebase calculations, as well as provide liquidity for the rebase to purchase yCurve for the treasury.


## Rebases

Rebases are controlled by an external contract called the Rebaser. This is comparable to Ampleforth's `monetaryPolicy` contract. It dictates how large the rebase is and what happens on the rebase. The HAM token just changes the supply based on what this contract provides it.

There are a requirements before rebases are active:
<br />
•	Liquid HAM/yCRV market<br/>
•	`init_twap()`<br/>
•	`activate_rebasing()`<br/>

Following the launch of the second pool, rebasing can begin its activation phase. This begins with `init_twap()` on the rebaser contract. Anyone can call this at anytime once there is a HAM/yCRV Uniswap V2 market. The oracle is designed to be 12 hours between checkpoints. Given that, 12 hours after `init_twap()` is called, anyone can call `activate_rebasing()`. This turns rebasing on, permanently. Now anyone can call `rebase()` when `inRebaseWindow() == true;`.

In a rebase, the order of operations are:
<br />
•	ensure in rebase window<br/>
•	calculate how far off price is from the peg<br/>
•	dampen the rebase by the rebaseLag<br/>
•	if positive calculate protocol mint amount<br/>
•	change scaling factor, (in/de)flating the supply<br/>
•	sync uniswap, mint, sell to uniswap, transfer excess HAM and bought yCRV to reserves<br/>
•	call any extra functions governance adds in the future (i.e. Balancer gulps)<br/>


## Governance
Governance is entirely dictated by HAM holders from the start. Upon deployment, ownership of all HAM protocol contracts was reliquished to the timelocked Governance contract or removed entirely. At the very least, this can be seen as a reference implementation for a truly decentralized protocol.

# Development
### Building
This repo uses truffle. Ensure that you have truffle installed. Given the composability aspect of this

Then, to build the contracts run:
```
$ truffle compile
```



To run tests, run against a single test package, i.e.:
```
$ sh startBlockchain.sh
$ truffle migrate --network distribution
$ python scripts/clean.py
$ cd jsLib
$ jest deployment
$ jest token
$ jest rebase
$ jest governance
$ jest governorAlpha
$ jest distribution
```
The need to run one-by-one seems to be a limitation of jest + ganache.

The distribution tests require specific tokens. These are acquired by using the ganache unlock_account function. If you receive fails, the owner likely decreased their ownership of that token. Just replace any instances of that address with another holder of the token.

Note: some governance tests require a different ganache setup. You will encounter a warning (but not a failed test) if the wrong type of ganache is setup. To run the correct one:
```
$ sh startBlockchainMining.sh
$ truffle migrate --network distribution
$ python scripts/clean.py
$ cd jsLib
$ jest governance
```


#### Attributions
Much of this code base is modified from existing works, including:

[Compound](https://compound.finance) - Jumping off point for token code and governance

[Ampleforth](https://ampleforth.org) - Initial rebasing mechanism, modified to better suit the HAM protocol

[Synthetix](https://synthetix.io) - Rewards staking contract

[YEarn](https://yearn.finance)/[YFI](https://ygov.finance) - Initial fair distribution implementation
