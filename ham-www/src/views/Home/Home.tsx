import React, { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'

import { useWallet } from 'use-wallet'

import Page from '../../components/Page'
import PageHeader from '../../components/PageHeader'
import Spacer from '../../components/Spacer'

import useHam from '../../hooks/useHam'

import Rebase from './components/Rebase'
import Stats from './components/Stats'
import Vote from './components/Vote'

import { OverviewData } from './types'
import { getStats } from './utils'

const Home: React.FC = () => {

  const { account } = useWallet()

  const ham = useHam()
  const [{
    circSupply,
    curPrice,
    nextRebase,
    targetPrice,
    totalSupply,
  }, setStats] = useState<OverviewData>({})

  const fetchStats = useCallback(async () => {
    const statsData = await getStats(ham)
    setStats(statsData)
  }, [ham, setStats])

  useEffect(() => {
    if (ham) {
      fetchStats()
    }
  }, [fetchStats, ham])

  return (
    <Page>
      <PageHeader icon="⚠️" subtitle="Remove liquidity from the HAM / YCRV Uniswap pool" title="Warning" />
      <div style={{
        margin: '-24px auto 48px'
      }}>
        <StyledLink href="https://medium.com/@hamfinance/how-to-exit-the-eternal-lands-pool-and-withdraw-your-ham-823d57c95f3a">How to withdraw from Uniswap</StyledLink>
      </div>
      <Spacer />
      <div>
        <StyledOverview>
          <Rebase nextRebase={nextRebase} />
          <StyledSpacer />
          <Stats
            circSupply={circSupply}
            curPrice={curPrice}
            targetPrice={targetPrice}
            totalSupply={totalSupply}
          />
        </StyledOverview>
      </div>
    </Page>
  )
}

const StyledOverview = styled.div`
  align-items: center;
  display: flex;
  @media (max-width: 768px) {
    width: 100%;
    flex-flow: column nowrap;
    align-items: center;
  }
`

const StyledSpacer = styled.div`
  height: ${props => props.theme.spacing[4]}px;
  width: ${props => props.theme.spacing[4]}px;
`

const StyledLink = styled.a`
  font-weight: 700l
  text-decoration: none;
  color: ${props => props.theme.color.primary.main};
`

export default Home