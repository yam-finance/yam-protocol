// import * as Types from './types.js';

export class Account {
  constructor(
    contracts,
    address
  ) {
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
    return this.walletInfo["DAI"]
  }

  async getSCRVWalletBalance() {
    this.walletInfo["SCRV"] = await this.contracts.scrv.methods.balanceOf(this.accountInfo).call();
    return this.walletInfo["SCRV"]
  }

  async getYFIWalletBalance() {
    this.walletInfo["YFI"] = await this.contracts.yfi.methods.balanceOf(this.accountInfo).call();
    return this.walletInfo["YFI"]
  }

  async getUNIAmplWalletBalance() {
    this.walletInfo["CREAM"] = await this.contracts.UNIAmpl.methods.balanceOf(this.accountInfo).call();
    return this.walletInfo["CREAM"]
  }

  async getWETHWalletBalance() {
    this.walletInfo["WETH"] = await this.contracts.weth.methods.balanceOf(this.accountInfo).call();
    return this.walletInfo["WETH"]
  }

  async getETHWalletBalance() {
    this.walletInfo["ETH"] = await this.contracts.web3.eth.getBalance(this.accountInfo);
    return this.walletInfo["ETH"]
  }
}
