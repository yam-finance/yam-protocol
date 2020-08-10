export interface Farm {
  name: string,
  depositToken: string,
  earnToken: string,
  icon: React.ReactNode,
  id: string,
}

export interface FarmsContext {
  farms: Farm[]
}