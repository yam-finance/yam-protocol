import React from 'react'
import {
  Route,
  Switch,
  useRouteMatch,
} from 'react-router-dom'
import { useWallet } from 'use-wallet'
import WalletProviderModal from '../../components/TopBar/components/WalletProviderModal'

import farmer from '../../assets/img/farmer.png'

import useModal from '../../hooks/useModal'
import Button from '../../components/Button'
import PageHeader from '../../components/PageHeader'

import Farm from '../Farm'

import FarmCards from './components/FarmCards'

const Farms: React.FC = () => {
  const { path } = useRouteMatch()
  const { account } = useWallet()
  const [onPresentWalletProvider] = useModal(<WalletProviderModal />)
  return (
    <Switch>
      {!!account ? (
        <>
          <Route exact path={path}>
            <PageHeader
              icon={<img src={farmer} height="96" />}
              subtitle="Earn YAM tokens by providing liquidity."
              title="Select a farm."
            />
            <FarmCards />
          </Route>
          <Route path={`${path}/:farmId`}>
            <Farm />
          </Route>
        </>
      ) : (
        <div style={{
          alignItems: 'center',
          display: 'flex',
          flex: 1,
          justifyContent: 'center',
        }}>
          <Button onClick={onPresentWalletProvider} text="Unlock Wallet" />
        </div>
      )}
    </Switch>
  )
}


export default Farms