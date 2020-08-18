import React, { useMemo } from 'react'
import styled from 'styled-components'

import { useWallet } from 'use-wallet'

import useModal from '../../../hooks/useModal'
import { formatAddress } from '../../../utils'

import Button from '../../Button'

import VoteModal from './VoteModal'

interface AccountButtonProps {}

const AccountButton: React.FC<AccountButtonProps> = (props) => {
  const [onPresentAccountModal] = useModal(<VoteModal />)
  
  const { account, connect } = useWallet()

  return (
    <StyledAccountButton>
      {!account ? (
        <Button
          onClick={() => connect('injected')}
          size="md"
          text="Unlock Wallet"
        />
      ) : (
        <Button
          onClick={onPresentAccountModal}
          size="md"
          text="Make A Proposal"
        />
      )}
    </StyledAccountButton>
  )
}

const StyledAccountButton = styled.div``

export default AccountButton