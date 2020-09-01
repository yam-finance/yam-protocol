import React, { useCallback, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { useWallet } from 'use-wallet'

import useYam from '../../../hooks/useYam'

import ZOMBIEPoolJson from '../../../yam/clean_build/contracts/ZombiePool.json';
import UNIPoolJson from '../../../yam/clean_build/contracts/ShrimpUniPool.json';
import DOGEPoolJson from '../../../yam/clean_build/contracts/DOGEPoolJson.json';


import {
  current_Dai_value,
  current_DaiStaked_value,
  log_data,
  log_data2
} from '../../../yamUtils'

const TVL: React.FC = () => {
  const [dicelptvl, setdicelptvl] = useState("loading...")

  const yam = useYam()
  const { ethereum } = useWallet()
  var address = '0xdcEe2dC9834dfbc7d24C57769ED51daf202a1b87'
  var cAddress = '0xd55BD2C12B30075b325Bc35aEf0B46363B3818f8'
  var nowAbi = ZOMBIEPoolJson.abi
  var currentCoinPrice = 'zombie-finance'
  var token_name = "";
  var new_tvl = 0

  function a(tokenname: any) {
    switch (tokenname) {
      case 'zombie':
        address = '0xdcEe2dC9834dfbc7d24C57769ED51daf202a1b87'
        cAddress = '0xd55BD2C12B30075b325Bc35aEf0B46363B3818f8'
        nowAbi = ZOMBIEPoolJson.abi
        currentCoinPrice = 'zombie-finance'
        token_name = tokenname
        return currentCoinPrice;
      case 'uni':
        address = '0x03b42a5e68d5a0bc47ad52d1decf3752d6091264'
        cAddress = '0xeba5d22bbeb146392d032a2f74a735d66a32aee4'
        nowAbi = UNIPoolJson.abi
        currentCoinPrice = '1'
        token_name = tokenname
        return currentCoinPrice;
      case 'dogefi':
        address = '0x145FF9b001A7E9a2b547f0b41813f7706a002526'
        cAddress = '0x9B9087756eCa997C5D595C840263001c9a26646D'
        nowAbi = DOGEPoolJson.abi
        currentCoinPrice = 'dogefi'
        token_name = tokenname
        return currentCoinPrice;
      default:
        address = '0xdcEe2dC9834dfbc7d24C57769ED51daf202a1b87'
        cAddress = '0xd55BD2C12B30075b325Bc35aEf0B46363B3818f8'
        nowAbi = ZOMBIEPoolJson.abi
        currentCoinPrice = 'zombie-finance'
        token_name = tokenname
        return currentCoinPrice;
    }
  }


  const get_wrapped_value = useCallback(async (num, old_tvl) => {
    const totalEthWrapped = await log_data(ethereum, cAddress, nowAbi);
    get_prices_wrapped(totalEthWrapped / Number(num), old_tvl)
  }, [yam])

  const get_altwrapped_value = useCallback(async (num, old_tvl) => {
    const totalDaiwrapped = await log_data2(ethereum, cAddress, nowAbi);
    get_prices_wrapped(totalDaiwrapped / Number(num), old_tvl)
  }, [yam])

  const getdai = useCallback(async (num, stake, old_tvl) => {
    if (currentCoinPrice === '1') {
      setCurrentTVl(num, stake, old_tvl)
    } else if (currentCoinPrice === '2') {
      setCurrentTVl(num, stake, old_tvl)
    } else {
      setCurrentTVl(num, stake, old_tvl)
    }

  }, [yam])

  const getdaistaked = useCallback(async (num, zomNum, old_tvl) => {
    const total_Amount_Staked = await current_DaiStaked_value(ethereum, address);
    getdai(num, total_Amount_Staked, old_tvl)
  }, [yam])

  const callPrice = useCallback(async (coin_name, old_tvl) => {
    if (currentCoinPrice === '1') {
      const totalDai = await current_Dai_value(ethereum, cAddress);
      get_wrapped_value(totalDai, old_tvl)
    } else if (currentCoinPrice === '2') {
      const totalDai = await current_Dai_value(ethereum, cAddress);
      get_altwrapped_value(totalDai, old_tvl)
    } else {
      if(token_name === 'dogefi'){
        get_prices(.5, old_tvl)
      } else {
      axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=Cethereum%2C${coin_name}&vs_currencies=usd`).then((res) => {
        if (res.status === 200) {
          get_prices(Number(res.data[`${coin_name}`].usd), old_tvl)
        }
      })
    }
  }
  }, [yam])

  const get_prices_wrapped = useCallback(async (num, old_tvl) => {
    getdaistaked(num, 0, old_tvl)
  }, [yam])

  const get_prices = useCallback(async (num, old_tvl) => {
    getdaistaked(num, 0, old_tvl)
  }, [yam])

  const setCurrentTVl = useCallback(async (num, stake, oldtvl) => {
    //stake is the value staked
    //num is the current value of the coin
    var new_tvl = 0;
    switch (token_name) {
      case 'zombie':
        new_tvl = oldtvl + Number(stake) * Number(num)
        callPrice(a('dogefi'), new_tvl)
        break;
      case 'dogefi':
        new_tvl = oldtvl + Number(stake) * Number(num)
        callPrice(a('uni'), new_tvl)
        break;
      case 'uni':
        new_tvl = oldtvl + Number(stake) * Number(num)
        if (isNaN(new_tvl)) {
          setdicelptvl('unlock wallet');
        } else {
          setdicelptvl(new_tvl.toLocaleString());
        }
        break;
      default:
        return;
    }

  }, [yam])

  useEffect(() => {
    callPrice(a('zombie'), 0)

  }, [])

  return (
    <>

      <div>
        {(dicelptvl)}
      </div>
    </>
  )
}

export default TVL 
