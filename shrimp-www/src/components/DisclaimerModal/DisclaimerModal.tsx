import React, { useCallback, useState, useMemo } from 'react'

import Button from '../Button'
import CardIcon from '../CardIcon'
import Modal, { ModalProps } from '..//Modal'
import ModalActions from '..//ModalActions'
import ModalTitle from '..//ModalTitle'

interface DisclaimerModal extends ModalProps {
  onConfirm: () => void
}

const DisclaimerModal: React.FC<DisclaimerModal> = ({ onConfirm, onDismiss }) => {

  const [step, setStep] = useState('disclaimer')

  const handleConfirm = useCallback(() => {
    onConfirm()
    onDismiss()
  }, [onConfirm, onDismiss])

  const modalContent = useMemo(() => {
    if (step === 'disclaimer') {
      return (
        <div>
          <p>Audits: None. (This project is in beta. Use at your own risk.)</p>
          <p>🚨 The final inflation mint was September 25th (4494.92 Shrimp), Shrimp WETH_SHRIMP_UNI_LP Pool has removed the liquidity.</p>
        </div>
      )
    } else {
      return (
        <div>
          <p>Attention SHRIMP Uniswap LPs</p>
          <p>The only Uniswap pool that is compatible with SHRIMP is SHRIMP/WETH</p>
          <p>Providing liquidity for other Uniswap pools is dangerous</p>
        </div>
      )
    }
  }, [step])

  const button = useMemo(() => {
    if (step === 'disclaimer') {
      // return (
      //   <Button text="Next" variant="secondary" onClick={() => setStep('uniswap')} />
      // )
      return (
        <Button text="I understand" onClick={handleConfirm} />
      )
    } else {
      return (
        <Button text="I understand" onClick={handleConfirm} />
      )
    }
  }, [setStep, step, handleConfirm])

  return (
    <Modal>
      <ModalTitle text={`Warning`} />
      <CardIcon>⚠️</CardIcon>
      {modalContent}
      <ModalActions>
        {button}
      </ModalActions>
    </Modal>
  )
}


export default DisclaimerModal