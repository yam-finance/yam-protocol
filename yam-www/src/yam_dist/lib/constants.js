"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addressMap = exports.INTEGERS = exports.SUBTRACT_GAS_LIMIT = void 0;

var _bignumber = _interopRequireDefault(require("bignumber.js/bignumber"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const SUBTRACT_GAS_LIMIT = 100000;
exports.SUBTRACT_GAS_LIMIT = SUBTRACT_GAS_LIMIT;
const ONE_MINUTE_IN_SECONDS = new _bignumber.default(60);
const ONE_HOUR_IN_SECONDS = ONE_MINUTE_IN_SECONDS.times(60);
const ONE_DAY_IN_SECONDS = ONE_HOUR_IN_SECONDS.times(24);
const ONE_YEAR_IN_SECONDS = ONE_DAY_IN_SECONDS.times(365);
const INTEGERS = {
  ONE_MINUTE_IN_SECONDS,
  ONE_HOUR_IN_SECONDS,
  ONE_DAY_IN_SECONDS,
  ONE_YEAR_IN_SECONDS,
  ZERO: new _bignumber.default(0),
  ONE: new _bignumber.default(1),
  ONES_31: new _bignumber.default('4294967295'),
  // 2**32-1
  ONES_127: new _bignumber.default('340282366920938463463374607431768211455'),
  // 2**128-1
  ONES_255: new _bignumber.default('115792089237316195423570985008687907853269984665640564039457584007913129639935'),
  // 2**256-1
  INTEREST_RATE_BASE: new _bignumber.default('1e18')
};
exports.INTEGERS = INTEGERS;
const addressMap = {
  uniswapFactory: "0xc0a47dFe034B400B47bDaD5FecDa2621de6c4d95",
  uniswapFactoryV2: "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f",
  YFI: "0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e",
  YCRV: "0xdF5e0e81Dff6FAF3A7e52BA697820c5e32D806A8",
  UNIAmpl: "0xc5be99a02c6857f9eac67bbce58df5572498f40c",
  WETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  UNIRouter: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
  LINK: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
  MKR: "0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2",
  SNX: "0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F",
  COMP: "0xc00e94Cb662C3520282E6f5717214004A7f26888",
  LEND: "0x80fB784B7eD66730e8b1DBd9820aFD29931aab03"
};
exports.addressMap = addressMap;