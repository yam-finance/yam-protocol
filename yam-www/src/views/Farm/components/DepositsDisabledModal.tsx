import React from 'react'

import Button from '../../../components/Button'
import Modal, { ModalProps } from '../../../components/Modal'
import ModalActions from '../../../components/ModalActions'
import ModalTitle from '../../../components/ModalTitle'

interface DepositModalProps extends ModalProps {
}

const DepositModal: React.FC<DepositModalProps> = ({ onDismiss }) => {
  return (
    <Modal>
      <ModalTitle text={`Deposits Disabled`} />
      <p>Deposits are temporarily disabled.</p>
      <ModalActions>
        <Button text="Confirm" onClick={onDismiss} />
      </ModalActions>
    </Modal>
  )
}

export default DepositModal