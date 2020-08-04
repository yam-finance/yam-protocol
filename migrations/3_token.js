// ============ Contracts ============

// Governance
// deployed first
const Gov = artifacts.require("YAMGovernance");

// Token
// deployed second
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
  await deployer.deploy(YAMProxy, /*myAddr*/, YAMImplementation.address);
}
