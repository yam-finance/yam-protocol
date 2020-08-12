import React, { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import BigNumber from 'bignumber.js'

import { useWallet } from 'use-wallet'

import Button from '../../../components/Button'
import Card from '../../../components/Card'
import CardContent from '../../../components/CardContent'
import Spacer from '../../../components/Spacer'

import useYam from '../../../hooks/useYam'

import { getDisplayBalance } from '../../../utils/formatBalance'

import { delegate, getVotes } from '../../../yamUtils'

interface VoteProps {
}

const METER_TOTAL = 150000

const Vote: React.FC<VoteProps> = () => {
  const [totalVotes, setTotalVotes] = useState(0)
  const { account } = useWallet()
  const yam = useYam()

  const handleVoteClick = useCallback(() => {
    delegate(yam, account)
  }, [account, yam])

  const fetchVotes = useCallback(async () => {
    const voteCount = await getVotes(yam)
    setTotalVotes(Number(getDisplayBalance(voteCount)))
  }, [yam, setTotalVotes])

  useEffect(() => {
    if (yam) {
      fetchVotes()
    }
  }, [fetchVotes, yam])

  return (
    <Card>
      <CardContent>
        <StyledTitle>{new BigNumber(totalVotes).toFixed(2)} / 160,000 Votes</StyledTitle>
        <Spacer />
        <StyledCheckpoints>
          <StyledCheckpoint left={35500 / METER_TOTAL * 100}>
            <StyledCheckpointText left={-48}>
              <div>Target Proposal</div>
              <div>50,000</div>
            </StyledCheckpointText>
          </StyledCheckpoint>
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
        <Button text="Delegate to save YAM" onClick={handleVoteClick} />
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

const StyledTitle = styled.div`
  font-size: 32px;
  font-weight: 700;
  text-align: center;
  height: 56px;
  line-height: 56px;
`

const StyledCheckpoints = styled.div`
  position: relative;
  width: 100%;
  height: 56px;
`

interface StyledCheckpointProps {
  left: number
}
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