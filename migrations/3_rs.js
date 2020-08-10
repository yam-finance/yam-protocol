// ============ Contracts ============

// Token
// deployed first
const YAMImplementation = artifacts.require("YAMDelegate");
const YAMProxy = artifacts.require("YAMDelegator");

// Rs
// deployed second
const YAMReserves = artifacts.require("YAMReserves");
const YAMRebaser = artifacts.require("YAMRebaser");

// ============ Main Migration ============

const migration = async (deployer, network, accounts) => {
  await Promise.all([
    deployRs(deployer, network),
  ]);
};

module.exports = migration;

// ============ Deploy Functions ============


async function deployRs(deployer, network) {
  let reserveToken = "0xdF5e0e81Dff6FAF3A7e52BA697820c5e32D806A8";
  let uniswap_factory = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
  await deployer.deploy(YAMReserves, reserveToken, YAMProxy.address);
  await deployer.deploy(YAMRebaser,
      YAMProxy.address,
      reserveToken,
      uniswap_factory,
      YAMReserves.address
  );
  let rebase = new web3.eth.Contract(YAMRebaser.abi, YAMRebaser.address);

  let pair = await rebase.methods.uniswap_pair().call();
  console.log(pair)
  let yam = await YAMProxy.deployed();
  await yam._setRebaser(YAMRebaser.address);
  let reserves = await YAMReserves.deployed();
  await reserves._setRebaser(YAMRebaser.address)
}
