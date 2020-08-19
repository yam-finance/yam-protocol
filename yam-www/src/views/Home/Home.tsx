import React, { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'

import Page from '../../components/Page'
import PageHeader from '../../components/PageHeader'
import Spacer from '../../components/Spacer'

import useYam from '../../hooks/useYam'

import Migrate from './components/Migrate'
import Rebase from './components/Rebase'
import Stats from './components/Stats'

import { OverviewData } from './types'
import { getStats } from './utils'

const Home: React.FC = () => {

  const yam = useYam()
  const [{
    curPrice,
    nextRebase,
    scalingFactor,
    targetPrice,
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
      <PageHeader
        icon={(
          <div style={{ position: 'relative', transform: 'scaleX(-1)'}}>⛵</div>
        )}
        subtitle="Burn V1 tokens before the deadline to receive V2 tokens."
        title="It's time to migrate to Yam V2!"
      />
      <div style={{
        margin: '-24px auto 48px'
      }}>
        <StyledLink href="https://medium.com/@yamfinance/yam-migration-faq-57c705688fe6">Learn more</StyledLink>
      </div>
      <div>
        <Migrate />
        <Spacer />
        <StyledOverview>
          <Rebase nextRebase={nextRebase} />
          <StyledSpacer />
          <Stats
            curPrice={curPrice}
            scalingFactor={scalingFactor}
            targetPrice={targetPrice}
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