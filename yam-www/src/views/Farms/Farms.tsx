import React from 'react'
import {
  Route,
  Switch,
  useRouteMatch,
} from 'react-router-dom'

import farmer from '../../assets/img/farmer.png'
import Page from '../../components/Page'
import PageHeader from '../../components/PageHeader'

import Farm from '../Farm'

import FarmCards from './components/FarmCards'

const Farms: React.FC = () => {
  const { path } = useRouteMatch()
  return (
    <Switch>
      <Route exact path={path}>
        <Page>
          <PageHeader
            icon={<img src={farmer} height="96" />}
            subtitle="Earn YAM tokens by providing liquidity."
            title="Select a farm."
          />
          <FarmCards />
        </Page>
      </Route>
      <Route path={`${path}/:farmId`}>
        <Farm />
      </Route>
    </Switch>
  )
}


export default Farms