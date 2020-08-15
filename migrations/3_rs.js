// ============ Contracts ============

// Token
// deployed first
const HAMImplementation = artifacts.require("HAMDelegate");
const HAMProxy = artifacts.require("HAMDelegator");

// Rs
// deployed second
const HAMReserves = artifacts.require("HAMReserves");
const HAMRebaser = artifacts.require("HAMRebaser");

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
  await deployer.deploy(HAMReserves, reserveToken, HAMProxy.address);
  await deployer.deploy(HAMRebaser,
      HAMProxy.address,
      reserveToken,
      uniswap_factory,
      HAMReserves.address
  );
  let rebase = new web3.eth.Contract(HAMRebaser.abi, HAMRebaser.address);

  let pair = await rebase.methods.uniswap_pair().call();
  console.log(pair)
  let ham = await HAMProxy.deployed();
  await ham._setRebaser(HAMRebaser.address);
  let reserves = await HAMReserves.deployed();
  await reserves._setRebaser(HAMRebaser.address)
}
