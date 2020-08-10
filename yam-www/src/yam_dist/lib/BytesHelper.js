"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.hexStringToBytes = hexStringToBytes;
exports.bytesToHexString = bytesToHexString;
exports.toBytes = toBytes;
exports.argToBytes = argToBytes;
exports.addressToBytes32 = addressToBytes32;
exports.hashString = hashString;
exports.hashBytes = hashBytes;
exports.stripHexPrefix = stripHexPrefix;
exports.addressesAreEqual = addressesAreEqual;

require("core-js/modules/es6.regexp.to-string");

var _ethers = _interopRequireDefault(require("ethers"));

var _web = _interopRequireDefault(require("web3"));

var _bignumber = _interopRequireDefault(require("bignumber.js/bignumber"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function hexStringToBytes(hex) {
  if (!hex || hex === '0x') {
    return [];
  }

  return _web.default.utils.hexToBytes(hex).map(x => [x]);
}

function bytesToHexString(input) {
  return _ethers.default.utils.hexlify(input.map(x => new _bignumber.default(x[0]).toNumber()));
}

function toBytes() {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  const result = args.reduce((acc, val) => acc.concat(argToBytes(val)), []);
  return result.map(a => [a]);
}

function argToBytes(val) {
  let v = val;

  if (typeof val === 'boolean') {
    v = val ? '1' : '0';
  }

  if (typeof val === 'number') {
    v = val.toString();
  }

  if (val instanceof _bignumber.default) {
    v = val.toFixed(0);
  }

  return _web.default.utils.hexToBytes(_web.default.utils.padLeft(_web.default.utils.toHex(v), 64, '0'));
}

function addressToBytes32(input) {
  return "0x000000000000000000000000".concat(stripHexPrefix(input));
}

function hashString(input) {
  return _web.default.utils.soliditySha3({
    t: 'string',
    v: input
  });
}

function hashBytes(input) {
  // javascript soliditySha3 has a problem with empty bytes arrays, so manually return the same
  // value that solidity does for keccak256 of an empty bytes array
  if (!stripHexPrefix(input)) {
    return '0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470';
  }

  return _web.default.utils.soliditySha3({
    t: 'bytes',
    v: "0x".concat(stripHexPrefix(input))
  });
}

function stripHexPrefix(input) {
  if (input.indexOf('0x') === 0) {
    return input.substr(2);
  }

  return input;
}

function addressesAreEqual(addressOne, addressTwo) {
  return addressOne && addressTwo && stripHexPrefix(addressOne).toLowerCase() === stripHexPrefix(addressTwo).toLowerCase();
}