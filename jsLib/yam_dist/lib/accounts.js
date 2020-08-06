"use strict";

require("core-js/modules/web.dom.iterable");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Account = void 0;

var Types = _interopRequireWildcard(require("./types.js"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

class Account {
  constructor(contracts, address) {
    this.contracts = contracts;
    this.accountInfo = address;
    this.type = "";
    this.allocation = [];
    this.balances = {};
    this.status = "";
    this.approvals = {};
    this.walletInfo = {};
  }

  async getYAMWalletBalance() {
    this.walletInfo["DAI"] = await this.contracts.yam.methods.balanceOf(this.accountInfo).call();
    return this.walletInfo["DAI"];
  }

  async getYCRVWalletBalance() {
    this.walletInfo["YCRV"] = await this.contracts.ycrv.methods.balanceOf(this.accountInfo).call();
    return this.walletInfo["YCRV"];
  }

  async getYFIWalletBalance() {
    this.walletInfo["YFI"] = await this.contracts.yfi.methods.balanceOf(this.accountInfo).call();
    return this.walletInfo["YFI"];
  }

  async getUNIAmplWalletBalance() {
    this.walletInfo["UNIAmpl"] = await this.contracts.UNIAmpl.methods.balanceOf(this.accountInfo).call();
    return this.walletInfo["UNIAmpl"];
  }

  async getWETHWalletBalance() {
    this.walletInfo["WETH"] = await this.contracts.weth.methods.balanceOf(this.accountInfo).call();
    return this.walletInfo["WETH"];
  }

  async getETHWalletBalance() {
    this.walletInfo["ETH"] = await this.contracts.web3.eth.getBalance(this.accountInfo);
    return this.walletInfo["ETH"];
  }

}

exports.Account = Account;