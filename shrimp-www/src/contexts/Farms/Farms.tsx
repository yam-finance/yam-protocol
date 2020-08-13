import React, { useCallback, useEffect, useState } from 'react'

import { Contract } from 'web3-eth-contract'

import { yam as yamAddress } from '../../constants/tokenAddresses'
import useYam from '../../hooks/useYam'
import { getPoolContracts } from '../../yamUtils'

import Context from './context'
import { Farm } from './types'

const NAME_FOR_POOL: { [key: string]: string } = {
  yfi_pool: 'YFI Farm',
  eth_pool: 'Weth Homestead',
  cream_pool: 'Modgie streams',
  comp_pool: 'Compounding Hills',
  dice_pool: 'Safe Haven',
}

const ICON_FOR_POOL: { [key: string]: string } = {
  yfi_pool: '🐋',
  eth_pool: '🌎',
  cream_pool: '🍦',
  comp_pool: '💸',
  dice_pool: '🎲',
}

const SORT_FOR_POOL: { [key: string]: number } = {
  yfi_pool: 0,
  eth_pool: 1,
  cream_pool: 2,
  comp_pool: 3,
  dice_pool: 4,
}

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
      //  else if (tokenKey === 'ampl') {
      //   tokenKey = 'ampl_eth_uni_lp'
      // } else if (tokenKey === 'scrv') {
      //   tokenKey = 'scrv_shrimp_uni_lp'
      // }

      const method = pool.methods[tokenKey]
      try {
        let tokenAddress = ''
        if (method) {
          tokenAddress = await method().call()
        } 
        // else if (tokenKey === 'scrv_shrimp_uni_lp') {
        //   tokenAddress = '0xdf5e0e81dff6faf3a7e52ba697820c5e32d806a8'
        // }
        farmsArr.push({
          contract: pool,
          name: NAME_FOR_POOL[poolKey],
          depositToken: tokenKey,
          depositTokenAddress: tokenAddress,
          earnToken: 'shrimp',
          earnTokenAddress: yamAddress,
          icon: ICON_FOR_POOL[poolKey],
          id: tokenKey,
          sort: SORT_FOR_POOL[poolKey]
        })
      } catch (e) {
        console.log(e)
      }
    }
    farmsArr.sort((a, b) => a.sort < b.sort ? 1 : -1)
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