import React, { useCallback, useEffect, useState } from 'react'

import { Contract } from "web3-eth-contract"

import { yam as yamAddress } from '../../constants/tokenAddresses'
import useYam from '../../hooks/useYam'
import { getPoolContracts } from '../../yamUtils'

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

  const fetchPools = useCallback(async () => {
    const pools: { [key: string]: Contract} = await getPoolContracts(yam)
    const wethPool = pools['eth_pool']!
    const tokenAddress = await wethPool.methods.weth().call()
    setFarms([
      {
        contract: wethPool,
        name: 'Weth Pool',
        depositToken: 'weth',
        depositTokenAddress: tokenAddress,
        earnToken: 'yam',
        earnTokenAddress: yamAddress,
        icon: '.',
        id: 'weth',
      }
    ])
  }, [yam])

  useEffect(() => {
    if (yam) {
      fetchPools()
    }
  }, [yam])
  
  return (
    <Context.Provider value={{ farms }}>
      {children}
    </Context.Provider>
  )
}

export default Farms