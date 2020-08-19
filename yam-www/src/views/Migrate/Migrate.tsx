import React, { useCallback } from 'react'

import numeral from 'numeral'
import Countdown, { CountdownRenderProps} from 'react-countdown'
import styled from 'styled-components'
import { useWallet } from 'use-wallet'

import Button from '../../components/Button'
import Card from '../../components/Card'
import CardContent from '../../components/CardContent'
import CardIcon from '../../components/CardIcon'
import Container from '../../components/Container'
import Dial from '../../components/Dial'
import Label from '../../components/Label'
import Page from '../../components/Page'
import PageHeader from '../../components/PageHeader'
import Separator from '../../components/Separator'
import Spacer from '../../components/Spacer'
import Value from '../../components/Value'

import { yam as yamAddress } from '../../constants/tokenAddresses'

import useScalingFactor from '../../hooks/useScalingFactor'
import useTokenBalance from '../../hooks/useTokenBalance'

import { bnToDec } from '../../utils'

import MigrateYamIcon from './components/MigrateYamIcon'

const Migrate: React.FC = () => {

  const { account } = useWallet()
  const scalingFactor = useScalingFactor()

  const yamV1Balance = bnToDec(useTokenBalance(yamAddress))
  const yamV2ReceiveAmount = yamV1Balance / scalingFactor

  const renderer = useCallback((countdownProps: CountdownRenderProps) => {
    const { hours, minutes, seconds } = countdownProps
    const paddedSeconds = seconds < 10 ? `0${seconds}` : seconds
    const paddedMinutes = minutes < 10 ? `0${minutes}` : minutes
    const paddedHours = hours < 10 ? `0${hours}` : hours
    return (
      <StyledCountdown>{paddedHours}:{paddedMinutes}:{paddedSeconds}</StyledCountdown>
    )
  }, [])

  return (
    <Page>
      <PageHeader
        icon={(
          <div style={{ position: 'relative', transform: 'scaleX(-1' }}>⛵</div>
        )}
        subtitle="Burn your YAMV1 tokens to receive YAMV2 tokens"
        title="Migrate to YAMV2"
      />
      <Container>

      <StyledMigrateWrapper>
        <div style={{ flex: 1 }}>
          <Card>
            <CardContent>
              <div style={{ margin: '0 auto' }}>
                <Dial color="primary" value={66} size={190}>
                  <StyledCountdownWrapper>
                    <Countdown date={new Date(Date.now() + 10000000)} renderer={renderer} />
                    <Label text="Migration Deadline" />
                  </StyledCountdownWrapper>
                </Dial>
              </div>
              <Spacer size="lg" />
              <StyledBalances>
                <StyledBalance>
                  <Value value={yamV1Balance ? numeral(yamV1Balance).format('0.00a') : '--'} />
                  <Label text="Burn YAMV1" />
                </StyledBalance>
                <div style={{ alignSelf: 'stretch' }}>
                <Separator orientation="vertical" />
                </div>
                <StyledBalance>
                  <Value value={yamV2ReceiveAmount ? numeral(yamV2ReceiveAmount).format('0.00a') : '--'} />
                  <Label text="Mint YAMV2" />
                </StyledBalance>
              </StyledBalances>
              <Spacer size="lg" />
              <Button disabled={!account || !yamV1Balance} text="Migrate to V2" />
              <Spacer />
              <StyledWarning>WARNING: Burning your YAMV1 tokens for YAMV2 tokens is a permanent action.</StyledWarning>
            </CardContent>
          </Card>
        </div>
    
      </StyledMigrateWrapper>
      </Container>
    </Page>
  )
}

const StyledBalances = styled.div`
  display: flex;
`

const StyledBalance = styled.div`
  flex: 1;
  text-align: center;
`

const StyledCountdownWrapper = styled.div`
  text-align: center;
`
const StyledCountdown = styled.div`
  color: ${props => props.theme.color.primary.main};
  font-size: 36px;
  font-weight: 700;
`

const StyledMigrateWrapper = styled.div`
  align-items: center;
  display: flex;
`

const StyledWarning = styled.div`
  color: ${props => props.theme.color.primary.main};
  font-size: 12px;
  text-align: center;
`

export default Migrate