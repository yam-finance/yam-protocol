var fs = require('fs')

// ============ Contracts ============


// Protocol
// deployed second
const YAMImplementation = artifacts.require("YAMDelegate");
const YAMProxy = artifacts.require("YAMDelegator");

// deployed third
const YAMReserves = artifacts.require("YAMReserves");
const YAMRebaser = artifacts.require("YAMRebaser");

const Gov = artifacts.require("GovernorAlpha");
const Timelock = artifacts.require("Timelock");

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
    deployDistribution(deployer, network, accounts),
    // deploySecondLayer(deployer, network)
  ]);
};

module.exports = migration;

// ============ Deploy Functions ============


async function deployDistribution(deployer, network, accounts) {
  await deployer.deploy(YAM_ETHPool);
  await deployer.deploy(YAM_uAMPLPool);
  await deployer.deploy(YAM_YFIPool);
  await deployer.deploy(YAMIncentivizer);

  let eth_pool = new web3.eth.Contract(YAM_ETHPool.abi, YAM_ETHPool.address);
  let ampl = new web3.eth.Contract(YAM_uAMPLPool.abi, YAM_uAMPLPool.address);
  let yfi = new web3.eth.Contract(YAM_YFIPool.abi, YAM_YFIPool.address);
  let ycrv = new web3.eth.Contract(YAMIncentivizer.abi, YAMIncentivizer.address);

  eth_pool.methods.setRewardDistribution(accounts[0]).send({from: accounts[0], gas: 100000});
  ampl.methods.setRewardDistribution(accounts[0]).send({from: accounts[0], gas: 100000});
  yfi.methods.setRewardDistribution(accounts[0]).send({from: accounts[0], gas: 100000});
  ycrv.methods.setRewardDistribution(accounts[0]).send({from: accounts[0], gas: 100000});

  let yam = await YAMProxy.deployed();
  let yReserves = await YAMReserves.deployed()
  let yRebaser = await YAMRebaser.deployed()
  let tl = await Timelock.deployed();
  let gov = await Gov.deployed();

  let one_mil = web3.utils.toBN(10**6).mul(web3.utils.toBN(10**18));
  let two_mil = one_mil.mul(web3.utils.toBN(2));

  yam.transfer(YAM_ETHPool.address, one_mil.toString());
  eth_pool.methods.notifyRewardAmount(one_mil.toString());

  yam.transfer(YAM_uAMPLPool.address, one_mil.toString());
  ampl.methods.notifyRewardAmount(one_mil.toString());

  yam.transfer(YAM_YFIPool.address, one_mil.toString());
  yfi.methods.notifyRewardAmount(one_mil.toString());

  ycrv.methods.notifyRewardAmount(two_mil.toString());

  tl.setPendingAdmin(Gov.address);
  gov.__acceptAdmin();
  yam._setIncentivizer(YAMIncentivizer.address);
  yam._setPendingGov(Gov.address);
  yReserves._setPendingGov(Gov.address);
  yRebaser._setPendingGov(Gov.address);
  gov._acceptGov([YAMProxy.address, YAMReserves.address, YAMRebaser.address]);
  gov.__abdicate();
}
