import BigNumber from 'bignumber.js/bignumber';
import { INTEGERS } from './constants.js';


export function stringToDecimal(s) {
  return new BigNumber(s).div(INTEGERS.INTEREST_RATE_BASE);
}

export function decimalToString(d) {
  return new BigNumber(d).times(INTEGERS.INTEREST_RATE_BASE).toFixed(0);
}

export function toString(input) {
  return new BigNumber(input).toFixed(0);
}

export function integerToValue(i) {
  return {
    sign: i.isGreaterThan(0),
    value: i.abs().toFixed(0),
  };
}

export function valueToInteger(
  { value, sign },
) {
  let result = new BigNumber(value);
  if (!result.isZero() && !sign) {
    result = result.times(-1);
  }
  return result;
}

export function coefficientsToString(
  coefficients,
) {
  let m = new BigNumber(1);
  let result = new BigNumber(0);
  for (let i = 0; i < coefficients.length; i += 1) {
    result = result.plus(m.times(coefficients[i]));
    m = m.times(256);
  }
  return result.toFixed(0);
}

export function toNumber(input) {
  return new BigNumber(input).toNumber();
}


function partial(
  target,
  numerator,
  denominator,
){
  return target.times(numerator).div(denominator).integerValue(BigNumber.ROUND_DOWN);
}
