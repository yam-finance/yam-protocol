import React, { useCallback, useEffect, useState } from 'react'

import { useWallet } from 'use-wallet'
import { Contract } from 'web3-eth-contract'

import { yam as yamAddress } from '../../constants/tokenAddresses'
import useYam from '../../hooks/useYam'

import { bnToDec } from '../../utils'
import { getPoolContracts, getEarned } from '../../yamUtils'

import Context from './context'
import { Farm } from './types'

const NAME_FOR_POOL: { [key: string]: string } = {
  yfi_pool: 'YFI Farm',
  eth_pool: 'Weth Homestead',
  ampl_pool: 'Ample Soils',
  ycrv_pool: 'Eternal Lands',
  comp_pool: 'Compounding Hills',
  link_pool: 'Marine Gardens',
  lend_pool: 'Aave Agriculture',
  snx_pool: 'Spartan Grounds',
  mkr_pool: 'Maker Range',
}

const ICON_FOR_POOL: { [key: string]: string } = {
  yfi_pool: '🐋',
  eth_pool: '🌎',
  ampl_pool: '🌷',
  comp_pool: '💸',
  link_pool: '🔗',
  lend_pool: '🏕️',
  snx_pool: '⚔️',
  mkr_pool: '🐮',
  ycrv_pool: '🌈',
}

const SORT_FOR_POOL: { [key: string]: number } = {
  yfi_pool: 0,
  eth_pool: 1,
  ampl_pool: 2,
  comp_pool: 3,
  ycrv_pool: 4,
  link_pool: 5,
  lend_pool: 6,
  snx_pool: 7,
  mkr_pool: 8,
}

const Farms: React.FC = ({ children }) => {

  const [farms, setFarms] = useState<Farm[]>([])
  const [unharvested, setUnharvested] = useState(0)
  
  const yam = useYam()
  const { account } = useWallet()

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
      } else if (tokenKey === 'ampl') {
        tokenKey = 'ampl_eth_uni_lp'
      } else if (tokenKey === 'ycrv') {
        tokenKey = 'ycrv_yam_uni_lp'
      }

      const method = pool.methods[tokenKey]
      try {
        let tokenAddress = ''
        if (method) {
          tokenAddress = await method().call()
        } else if (tokenKey === 'ycrv_yam_uni_lp') {
          tokenAddress = '0xdf5e0e81dff6faf3a7e52ba697820c5e32d806a8'
        }
        farmsArr.push({
          contract: pool,
          name: NAME_FOR_POOL[poolKey],
          depositToken: tokenKey,
          depositTokenAddress: tokenAddress,
          earnToken: 'yam',
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

  useEffect(() => {
    async function fetchUnharvested () {
      const unharvestedBalances = await Promise.all(farms.map(async (farm: Farm) => {
        const earnings = await getEarned(yam, farm.contract, account)
        return bnToDec(earnings)
      }))
      const totalBal = unharvestedBalances.reduce((acc, val) => acc + val)
      setUnharvested(totalBal)
    }
    if (account && farms.length && yam) {
      fetchUnharvested()
    }
  }, [account, farms, setUnharvested, yam])
  
  return (
    <Context.Provider value={{
      farms,
      unharvested,
    }}>
      {children}
    </Context.Provider>
  )
}

export default Farms