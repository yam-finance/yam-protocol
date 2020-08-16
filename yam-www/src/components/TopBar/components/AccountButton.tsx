import React from 'react'
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
  walletlink
}

const AccountButton: React.FC<AccountButtonProps> = (props) => {
  const [onPresentWalletProvider] = useModal(<WalletProviderModal />)
  const [onPresentAccountModal] = useModal(<AccountModal />)
  const { account, connector } = useWallet()
  
  return (
    <StyledAccountButton>
      {!account ? (
        <Button
          onClick={onPresentWalletProvider}
          size="sm"
          text="Unlock Wallet"
        />
      ) : (
        <StyledProviderRow>
          <Button onClick={onPresentAccountModal} size="sm">
            <StyledProviderIcon>
              <ReactSVG src={icons[connector]} />
            </StyledProviderIcon>
            {`${account.slice(0, 5)}...${account.slice(-4, -1)}`}
          </Button>
        </StyledProviderRow>
      )}
    </StyledAccountButton>
  )
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
