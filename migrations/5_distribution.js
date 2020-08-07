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
  console.log(network)
  let yam = await YAMProxy.deployed();
  let yReserves = await YAMReserves.deployed()
  let yRebaser = await YAMRebaser.deployed()
  let tl = await Timelock.deployed();
  let gov = await Gov.deployed();
  if (network != "test") {
    await deployer.deploy(YAM_ETHPool);
    await deployer.deploy(YAM_uAMPLPool);
    await deployer.deploy(YAM_YFIPool);
    await deployer.deploy(YAMIncentivizer);

    let eth_pool = new web3.eth.Contract(YAM_ETHPool.abi, YAM_ETHPool.address);
    let ampl_pool = new web3.eth.Contract(YAM_uAMPLPool.abi, YAM_uAMPLPool.address);
    let yfi_pool = new web3.eth.Contract(YAM_YFIPool.abi, YAM_YFIPool.address);
    let ycrv_pool = new web3.eth.Contract(YAMIncentivizer.abi, YAMIncentivizer.address);

    console.log("setting distributor");
    await eth_pool.methods.setRewardDistribution(accounts[0]).send({from: accounts[0], gas: 100000});
    await ampl_pool.methods.setRewardDistribution(accounts[0]).send({from: accounts[0], gas: 100000});
    await yfi_pool.methods.setRewardDistribution(accounts[0]).send({from: accounts[0], gas: 100000});
    await ycrv_pool.methods.setRewardDistribution(accounts[0]).send({from: accounts[0], gas: 100000});


    let one_mil = web3.utils.toBN(10**6).mul(web3.utils.toBN(10**18));
    let two_mil = one_mil.mul(web3.utils.toBN(2));

    console.log("transfering and notifying");
    console.log("eth");
    await yam.transfer(YAM_ETHPool.address, one_mil.toString());
    await eth_pool.methods.notifyRewardAmount(one_mil.toString()).send({from:accounts[0]});

    console.log("ampl");
    await yam.transfer(YAM_uAMPLPool.address, one_mil.toString());
    await ampl_pool.methods.notifyRewardAmount(one_mil.toString()).send({from:accounts[0]});

    console.log("yfi");
    await yam.transfer(YAM_YFIPool.address, one_mil.toString());
    await yfi_pool.methods.notifyRewardAmount(one_mil.toString()).send({from:accounts[0]});

    await yam._setIncentivizer(YAMIncentivizer.address);

    let a = await ycrv_pool.methods.notifyRewardAmount(two_mil.toString()).send({from: accounts[0], gas: 500000});
    console.log(a)
  }


  await tl.setPendingAdmin(Gov.address);
  await gov.__acceptAdmin();
  await yam._setPendingGov(Gov.address);
  await yReserves._setPendingGov(Gov.address);
  await yRebaser._setPendingGov(Gov.address);
  await gov._acceptGov([YAMProxy.address, YAMReserves.address, YAMRebaser.address]);
  await gov.__abdicate();
}
