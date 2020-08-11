import React, { useMemo, useState } from 'react'
import styled from 'styled-components'

import { useParams } from 'react-router-dom'
import { useWallet } from 'use-wallet'
import { provider } from 'web3-core'
import Button from '../../components/Button'
import Card from '../../components/Card'
import CardContent from '../../components/CardContent'
import CardIcon from '../../components/CardIcon'
import IconButton from '../../components/IconButton'
import Label from '../../components/Label'
import PageHeader from '../../components/PageHeader'

import { AddIcon, RemoveIcon } from '../../components/icons'

import useAllowance from '../../hooks/useAllowance'
import useApprove from '../../hooks/useApprove'
import useEarnings from '../../hooks/useEarnings'
import useFarm from '../../hooks/useFarm'
import useModal from '../../hooks/useModal'
import useRedeem from '../../hooks/useRedeem'
import useStake from '../../hooks/useStake'
import useStakedBalance from '../../hooks/useStakedBalance'
import useTokenBalance from '../../hooks/useTokenBalance'
import useUnstake from '../../hooks/useUnstake'

import { getDisplayBalance } from '../../utils/formatBalance'
import { getContract } from '../../utils/erc20'

import DepositModal from './components/DepositModal'
import WithdrawModal from './components/WithdrawModal'

const Farm: React.FC = () => {
  const [userApproved, setUserApproved] = useState(false)

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

  const { ethereum } = useWallet()

  const tokenContract = useMemo(() => {
    return getContract(ethereum as provider, depositTokenAddress)
  }, [ethereum, depositTokenAddress])

  const allowance = useAllowance(tokenContract, contract)
  const { onApprove } = useApprove(tokenContract, contract)
  const earnings = useEarnings(contract)
  const tokenBalance = useTokenBalance(depositTokenAddress)
  const stakedBalance = useStakedBalance(contract)
  const { onStake } = useStake(contract)
  const { onUnstake } = useUnstake(contract)
  const { onRedeem } = useRedeem(contract)

  const [onPresentDeposit] = useModal(<DepositModal max={tokenBalance} onConfirm={onStake} tokenName={depositToken} />)
  const [onPresentWithdraw] = useModal(<WithdrawModal max={stakedBalance} onConfirm={onUnstake} tokenName={depositToken} />)

  const userApprove = () => {
    onApprove()
      .then(() => setUserApproved(true))
      .catch(() => {})
  }

  return (
    <>
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
                    {(!allowance.toNumber() && !userApproved) ? (
                      <Button onClick={userApprove} text={`Approve ${depositToken}`} />
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
                    <Button onClick={onRedeem} text="Harvest" disabled={!earnings.toNumber()} />
                  </StyledCardActions>
                </StyledCardContentInner>
              </CardContent>
            </Card>
          </StyledCardWrapper>
        </StyledCardsWrapper>
      </StyledFarm>
    </>
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
