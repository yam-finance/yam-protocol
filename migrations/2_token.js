// ============ Contracts ============

// Token
// deployed first
const HAMImplementation = artifacts.require("HAMDelegate");
const HAMProxy = artifacts.require("HAMDelegator");

// ============ Main Migration ============

const migration = async (deployer, network, accounts) => {
  await Promise.all([
    deployToken(deployer, network),
  ]);
};

module.exports = migration;

// ============ Deploy Functions ============


async function deployToken(deployer, network) {
  await deployer.deploy(HAMImplementation);
  if (network != "mainnet") {
    await deployer.deploy(HAMProxy,
      "HAM",
      "HAM",
      18,
      "9000000000000000000000000", // print extra few mil for user
      HAMImplementation.address,
      "0x"
    );
  } else {
    await deployer.deploy(HAMProxy,
      "HAM",
      "HAM",
      18,
      "2000000000000000000000000",
      HAMImplementation.address,
      "0x"
    );
  }

}
