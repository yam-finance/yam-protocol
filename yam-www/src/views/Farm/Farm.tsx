import React, { useCallback, useEffect } from 'react'
import styled from 'styled-components'

import BigNumber from 'bignumber.js'
import { useParams } from 'react-router-dom'
import { useWallet } from 'use-wallet'

import Button from '../../components/Button'
import Card from '../../components/Card'
import CardContent from '../../components/CardContent'
import CardIcon from '../../components/CardIcon'
import IconButton from '../../components/IconButton'
import Label from '../../components/Label'
import Page from '../../components/Page'
import PageHeader from '../../components/PageHeader'

import { AddIcon, RemoveIcon } from '../../components/icons'

import useAllowance from '../../hooks/useAllowance'
import useEarnings from '../../hooks/useEarnings'
import useFarm from '../../hooks/useFarm'
import useModal from '../../hooks/useModal'
import useStakedBalance from '../../hooks/useStakedBalance'
import useTokenBalance from '../../hooks/useTokenBalance'
import useYam from '../../hooks/useYam'

import { getDisplayBalance } from '../../utils/formatBalance'

import DepositModal from './components/DepositModal'
import WithdrawModal from './components/WithdrawModal'

const Farm: React.FC = () => {

  const { farmId } = useParams()
  const {
    contract,
    depositToken,
    depositTokenAddress,
    earnToken,
    name,
    icon,
  } = useFarm(farmId) || {
    depositToken: '',
    depositTokenAddress: '',
    earnToken: '',
    name: '',
    icon: ''
  }

  const allowance = useAllowance(depositTokenAddress, contract ? contract.options.address : '')
  const earnings = useEarnings(contract)
  const tokenBalance = useTokenBalance(depositTokenAddress)
  const stakedBalance = useStakedBalance(contract)
  const [onPresentDeposit] = useModal(<DepositModal max={tokenBalance} tokenName={depositToken} />)
  const [onPresentWithdraw] = useModal(<WithdrawModal max={stakedBalance} tokenName={depositToken} />)

  const { account } = useWallet()
  const yam = useYam()
  
  useEffect(() => {

  }, [contract, account, yam])

  return (
    <Page>
      <PageHeader
        icon={icon}
        subtitle={`Deposit ${depositToken} and earn ${earnToken}`}
        title={name}
      />
      <StyledFarm>
        <StyledCardsWrapper>
          <StyledCardWrapper>
            <Card>
              <CardContent>
                <StyledCardContentInner>
                  <StyledCardHeader>
                    <CardIcon>🌱</CardIcon>
                    <StyledValue>{getDisplayBalance(stakedBalance)}</StyledValue>
                    <Label text={`${depositToken} Staked`} />
                  </StyledCardHeader>
                  <StyledCardActions>
                    {!allowance.toNumber() ? (
                      <Button text={`Approve ${depositToken}`} />
                    ) : (
                      <>
                        <IconButton onClick={onPresentWithdraw}>
                          <RemoveIcon />
                        </IconButton>
                        <StyledActionSpacer />
                        <IconButton onClick={onPresentDeposit}>
                          <AddIcon />
                        </IconButton>
                      </>
                    )}
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
                    <StyledValue>{getDisplayBalance(earnings)}</StyledValue>
                    <Label text={`${earnToken} Earned`} />
                  </StyledCardHeader>
                  <StyledCardActions>
                    <Button text="Harvest" disabled={!earnings.toNumber()} />
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