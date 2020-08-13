import React, { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import BigNumber from 'bignumber.js'
import Countdown, { CountdownRenderProps} from 'react-countdown'

import { useWallet } from 'use-wallet'

import Button from '../../../components/Button'
import Card from '../../../components/Card'
import CardContent from '../../../components/CardContent'
import Label from '../../../components/Label'
import Spacer from '../../../components/Spacer'

import useYam from '../../../hooks/useYam'

import { delegate, didDelegate, getVotes } from '../../../yamUtils'

interface VoteProps {
}

const METER_TOTAL = 150000
const WARNING_TIMESTAMP = 1597302000000 - 600000

const Vote: React.FC<VoteProps> = () => {
  const [totalVotes, setTotalVotes] = useState(0)
  const [delegated, setDelegated] = useState(false)

  const { account } = useWallet()
  const yam = useYam()

  const renderer = (countdownProps: CountdownRenderProps) => {
    const { hours, minutes, seconds } = countdownProps
    const paddedSeconds = seconds < 10 ? `0${seconds}` : seconds
    const paddedMinutes = minutes < 10 ? `0${minutes}` : minutes
    const paddedHours = hours < 10 ? `0${hours}` : hours
    return (
      <StyledCountdown>{paddedHours}:{paddedMinutes}:{paddedSeconds}</StyledCountdown>
    )
  }

  const handleVoteClick = useCallback(() => {
    delegate(yam, account)
  }, [account, yam])

  const fetchVotes = useCallback(async () => {
    const voteCount = await getVotes(yam)
    setTotalVotes(Number(voteCount))
  }, [yam, setTotalVotes])

  useEffect(() => {
    if (yam) {
      fetchVotes()
    }
    const refetch = setInterval(fetchVotes, 10000)
    return () => clearInterval(refetch)
  }, [fetchVotes, yam])

  const fetchDidDelegate = useCallback(async () => {
    const d = await didDelegate(yam, account)
    setDelegated(d)
  }, [setDelegated, yam, account])

  useEffect(() => {
    if (yam && account) {
      fetchDidDelegate()
    }
  }, [fetchDidDelegate, yam, account])

  return (
    <Card>
      <CardContent>
        <div style={{
          alignItems: 'center',
          display: 'flex',
        }}>
          <StyledCenter>
            {Date.now() > WARNING_TIMESTAMP ? (
              <StyledTitle>{`< 10 minutes`}</StyledTitle>
            )
            : (
              <Countdown date={1597302000000} renderer={renderer} />
            )}
            <Label text="Time remaining" />
          </StyledCenter>
          <Spacer />
          <StyledCenter>
            <div style={{
              alignItems: 'baseline',
              display: 'flex',
            }}>
              <StyledTitle>{Number(new BigNumber(totalVotes).toFixed(0)).toLocaleString()}</StyledTitle>
              <StyledDenominator>/ 160,000</StyledDenominator>
            </div>
            <Label text="Votes delegated" />
          </StyledCenter>
        </div>
        <Spacer />
        <StyledCheckpoints>
          <StyledCheckpoint left={140000 / METER_TOTAL * 100}>
            <StyledCheckpointText left={-40}>
              <div>YAM Saved</div>
              <div>160,000</div>
            </StyledCheckpointText>
          </StyledCheckpoint>
        </StyledCheckpoints>
        <StyledMeter>
          <StyledMeterInner width={Math.max(1000, totalVotes) / METER_TOTAL * 100} />
        </StyledMeter>
        <Spacer />
        {!delegated ? (
          <Button text="Delegate to save YAM" onClick={handleVoteClick} />
        ) : (
          <Button text="Delegated" disabled />
        )}
        <div style={{
          margin: '0 auto',
          width: 512,
          paddingTop: 24,
          opacity: 0.6,
        }}>
          <p>NOTE: You must harvest your YAMs BEFORE 7am UTC Thursday 8/13 - very soon.</p>
          <p>Hold them in your wallet until 9AM UTC Sunday 8/16 for your delegation to save YAM</p>
        </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 32,
          }}>
          <StyledLink target="__blank" href="https://twitter.com/YamFinance/status/1293660938906869760">More Info</StyledLink>
        </div>
      </CardContent>
    </Card>
  )
}

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
  text-align: center;
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
  z-index: 1;
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

export default Vote
