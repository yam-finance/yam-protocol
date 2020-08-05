var fs = require('fs')

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

// deployed fifth
const YAMIncentivizer = artifacts.require("YAMIncentivizer");

// ============ Main Migration ============

const migration = async (deployer, network, accounts) => {
  await Promise.all([
    // deployTestContracts(deployer, network),
    deployDistribution(deployer, network),
    // deploySecondLayer(deployer, network)
  ]);
};

module.exports = migration;

// ============ Deploy Functions ============


async function deployDistribution(deployer, network) {
  let yam = await deployer.deployed(YAMProxy);
  let eth = await deployer.deploy(YAM_ETHPool);
  let ampl = await deployer.deploy(YAM_uAMPLPool);
  let yfi = await deployer.deploy(YAM_YFIPool);
  let ycrv = await deployer.deploy(YAMIncentivizer);
  let one_mil = 1 * 10**6 * 10**18;
  let two_mil = one_mil * 2;
  yam.transfer(YAM_ETHPool.address, one_mil.toString());
  eth.notifyRewardAmount(one_mil.toString());
  yam.transfer(YAM_uAMPLPool.address, one_mil.toString());
  ampl.notifyRewardAmount(one_mil.toString());
  yam.transfer(YAM_YFIPool.address, one_mil.toString());
  yfi.notifyRewardAmount(one_mil.toString());

  yam.transfer(YAMIncentivizer.address, two_mil.toString());
}
