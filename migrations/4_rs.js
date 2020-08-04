// ============ Contracts ============

// Governance
// deployed first
const Gov = artifacts.require("YAMGovernance");

// Token
// deployed second
const YAMImplementation = artifacts.require("YAMDelegate");
const YAMProxy = artifacts.require("YAMDelegator");

// Rs
// deployed third
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
  let reserveToken = "";
  let uniswap_factory = "";
  let max_slippage_factor_ = /* TBD */;
  await deployer.deploy(YAMReserves, reserveToken, Gov.address);
  await deployer.deploy(YAMRebaser,
      YAMProxy.address,
      reserveToken,
      uniswap_factory,
      YAMReserves.address,
      max_slippage_factor_,
      Gov.address
  );

  let yam = await YAMProxy.deployed();
  yam.setRebaser(YAMRebaser.address);

}
