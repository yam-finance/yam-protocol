# 🍠  YAM Protocol  🍠
## The Protocol
Yam is an experimental protocol building upon the most exciting innovations in programmable money and governance. Built by a team of DeFi natives, it seeks to create:

•	an elastic supply to seek eventual price stability<br/>
•	a governable treasury to further support stability<br/>
•	fully on-chain governance to enable decentralized control and evolution from Day 1<br/>
•	a fair distribution mechanism that incentivizes key community members to actively take the reins of governance

At its core, YAM is an elastic supply cryptocurrency, which expands and its supply in response to market conditions, initially targeting 1 USD per YAM. This stability mechanism by includes one key addition to existing elastic supply models such as Ampleforth: a portion of each supply expansion is used to buy yCurve (a high-yield USD-denominated stablecoin) and add it to the Yam treasury, which is controlled via Yam community governance.

We have built Yam to be a minimally viable monetary experiment, and at launch there will be zero value in the YAM token. After deployment, it is entirely dependent upon YAM holders to determine its value and future development. We have employed a fork of the Compound governance module, which will ensure all updates to the Yam protocol happen entirely on-chain through community voting.

## The Token
The core YAM token uses yCRV as the reserve currency, which is roughly a $1 peg. Each supply expansion (referred to as an inflating rebase), a portion of tokens is minted and used to build up the treasury. This treasury is then in complete ownership of $YAM holders via governance.


## Distribution
Rather than allocating a portion of the supply to the founding team, YAM is being distributed in the spirit of YFI: no premine, no founder shares, no VC interests — simply equal — opportunity staking distribution to attract a broad and vision-aligned community to steward the future of the protocol and token.

The initial distribution of YAM will be evenly distributed across eight staking pools: WETH, YFI, MKR, LEND, LINK, SNX, COMP, and ETH/APML Uniswap v2 LP tokens. These pools were chosen intentionally to reach a broad swath of the overall DeFi community, as well as specific communities with a proven commitment to active governance and an understanding of complex tokenomics.

Following the launch of the initial distribution pools, a second distribution wave will be incentivized through a YAM/yCRV Uniswap pool. This pool will allow Uniswap's TWAP-based oracle to provide necessary input as the basis for rebase calculations, as well as provide liquidity for the rebase to purchase yCurve for the treasury.


## Governance
Governance is entirely dictated by YAM holders from the start. Upon deployment, ownership of all YAM protocol contracts was reliquished to the timelocked Governance contract or removed entirely. At the very least, this can be seen as a reference implementation for a truly decentralized protocol.

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

[Ampleforth](https://ampleforth.org) - Initial rebasing mechanism, modified to better suit the YAM protocol

[Synthetix](https://synthetix.io) - Rewards staking contract

[YEarn](https://yearn.finance)/[YFI](https://ygov.finance) - Initial fair distribution implementation
