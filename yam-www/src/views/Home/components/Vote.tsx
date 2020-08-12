import React, { useCallback } from 'react'
import styled from 'styled-components'

import { useWallet } from 'use-wallet'

import Button from '../../../components/Button'
import Card from '../../../components/Card'
import CardContent from '../../../components/CardContent'

import useYam from '../../../hooks/useYam'

import { vote } from '../../../yamUtils'

interface VoteProps {
}

const Vote: React.FC<VoteProps> = () => {

  const { account } = useWallet()
  const yam = useYam()

  const handleVoteClick = useCallback(() => {
    vote(yam, account)
  }, [account, yam])

  return (
    <Card>
      <CardContent>
        <Button text="Vote to save YAM" onClick={handleVoteClick} />
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 32,
          }}>
          <StyledLink target="__blank" href="https://twitter.com/YamFinance/status/1293608258553417729">More Info</StyledLink>
        </div>
      </CardContent>
    </Card>
  )
}

const StyledLink = styled.a`
  color: ${props => props.theme.color.grey[600]};
  text-decoration: none;
  font-weight: 700;
`

export default Vote