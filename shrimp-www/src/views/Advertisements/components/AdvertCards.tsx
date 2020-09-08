import React, { useCallback, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import Countdown, { CountdownRenderProps } from 'react-countdown'

import Button from '../../../components/Button'
import Card from '../../../components/Card'
import CardContent from '../../../components/CardContent'
import CardIcon from '../../../components/CardIcon'
import Loader from '../../../components/Loader'

import useFarms from '../../../hooks/useFarms'

import { Farm } from '../../../contexts/Farms'

import { getPoolStartTime, getPoolEndTime } from '../../../yamUtils'

import doge from '../../../assets/img/doge.png';
import kimchi from '../../../assets/img/kimchi.png';
import frens from '../../../assets/img/frens.png';


const AdvertCards: React.FC = () => {
  const [farms] = useFarms()

  const rows = farms.reduce<Farm[][]>((farmRows, farm) => {
    const newFarmRows = [...farmRows]
    if (newFarmRows[newFarmRows.length - 1].length === 3) {
      if (farm.name === "Frens 4evur" || farm.name === "Kimchi crunch" || farm.name === "Sushi swap" || farm.name === "Taco Tuesday" || farm.name === "Zombie Swamp" || farm.name === "DogeFi Days") {
        newFarmRows.push([farm])
      }

    } else {
      if (farm.name === "Frens 4evur" || farm.name === "Kimchi crunch" || farm.name === "Sushi swap" || farm.name === "Taco Tuesday" || farm.name === "Zombie Swamp" || farm.name === "DogeFi Days") {
        newFarmRows[newFarmRows.length - 1].push(farm)
      }
    }
    return newFarmRows
  }, [[]])

  return (
    <StyledCards>
      {rows.map((farmRow, i) => (
        <StyledRow key={i}>
          {farmRow.map((farm, j) => (
            <React.Fragment key={j}>
              <FarmCard farm={farm} />
              {(j === 0 || j === 1) && <StyledSpacer />}
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
  const [startTime, setStartTime] = useState(0)
  const [endTime, setEndTime] = useState(0)

  const timeStamp = 1598443200000;
  const dogestart = 1598868000000;
  const sushistart = 1598954400503;
  const threedays = 10800000;
  const kimchiTime = 1599213600000;
  const frensWhen = 599645600000;

  const getStartTime = useCallback(async () => {
    const startTime = await getPoolStartTime(farm.contract)
    setStartTime(startTime)
  }, [farm, setStartTime])

  const getEndTime = useCallback(async () => {
    const endTime = await getPoolEndTime(farm.contract)
    setEndTime((endTime))
  }, [farm, setStartTime])

  const renderer = (countdownProps: CountdownRenderProps) => {
    const { days, hours, minutes, seconds } = countdownProps
    const paddedSeconds = seconds < 10 ? `0${seconds}` : seconds
    const paddedMinutes = minutes < 10 ? `0${minutes}` : minutes
    const totalhours = days * 24 + hours;
    const paddedHours = totalhours < 10 ? `0${totalhours}` : totalhours
    return (
      <span style={{ width: '100%' }}>{totalhours > 23 ? totalhours : paddedHours}:{paddedMinutes}:{paddedSeconds}</span>
    )
  }
  // const renderer = (countdownProps: CountdownRenderProps) => {
  //   const { days, hours, minutes, seconds } = countdownProps
  //   const paddedSeconds = seconds < 10 ? `0${seconds}` : seconds
  //   const paddedMinutes = minutes < 10 ? `0${minutes}` : minutes
  //   const totalhours = days * 24 + hours;
  //   const paddedHours = hours < 10 ? `0${hours}` : hours
  //   const final_hours = totalhours === 0 && hours > 0 && hours < 10 ? `0${hours}` : hours
  //   return (
  //     <StyledCountdown>{totalhours > 11 ? totalhours : final_hours}:{paddedMinutes}:{paddedSeconds}</StyledCountdown>
  //   )
  // }
  useEffect(() => {
    if (farm) {
      getStartTime()
      getEndTime()
    }
  }, [farm, getStartTime, getEndTime])

  const poolActive = startTime * 1000 - Date.now() <= 0

  return (
    <>
      <StyledCardWrapper>
        {farm.name === "Kimchi crunch" || farm.name === "Sushi swap" || farm.name === "Taco Tuesday" || farm.name === "Frens 4evur" || farm.name === "Zombie Swamp" || farm.name === "DogeFi Days" ?
          (
            <Card>
              <CardContent>
                <StyledContent>
                  {farm.name !== 'Frens 4evur' && farm.name !== 'Zombie Swamp' && farm.name !== 'DogeFi Days' && farm.name !== "Kimchi crunch" ?
                    <CardIcon>{farm.icon}</CardIcon> : ''}

                  {farm.name === 'DogeFi Days' &&
                    <CardIcon><img style={{ width: "32px" }} src={doge} /></CardIcon>}

                    {farm.name === 'Frens 4evur' &&
                    <CardIcon><img style={{ width: "64px" }} src={frens} /></CardIcon>}      

                  {farm.name === 'Kimchi crunch' &&
                    <CardIcon><img style={{ width: "32px" }} src={kimchi} /></CardIcon>}

                  {farm.name === 'Zombie Swamp' &&
                    <CardIcon><img style={{ width: "32px" }} src="https://zombie.finance/logo2.png" /></CardIcon>}
                  <StyledTitle>{farm.name}</StyledTitle>
                  <StyledDetails>
                    <StyledDetail>Deposit {farm.depositToken.toUpperCase()}</StyledDetail>
                    <StyledDetail>Earn {farm.earnToken.toUpperCase()}</StyledDetail>
                  </StyledDetails>
                  {farm.name !== 'Sushi swap' && farm.name !== "Kimchi crunch" && <br />}
                  {farm.name !== 'Sushi swap' && farm.name !== 'Zombie Swamp' && farm.name !== 'DogeFi Days' && farm.name !== "Kimchi crunch" && farm.name !== "Frens 4evur" ?
                    <>
                      {Date.now() > endTime * 1000 ? (
                        <>
                          <Button
                            disabled={!poolActive}
                            text={poolActive ? 'Remove Liquidity' : undefined}
                            to={`/farms/${farm.id}`}
                          />
                        </>
                      )
                        : (<>
                          <a href={`/farms/${farm.id}`} style={{ textDecoration: 'none', width: '100%' }}>
                            <Button
                              disabled={!poolActive}
                              text={poolActive ? '' : undefined}
                              to={`/farms/${farm.id}`}
                            >
                              {900000 > Number(endTime * 1000) &&
                                <span style={{ color: 'red', marginLeft: '33%' }} >
                                  <Countdown date={Number(endTime * 1000)} renderer={renderer} />
                                </span>
                              }
                              {900000 < Number(endTime * 1000) &&

                                <Countdown date={Number(endTime * 1000)} renderer={renderer} />

                              }
                            </Button>
                          </a>
                        </>
                        )}
                    </>
                    : ''
                  }
                  {console.log(endTime, farm.name)}
                  {farm.name === 'Zombie Swamp' &&
                    <Button
                      disabled={timeStamp > Date.now()}
                      text={timeStamp < Date.now() ? 'Select' : undefined}
                      to={`/farms/${farm.id}`}
                    >
                      {timeStamp > Date.now() && <Countdown date={timeStamp} renderer={renderer} />}
                    </Button>
                  }
                  {farm.name === 'DogeFi Days' &&
                    <Button
                      disabled={dogestart > Date.now()}
                      text={'Remove liquidity'}
                      to={`/farms/${farm.id}`}
                    />
                    //  {dogestart > Date.now() && <Countdown date={dogestart} renderer={renderer} />}
                    //</Button>
                  }
                  {farm.name === 'Sushi swap' &&
                    <Button
                      disabled={sushistart > Date.now()}
                      text={sushistart < Date.now() ? 'Select' : undefined}
                      to={`/farms/${farm.id}`}
                    >
                      {sushistart > Date.now() && <Countdown date={sushistart} renderer={renderer} />}
                    </Button>
                  }
                  {farm.name === 'Kimchi crunch' &&
                    <Button
                      disabled={kimchiTime > Date.now()}
                      text={kimchiTime < Date.now() ? 'Select' : undefined}
                      to={`/farms/${farm.id}`}
                    >
                      {kimchiTime > Date.now() && <Countdown date={kimchiTime} renderer={renderer} />}
                    </Button>
                  }
                  {farm.name === 'Frens 4evur' &&
                    <Button
                      disabled={frensWhen > Date.now()}
                      text={frensWhen < Date.now() ? 'Select' : undefined}
                      to={`/farms/${farm.id}`}
                    >
                     {frensWhen > Date.now() && <Countdown date={frensWhen} renderer={renderer} />}
                    </Button>
                  }
                  {farm.name === "Taco Tuesday" &&
                    <>
                      <br />
                      <StyledDetail>30,678 Shrimp</StyledDetail>
                      <StyledDetail>7 Days</StyledDetail>
                      <StyledDetail><a href="https://t.me/TacoGram">Telegram</a> | <a href="https://twitter.com/Taconomics101">Twitter</a></StyledDetail>
                    </>
                  }
                  {farm.name === 'Zombie Swamp' &&
                    <>
                      <br />
                      <StyledDetail>3,000 Shrimp</StyledDetail>
                      <StyledDetail>14 Days</StyledDetail>
                      <StyledDetail><a href="https://t.me/defizombie">Telegram</a> | <a href="https://twitter.com/ZombieFinance">Twitter</a></StyledDetail>
                    </>
                  }
                  {farm.name === "DogeFi Days" &&
                    <>
                      <br />
                      <StyledDetail>1,000 Shrimp</StyledDetail>
                      <StyledDetail>5 Days</StyledDetail>
                      <StyledDetail><a href="https://t.me/DOGEFI_army">Telegram</a> | <a href="https://twitter.com/DOGEFI_Army">Twitter</a></StyledDetail>
                    </>
                  }
                  {farm.name === "Sushi swap" &&
                    <>
                      <br />
                      <StyledDetail>3,000 Shrimp</StyledDetail>
                      <StyledDetail>7 Days</StyledDetail>
                      <StyledDetail><a href="https://discord.com/invite/hJ2p555">Discord</a> | <a href="https://twitter.com/SushiSwap">Twitter</a></StyledDetail>
                    </>
                  }
                  {farm.name === "Kimchi crunch" &&
                    <>
                      <br />
                      <StyledDetail>3,000 Shrimp</StyledDetail>
                      <StyledDetail>7 Days</StyledDetail>
                      <StyledDetail><a href="https://discord.com/invite/ypafxfP">Discord</a> | <a href="https://twitter.com/kimchi_finance">Twitter</a></StyledDetail>
                    </>
                  }
                  {farm.name === "Frens 4evur" &&
                    <>
                      <br />
                      <StyledDetail>1,000 Shrimp</StyledDetail>
                      <StyledDetail>14 Days</StyledDetail>
                      <StyledDetail><a href="https://t.me/frenslink">Telegram</a> | <a href="https://twitter.com/frenscommunity">Twitter</a></StyledDetail>
                    </>
                  }
                </StyledContent>
              </CardContent>
            </Card>
          )
          :
          null
        }
      </StyledCardWrapper>

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
  width: calc((900px - ${props => props.theme.spacing[4]}px * 2) / 3);
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

export default AdvertCards
