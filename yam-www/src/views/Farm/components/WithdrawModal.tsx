import React from 'react'
import styled from 'styled-components'

import BigNumber from 'bignumber.js'

import Button from '../../../components/Button'
import Input from '../../../components/Input'
import Modal, { ModalProps } from '../../../components/Modal'
import ModalActions from '../../../components/ModalActions'
import ModalTitle from '../../../components/ModalTitle'
import TokenInput from '../../../components/TokenInput'

import { getDisplayBalance } from '../../../utils/formatBalance'

interface WithdrawModalProps extends ModalProps {
  max: BigNumber,
  tokenName?: string,
}

const WithdrawModal: React.FC<WithdrawModalProps> = ({ onDismiss, max, tokenName = '' }) => (
  <Modal>
    <ModalTitle text={`Withdraw ${tokenName}`} />
    <TokenInput max={getDisplayBalance(max)} symbol={tokenName} />
    <ModalActions>
      <Button text="Cancel" variant="secondary" onClick={onDismiss} />
      <Button text="Confirm" />
    </ModalActions>
  </Modal>
)


export default WithdrawModal