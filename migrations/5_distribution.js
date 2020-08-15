var fs = require('fs')

// ============ Contracts ============


// Protocol
// deployed second
const HAMImplementation = artifacts.require("HAMDelegate");
const HAMProxy = artifacts.require("HAMDelegator");

// deployed third
const HAMReserves = artifacts.require("HAMReserves");
const HAMRebaser = artifacts.require("HAMRebaser");

const Gov = artifacts.require("GovernorAlpha");
const Timelock = artifacts.require("Timelock");

// deployed fourth
const HAM_ETHPool = artifacts.require("HAMETHPool");
const HAM_uAMPLPool = artifacts.require("HAMAMPLPool");
const HAM_YFIPool = artifacts.require("HAMYFIPool");
const HAM_LINKPool = artifacts.require("HAMLINKPool");
const HAM_MKRPool = artifacts.require("HAMMKRPool");
const HAM_LENDPool = artifacts.require("HAMLENDPool");
const HAM_COMPPool = artifacts.require("HAMCOMPPool");
const HAM_SNXPool = artifacts.require("HAMSNXPool");


// deployed fifth
const HAMIncentivizer = artifacts.require("HAMIncentivizer");

// ============ Main Migration ============

const migration = async (deployer, network, accounts) => {
  await Promise.all([
    // deployTestContracts(deployer, network),
    deployDistribution(deployer, network, accounts),
    // deploySecondLayer(deployer, network)
  ]);
}

module.exports = migration;

// ============ Deploy Functions ============


