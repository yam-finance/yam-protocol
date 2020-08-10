import React from 'react'
import styled from 'styled-components'

import { Yam } from '../../yam_dist'

import Page from '../../components/Page'
import PageHeader from '../../components/PageHeader'

import Rebase from './components/Rebase'
import Stats from './components/Stats'

const Home: React.FC = () => {
  console.log(Yam)
  return (
    <Page>
      <PageHeader icon="🌞" subtitle="It's a great day to farm YAMs" title="Welcome" />
      <StyledOverview>
        <Rebase />
        <StyledSpacer />
        <Stats />
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