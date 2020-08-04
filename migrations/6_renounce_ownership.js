// ============ Contracts ============

// Governance
// deployed first
const Gov = artifacts.require("YAMGovernance");

// Protocol
// deployed second
const YAMImplementation = artifacts.require("YAMDelegate");
const YAMProxy = artifacts.require("YAMDelegator");

// deployed third
const YAMReserves = artifacts.require("YAMReserves");
const YAMRebaser = artifacts.require("YAMRebaser");


// deployed fourth
const YAM_ETHPool = artifacts.require("YAMETHPool");
const YAM_uAMPLPool = artifacts.require("YAMAMPLPool");
const YAM_YFIPool = artifacts.require("YAMYFIPool");

// deployed 24 hours after distribution starts. Manual
const YAMIncentivizer = artifacts.require("YAMIncentivizer");

// ============ Main Migration ============

const migration = async (deployer, network, accounts) => {
  await Promise.all([
    renounceToGov(deployer, network),
  ]);
};

module.exports = migration;

// ============ Deploy Functions ============


async function renounceToGov(deployer, network) {
  let yam = await YAMProxy.deployed();

  // set pending to governance address now that we are done
  yam._setPendingGov(Gov.address);

  let gov = await Gov.deployed();
  // Have governance accept YAM
  // {to: YAMProxy.address, data: keccak256("_acceptGov") }
  gov.sendTransaction(encoded);

  // set owner == address(0)
  gov.renounceOwnership();
}
