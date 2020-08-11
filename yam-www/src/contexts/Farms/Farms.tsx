import React, { useEffect, useState } from 'react'

import useYam from '../../hooks/useYam'

import Context from './context'
import { Farm } from './types'

const Farms: React.FC = ({ children }) => {
  const [farms, setFarms] = useState<Farm[]>([])
  const yam = useYam()

  /*
  useEffect(() => {
    setFarms([
      {
        name: 'Marine Fields',
        depositToken: 'LINK',
        depositTokenAddress: '0x514910771af9ca656af840dff83e8264ecf986ca',
        earnToken: 'YAM',
        earnTokenAddress: '',
        icon: '🔗',
        id: 'marine-fields',
      },
    ])
  }, [setFarms])
  */

  useEffect(() => {
    if (yam) {
      console.log(yam)
    }
  }, [yam])
  
  return (
    <Context.Provider value={{ farms }}>
      {children}
    </Context.Provider>
  )
}

export default Farms