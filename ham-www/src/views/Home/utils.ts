import { Ham } from '../../ham'

import {
  getCurrentPrice as gCP,
  getTargetPrice as gTP,
  getCirculatingSupply as gCS,
  getNextRebaseTimestamp as gNRT,
  getTotalSupply as gTS,
} from '../../hamUtils'

const getCurrentPrice = async (ham: typeof Ham): Promise<number> => {
  // FORBROCK: get current HAM price
  return gCP(ham)
}

const getTargetPrice = async (ham: typeof Ham): Promise<number> => {
  // FORBROCK: get target HAM price
  return gTP(ham)
}

const getCirculatingSupply = async (ham: typeof Ham): Promise<string> => {
  // FORBROCK: get circulating supply
  return gCS(ham)
}

const getNextRebaseTimestamp = async (ham: typeof Ham): Promise<number> => {
  // FORBROCK: get next rebase timestamp
  const nextRebase = await gNRT(ham) as number
  return nextRebase * 1000
}

const getTotalSupply = async (ham: typeof Ham): Promise<string> => {
  // FORBROCK: get total supply
  return gTS(ham)
}

export const getStats = async (ham: typeof Ham) => {
  const curPrice = await getCurrentPrice(ham)
  const circSupply = '' // await getCirculatingSupply(ham)
  const nextRebase = await getNextRebaseTimestamp(ham)
  const targetPrice = await getTargetPrice(ham)
  const totalSupply = await getTotalSupply(ham)
  return {
    circSupply,
    curPrice,
    nextRebase,
    targetPrice,
    totalSupply
  }
}
