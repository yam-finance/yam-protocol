import React, { useCallback } from 'react'
import styled from 'styled-components'

import { useWallet } from 'use-wallet'

import useModal from '../../../hooks/useModal'

import Button from '../../Button'

import AccountModal from './AccountModal'
import WalletProviderModal from './WalletProviderModal'

interface AccountButtonProps {}

const AccountButton: React.FC<AccountButtonProps> = (props) => {

  const [onPresentAccountModal] = useModal(<AccountModal />)
  const [onPresentWalletProviderModal] = useModal(<WalletProviderModal />)
  
  const { account } = useWallet()

  const handleUnlockClick = useCallback(() => {
    onPresentWalletProviderModal()
  }, [])

  return (
    <StyledAccountButton>
      {!account ? (
        <Button
          onClick={handleUnlockClick}
          size="sm"
          text="Unlock Wallet"
        />
      ) : (
        <Button
          onClick={onPresentAccountModal}
          size="sm"
          text="My Wallet"
        />
      )}
    </StyledAccountButton>
  )
}

const StyledAccountButton = styled.div``

export default AccountButton