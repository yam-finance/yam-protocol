import React, { useCallback } from 'react'
import styled from 'styled-components'

import { useParams } from 'react-router-dom'

import Button from '../../components/Button'
import Card from '../../components/Card'
import CardContent from '../../components/CardContent'
import CardIcon from '../../components/CardIcon'
import IconButton from '../../components/IconButton'
import Label from '../../components/Label'
import Page from '../../components/Page'
import PageHeader from '../../components/PageHeader'

import { AddIcon, RemoveIcon } from '../../components/icons'

import useFarm from '../../hooks/useFarm'
import useModal from '../../hooks/useModal'

import DepositModal from './components/DepositModal'
import WithdrawModal from './components/WithdrawModal'

const Farm: React.FC = () => {

  const { farmId } = useParams()
  const [farm] = useFarm(farmId)

  const [onPresentDeposit] = useModal(<DepositModal tokenName={farm.depositToken} />)
  const [onPresentWithdraw] = useModal(<WithdrawModal tokenName={farm.depositToken} />)

  const earnedValue = 12.55
  const stakedValue = 500

  return (
    <Page>
      <PageHeader
        icon={farm.icon}
        subtitle={`Deposit ${farm.depositToken} and earn ${farm.earnToken}`}
        title={farm.name}
      />
      <StyledFarm>
        <StyledCardsWrapper>
          <StyledCardWrapper>
            <Card>
              <CardContent>
                <StyledCardContentInner>
                  <StyledCardHeader>
                    <CardIcon>🌱</CardIcon>
                    <StyledValue>{stakedValue}</StyledValue>
                    <Label text={`${farm.depositToken} Staked`} />
                  </StyledCardHeader>
                  <StyledCardActions>
                    <IconButton onClick={onPresentWithdraw}>
                      <RemoveIcon />
                    </IconButton>
                    <StyledActionSpacer />
                    <IconButton onClick={onPresentDeposit}>
                      <AddIcon />
                    </IconButton>
                  </StyledCardActions>
                </StyledCardContentInner>
              </CardContent>
            </Card>
          </StyledCardWrapper>

          <StyledCardSpacer />

          <StyledCardWrapper>
            <Card>
              <CardContent>
                <StyledCardContentInner>
                  <StyledCardHeader>
                    <CardIcon>🍠</CardIcon>
                    <StyledValue>{earnedValue}</StyledValue>
                    <Label text={`${farm.earnToken} Earned`} />
                  </StyledCardHeader>
                  <StyledCardActions>
                    <Button text="Harvest" />
                  </StyledCardActions>
                </StyledCardContentInner>
              </CardContent>
            </Card>
          </StyledCardWrapper>
        </StyledCardsWrapper>
      </StyledFarm>
    </Page>
  )
}

const StyledFarm = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
`

const StyledCardsWrapper = styled.div`
  display: flex;
  width: 600px;
`

const StyledCardWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
`

const StyledCardContentInner = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: space-between;
`

const StyledCardSpacer = styled.div`
  width: ${props => props.theme.spacing[4]}px;
`

const StyledValue = styled.span`
  color: ${props => props.theme.color.grey[600]};
  font-size: 36px;
  font-weight: 700;
`

const StyledCardHeader = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
`
const StyledCardActions = styled.div`
  display: flex;
  justify-content: center;
  margin-top: ${props => props.theme.spacing[6]}px;
  width: 100%;
`
const StyledActionSpacer = styled.div`
  height: ${props => props.theme.spacing[4]}px;
  width: ${props => props.theme.spacing[4]}px;
`

export default Farm