async function deployDistribution(deployer, network, accounts) {
  console.log(network)
  let ham = await HAMProxy.deployed();
  let yReserves = await HAMReserves.deployed()
  let yRebaser = await HAMRebaser.deployed()
  let tl = await Timelock.deployed();
  let gov = await Gov.deployed();
  if (network != "test") {
    await deployer.deploy(HAM_ETHPool);
    await deployer.deploy(HAM_uAMPLPool);
    await deployer.deploy(HAM_YFIPool);
    await deployer.deploy(HAMIncentivizer);
    await deployer.deploy(HAM_LINKPool);
    await deployer.deploy(HAM_MKRPool);
    await deployer.deploy(HAM_LENDPool);
    await deployer.deploy(HAM_COMPPool);
    await deployer.deploy(HAM_SNXPool);

    let eth_pool = new web3.eth.Contract(HAM_ETHPool.abi, HAM_ETHPool.address);
    let ampl_pool = new web3.eth.Contract(HAM_uAMPLPool.abi, HAM_uAMPLPool.address);
    let yfi_pool = new web3.eth.Contract(HAM_YFIPool.abi, HAM_YFIPool.address);
    let lend_pool = new web3.eth.Contract(HAM_LENDPool.abi, HAM_LENDPool.address);
    let mkr_pool = new web3.eth.Contract(HAM_MKRPool.abi, HAM_MKRPool.address);
    let snx_pool = new web3.eth.Contract(HAM_SNXPool.abi, HAM_SNXPool.address);
    let comp_pool = new web3.eth.Contract(HAM_COMPPool.abi, HAM_COMPPool.address);
    let link_pool = new web3.eth.Contract(HAM_LINKPool.abi, HAM_LINKPool.address);
    let ycrv_pool = new web3.eth.Contract(HAMIncentivizer.abi, HAMIncentivizer.address);

    console.log("setting distributor");
    await Promise.all([
        eth_pool.methods.setRewardDistribution(accounts[0]).send({from: accounts[0], gas: 100000}),
        ampl_pool.methods.setRewardDistribution(accounts[0]).send({from: accounts[0], gas: 100000}),
        yfi_pool.methods.setRewardDistribution(accounts[0]).send({from: accounts[0], gas: 100000}),
        ycrv_pool.methods.setRewardDistribution(accounts[0]).send({from: accounts[0], gas: 100000}),
        lend_pool.methods.setRewardDistribution(accounts[0]).send({from: accounts[0], gas: 100000}),
        mkr_pool.methods.setRewardDistribution(accounts[0]).send({from: accounts[0], gas: 100000}),
        snx_pool.methods.setRewardDistribution(accounts[0]).send({from: accounts[0], gas: 100000}),
        comp_pool.methods.setRewardDistribution(accounts[0]).send({from: accounts[0], gas: 100000}),
        link_pool.methods.setRewardDistribution(accounts[0]).send({from: accounts[0], gas: 100000}),
        ycrv_pool.methods.setRewardDistribution(accounts[0]).send({from: accounts[0], gas: 100000}),
      ]);

    let two_fifty = web3.utils.toBN(10**3).mul(web3.utils.toBN(10**18)).mul(web3.utils.toBN(250));
    let one_five = two_fifty.mul(web3.utils.toBN(6));

    console.log("transfering and notifying");
    console.log("eth");
    await Promise.all([
      ham.transfer(HAM_ETHPool.address, two_fifty.toString()),
      ham.transfer(HAM_uAMPLPool.address, two_fifty.toString()),
      ham.transfer(HAM_YFIPool.address, two_fifty.toString()),
      ham.transfer(HAM_LENDPool.address, two_fifty.toString()),
      ham.transfer(HAM_MKRPool.address, two_fifty.toString()),
      ham.transfer(HAM_SNXPool.address, two_fifty.toString()),
      ham.transfer(HAM_COMPPool.address, two_fifty.toString()),
      ham.transfer(HAM_LINKPool.address, two_fifty.toString()),
      ham._setIncentivizer(HAMIncentivizer.address),
    ]);

    await Promise.all([
      eth_pool.methods.notifyRewardAmount(two_fifty.toString()).send({from:accounts[0]}),
      ampl_pool.methods.notifyRewardAmount(two_fifty.toString()).send({from:accounts[0]}),
      yfi_pool.methods.notifyRewardAmount(two_fifty.toString()).send({from:accounts[0]}),
      lend_pool.methods.notifyRewardAmount(two_fifty.toString()).send({from:accounts[0]}),
      mkr_pool.methods.notifyRewardAmount(two_fifty.toString()).send({from:accounts[0]}),
      snx_pool.methods.notifyRewardAmount(two_fifty.toString()).send({from:accounts[0]}),
      comp_pool.methods.notifyRewardAmount(two_fifty.toString()).send({from:accounts[0]}),
      link_pool.methods.notifyRewardAmount(two_fifty.toString()).send({from:accounts[0]}),
      
      // incentives is a minter and prepopulates itself.
      ycrv_pool.methods.notifyRewardAmount("0").send({from: accounts[0], gas: 500000}),
    ]);

    await Promise.all([
      eth_pool.methods.setRewardDistribution(Timelock.address).send({from: accounts[0], gas: 100000}),
      ampl_pool.methods.setRewardDistribution(Timelock.address).send({from: accounts[0], gas: 100000}),
      yfi_pool.methods.setRewardDistribution(Timelock.address).send({from: accounts[0], gas: 100000}),
      lend_pool.methods.setRewardDistribution(Timelock.address).send({from: accounts[0], gas: 100000}),
      mkr_pool.methods.setRewardDistribution(Timelock.address).send({from: accounts[0], gas: 100000}),
      snx_pool.methods.setRewardDistribution(Timelock.address).send({from: accounts[0], gas: 100000}),
      comp_pool.methods.setRewardDistribution(Timelock.address).send({from: accounts[0], gas: 100000}),
      link_pool.methods.setRewardDistribution(Timelock.address).send({from: accounts[0], gas: 100000}),
      ycrv_pool.methods.setRewardDistribution(Timelock.address).send({from: accounts[0], gas: 100000}),
    ]);
    await Promise.all([
      eth_pool.methods.transferOwnership(Timelock.address).send({from: accounts[0], gas: 100000}),
      ampl_pool.methods.transferOwnership(Timelock.address).send({from: accounts[0], gas: 100000}),
      yfi_pool.methods.transferOwnership(Timelock.address).send({from: accounts[0], gas: 100000}),
      lend_pool.methods.transferOwnership(Timelock.address).send({from: accounts[0], gas: 100000}),
      mkr_pool.methods.transferOwnership(Timelock.address).send({from: accounts[0], gas: 100000}),
      snx_pool.methods.transferOwnership(Timelock.address).send({from: accounts[0], gas: 100000}),
      comp_pool.methods.transferOwnership(Timelock.address).send({from: accounts[0], gas: 100000}),
      link_pool.methods.transferOwnership(Timelock.address).send({from: accounts[0], gas: 100000}),
      ycrv_pool.methods.transferOwnership(Timelock.address).send({from: accounts[0], gas: 100000}),
    ]);
  }

  await Promise.all([
    ham._setPendingGov(Timelock.address),
    yReserves._setPendingGov(Timelock.address),
    yRebaser._setPendingGov(Timelock.address),
  ]);

  await Promise.all([
      tl.executeTransaction(
        HAMProxy.address,
        0,
        "_acceptGov()",
        "0x",
        0
      ),

      tl.executeTransaction(
        HAMReserves.address,
        0,
        "_acceptGov()",
        "0x",
        0
      ),

      tl.executeTransaction(
        HAMRebaser.address,
        0,
        "_acceptGov()",
        "0x",
        0
      ),
  ]);
  await tl.setPendingAdmin(Gov.address);
  await gov.__acceptAdmin();
  await gov.__abdicate();
}
