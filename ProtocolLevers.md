# Levers

The expectation is that after the pools receive their YAMs, there is no longer a founding team or any team to speak of. This is a protocol that is being put out there and decentralize. The writer of these contracts or those connected with its inception, are under no obligation and likely won't continue development once it is deployed.

That said, it would be helpful for governance to have a well documented set of levers inside the protocol.

## YAM Levers

#### `gov`/`pendingGov`
##### File: `YAMTokenStorage.sol`
##### Description
address that controls every permissioned function, or is primed to.
##### Setting
###### File: `YAM.sol`
`_setPendingGov(address)`: sets `pendingGov` to new address. To complete the change of governance, the new governance contract has to call `_acceptGov()`.

<br />
<br />
<br />

#### `rebaser`
##### File: `YAMTokenStorage.sol`
##### Description
address that controls the rebasing functionality. This contract is one of two contracts that can `mint`. It also tells how much to change `yamsScalingFactor`.
##### Setting
###### File: `YAM.sol`
`_setRebaser(address)`: sets `rebaser` to new address.

<br />
<br />
<br />

#### `incentivizer`
##### File: `YAMTokenStorage.sol`
##### Description
address that controls the incentivizer pool. This contract is one of two contracts that can `mint`. It is there to promote liquidity for the rebasing functionality to work correctly.
##### Setting
###### File: `YAM.sol`
`_setIncentivizer(address)`: sets `incentivzer` to new address.

<br />
<br />
<br />
