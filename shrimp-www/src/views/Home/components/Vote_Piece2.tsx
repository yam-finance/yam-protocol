import React, { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import BigNumber from 'bignumber.js'
import Countdown, { CountdownRenderProps } from 'react-countdown'

import { useWallet } from 'use-wallet'

import Button from '../../../components/Button'
import Card from '../../../components/Card'
import CardContent from '../../../components/CardContent'
import Label from '../../../components/Label'
import Spacer from '../../../components/Spacer'

import useYam from '../../../hooks/useYam'

import {
  delegate,
  didDelegate,
  getDelegatedBalance,
  getScalingFactor,
  getVotes_piece2,
  get_y_n_vote2,
  get_counted_votes
} from '../../../yamUtils'

interface VoteProps {
}

const METER_TOTAL = 280000
const WARNING_TIMESTAMP = 1598080645351

const Voter: React.FC<VoteProps> = () => {
  const [totalVotes, setTotalVotes] = useState(new Number)
  // const [scalingFactor, setScalingFactor] = useState(new BigNumber(1))
  // const [delegated, setDelegated] = useState(false)
  // const [delegatedBalance, setDelegatedBalance] = useState(new BigNumber(0))

  const { account, ethereum } = useWallet()
  const yam = useYam()

  const renderer = (countdownProps: CountdownRenderProps) => {
    const { days, hours, minutes, seconds } = countdownProps
    const paddedSeconds = seconds < 10 ? `0${seconds}` : seconds
    const paddedMinutes = minutes < 10 ? `0${minutes}` : minutes
    const totalhours = days * 24 + hours;
    const paddedHours = hours < 10 ? `0${hours}` : hours
    return (
      <StyledCountdown>{totalhours > 24 ? totalhours : paddedHours}:{paddedMinutes}:{paddedSeconds}</StyledCountdown>
    )
  }

  const y_vote = useCallback(() => {
    get_y_n_vote2(ethereum, account)
  }, [ethereum, account])

  const fetchVotes = useCallback(async () => {
    getVotes_piece2(ethereum).then(function (data) {
      setTotalVotes(data)
    })
  }, [yam, setTotalVotes])

  useEffect(() => {
    if (yam) {
      fetchVotes()
    }
    const refetch = setInterval(fetchVotes, 10000)
    return () => clearInterval(refetch)
  }, [fetchVotes, yam])


  return (
    <Card>
      <CardContent>
        <div style={{ alignItems: 'flex-start', display: 'flex' }}>
          <StyledCenter>
            <Label text="Time remaining" />
            {Date.now() > WARNING_TIMESTAMP ? (
              <StyledDenominator>{`< 10 minutes`}</StyledDenominator>
            )
              : (
                <Countdown date={WARNING_TIMESTAMP} renderer={renderer} />
              )}
          </StyledCenter>
          <Spacer />
          <StyledCenter>
            <Label text="Votes Placed" />
            <div style={{
              alignItems: 'baseline',
              display: 'flex',
            }}>
              <StyledTitle>
                <div>{Number(totalVotes).toLocaleString()}</div>
              </StyledTitle>
              <StyledDenominator>
                <div>{`/ 224,746`}</div>
              </StyledDenominator>
            </div>
            {/* <div style={{
              alignItems: 'baseline',
              display: 'flex',
            }}>
              <div style={{ fontSize: 12 }}>{`${Number(totalVotes.multipliedBy(scalingFactor).toFixed(0)).toLocaleString()}`}</div>
              <div style={{
                  fontSize: 12,
                  marginTop: 4,
                  marginLeft: 4,
                }}>{`/ ${Number(new BigNumber(160000).multipliedBy(scalingFactor).toFixed(0)).toLocaleString()} YAM`}</div>
            </div> */}
            <br />
            <br />
          </StyledCenter>
        </div>
        <Spacer />
        <StyledCheckpoints>
          <StyledCheckpoint left={140000 / METER_TOTAL * 100}>
            <StyledCheckpointText left={-50}>
              <div>Proposal Passed</div>
              <div>100,000</div>
            </StyledCheckpointText>
          </StyledCheckpoint>
        </StyledCheckpoints>
        <StyledMeter>
          <StyledMeterInner width={(Math.max(1000) / 1000 * 100) * Number(totalVotes) / 224746} />
        </StyledMeter>
        <Spacer />
        <Button text="Yes" onClick={y_vote} />
        {/* ) : (
          <div>
            {/* <StyledDelegatedCount>Delegating: {Number(delegatedBalance.multipliedBy(scalingFactor).toFixed(0)).toLocaleString()} YAM</StyledDelegatedCount> 
            <StyledThankYou>Thank you for your vote.</StyledThankYou>
          </div>
        )} */}
        <div style={{
          margin: '0 auto',
          width: 512,
          paddingTop: 24,
          opacity: 0.6,
        }}>
          <p>Proposal 2, </p>
          <p>🚨 New balancer liquidity pool 🚨</p>
          <p>✅Bal-Shrimp-Dai Pool 95: Shrimp 95% /Dai 5%<br />
             ✅Bal-Shrimp-Dai Pool 80: Shrimp 80%/Dai 20%<br/>

             Circulating Shrimp Supply：224,746 Shrimp<br/>
Weekly expected inflation：3%<br/>
Advanced Pool Period: Unlimited<br/>
Bal-Shrimp-Dai Pool 95：4494.92 Shrimp/Weekly<br/>
Bal-Shrimp-Dai Pool 80：2247.46 Shrimp/Weekly<br/>
Expected time to go online：2020/08/20 10:00:00 UTC+0</p>
        {/* <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 32,
        }}>
          <StyledLink target="__blank" href="https://github.com/shrimp-finance/shrimp-protocol/wiki/Shrimp-Declaration-of-Independence">More Info</StyledLink>
        </div> */}
        </div>
      {/* <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 32,
        }}> */}
      {/* below here is a twitter link, we can place a link
             to a twitter announcement here so i have only commented it out for now  */}
      {/* <StyledLink target="__blank" href="https://twitter.com/YamFinance/status/1293660938906869760">More Info</StyledLink> */}
      {/* </div> */}
      </CardContent>
    </Card >
  )
}

const StyledDelegatedCount = styled.div`
  text-align: center;
  font-size: 24px;
  color: ${props => props.theme.color.grey[600]};
  font-weight: 700;
  margin: 0 auto;
`

const StyledThankYou = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: ${props => props.theme.color.secondary.main};
  text-align: center;
  padding: 0 48px;
`

const StyledDenominator = styled.div`
  margin-left: 8px;
  font-size: 18px;
  color: ${props => props.theme.color.grey[600]};
`

const StyledCountdown = styled.div`
  color: ${props => props.theme.color.primary.main};
  font-size: 32px;
  font-weight: 700;
`

const StyledTitle = styled.div`
  font-size: 32px;
  font-weight: 700;
  line-height: 32px;
`

const StyledCheckpoints = styled.div`
  position: relative;
  width: 100%;
  height: 56px;
`

/*
          <StyledCheckpoint left={35500 / METER_TOTAL * 100}>
            <StyledCheckpointText left={-48}>
              <div>Target Proposal</div>
              <div>50,000</div>
            </StyledCheckpointText>
          </StyledCheckpoint>
*/

interface StyledCheckpointProps {
  left: number
}

const StyledCenter = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  margin: 0 auto;
`
const StyledCheckpoint = styled.div<StyledCheckpointProps>`
  position: absolute;
  left: ${props => props.left}%;
  &:after {
    content: "";
    position: absolute;
    width: 1px;
    background-color: ${props => props.theme.color.grey[400]};
    height: 28px;
    left: 0;
    top: 40px;
  }
`

const StyledCheckpointText = styled.div<StyledCheckpointProps>`
  position: absolute;
  left: ${props => props.left}px;
  font-size: 14px;
  font-weight: 700;
  white-space: nowrap;
  color: ${props => props.theme.color.grey[600]};
  text-align: center;
`

const StyledMeter = styled.div`
  box-sizing: border-box;
  position: relative;
  height: 12px;
  border-radius: 16px;
  width: 100%;
  background-color: ${props => props.theme.color.grey[300]};
  padding: 2px;
`

interface StyledMeterInnerProps {
  width: number
}
const StyledMeterInner = styled.div<StyledMeterInnerProps>`
  height: 100%;
  background-color: ${props => props.theme.color.secondary.main};
  border-radius: 12px;
  width: ${props => props.width}%;
`

const StyledLink = styled.a`
  color: ${props => props.theme.color.grey[600]};
  text-decoration: none;
  font-weight: 700;
`

export default Voter
