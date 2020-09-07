import React, { useCallback, useEffect, useState } from 'react'

import { Contract } from 'web3-eth-contract'

import { yam as yamAddress } from '../../constants/tokenAddresses'
import useYam from '../../hooks/useYam'
import { getPoolContracts } from '../../yamUtils'

import Context from './context'
import { Farm } from './types'

const NAME_FOR_POOL: { [key: string]: string } = {
  zombie_pool: 'Zombie Swamp',
  bsd95_pool: 'Bal_Shrimp_Dai_95',
  bsd80_pool: 'Bal_Shrimp_Dai_80',
  yfi_pool: 'YFI Farm',
  eth_pool: 'Weth Homestead',
  cream_pool: 'Modgie streams',
  comp_pool: 'Compounding Hills',
  dice_pool: 'Safe Haven',
  uni_pool: 'WETH_SHRIMP_UNI_LP',
  taco_pool: 'Taco Tuesday',
  dogefi_pool: 'DogeFi Days',
  sushilp_pool: 'Sushi swap',
  kimchilp_pool: 'Kimchi crunch',
  frens_pool: 'Frens 4evur'
}

const ICON_FOR_POOL: { [key: string]: string } = {
  zombie_pool: 'aa',
  bsd95_pool: '⛵️',
  bsd80_pool: '🌊',
  yfi_pool: '🐋',
  eth_pool: '🌎',
  cream_pool: '🍦',
  comp_pool: '💸',
  dice_pool: '🎲',
  uni_pool: '🌈',
  taco_pool: '🌮',
  dogefi_pool: 'dd',
  sushilp_pool: '🍣',
  kimchilp_pool: 'k',
  frens_pool: 'f'
}

const SORT_FOR_POOL: { [key: string]: number } = {
  dogefi_pool: 3, //2
  zombie_pool: 13, //1
  bsd95_pool: 0,
  bsd80_pool: 1,  
  taco_pool: 2, //4
  yfi_pool: 5,
  eth_pool: 6,
  cream_pool: 7,
  comp_pool: 8,
  dice_pool: 9,
  uni_pool: 10,
  sushilp_pool: 11, //3
  kimchilp_pool: 4,
  frens_pool: 12
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
      if (tokenKey === 'sushilp') {
        tokenKey = 'shrimp_sushi_uni_LP'
      }

      if (tokenKey === 'kimchilp') {
        tokenKey = 'shrimp_kimchi_uni_LP'
      }

      try {
        let tokenAddress = ''

        if (tokenKey === 'dice') {
          tokenAddress = '0xCF67CEd76E8356366291246A9222169F4dBdBe64'
        }

        if (tokenKey === 'cream') {
          tokenAddress = '0x2ba592F78dB6436527729929AAf6c908497cB200'
        }

        if (tokenKey === 'comp') {
          tokenAddress = '0xc00e94cb662c3520282e6f5717214004a7f26888'
        }

        if (tokenKey === 'yfi') {
          tokenAddress = '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e'
        }

        if (tokenKey === 'weth') {
          tokenAddress = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
        }

        if (tokenKey === 'uni') {
          tokenAddress = '0xeba5d22bbeb146392d032a2f74a735d66a32aee4'
        }

        if (tokenKey === 'taco') {
          tokenAddress = '0x00D1793D7C3aAE506257Ba985b34C76AaF642557'
        }
        //Pool 95
        if (tokenKey === 'bsd95') {
          tokenAddress = '0x00D1793D7C3aAE506257Ba985b34C76AaF642557'
        }
        //Pool 80
        if (tokenKey === 'bsd80') {
          tokenAddress = '0x00D1793D7C3aAE506257Ba985b34C76AaF642557'
        }

        if (tokenKey === 'zombie') {
          tokenAddress = '0xd55BD2C12B30075b325Bc35aEf0B46363B3818f8'
        }

        if (tokenKey === 'dogefi') {
          tokenAddress = '0x9B9087756eCa997C5D595C840263001c9a26646D'
        }

        if (tokenKey === 'shrimp_sushi_uni_LP') {
          tokenAddress = '0x335047EdC5a61f230da56e224a6555d313e961de'
        }

        if (tokenKey === 'shrimp_kimchi_uni_LP') {
          tokenAddress = '0x1fe3b8360691996da69336c825d6446f7fb81933'
        }

        if (tokenKey === 'frens') {
          tokenAddress = '0x907cb97615b7cD7320Bc89bb7CDB46e37432eBe7'
        }
        
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
        alert(e);
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