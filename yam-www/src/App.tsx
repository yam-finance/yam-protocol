import React from 'react'
import {
  BrowserRouter as Router,
  Route,
  Switch,
} from 'react-router-dom'
import { ThemeProvider } from 'styled-components'
import { UseWalletProvider } from 'use-wallet'

import FarmsProvider from './contexts/Farms'
import ModalsProvider from './contexts/Modals'

import About from './views/About'
import Farms from './views/Farms'
import Home from './views/Home'

import theme from './theme'

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <UseWalletProvider chainId={1}>
        <ModalsProvider>
          <FarmsProvider>
            <Router>
              <Switch>
                <Route path="/" exact>
                  <Home />
                </Route>
                <Route path="/farms">
                  <Farms />
                </Route>
                <Route path="/about">
                  <About />
                </Route>
              </Switch>
            </Router>
          </FarmsProvider>
        </ModalsProvider>
      </UseWalletProvider>
    </ThemeProvider>
  )
}

export default App
