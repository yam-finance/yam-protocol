"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Yam = void 0;

var _web = _interopRequireDefault(require("web3"));

var _bignumber = _interopRequireDefault(require("bignumber.js/bignumber"));

var _contracts = require("./lib/contracts.js");

var _accounts = require("./lib/accounts.js");

var _evm = require("./lib/evm.js");

var _constants = require("./lib/constants.js");

var _uni = _interopRequireDefault(require("./lib/uni.json"));

var _bncNotify = _interopRequireDefault(require("bnc-notify"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const oneEther = 1000000000000000000;

class Yam {
  constructor(provider, networkId, testing, options) {
    var realProvider;

    if (typeof provider === 'string') {
      if (provider.includes("wss")) {
        realProvider = new _web.default.providers.WebsocketProvider(provider, options.ethereumNodeTimeout || 10000);
      } else {
        realProvider = new _web.default.providers.HttpProvider(provider, options.ethereumNodeTimeout || 10000);
      }
    } else {
      realProvider = provider;
    }

    this.web3 = new _web.default(realProvider);

    if (testing) {
      this.testing = new _evm.EVM(realProvider);
      this.snapshot = this.testing.snapshot();
    }

    if (options.defaultAccount) {
      this.web3.eth.defaultAccount = options.defaultAccount;
    }

    this.contracts = new _contracts.Contracts(realProvider, networkId, this.web3, options);
    this.accounts = [];
    this.markets = [];
    this.prices = {};
    this.allocations = {};
    this.rates = {};
    this.aprs = {};
    this.poolWeis = {};
    this.platformInfo = {};
  }

  async resetEVM() {
    this.testing.resetEVM(this.snapshot);
  }

  addAccount(address, number) {
    this.accounts.push(new _accounts.Account(this.contracts, address, number));
  }

  setProvider(provider, networkId) {
    this.web3.setProvider(provider);
    this.contracts.setProvider(provider, networkId);
    this.operation.setNetworkId(networkId);
  }

  setDefaultAccount(account) {
    this.web3.eth.defaultAccount = account;
    this.contracts.setDefaultAccount(account);
  }

  getDefaultAccount() {
    return this.web3.eth.defaultAccount;
  }

  loadAccount(account) {
    const newAccount = this.web3.eth.accounts.wallet.add(account.privateKey);

    if (!newAccount || account.address && account.address.toLowerCase() !== newAccount.address.toLowerCase()) {
      throw new Error("Loaded account address mismatch.\n        Expected ".concat(account.address, ", got ").concat(newAccount ? newAccount.address : null));
    }
  }

  toBigN(a) {
    return (0, _bignumber.default)(a);
  }

}

exports.Yam = Yam;