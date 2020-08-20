import React, { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import { useWallet } from 'use-wallet'
import { provider } from 'web3-core'

import Button from '../../../components/Button'
import Label from '../../../components/Label'
import Modal, { ModalProps } from '../../../components/Modal'
import ModalActions from '../../../components/ModalActions'
import ModalContent from '../../../components/ModalContent'
import ModalTitle from '../../../components/ModalTitle'
import Separator from '../../../components/Separator'
import Spacer from '../../../components/Spacer'
import WalletProviderModal from '../../../components/WalletProviderModal'

import { yam as yamV1Address } from '../../../constants/tokenAddresses'

import useAllowance from '../../../hooks/useAllowance'
import useApprove from '../../../hooks/useApprove'
import useModal from '../../../hooks/useModal'
import useUnharvested from '../../../hooks/useUnharvested'
import useYam from '../../../hooks/useYam'

import { getContract } from '../../../utils/erc20'

const MigrationInstructionsModal: React.FC<ModalProps> = ({ onDismiss }) => {

  const [approvalDisabled, setApprovalDisabled] = useState(false)
  
  const [onPresentUnlockModal] = useModal(<WalletProviderModal />)
  const harvested = useUnharvested()
  const { account, ethereum } = useWallet()
  const hasHarvested = !!account && !harvested

  const yam = useYam()
  const yamTokenContract = useMemo(() => getContract(ethereum as provider, yamV1Address), [])
  const migrationContract = yam ? (yam as any).contracts.yamV2migration : undefined

  const allowance = useAllowance(yamTokenContract, migrationContract)
  const { onApprove } = useApprove(yamTokenContract, migrationContract)
  const hasApproved = !!allowance.toNumber()

  const handleApprove = useCallback(async () => {
    setApprovalDisabled(true)
    try {
      await onApprove()
      setApprovalDisabled(false)
    } catch (e) {
      setApprovalDisabled(false)
    }
  }, [setApprovalDisabled, onApprove])

  return (
    <Modal>
      <ModalTitle text="Migration checklist" />
      <ModalContent>
        <StyledStep>
          <StyledCheckboxWrapper>
            {!!account ? '✅' : '⬜'}
          </StyledCheckboxWrapper>
          <div>
            <Label text="Step 1" />
            <StyledStepValue>Unlock wallet</StyledStepValue>
          </div>
          <div style={{ flex: 1 }} />
          {!account && (
            <div>
              <Button
                onClick={onPresentUnlockModal}
                size="sm"
                text="Unlock Wallet"
              />
            </div>
          )}
        </StyledStep>

        <Spacer />
        <Separator />
        <Spacer />

        <StyledStep>
          <StyledCheckboxWrapper>
            {hasHarvested ? '✅' : '⬜'}
          </StyledCheckboxWrapper>
          <div>
            <Label text="Step 2" />
            <StyledStepValue>Harvest and Unstake tokens</StyledStepValue>
          </div>
          <div style={{ flex: 1 }} />
          {!hasHarvested && (
            <div>
              <Button
                disabled={!account}
                href="/farms"
                size="sm"
                text="View Farms"
              />
            </div>
          )}
        </StyledStep>

        <Spacer />
        <Separator />
        <Spacer />
        
        <StyledStep>
          <StyledCheckboxWrapper>
            {hasApproved ? '✅' : '⬜'}
          </StyledCheckboxWrapper>
          <div>
            <Label text="Step 3" />
            <StyledStepValue>Approve migration contract</StyledStepValue>
          </div>
          <div style={{ flex: 1 }} />
          {!hasApproved && (
            <div>
              <Button
                disabled={!account || approvalDisabled}
                onClick={handleApprove}
                size="sm"
                text="Approve"
              />
            </div>
          )}
        </StyledStep>

        <Spacer />
        <Separator />
        <Spacer />

        <StyledStep>
          <StyledCheckboxWrapper>
            {hasHarvested ? '✅' : '⬜'}
          </StyledCheckboxWrapper>
          <div>
            <Label text="Step 4" />
            <StyledStepValue>Migrate v1 to v2 tokens</StyledStepValue>
          </div>
        </StyledStep>

        <Spacer />
        <Separator />
        <Spacer size="sm" />

        <StyledStep>
          <StyledCheckboxWrapper>
          ⚠️
          </StyledCheckboxWrapper>
          <div>
            <Label text="Withdraw Uniswap liquidity if necessary" />
          </div>
        </StyledStep>
      </ModalContent>
      <ModalActions>
        <Button onClick={onDismiss} text="Got it!" />
      </ModalActions>
    </Modal>
  )
}

const StyledCheckboxWrapper = styled.span.attrs({
  role: 'img',
})`
  line-height: 44px;
  height: 44px;
  width: 44px;
`

const StyledStep = styled.div`
  align-items: center;
  display: flex;
`

const StyledStepValue = styled.div`
  color: ${props => props.theme.color.grey[600]};
  font-size: 18px;
  font-weight: 700;
`

export default MigrationInstructionsModal