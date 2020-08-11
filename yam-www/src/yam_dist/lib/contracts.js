"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Contracts = void 0;

require("core-js/modules/es6.symbol");

require("core-js/modules/web.dom.iterable");

var _bignumber = _interopRequireDefault(require("bignumber.js/bignumber"));

var _web = _interopRequireDefault(require("web3"));

var Types = _interopRequireWildcard(require("./types.js"));

var _constants = require("./constants.js");

var _IERC = _interopRequireDefault(require("../clean_build/contracts/IERC20.json"));

var _YAMDelegator = _interopRequireDefault(require("../clean_build/contracts/YAMDelegator.json"));

var _YAMRebaser = _interopRequireDefault(require("../clean_build/contracts/YAMRebaser.json"));

var _YAMReserves = _interopRequireDefault(require("../clean_build/contracts/YAMReserves.json"));

var _GovernorAlpha = _interopRequireDefault(require("../clean_build/contracts/GovernorAlpha.json"));

var _Timelock = _interopRequireDefault(require("../clean_build/contracts/Timelock.json"));

var _weth = _interopRequireDefault(require("./weth.json"));

var _snx = _interopRequireDefault(require("./snx.json"));

var _unifact = _interopRequireDefault(require("./unifact2.json"));

var _uni = _interopRequireDefault(require("./uni2.json"));

var _uniR = _interopRequireDefault(require("./uniR.json"));

var _YAMETHPool = _interopRequireDefault(require("../clean_build/contracts/YAMETHPool.json"));

var _YAMAMPLPool = _interopRequireDefault(require("../clean_build/contracts/YAMAMPLPool.json"));

var _YAMYFIPool = _interopRequireDefault(require("../clean_build/contracts/YAMYFIPool.json"));

var _YAMMKRPool = _interopRequireDefault(require("../clean_build/contracts/YAMMKRPool.json"));

var _YAMLENDPool = _interopRequireDefault(require("../clean_build/contracts/YAMLENDPool.json"));

var _YAMCOMPPool = _interopRequireDefault(require("../clean_build/contracts/YAMCOMPPool.json"));

var _YAMSNXPool = _interopRequireDefault(require("../clean_build/contracts/YAMSNXPool.json"));

var _YAMLINKPool = _interopRequireDefault(require("../clean_build/contracts/YAMLINKPool.json"));

