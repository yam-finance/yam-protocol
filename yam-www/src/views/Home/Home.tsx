import React, { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'

import Button from '../../components/Button'
import Container from '../../components/Container'
import Page from '../../components/Page'
import PageHeader from '../../components/PageHeader'
import Spacer from '../../components/Spacer'

import useModal from '../../hooks/useModal'
import useYam from '../../hooks/useYam'

import Balances from './components/Balances'
import Migrate from './components/Migrate'
import MigrationInstructionsModal from './components/MigrationInstructionsModal'
import Rebase from './components/Rebase'
import Stats from './components/Stats'

import { OverviewData } from './types'
import { getStats } from './utils'

import { bnToDec } from '../../utils'
import { getV2Supply } from '../../yamUtils'

const Home: React.FC = () => {

  const [onPresentMigrationInstructionsModal] = useModal(<MigrationInstructionsModal />, 'test')

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

  const handleInstructionsClick = useCallback(() => {
    onPresentMigrationInstructionsModal()
  }, [onPresentMigrationInstructionsModal])

  useEffect(() => {
    async function fetchTotalSupply () {
      const supply = await getV2Supply(yam)
      console.log(bnToDec(supply, 24))
    }
    if (yam) {
      fetchStats()
      fetchTotalSupply()
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
      
      <Container>
        <Button
          onClick={handleInstructionsClick}
          text="View migration checklist"
        />
        <Spacer size="lg" />
        <Balances />
        <Spacer />
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
      </Container>

    </Page>
  )
}

const StyledOverview = styled.div`
  align-items: center;
  display: flex;
  @media (max-width: 768px) {
    width: 100%;
    flex-flow: column nowrap;
    align-items: stretch;
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