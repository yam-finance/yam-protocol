import React from 'react'
import styled from 'styled-components'

import Button from '../../Button'
import Card from '../../Card'
import CardContent from '../../CardContent'
import CardIcon from '../../CardIcon'
import CardTitle from '../../CardTitle'
import Modal from '../../Modal'
import ModalTitle from '../../ModalTitle'
import Spacer from '../../Spacer'

const WalletProviderModal: React.FC = () => {
  return (
    <Modal>
      <ModalTitle text="Select a wallet provider." />
      <Spacer />
      <StyledWalletsWrapper>
        <StyledWalletCard>
          <Card>
            <CardContent>
              <CardIcon>M</CardIcon>
              <CardTitle text="Metamask" />
              <Spacer />
              <Button text="Select" />
            </CardContent>
          </Card>
        </StyledWalletCard>
        <Spacer />
        <StyledWalletCard>
          <Card>
            <CardContent>
              <CardIcon>C</CardIcon>
              <CardTitle text="WalletConnect" />
              <Spacer />
              <Button text="Select" />
            </CardContent>
          </Card>
        </StyledWalletCard>
      </StyledWalletsWrapper>
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