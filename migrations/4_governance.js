// ============ Contracts ============


// Token
// deployed first
const YAMImplementation = artifacts.require("YAMDelegate");
const YAMProxy = artifacts.require("YAMDelegator");

// Rs
// deployed second
const YAMReserves = artifacts.require("YAMReserves");
const YAMRebaser = artifacts.require("YAMRebaser");

// Governance
// deployed third
const Gov = artifacts.require("GovernorAlpha");
const Timelock = artifacts.require("Timelock");



// ============ Main Migration ============

const migration = async (deployer, network, accounts) => {
  await Promise.all([
    deployGovernance(deployer, network),
  ]);
};

module.exports = migration;

// ============ Deploy Functions ============
// This is split across multiple files so that
// if the web3 provider craps out, all progress isn't lost.
//
// This is at the expense of having to do 6 extra txs to sync the migrations
// contract

async function deployGovernance(deployer, network) {
  let yam = await YAMProxy.deployed()
  let yReserves = await YAMReserves.deployed()
  let yRebaser = await YAMRebaser.deployed()
  await deployer.deploy(Timelock, 172800);
  await deployer.deploy(Gov,
      Timelock.address,
      YAMProxy.address
  );
  let tl = await Timelock.deployed();
  let gov = await Gov.deployed();
  tl.setPendingAdmin(Gov.address);
  gov.__acceptAdmin();
  yam._setPendingGov(Gov.address);
  yReserves._setPendingGov(Gov.address);
  yRebaser._setPendingGov(Gov.address);
  gov._acceptGov([YAMProxy.address, YAMReserves.address, YAMRebaser.address]);
  gov.__abdicate();
}

// let accounts = [];
// web3.eth.getAccounts().then(e => accounts = e);
// let yamImpl = new web3.eth.Contract(YAMDelegate.abi, YAMDelegate.address)
// let yam = new web3.eth.Contract(YAMDelegator.abi, YAMDelegator.address)
// let reserves = new web3.eth.Contract(YAMReserves.abi, YAMReserves.address)
// let rebaser = new web3.eth.Contract(YAMRebaser.abi, YAMRebaser.address)
// let gov = new web3.eth.Contract(GovernorAlpha.abi, GovernorAlpha.address)
// let tl = new web3.eth.Contract(Timelock.abi, Timelock.address)
