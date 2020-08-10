"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "Web3", {
  enumerable: true,
  get: function get() {
    return _web.default;
  }
});
Object.defineProperty(exports, "BigNumber", {
  enumerable: true,
  get: function get() {
    return _bignumber.default;
  }
});
Object.defineProperty(exports, "Yam", {
  enumerable: true,
  get: function get() {
    return _Yam.Yam;
  }
});

var _web = _interopRequireDefault(require("web3"));

var _bignumber = _interopRequireDefault(require("bignumber.js/bignumber"));

var _Yam = require("./Yam.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_bignumber.default.config({
  EXPONENTIAL_AT: 1000,
  DECIMAL_PLACES: 80
});