import React, { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'

import { useWallet } from 'use-wallet'

import Page from '../../components/Page'
import PageHeader from '../../components/PageHeader'

import useYam from '../../hooks/useYam'
import Button from '../../components/Button'

// import Rebase from './components/Rebase'
import Stats from '../Home/components/Stats'
import Vote_Piece from '../Home/components/Vote_Piece'

import { OverviewData } from '../Home/types'
import { getStats } from '../Home/utils'

const Vote: React.FC = () => {

  const { account, connect } = useWallet()
  const yam = useYam()
  const [{
    circSupply,
    curPrice,
    // nextRebase,
    targetPrice,
    totalSupply,
  }, setStats] = useState<OverviewData>({})

  const fetchStats = useCallback(async () => {
    const statsData = await getStats(yam)
    setStats(statsData)
  }, [yam, setStats])

  useEffect(() => {
    if (yam) {
      fetchStats()
    }
  }, [yam])

  return (
    <Page>
      <PageHeader icon="🦐" subtitle="Vote for changes here" />
      <div>
         {!!account && (
          <StyledVote>
            <Vote_Piece />
          </StyledVote>
        )} 
        {!account && (
            <div style={{
                alignItems: 'center',
                display: 'flex',
                flex: 1,
                justifyContent: 'center',
              }}>
                <Button
                  onClick={() => connect('injected')}
                  text="Unlock Wallet"
                />
              </div>
        )}
        
        <StyledSpacer />
        <StyledOverview>
          {/* <Stats
            circSupply={circSupply}
            curPrice={curPrice}
            targetPrice={targetPrice}
            totalSupply={totalSupply}
          /> */}
        </StyledOverview>
      </div>
    </Page>
  )
}

const StyledOverview = styled.div`
  align-items: center;
  display: flex;
`

const StyledSpacer = styled.div`
  height: ${props => props.theme.spacing[4]}px;
  width: ${props => props.theme.spacing[4]}px;
`

const StyledVote = styled.div`
  width: 100%;
`

export default Vote