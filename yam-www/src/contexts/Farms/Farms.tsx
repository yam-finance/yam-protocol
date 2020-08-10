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