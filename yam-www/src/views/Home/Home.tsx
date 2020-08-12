import React, { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'

import Page from '../../components/Page'
import PageHeader from '../../components/PageHeader'

import useYam from '../../hooks/useYam'

import Rebase from './components/Rebase'
import Stats from './components/Stats'

import { OverviewData } from './types'
import { getStats } from './utils'

const Home: React.FC = () => {

  const yam = useYam()
  const [{
    circSupply,
    curPrice,
    nextRebase,
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
      <PageHeader icon="🌞" subtitle="It's a great day to farm YAMs" title="Welcome" />
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

export default Home