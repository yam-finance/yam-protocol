import BigNumber from 'bignumber.js'

export const getDisplayBalance = (balance: BigNumber, decimals = 18) => {
  return balance.dividedBy(new BigNumber(10).pow(18)).toString()
}