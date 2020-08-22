import React from 'react'
import styled from 'styled-components'

import farmer from '../../assets/img/farmer.png'

import Container from '../../components/Container'
import Page from '../../components/Page'
import PageHeader from '../../components/PageHeader'

import Balances from './components/Balances'

const Home: React.FC = () => {
  return (
    <Page>
      <PageHeader
        icon={(
          <img src={farmer} height={96} />
        )}
        subtitle="YAMV3 governance voting will begin soon."
        title="YAMV2 migration has finished."
      />
      
      <Container>
        <Balances />
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