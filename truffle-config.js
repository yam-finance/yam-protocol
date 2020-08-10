require('dotenv-flow').config();
const HDWalletProvider = require("@truffle/hdwallet-provider");
var Web3 = require('web3');
// var p = ;
module.exports = {
  compilers: {
    solc: {
      version: '0.5.17',
      docker: process.env.DOCKER_COMPILER !== undefined
        ? process.env.DOCKER_COMPILER === 'true' : true,
      parser: 'solcjs',
      settings: {
        optimizer: {
          enabled: true,
          runs: 50000
        },
        evmVersion: 'istanbul',
      },
    },
  },
  networks: {
    test: {
      host: '0.0.0.0',
      port: 8545,
      network_id: '1001',
      gasPrice: 50000000000,
      gas: 8000000,
      network_id: '1001',
    },
    distribution: {
      host: '0.0.0.0',
      port: 8545,
      network_id: '1001',
      gasPrice: 50000000000,
      gas: 8000000,
      network_id: '1001',
    },
    test_ci: {
      host: '0.0.0.0',
      port: 8545,
      gasPrice: 1,
      gas: 10000000,
      network_id: '1001',
    },
    mainnet: {
      network_id: '1',
      provider: () => new HDWalletProvider(
        [process.env.DEPLOYER_PRIVATE_KEY],
        "https://mainnet.infura.io/v3/731a2b3d28e445b7ac56f23507614fea",
        0,
        1,
      ),
      gasPrice: Number(process.env.GAS_PRICE),
      gas: 8000000,
      from: process.env.DEPLOYER_ACCOUNT,
      timeoutBlocks: 800,
    },
    kovan: {
      network_id: '42',
      provider: () => new HDWalletProvider(
        [process.env.DEPLOYER_PRIVATE_KEY],
        'https://kovan.infura.io/v3/04c5f76635f24c70b28488be34dbd838',
        0,
        1,
      ),
      gasPrice: 10000000000, // 10 gwei
      gas: 6900000,
      from: process.env.DEPLOYER_ACCOUNT,
      timeoutBlocks: 500,
    },
    dev: {
      host: 'localhost',
      port: 8445,
      network_id: '1005',
      gasPrice: 1000000000, // 1 gwei
      gas: 8000000,
    },
    coverage: {
      host: '0.0.0.0',
      network_id: '1002',
      port: 8555,
      gas: 0xfffffffffff,
      gasPrice: 1,
    },
    docker: {
      host: 'localhost',
      network_id: '1313',
      port: 8545,
      gasPrice: 1,
    },
  },
};
