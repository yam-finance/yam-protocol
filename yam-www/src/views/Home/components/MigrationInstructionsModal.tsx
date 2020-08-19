import React, { useEffect } from 'react'
import styled from 'styled-components'
import { useWallet } from 'use-wallet'

import metamaskLogo from '../../../assets/img/metamask-fox.svg'
import walletConnectLogo from '../../../assets/img/wallet-connect.svg'

import Button from '../../../components/Button'
import Card from '../../../components/Card'
import CardContent from '../../../components/CardContent'
import CardIcon from '../../../components/CardIcon'
import CardTitle from '../../../components/CardTitle'
import Label from '../../../components/Label'
import ModalActions from '../../../components/ModalActions'
import Modal, { ModalProps } from '../../../components/Modal'
import ModalTitle from '../../../components/ModalTitle'
import Separator from '../../../components/Separator'
import Spacer from '../../../components/Spacer'
import Value from '../../../components/Value'

const MigrationInstructionsModal: React.FC<ModalProps> = ({ onDismiss }) => {

  const { account, connect } = useWallet()

  useEffect(() => {
    if (account) {
      onDismiss()
    }
  }, [account, onDismiss])

  return (
    <Modal>
      <ModalTitle text="Migration instructions" />
      <Spacer />
      <Label text="Step 1" />
      <StyledStepValue>Harvest and Unstake tokens</StyledStepValue>
      <Spacer />
      <Separator />
      <Spacer />
      <Label text="Step 2" />
      <StyledStepValue>Withdraw Uniswap liquidity if necessary</StyledStepValue>
      <Spacer />
      <Separator />
      <Spacer />
      <Label text="Step 3" />
      <StyledStepValue>Approve migration contract</StyledStepValue>
      <Spacer />
      <Separator />
      <Spacer />
      <Label text="Step 4" />
      <StyledStepValue>Migrate v1 to v2 tokens</StyledStepValue>
      <ModalActions>
        <Button onClick={onDismiss} text="Got it!" />
      </ModalActions>
    </Modal>
  )
}

const StyledStepValue = styled.div`
  color: ${props => props.theme.color.grey[600]};
  font-size: 18px;
  font-weight: 700;
`

export default MigrationInstructionsModal