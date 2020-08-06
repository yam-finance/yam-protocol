"use strict";

require("core-js/modules/es6.regexp.to-string");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.stringToDecimal = stringToDecimal;
exports.decimalToString = decimalToString;
exports.toString = toString;
exports.integerToValue = integerToValue;
exports.valueToInteger = valueToInteger;
exports.coefficientsToString = coefficientsToString;
exports.toNumber = toNumber;

var _bignumber = _interopRequireDefault(require("bignumber.js/bignumber"));

var _constants = require("./constants.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function stringToDecimal(s) {
  return new _bignumber.default(s).div(_constants.INTEGERS.INTEREST_RATE_BASE);
}

function decimalToString(d) {
  return new _bignumber.default(d).times(_constants.INTEGERS.INTEREST_RATE_BASE).toFixed(0);
}

function toString(input) {
  return new _bignumber.default(input).toFixed(0);
}

function integerToValue(i) {
  return {
    sign: i.isGreaterThan(0),
    value: i.abs().toFixed(0)
  };
}

function valueToInteger(_ref) {
  let {
    value,
    sign
  } = _ref;
  let result = new _bignumber.default(value);

  if (!result.isZero() && !sign) {
    result = result.times(-1);
  }

  return result;
}

function coefficientsToString(coefficients) {
  let m = new _bignumber.default(1);
  let result = new _bignumber.default(0);

  for (let i = 0; i < coefficients.length; i += 1) {
    result = result.plus(m.times(coefficients[i]));
    m = m.times(256);
  }

  return result.toFixed(0);
}

function toNumber(input) {
  return new _bignumber.default(input).toNumber();
}

function partial(target, numerator, denominator) {
  return target.times(numerator).div(denominator).integerValue(_bignumber.default.ROUND_DOWN);
}