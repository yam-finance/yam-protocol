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

  const fetchPools = useCallback(async () => {
    const pools: { [key: string]: Contract} = await getPoolContracts(yam)
    
    const farmsArr: Farm[] = []
    const poolKeys = Object.keys(pools)
    for (let i = 0; i < poolKeys.length; i++) {
      const poolKey = poolKeys[i]
      const pool = pools[poolKey]
      let tokenKey = poolKey.replace('_pool', '')
      if (tokenKey === 'eth') {
        tokenKey = 'weth'
      }
      const method = pool.methods[tokenKey]
      if (method) {
        try {
          const tokenAddress = await method().call()
          farmsArr.push({
            contract: pool,
            name: `${tokenKey} pool`,
            depositToken: tokenKey,
            depositTokenAddress: tokenAddress,
            earnToken: 'yam',
            earnTokenAddress: yamAddress,
            icon: '.',
            id: tokenKey
          })
        } catch (e) {
          console.log(e)
        }
      }
    }
    setFarms(farmsArr)
  }, [yam, setFarms])

  useEffect(() => {
    if (yam) {
      fetchPools()
    }
  }, [yam, fetchPools])
  
  return (
    <Context.Provider value={{ farms }}>
      {children}
    </Context.Provider>
  )
}

export default Farms