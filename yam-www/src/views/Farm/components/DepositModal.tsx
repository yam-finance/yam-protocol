import React from 'react'

import BigNumber from 'bignumber.js'

import Button from '../../../components/Button'
import Modal, { ModalProps } from '../../../components/Modal'
import ModalActions from '../../../components/ModalActions'
import ModalTitle from '../../../components/ModalTitle'
import TokenInput from '../../../components/TokenInput'

import { getDisplayBalance } from '../../../utils/formatBalance'

interface DepositModalProps extends ModalProps {
  max: BigNumber,
  tokenName?: string,
}

const DepositModal: React.FC<DepositModalProps> = ({ max, onDismiss, tokenName = '' }) => (
  <Modal>
    <ModalTitle text={`Deposit ${tokenName}`} />
    <TokenInput max={getDisplayBalance(max)} symbol={tokenName} />
    <ModalActions>
      <Button text="Cancel" variant="secondary" onClick={onDismiss} />
      <Button text="Confirm" />
    </ModalActions>
  </Modal>
)


export default DepositModal