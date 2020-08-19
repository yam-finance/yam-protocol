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
import useScalingFactor from '../../../hooks/useScalingFactor'

import {
  delegate,
  didDelegate,
  getDelegatedBalance,
  getVotes,
} from '../../../yamUtils'

interface VoteProps {
}

const METER_TOTAL = 220000
const WARNING_TIMESTAMP = 1597302000000 - 600000

const Vote: React.FC<VoteProps> = () => {
  const [totalVotes, setTotalVotes] = useState(new BigNumber(0))
  const [delegated, setDelegated] = useState(false)
  const [delegatedBalance, setDelegatedBalance] = useState(new BigNumber(0))

  const { account } = useWallet()
  const scalingFactor = useScalingFactor()
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

  const undelegateRenderer = (countdownProps: CountdownRenderProps) => {
    const { days, hours, minutes, seconds } = countdownProps
    const paddedSeconds = seconds < 10 ? `0${seconds}` : seconds
    const paddedMinutes = minutes < 10 ? `0${minutes}` : minutes
    const paddedHours = hours < 10 ? `0${hours}` : hours
    return (
      <StyledUndelegateCountdown>{days}:{paddedHours}:{paddedMinutes}:{paddedSeconds}</StyledUndelegateCountdown>
    )
  }

  const handleVoteClick = useCallback(() => {
    delegate(yam, account)
  }, [account, yam])

  const fetchVotes = useCallback(async () => {
    const voteCount = await getVotes(yam)
    setTotalVotes(voteCount)
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
    if (d) {
      const amount = await getDelegatedBalance(yam, account)
      setDelegatedBalance(amount)
    }
    setDelegated(d)
  }, [setDelegated, yam, account, setDelegatedBalance])

  useEffect(() => {
    if (yam && account) {
      fetchDidDelegate()
    }
  }, [fetchDidDelegate, yam, account])

  return (
    <Card>
      <CardContent>
        <StyledResponsiveWrapper>
          <StyledCenter>
            <Label text="Time remaining" />
            {Date.now() > WARNING_TIMESTAMP ? (
              <StyledTitle>{`Snapshot pending`}</StyledTitle>
            )
            : (
              <Countdown date={1597302000000} renderer={renderer} />
            )}
          </StyledCenter>
          <Spacer />
          <StyledCenter>
            <Label text="Votes delegated" />
            <div style={{
              alignItems: 'baseline',
              display: 'flex',
            }}>
              <StyledTitle acheived={totalVotes.toNumber() > 160000}>
                <div>{Number(totalVotes.toFixed(0)).toLocaleString()}</div>
              </StyledTitle>
              <StyledDenominator>
                <div>{`/ 160,000`}</div>
              </StyledDenominator>
            </div>
            <div style={{
              alignItems: 'baseline',
              display: 'flex',
            }}>
              <div style={{ fontSize: 12 }}>{`${Number(totalVotes.multipliedBy(scalingFactor).toFixed(0)).toLocaleString()}`}</div>
              <div style={{
                  fontSize: 12,
                  marginTop: 4,
                  marginLeft: 4,
                }}>{`/ ${Number(new BigNumber(160000).multipliedBy(scalingFactor).toFixed(0)).toLocaleString()} YAM`}</div>
            </div>
          </StyledCenter>
        </StyledResponsiveWrapper>
        <Spacer />
        <StyledCheckpoints>
          <StyledCheckpoint acheived={totalVotes.toNumber() > 160000} left={160000 / METER_TOTAL * 100}>
            <StyledCheckpointText left={-44}>
              <div>Min. Required</div>
              <div>160,000</div>
            </StyledCheckpointText>
          </StyledCheckpoint>
        </StyledCheckpoints>
        <StyledMeter>
          <StyledMeterInner width={Math.max(1000, totalVotes.toNumber()) / METER_TOTAL * 100} />
        </StyledMeter>
        <StyledCheckpoints>
          <StyledCheckpoint acheived={totalVotes.toNumber() > 200000} reverse left={200000 / METER_TOTAL * 100}>
            <StyledCheckpointText left={-40}>
              <div>Stretch goal</div>
              <div>200,000</div>
            </StyledCheckpointText>
          </StyledCheckpoint>
        </StyledCheckpoints>
        <Spacer />
        {!delegated ? (
          <Button text="Delegate to save YAM" onClick={handleVoteClick} />
        ) : (
          <div>
            <StyledDelegatedCount>Delegating: {Number(delegatedBalance.multipliedBy(scalingFactor).toFixed(0)).toLocaleString()} YAM</StyledDelegatedCount>
            <StyledThankYou>Thank you for your support ❤️</StyledThankYou>
            <div style={{
              alignItems: 'baseline',
              display: 'flex',
              justifyContent: 'center',
              marginTop: 12,
            }}>
              {`You can undelegate in:`}
              <Countdown date={1597615200000} renderer={undelegateRenderer} />
            </div>
          </div>
        )}
        <div style={{
          margin: '0 auto',
          width: 'calc(100% - 48px)',
          maxWidth: 512,
          paddingTop: 24,
          opacity: 0.6,
        }}>
          <p>NOTE: You must harvest your YAMs BEFORE 7am UTC Thursday 8/13 - very soon.</p>
          <p>Hold them in your wallet until 10PM UTC Sunday 8/16 for your delegation to save YAM</p>
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

const StyledDelegatedCount = styled.div`
  text-align: center;
  font-size: 24px;
  color: ${props => props.theme.color.grey[600]};
  font-weight: 700;
  margin: 0 auto;
`

const StyledUndelegateCountdown = styled.div`
  margin-left: 4px;
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

interface StyledTitleProps {
  acheived?: boolean
}
const StyledTitle = styled.div<StyledTitleProps>`
  font-size: 32px;
  font-weight: 700;
  line-height: 32px;
`

const StyledCheckpoints = styled.div`
  position: relative;
  width: 100%;
  height: 56px;
`

const StyledResponsiveWrapper = styled.div`
  align-items: center;
  display: flex;
  @media (max-width: 768px) {
    display: block;
  }
`

interface StyledCheckpointProps {
  acheived?: boolean,
  left: number,
  reverse?: boolean
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
  top: ${props => props.reverse ? 20 : 0}px;
  color: ${props => props.acheived ? props.theme.color.secondary.main : props.theme.color.grey[600]};
  &:after {
    content: "";
    position: absolute;
    width: 1px;
    background-color: ${props => props.acheived ? props.theme.color.secondary.main : props.theme.color.grey[400]};
    height: 28px;
    left: 0;
    top: ${props => props.reverse ? -32 : 40}px;
  }
`

const StyledCheckpointText = styled.div<StyledCheckpointProps>`
  position: absolute;
  left: ${props => props.left}px;
  font-size: 14px;
  font-weight: 700;
  white-space: nowrap;
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