var _YAMIncentivizer = _interopRequireDefault(require("../clean_build/contracts/YAMIncentivizer.json"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

class Contracts {
  constructor(provider, networkId, web3, options) {
    this.web3 = web3;
    this.defaultConfirmations = options.defaultConfirmations;
    this.autoGasMultiplier = options.autoGasMultiplier || 1.5;
    this.confirmationType = options.confirmationType || Types.ConfirmationType.Confirmed;
    this.defaultGas = options.defaultGas;
    this.defaultGasPrice = options.defaultGasPrice;
    this.uni_pair = new this.web3.eth.Contract(_uni.default);
    this.uni_router = new this.web3.eth.Contract(_uniR.default);
    this.uni_fact = new this.web3.eth.Contract(_unifact.default);
    this.yfi = new this.web3.eth.Contract(_IERC.default.abi);
    this.UNIAmpl = new this.web3.eth.Contract(_IERC.default.abi);
    this.ycrv = new this.web3.eth.Contract(_IERC.default.abi);
    this.yam = new this.web3.eth.Contract(_YAMDelegator.default.abi);
    this.yfi_pool = new this.web3.eth.Contract(_YAMYFIPool.default.abi);
    this.eth_pool = new this.web3.eth.Contract(_YAMETHPool.default.abi);
    this.ampl_pool = new this.web3.eth.Contract(_YAMAMPLPool.default.abi);
    this.ycrv_pool = new this.web3.eth.Contract(_YAMIncentivizer.default.abi);
    this.comp_pool = new this.web3.eth.Contract(_YAMCOMPPool.default.abi);
    this.link_pool = new this.web3.eth.Contract(_YAMLINKPool.default.abi);
    this.lend_pool = new this.web3.eth.Contract(_YAMLENDPool.default.abi);
    this.snx_pool = new this.web3.eth.Contract(_YAMSNXPool.default.abi);
    this.mkr_pool = new this.web3.eth.Contract(_YAMMKRPool.default.abi);
    this.comp = new this.web3.eth.Contract(_IERC.default.abi);
    this.link = new this.web3.eth.Contract(_IERC.default.abi);
    this.lend = new this.web3.eth.Contract(_IERC.default.abi);
    this.snx = new this.web3.eth.Contract(_IERC.default.abi);
    this.mkr = new this.web3.eth.Contract(_IERC.default.abi);
    this.erc20 = new this.web3.eth.Contract(_IERC.default.abi);
    this.pool = new this.web3.eth.Contract(_YAMLENDPool.default.abi);
    this.rebaser = new this.web3.eth.Contract(_YAMRebaser.default.abi);
    this.reserves = new this.web3.eth.Contract(_YAMReserves.default.abi);
    this.gov = new this.web3.eth.Contract(_GovernorAlpha.default.abi);
    this.timelock = new this.web3.eth.Contract(_Timelock.default.abi);
    this.weth = new this.web3.eth.Contract(_weth.default);
    this.setProvider(provider, networkId);
    this.setDefaultAccount(this.web3.eth.defaultAccount);
  }

  setProvider(provider, networkId) {
    this.yam.setProvider(provider);
    this.rebaser.setProvider(provider);
    this.reserves.setProvider(provider);
    this.gov.setProvider(provider);
    this.timelock.setProvider(provider);
    const contracts = [{
      contract: this.yam,
      json: _YAMDelegator.default
    }, {
      contract: this.rebaser,
      json: _YAMRebaser.default
    }, {
      contract: this.reserves,
      json: _YAMReserves.default
    }, {
      contract: this.gov,
      json: _GovernorAlpha.default
    }, {
      contract: this.timelock,
      json: _Timelock.default
    }, {
      contract: this.ycrv_pool,
      json: _YAMIncentivizer.default
    }, {
      contract: this.eth_pool,
      json: _YAMETHPool.default
    }, {
      contract: this.yfi_pool,
      json: _YAMYFIPool.default
    }, {
      contract: this.ampl_pool,
      json: _YAMAMPLPool.default
    }, {
      contract: this.snx_pool,
      json: _YAMSNXPool.default
    }, {
      contract: this.mkr_pool,
      json: _YAMMKRPool.default
    }, {
      contract: this.lend_pool,
      json: _YAMLENDPool.default
    }, {
      contract: this.link_pool,
      json: _YAMLINKPool.default
    }, {
      contract: this.comp_pool,
      json: _YAMCOMPPool.default
    }];
    contracts.forEach(contract => this.setContractProvider(contract.contract, contract.json, provider, networkId));
    this.yfi.options.address = _constants.addressMap["YFI"];
    this.ycrv.options.address = _constants.addressMap["YCRV"];
    this.weth.options.address = _constants.addressMap["WETH"];
    this.snx.options.address = _constants.addressMap["SNX"];
    this.comp.options.address = _constants.addressMap["COMP"];
    this.link.options.address = _constants.addressMap["LINK"];
    this.lend.options.address = _constants.addressMap["LEND"];
    this.mkr.options.address = _constants.addressMap["MKR"];
    this.UNIAmpl.options.address = _constants.addressMap["UNIAmpl"];
    this.uni_fact.options.address = _constants.addressMap["uniswapFactoryV2"];
    this.uni_router.options.address = _constants.addressMap["UNIRouter"];
    this.pools = [{
      "tokenAddr": this.yfi.options.address,
      "poolAddr": this.yfi_pool.options.address
    }, {
      "tokenAddr": this.snx.options.address,
      "poolAddr": this.snx_pool.options.address
    }, {
      "tokenAddr": this.weth.options.address,
      "poolAddr": this.eth_pool.options.address
    }, {
      "tokenAddr": this.comp.options.address,
      "poolAddr": this.comp_pool.options.address
    }, {
      "tokenAddr": this.link.options.address,
      "poolAddr": this.link_pool.options.address
    }, {
      "tokenAddr": this.lend.options.address,
      "poolAddr": this.lend_pool.options.address
    }, {
      "tokenAddr": this.mkr.options.address,
      "poolAddr": this.mkr_pool.options.address
    }, {
      "tokenAddr": this.UNIAmpl.options.address,
      "poolAddr": this.ampl_pool.options.address
    }];
  }

  setDefaultAccount(account) {
    this.yfi.options.from = account;
    this.ycrv.options.from = account;
    this.yam.options.from = account;
    this.weth.options.from = account;
  }

  async callContractFunction(method, options) {
    const {
      confirmations,
      confirmationType,
      autoGasMultiplier
    } = options,
          txOptions = _objectWithoutProperties(options, ["confirmations", "confirmationType", "autoGasMultiplier"]);

    if (!this.blockGasLimit) {
      await this.setGasLimit();
    }

    if (!txOptions.gasPrice && this.defaultGasPrice) {
      txOptions.gasPrice = this.defaultGasPrice;
    }

    if (confirmationType === Types.ConfirmationType.Simulate || !options.gas) {
      let gasEstimate;

      if (this.defaultGas && confirmationType !== Types.ConfirmationType.Simulate) {
        txOptions.gas = this.defaultGas;
      } else {
        try {
          console.log("estimating gas");
          gasEstimate = await method.estimateGas(txOptions);
        } catch (error) {
          const data = method.encodeABI();
          const {
            from,
            value
          } = options;
          const to = method._parent._address;
          error.transactionData = {
            from,
            value,
            data,
            to
          };
          throw error;
        }

        const multiplier = autoGasMultiplier || this.autoGasMultiplier;
        const totalGas = Math.floor(gasEstimate * multiplier);
        txOptions.gas = totalGas < this.blockGasLimit ? totalGas : this.blockGasLimit;
      }

      if (confirmationType === Types.ConfirmationType.Simulate) {
        let g = txOptions.gas;
        return {
          gasEstimate,
          g
        };
      }
    }

    if (txOptions.value) {
      txOptions.value = new _bignumber.default(txOptions.value).toFixed(0);
    } else {
      txOptions.value = '0';
    }

    const promi = method.send(txOptions);
    const OUTCOMES = {
      INITIAL: 0,
      RESOLVED: 1,
      REJECTED: 2
    };
    let hashOutcome = OUTCOMES.INITIAL;
    let confirmationOutcome = OUTCOMES.INITIAL;
    const t = confirmationType !== undefined ? confirmationType : this.confirmationType;

    if (!Object.values(Types.ConfirmationType).includes(t)) {
      throw new Error("Invalid confirmation type: ".concat(t));
    }

    let hashPromise;
    let confirmationPromise;

    if (t === Types.ConfirmationType.Hash || t === Types.ConfirmationType.Both) {
      hashPromise = new Promise((resolve, reject) => {
        promi.on('error', error => {
          if (hashOutcome === OUTCOMES.INITIAL) {
            hashOutcome = OUTCOMES.REJECTED;
            reject(error);
            const anyPromi = promi;
            anyPromi.off();
          }
        });
        promi.on('transactionHash', txHash => {
          if (hashOutcome === OUTCOMES.INITIAL) {
            hashOutcome = OUTCOMES.RESOLVED;
            resolve(txHash);

            if (t !== Types.ConfirmationType.Both) {
              const anyPromi = promi;
              anyPromi.off();
            }
          }
        });
      });
    }

    if (t === Types.ConfirmationType.Confirmed || t === Types.ConfirmationType.Both) {
      confirmationPromise = new Promise((resolve, reject) => {
        promi.on('error', error => {
          if ((t === Types.ConfirmationType.Confirmed || hashOutcome === OUTCOMES.RESOLVED) && confirmationOutcome === OUTCOMES.INITIAL) {
            confirmationOutcome = OUTCOMES.REJECTED;
            reject(error);
            const anyPromi = promi;
            anyPromi.off();
          }
        });
        const desiredConf = confirmations || this.defaultConfirmations;

        if (desiredConf) {
          promi.on('confirmation', (confNumber, receipt) => {
            if (confNumber >= desiredConf) {
              if (confirmationOutcome === OUTCOMES.INITIAL) {
                confirmationOutcome = OUTCOMES.RESOLVED;
                resolve(receipt);
                const anyPromi = promi;
                anyPromi.off();
              }
            }
          });
        } else {
          promi.on('receipt', receipt => {
            confirmationOutcome = OUTCOMES.RESOLVED;
            resolve(receipt);
            const anyPromi = promi;
            anyPromi.off();
          });
        }
      });
    }

    if (t === Types.ConfirmationType.Hash) {
      const transactionHash = await hashPromise;

      if (this.notifier) {
        this.notifier.hash(transactionHash);
      }

      return {
        transactionHash
      };
    }

    if (t === Types.ConfirmationType.Confirmed) {
      return confirmationPromise;
    }

    const transactionHash = await hashPromise;

    if (this.notifier) {
      this.notifier.hash(transactionHash);
    }

    return {
      transactionHash,
      confirmation: confirmationPromise
    };
  }

  async callConstantContractFunction(method, options) {
    const m2 = method;

    const {
      blockNumber
    } = options,
          txOptions = _objectWithoutProperties(options, ["blockNumber"]);

    return m2.call(txOptions, blockNumber);
  }

  async setGasLimit() {
    const block = await this.web3.eth.getBlock('latest');
    this.blockGasLimit = block.gasLimit - _constants.SUBTRACT_GAS_LIMIT;
  }

  setContractProvider(contract, contractJson, provider, networkId) {
    contract.setProvider(provider);

    try {
      contract.options.address = contractJson.networks[networkId] && contractJson.networks[networkId].address;
    } catch (error) {// console.log(error)
    }
  }

}

exports.Contracts = Contracts;
