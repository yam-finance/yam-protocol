export interface Farm {
  name: string,
  depositToken: string,
  depositTokenAddress: string,
  earnToken: string,
  earnTokenAddress: string,
  icon: React.ReactNode,
  id: string,
}

export interface FarmsContext {
  farms: Farm[]
}