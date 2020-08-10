import React, { useEffect, useState } from 'react'

import Context from './context'
import { Farm } from './types'

const Farms: React.FC = ({ children }) => {
  const [farms, setFarms] = useState<Farm[]>([])
  useEffect(() => {
    setFarms([
      { name: 'Marine Fields', depositToken: 'LINK', earnToken: 'YAM', icon: '🔗', id: 'marine-fields' },
      { name: 'Spartan Grounds', depositToken: 'SNX', earnToken: 'YAM', icon: '⚔️', id: 'spartan-grounds' },
      { name: 'Compounding Hills', depositToken: 'COMP', earnToken: 'YAM', icon: '💸', id: 'compounding-hills' },
      { name: 'Maker Range', depositToken: 'MKR', earnToken: 'YAM', icon: '🐮', id: 'maker-range' },
      { name: 'Ample Soils', depositToken: 'AMPL/ETH Uniswap LP Shares', earnToken: 'YAM', icon: '🌷', id: 'ample-soils' },
      { name: 'Aave Agriculture', depositToken: 'LEND', earnToken: 'YAM', icon: '🏕️', id: 'aave-agriculture' },
      { name: 'Weth Homestead', depositToken: 'WETH', earnToken: 'YAM', icon: '🌏', id: 'weth-homestead' },
      { name: 'YFI Farm', depositToken: 'YFI', earnToken: 'YAM', icon: '🐋', id: 'yfi-farm' }
    ])
  }, [setFarms])
  return (
    <Context.Provider value={{
      farms,
    }}>
      {children}
    </Context.Provider>
  )
}

export default Farms