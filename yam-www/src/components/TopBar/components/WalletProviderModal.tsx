import React, { useCallback, useMemo } from 'react'
import styled from 'styled-components'

import { useWallet } from 'use-wallet'

import { ReactSVG } from 'react-svg'
import metamask from '../../../assets/img/metamask.svg'
import walletconnect from '../../../assets/img/walletconnect.svg'
import walletlink from '../../../assets/img/walletlink.svg'

import Button from '../../Button'
import CardIcon from '../../CardIcon'
import IconButton from '../../IconButton'
import { AddIcon, RemoveIcon } from '../../icons'
import Label from '../../Label'
import Modal, { ModalProps } from '../../Modal'
import ModalTitle from '../../ModalTitle'

const WalletProviderModal: React.FC<ModalProps> = ({ onDismiss }) => {
  const handleCancelClick = useCallback(() => {
    onDismiss!()
  }, [onDismiss])

  const { connect } = useWallet()

  return (
    <Modal>
      <ModalTitle text="Select Wallet Provider" />
      <StyledButtonsWrapper>
        <StyledIconButton onClick={() => connect('injected')}>
          <CardIcon>
            <StyledSvgWrapper>
              <ReactSVG src={metamask} />
            </StyledSvgWrapper>
          </CardIcon>
          <Label text="Metamask" />
        </StyledIconButton>

        <StyledIconButton onClick={() => connect('walletconnect')}>
          <CardIcon>
            <StyledSvgWrapper>
              <ReactSVG src={walletconnect} />
            </StyledSvgWrapper>
          </CardIcon>
          <Label text="Wallet Connect" />
        </StyledIconButton>

        <StyledIconButton onClick={() => connect('walletlink')}>
          <CardIcon>
            <StyledSvgWrapper>
              <ReactSVG src={walletlink} />
            </StyledSvgWrapper>
          </CardIcon>
          <Label text="Wallet Link" />
        </StyledIconButton>
      </StyledButtonsWrapper>

      <StyledSpacer />
      <Button onClick={handleCancelClick} text="Cancel" />
    </Modal>
  )
}

const StyledSpacer = styled.div`
  height: ${(props) => props.theme.spacing[4]}px;
  width: ${(props) => props.theme.spacing[4]}px;
`
const StyledButtonsWrapper = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  flex-wrap: wrap;
`

const StyledIconButton = styled.button`
  border: none;
  background-color: transparent;
  outline: none;
  margin-bottom: ${(props) => props.theme.spacing[4]}px;
`
const StyledSvgWrapper = styled.div`
  height: 50px;
  width: 50px;
`
const StyledProvider = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
`

export default WalletProviderModal
