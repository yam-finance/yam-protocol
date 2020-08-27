import React, { useCallback, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import Countdown, { CountdownRenderProps } from 'react-countdown'
import axios from 'axios'
import { useWallet } from 'use-wallet'

import Card from '../../../components/Card'
import CardContent from '../../../components/CardContent'

import useFarms from '../../../hooks/useFarms'

import { Farm } from '../../../contexts/Farms'

import useYam from '../../../hooks/useYam'

import UNIPoolJson from '../../../yam/clean_build/contracts/ShrimpUniPool.json';
import ZombiePool from '../../../yam/clean_build/contracts/ZombiePool.json';
import CREAMPoolJson from '../../../yam/clean_build/contracts/SHRIMPCREAMPool.json';
import DICEPoolJson from '../../../yam/clean_build/contracts/SHRIMPDICEPool.json';
import WETHPoolJson from '../../../yam/clean_build/contracts/YAMETHPool.json';
import YFIPoolJson from '../../../yam/clean_build/contracts/YAMYFIPool.json';

import doge from '../../../assets/img/doge.png'

import {
  current_zom_value,
  current_Dai_value,
  current_DaiStaked_value,
  current_UserDaiStaked_value,
  current_UserDaiEarned_value,
  current_DaiAPY,
  log_data,
  log_data2,
  log_data3,
  log_data4
} from '../../../yamUtils'


const StatCards: React.FC = () => {
  const [farms] = useFarms()
  const rows = farms.reduce<Farm[][]>((farmRows, farm) => {
    const newFarmRows = [...farmRows]
    if (newFarmRows[newFarmRows.length - 1].length) {
      newFarmRows.push([farm])
    } else {
      newFarmRows[newFarmRows.length - 1].push(farm)
    }
    return newFarmRows
  }, [[]])




  return (
    <StyledCards>
      {rows.map((farmRow, i) => (
        <StyledRow key={i}>
          {farmRow.map((farm, j) => (
            <React.Fragment key={j}>
              {farm.sort === 1 || farm.sort === 0 || farm.id === 'cream' || farm.id === 'shrimp' || farm.id === 'dice' ||farm.id === 'taco' || farm.id === 'comp' || farm.id === 'yfi' || farm.id === 'weth' || farm.id === 'dogefi' ?
              ''
              :
              <FarmCard farm={farm} />
            }
            </React.Fragment>
          ))}
        </StyledRow>
      ))}
    </StyledCards>
  )
}

interface FarmCardProps {
  farm: Farm,
}

const FarmCard: React.FC<FarmCardProps> = ({ farm }) => {
  // const [startTime, setStartTime] = useState(0)
  const [totalZom, setTotalZom] = useState(0)
  const [totalDai, setTotalDai] = useState(0)
  const [totalDaiStaked, setTotalDaiStaked] = useState(0)
  const [userStakedDai, setUserStakedDai] = useState(0)
  const [userEarnedDai, setUserEarnedDai] = useState(0)
  const [DaiAPY, setDaiAPY] = useState(0)
  const [totalwrapped, settotalwrapped] = useState(0)
  const [totalDaiwrapped, settotalDaiwrapped] = useState(0)

  const [currentPrice, setCurrentPrice] = useState(new Number)
  const [currentstatPrice, setCurrentstatPrice] = useState(new Number)

  const yam = useYam()
  const { account, ethereum } = useWallet()

  
  switch (farm.depositToken) {
    case 'zombie':
      var address = '0xdcEe2dC9834dfbc7d24C57769ED51daf202a1b87'
      var cAddress = '0xd55BD2C12B30075b325Bc35aEf0B46363B3818f8'
      var nowAbi = ZombiePool.abi
      var currentCoinPrice = 'zombie-finance'
      break;
    case 'cream':
      var address = '0xa8ed29d39Ec961Ded44451D38e56B609Fe08126e'
      var cAddress = '0x2ba592F78dB6436527729929AAf6c908497cB200'
      var nowAbi = CREAMPoolJson.abi
      var currentCoinPrice = 'cream'
      break;
    case 'dice':
      var address = '0xcec3fc05f9314528b5ef324a2e2c47f1d8bed515'
      var cAddress = '0xCF67CEd76E8356366291246A9222169F4dBdBe64'
      var nowAbi = DICEPoolJson.abi
      var currentCoinPrice = 'dice-finance'
      break;
      case 'weth':
      var address = '0x7127ee43fafba873ce985683ab79df2ce2912198'
      var cAddress = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
      var nowAbi = WETHPoolJson.abi
      var currentCoinPrice = 'weth'
      break;
    case 'uni':
      var address = '0x03b42a5e68d5a0bc47ad52d1decf3752d6091264'
      var cAddress = '0xeba5d22bbeb146392d032a2f74a735d66a32aee4'
      var nowAbi = UNIPoolJson.abi
      var currentCoinPrice = '1'
      break;
    case 'yfi': 
      var address = '0x9f83883fd3cadb7d2a83a1de51f9bf483438122e'
      var cAddress = '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e'
      var nowAbi = YFIPoolJson.abi
      var currentCoinPrice = 'yearn-finance'
      break;
    case 'taco':
      var address = '0x934929f34c7b7611AbC1aEcA15769Da3ca47A097'
      var cAddress = '0xc585cc7b9e77aea3371764320740c18e9aec9c55'
      var nowAbi = DICEPoolJson.abi
      var currentCoinPrice = 'tacos'
      break;
    default:
      var address = '0x934929f34c7b7611AbC1aEcA15769Da3ca47A097'
      var cAddress = '0xc585cc7b9e77aea3371764320740c18e9aec9c55'
      var nowAbi = DICEPoolJson.abi
      var currentCoinPrice = 'tacos'
  }


  
  const get_wrapped_value = useCallback(async (num) => {
    const totalwrapped = await log_data(ethereum, cAddress, nowAbi);
    settotalwrapped(totalwrapped);
    get_prices_wrapped(totalwrapped/Number(num))
  }, [yam])

  const get_altwrapped_value = useCallback(async (num) => {
    const totalDaiwrapped = await log_data2(ethereum, cAddress, nowAbi);
    settotalDaiwrapped(totalDaiwrapped);
    get_prices_wrapped(totalDaiwrapped/Number(num))
  }, [yam])

  const get_yfiwrapped_value = useCallback(async (num) => {
    const totalDaiwrapped = await log_data3(ethereum, cAddress, nowAbi);
    settotalDaiwrapped(totalDaiwrapped);
    get_prices_wrapped(totalDaiwrapped/Number(num))
  }, [yam])

  const get_crvwrapped_value = useCallback(async (num) => {
    const totalDaiwrapped = await log_data4(ethereum, cAddress, nowAbi);
    settotalDaiwrapped(totalDaiwrapped);
    get_prices_wrapped(totalDaiwrapped/Number(num))
  }, [yam])

  const gettots = useCallback(async () => {
    const totalZom = await current_zom_value(ethereum);
    setTotalZom(Number(totalZom))
  }, [yam])

  const getdai = useCallback(async () => {
    const totalDai = await current_Dai_value(ethereum, cAddress);
    setTotalDai(Number(totalDai))
    if(currentCoinPrice === '1'){
      get_wrapped_value(totalDai)
    } else if(currentCoinPrice === '2'){
      get_altwrapped_value(totalDai)
    } else if(currentCoinPrice === '3'){
      get_yfiwrapped_value(totalDai)
    } else if(currentCoinPrice === '4'){
      get_crvwrapped_value(totalDai)
    }
  }, [yam])

  const getdaistaked = useCallback(async (num, zomNum) => {
    const totalDaiStaked = await current_DaiStaked_value(ethereum, address);
    await setTotalDaiStaked(Number(totalDaiStaked))
    getDaiAPY(totalDaiStaked, num, zomNum)
  }, [yam])

  const getUserStakedDai = useCallback(async () => {
    const userStakedDai = await current_UserDaiStaked_value(ethereum, account, address);
    setUserStakedDai(Number(userStakedDai))
  }, [yam])

  const getUserEarnedDai = useCallback(async () => {
    const userEarnedDai = await current_UserDaiEarned_value(ethereum, account, address, nowAbi);
    setUserEarnedDai(Number(userEarnedDai))
  }, [yam])

  const getDaiAPY = useCallback(async (stakenum, numm, zomNum) => {
    const DaiAPY = await current_DaiAPY(ethereum, address, nowAbi);
    let num = Number(DaiAPY) * 60 * 60 * 24 * 365 * Number(zomNum);
    
    setDaiAPY(num / (stakenum * Number(numm)) * 100)
  }, [yam])

  const callPrice = useCallback(async () => {
    if (currentCoinPrice === '1' || currentCoinPrice === '2' || currentCoinPrice === '3' || currentCoinPrice === '4') {
    } else {
      axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=Cethereum%2C${currentCoinPrice}&vs_currencies=usd`).then((res) => {
        if (res.status === 200) {
          setCurrentstatPrice(Number(res.data[`${currentCoinPrice}`].usd))
          get_prices(Number(res.data[`${currentCoinPrice}`].usd))
        }
      })
    }
  }, [setCurrentstatPrice])

  const get_prices_wrapped = useCallback(async (num) => {
    //seconds step
    axios.get('https://api.coingecko.com/api/v3/simple/price?ids=Cethereum%2Cshrimp-finance&vs_currencies=usd').then((res) => {
      if (res.status === 200) {
        setCurrentPrice(Number(res.data['shrimp-finance'].usd))
        if (yam) {
          gettots()
          getdai()
          getdaistaked(num, Number(res.data['shrimp-finance'].usd))
          getUserStakedDai()
          getUserEarnedDai()
        }
      }
    })
  }, [yam, setCurrentstatPrice])

  const get_prices = useCallback(async (num) => {
    axios.get('https://api.coingecko.com/api/v3/simple/price?ids=Cethereum%2Cshrimp-finance&vs_currencies=usd').then((res) => {
      if (res.status === 200) {
        setCurrentPrice(Number(res.data['shrimp-finance'].usd))
        if (yam) {
          gettots()
          getdaistaked(num, Number(res.data['shrimp-finance'].usd))
          getUserStakedDai()
          getUserEarnedDai()
          getdai()
        }
      }
    })
  }, [yam, setCurrentstatPrice])

  useEffect(() => {
    if (currentCoinPrice === '1') {
      getdai()
    } else {
      callPrice()
    }


  }, [])

  return (
    <>{farm.sort === 1 || farm.sort === 0 || farm.id === 'cream' || farm.id === 'shrimp' || farm.id === 'dice' ||farm.id === 'taco' || farm.id === 'comp' || farm.id === 'yfi' || farm.id === 'weth' || farm.id === 'dogefi'?
    ''
    :
        <StyledCardWrapper>
          <Card>
            <CardContent>
              <StyledContent>
                <span>{farm.icon === 'dd' ? <img style={{ width: "25px" }} src={doge} /> : farm.icon === "aa" ? <img style={{width:"25px"}} src="https://zombie.finance/logo2.png"/> : farm.icon} {farm.name}</span>
              </StyledContent>
              <br />
        ========== PRICES ==========<br />
              {currentPrice && `SHRIMP: $${Number(currentPrice).toLocaleString()}`}<br />

              {farm.id === 'zombie'
              ? `${farm.id.toLocaleUpperCase()}: $${currentCoinPrice === '' ? Number(totalwrapped / totalDai) : Number(currentstatPrice).toLocaleString()}` : ''}
              {farm.id === 'uni' && `WETH_SHRIMP_UNI_LP: $${currentCoinPrice === '1' ? Number(totalwrapped / totalDai).toFixed(2) : Number(currentstatPrice).toLocaleString()}`}
              <br/>
              {currentCoinPrice === '1' && `TVL: $${(Number(totalDaiStaked)*Number(totalwrapped / totalDai)).toFixed(2)}`}
        {farm.id === 'zombie'
         ? `TVL: $${(Number(totalDaiStaked)*Number(currentstatPrice)).toFixed(2)}` : ''}
         <br/>
        ========== STAKING =========<br />
              {/* Total supply of SHRIMP-{totalZom}<br/> */}
              <> Total supply of {farm.depositToken.toLocaleUpperCase()}: {totalDai} <br />
        Total supply of {farm.depositToken.toLocaleUpperCase()} staked in our contract: {totalDaiStaked} <br />
        You are staking: {userStakedDai} <br />
              </>
        ======== SHRIMP REWARDS ========<br />
              <>Your available rewards are: {userEarnedDai}<br />
        APY: {DaiAPY}%<br/>
        
        </>
            </CardContent>
          </Card>
        </StyledCardWrapper>
}
    </>
  )
}

const StyledCardAccent = styled.div`
  background: linear-gradient(
    45deg,
    rgba(255, 0, 0, 1) 0%,
    rgba(255, 154, 0, 1) 10%,
    rgba(208, 222, 33, 1) 20%,
    rgba(79, 220, 74, 1) 30%,
    rgba(63, 218, 216, 1) 40%,
    rgba(47, 201, 226, 1) 50%,
    rgba(28, 127, 238, 1) 60%,
    rgba(95, 21, 242, 1) 70%,
    rgba(186, 12, 248, 1) 80%,
    rgba(251, 7, 217, 1) 90%,
    rgba(255, 0, 0, 1) 100%
  );
  border-radius: 12px;
  filter: blur(4px);
  position: absolute;
  top: -2px; right: -2px; bottom: -2px; left: -2px;
  z-index: -1;
`

const StyledCards = styled.div`
  width: 900px;
`

const StyledLoadingWrapper = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  justify-content: center;
`

const StyledRow = styled.div`
  display: flex;
  margin-bottom: ${props => props.theme.spacing[4]}px;
`

const StyledCardWrapper = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  position: relative;
`

const StyledTitle = styled.h4`
  color: ${props => props.theme.color.grey[600]};
  font-size: 24px;
  font-weight: 700;
  margin: ${props => props.theme.spacing[2]}px 0 0;
  padding: 0;
`

const StyledContent = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
`

const StyledSpacer = styled.div`
  height: ${props => props.theme.spacing[4]}px;
  width: ${props => props.theme.spacing[4]}px;
`

const StyledDetails = styled.div`
  margin-bottom: ${props => props.theme.spacing[6]}px;
  margin-top: ${props => props.theme.spacing[2]}px;
  text-align: center;
`

const StyledDetail = styled.div`
  color: ${props => props.theme.color.grey[500]};
`

export default StatCards
