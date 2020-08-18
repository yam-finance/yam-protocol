import React, { useMemo, useEffect } from 'react'
import styled from 'styled-components'

import { useWallet } from 'use-wallet'
import useLocalStorage from '../../hooks/useLocalStorage'

import Footer from '../Footer'
import TopBar from '../TopBar'

const Page: React.FC = ({ children }) => {
  const { account, connect, connector, status } = useWallet()
  const [provider, setProvider] = useLocalStorage('provider', false)

  // Login if we have a provider in storage
  useMemo(() => {
    if (provider) {
      connect(provider)
    }
  }, [])

  // Catch connection & error
  useEffect(() => {
    switch (status) {
      case 'connected':
        setProvider(connector)
        break
      case 'error':
        setProvider(false)
        break
    }
  })

  return (
    <StyledPage>
      <TopBar />
      <StyledMain>{children}</StyledMain>
      <Footer />
    </StyledPage>
  )
}

const StyledPage = styled.div``

const StyledMain = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - ${(props) => props.theme.topBarSize * 2}px);
`

export default Page
