import React, { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'

import { useWallet } from 'use-wallet'

import Page from '../../components/Page'
import PageHeader from '../../components/PageHeader'

import useYam from '../../hooks/useYam'
import Button from '../../components/Button'

// import Rebase from './components/Rebase'
import Stats from '../Home/components/Stats'
import Vote_Piece from '../Home/components/Vote_Piece'
import Vote_Piece2 from '../Home/components/Vote_Piece2'
import Vote_Piece3 from '../Home/components/Vote_Piece3'
import Vote_Piece4 from '../Home/components/Vote_Piece4'
// import Voter from '../Home/components/Vote'

import VoteButton from '../../components/TopBar/components/VoteButton'

import { OverviewData } from '../Home/types'
import { getStats } from '../Home/utils'

const Vote: React.FC = () => {

  const { account, connect } = useWallet()
  const yam = useYam()
  // const [{
  //   circSupply,
  //   curPrice,
  //   // nextRebase,
  //   targetPrice,
  //   totalSupply,
  // }, setStats] = useState<OverviewData>({})

  // const fetchStats = useCallback(async () => {
  //   const statsData = await getStats(yam)
  //   setStats(statsData)
  // }, [yam, setStats])

  // useEffect(() => {
  //   if (yam) {
  //     fetchStats()
  //   }
  // }, [yam])

  return (
    <Page>
      <PageHeader icon="🦐" subtitle="Vote for changes here" />
      <div style={{
        alignItems: 'center',
        display: 'flex',
        flex: 1,
        justifyContent: 'center',
        marginBottom: "20px"
      }}>
        <VoteButton />
      </div>

      <div>



        {!!account && (
          <><StyledVote>
            <Vote_Piece4 />
          </StyledVote>
            <br />
            <StyledVote>
              <Vote_Piece3 />
            </StyledVote>
            <br />
            <StyledVote>
              <Vote_Piece2 />
            </StyledVote>
            <br />
            <StyledVote>
              <Vote_Piece />
            </StyledVote>
            <br />
            {/* <StyledVote>
            <Voter />
          </StyledVote> */}
          </>
        )}
        <StyledSpacer />
        <StyledOverview>
          {/* <Stats
            circSupply={circSupply}
            curPrice={curPrice}
            targetPrice={targetPrice}
            totalSupply={totalSupply}
          /> */}
        </StyledOverview>
      </div>
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

const StyledVote = styled.div`
  width: 100%;
`

export default Vote