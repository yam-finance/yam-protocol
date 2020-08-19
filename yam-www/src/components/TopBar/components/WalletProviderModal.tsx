import React, { useEffect } from 'react'
import styled from 'styled-components'
import { useWallet } from 'use-wallet'

import metamaskLogo from '../../../assets/img/metamask-fox.svg'
import walletConnectLogo from '../../../assets/img/wallet-connect.svg'

import Button from '../../Button'
import Card from '../../Card'
import CardContent from '../../CardContent'
import CardIcon from '../../CardIcon'
import CardTitle from '../../CardTitle'
import Modal, { ModalProps } from '../../Modal'
import ModalTitle from '../../ModalTitle'
import Spacer from '../../Spacer'

const WalletProviderModal: React.FC<ModalProps> = ({ onDismiss }) => {

  const { account, connect } = useWallet()

  useEffect(() => {
    if (account) {
      onDismiss()
    }
  }, [account, onDismiss])

  return (
    <Modal>
      <ModalTitle text="Select a wallet provider." />
      <Spacer />
      <StyledWalletsWrapper>
        <StyledWalletCard>
          <Card>
            <CardContent>
              <CardIcon>
                <img src={metamaskLogo} style={{ height: 32 }} />
              </CardIcon>
              <CardTitle text="Metamask" />
              <Spacer />
              <Button onClick={() => connect('injected')} text="Select" />
            </CardContent>
          </Card>
        </StyledWalletCard>
        <Spacer />
        <StyledWalletCard>
          <Card>
            <CardContent>
              <CardIcon>
                <img src={walletConnectLogo} style={{ height: 24 }} />
              </CardIcon>
              <CardTitle text="WalletConnect" />
              <Spacer />
              <Button onClick={() => connect('walletconnect')} text="Select" />
            </CardContent>
          </Card>
        </StyledWalletCard>
      </StyledWalletsWrapper>
      <Spacer />
      <Button text="Cancel" onClick={onDismiss} />
    </Modal>
  )
}

const StyledWalletsWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
`

const StyledWalletCard = styled.div`
  flex-basis: calc(50% - ${props => props.theme.spacing[4]}px);
`

export default WalletProviderModal