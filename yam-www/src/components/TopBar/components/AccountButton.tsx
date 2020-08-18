import React, { useEffect } from 'react'
import styled from 'styled-components'

import { useWallet } from 'use-wallet'

import useModal from '../../../hooks/useModal'
import { formatAddress } from '../../../utils'

import { ReactSVG } from 'react-svg'
import injected from '../../../assets/img/metamask.svg'
import walletconnect from '../../../assets/img/walletconnect.svg'
import walletlink from '../../../assets/img/walletlink.svg'

import Button from '../../Button'

import AccountModal from './AccountModal'
import WalletProviderModal from './WalletProviderModal'

interface AccountButtonProps {}

const icons: any = {
  injected,
  walletconnect,
  walletlink,
}

const AccountButton: React.FC<AccountButtonProps> = (props) => {
  // Uncomment the below line & the onClick functions
  // below to enable the modal wallet chooser
  // const [onPresentWalletProvider] = useModal(<WalletProviderModal />)
  const [onPresentAccountModal] = useModal(<AccountModal />)
  const { account, connector, connect, status } = useWallet()

  // Catch connection & error
  switch (status) {
    case 'disconnected':
      return (
        <StyledAccountButton>
          <Button
            onClick={() => connect('injected')}
            // onClick={onPresentWalletProvider}
            size="sm"
            text="Unlock Wallet"
          />
        </StyledAccountButton>
      )
      break
    case 'connecting':
      return (
        <StyledAccountButton>
          <Button
            onClick={() => connect('injected')}
            // onClick={onPresentWalletProvider}
            size="sm"
            text="Connecting..."
          />
        </StyledAccountButton>
      )
      break
    case 'connected':
      return (
        <StyledAccountButton>
          <StyledProviderRow>
            <Button onClick={onPresentAccountModal} size="sm">
              <StyledProviderIcon>
                <ReactSVG src={icons[connector]} />
              </StyledProviderIcon>
              {`${account.slice(0, 5)}...${account.slice(-4, -1)}`}
            </Button>
          </StyledProviderRow>
        </StyledAccountButton>
      )
      break
    case 'error':
      alert(
        'There was an error connecting to your wallet. \n \nMake sure your browser has a wallet like MetaMask installed or that you have allowed the application to access it.'
      )
      return (
        <StyledAccountButton>
          <Button
            onClick={() => connect('injected')}
            // onClick={onPresentWalletProvider}
            size="sm"
            text="Error Connecting..."
          />
        </StyledAccountButton>
      )
      break
  }
}

const StyledProviderRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-around;
`

const StyledProviderIcon = styled.div`
  height: 25px;
  width: 25px;
  margin-right: 5px;
`

const StyledAccountButton = styled.div``

export default AccountButton
