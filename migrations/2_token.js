// ============ Contracts ============

// Token
// deployed first
const YAMImplementation = artifacts.require("YAMDelegate");
const YAMProxy = artifacts.require("YAMDelegator");

// ============ Main Migration ============

const migration = async (deployer, network, accounts) => {
  await Promise.all([
    deployToken(deployer, network),
  ]);
};

module.exports = migration;

// ============ Deploy Functions ============


async function deployToken(deployer, network) {
  await deployer.deploy(YAMImplementation);
  await deployer.deploy(YAMProxy,
    "YAM",
    "YAM",
    18,
    "3000000000000000000000000",
    YAMImplementation.address,
    "0x"
  );
}
