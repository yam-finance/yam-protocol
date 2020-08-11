import { Yam } from '../../yam_dist'

const getCurrentPrice = async (yam: typeof Yam): Promise<number> => {
  // FORBROCK: get current YAM price
  return 0
}

const getTargetPrice = async (yam: typeof Yam): Promise<number> => {
  // FORBROCK: get target YAM price
  return 0
}

const getCirculatingSupply = async (yam: typeof Yam): Promise<number> => {
  // FORBROCK: get circulating supply
  return 0
}

const getTotalSupply = async (yam: typeof Yam): Promise<number> => {
  // FORBROCK: get total supply
  return 0
}

export const getStats = async (yam: typeof Yam) => {
  const curPrice = await getCurrentPrice(yam)
  const circSupply = await getCirculatingSupply(yam)
  const targetPrice = await getTargetPrice(yam)
  const totalSupply = await getTotalSupply(yam)
  return {
    circSupply,
    curPrice,
    targetPrice,
    totalSupply
  }
}
