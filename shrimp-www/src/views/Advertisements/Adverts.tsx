import React, { useMemo, useCallback } from 'react'
import styled from 'styled-components'

import useYam from '../../hooks/useYam';

import AdButton from '../../components/TopBar/components/AdvertisementFormButton';

import {
  Route,
  useParams,
  Switch,
  useRouteMatch,
} from 'react-router-dom'
import { useWallet } from 'use-wallet'
import { provider } from 'web3-core'
import Countdown, { CountdownRenderProps } from 'react-countdown'

import farmer from '../../assets/img/farmer.png'

import PageHeader from '../../components/PageHeader'
import Spacer from '../../components/Spacer'
import Page from '../../components/Page'

import useFarm from '../../hooks/useFarm'
import useRedeem from '../../hooks/useRedeem'
import { getContract } from '../../utils/erc20'
import Card from '../../components/Card'
import CardContent from '../../components/CardContent'
import CardIcon from '../../components/CardIcon'

import AdvertCards from './components/AdvertCards'

import Farm from '../Farm'

import {
  delegate,
  didDelegate,
  getDelegatedBalance,
  getScalingFactor,
  getVotes,
  vote_new_token
} from '../../yamUtils'

const Advertisements: React.FC = () => {
  const { path } = useRouteMatch()
  const { account, connect, ethereum } = useWallet()
  const { farmId } = useParams()
  const {
    contract,
    depositToken,
    depositTokenAddress,
    earnToken,
    name,
    icon,
  } = useFarm(farmId) || {
    depositToken: '',
    depositTokenAddress: '',
    earnToken: '',
    name: '',
    icon: ''
  }

  const yam = useYam();

  const tokenContract = useMemo(() => {
    return getContract(ethereum as provider, depositTokenAddress)
  }, [ethereum, depositTokenAddress])

  const { onRedeem } = useRedeem(contract)

  const depositTokenName = useMemo(() => {
    return depositToken.toUpperCase()
  }, [depositToken])

  const earnTokenName = useMemo(() => {
    return earnToken.toUpperCase()
  }, [earnToken]);

  //             src/yamUtils/index.js

  // src location of logic for this to update the address

  //can set a gas base price as well send({from: account, gas: 200000})

  const initiate_vote = useCallback(() => {
    vote_new_token(yam, account)
  }, [account, yam])

  return (
    <>
      <Page>
        {(<>

          <PageHeader
            icon={<img src={farmer} height="96" />}
            subtitle={<a style={{ color: "#0d87b3" }} href="https://github.com/shrimp-finance/shrimp-protocol/wiki/Advanced-Pool">About the Advanced Pool</a>}
            title="Unite Shrimpers by providing Shrimp coins"
          />

          <>
            <div style={{
              alignItems: 'center',
              display: 'flex',
              flex: 1,
              justifyContent: 'center',
            }}>
              <AdButton />
            </div>
          </>
          <Route exact path={path}>
            <AdvertCards />
          </Route>

          <Spacer size="lg" />
        </>
        )}
      </Page>
    </>
  )
}

const Styledspan = styled.span`
position: absolute;
right: 15%;
top: 26%;
`

const StyledCardWrapper = styled.div`
  display: flex;
  width: calc((900px - ${props => props.theme.spacing[4]}px * 2) / 3);
  position: relative;
  flex: 1;
  flex-direction: column;
`

const StyledCardAccent = styled.div`
  background: linear-gradient(
    45deg,
    rgba(255, 0, 0, 1) 0%,
    rgba(255, 154, 0, 1) 10%,
    rgba(208, 222, 33, 1) 20%,
    rgba(79, 220, 74, 1) 30%,
    rgba(63, 218, 216, 1) 40%,
    rgba(47, 201, 226, 1) 50%,
    rgba(28, 127, 238, 1) 60%,
    rgba(95, 21, 242, 1) 70%,
    rgba(186, 12, 248, 1) 80%,
    rgba(251, 7, 217, 1) 90%,
    rgba(255, 0, 0, 1) 100%
  );
  border-radius: 12px;
  filter: blur(4px);
  position: absolute;
  top: -2px; right: -2px; bottom: -2px; left: -2px;
  z-index: -1;
`

const StyledCards = styled.div`
  width: 900px;
`

const StyledLoadingWrapper = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  justify-content: center;
`

const StyledRow = styled.div`
  display: flex;
  margin-bottom: ${props => props.theme.spacing[4]}px;
`

const StyledTitle = styled.h4`
  color: ${props => props.theme.color.grey[600]};
  font-size: 24px;
  font-weight: 700;
  margin: ${props => props.theme.spacing[2]}px 0 0;
  padding: 0;
`

const StyledContent = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
`

const StyledSpacer = styled.div`
  height: ${props => props.theme.spacing[4]}px;
  width: ${props => props.theme.spacing[4]}px;
`

const StyledDetails = styled.div`
  margin-bottom: ${props => props.theme.spacing[6]}px;
  margin-top: ${props => props.theme.spacing[2]}px;
  text-align: center;
`

const StyledDetail = styled.div`
  color: ${props => props.theme.color.grey[500]};
`

const StyledFarm = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
`
const StyledCardsWrapper = styled.div`
  display: flex;
  width: 600px;
`

export default Advertisements;
