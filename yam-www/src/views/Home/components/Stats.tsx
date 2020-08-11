import React, { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'

import Card from '../../../components/Card'
import CardContent from '../../../components/CardContent'
import Label from '../../../components/Label'

import useYam from '../../../hooks/useYam'

import { getStats } from '../utils'

const Stats: React.FC = () => {

  const yam = useYam()

  const [stats, setStats] = useState<{
    circSupply: number,
    curPrice: number,
    targetPrice: number,
    totalSupply: number
  }>()

  const fetchStats = useCallback(async () => {
    const statsData = await getStats(yam)
    setStats(statsData)
  }, [yam, setStats])

  useEffect(() => {
    if (yam) {
      fetchStats()
    }
  }, [fetchStats, yam])

  return (
    <StyledStats>
      <Card>
        <CardContent>
          <StyledStat>
            <StyledValue>{stats ? `$${stats.curPrice}` : 'Loading'}</StyledValue>
            <Label text="Current Price" />
          </StyledStat>
        </CardContent>
      </Card>

      <StyledSpacer />

      <Card>
        <CardContent>
          <StyledStat>
            <StyledValue>{stats ? `$${stats.targetPrice}` : 'Loading'}</StyledValue>
            <Label text="Target Price" />
          </StyledStat>
        </CardContent>
      </Card>

      <StyledSpacer />

      <Card>
        <CardContent>
          <StyledStat>
            <StyledValue>
              {stats ? `${stats.circSupply} / ${stats.totalSupply}` : 'Loading'}
            </StyledValue>
            <Label text="Circ / Total Supply" />
          </StyledStat>
        </CardContent>
      </Card>
    </StyledStats>
  )
}

const StyledStats = styled.div`
  width: 325px;
`

const StyledStat = styled.div`
  display: flex;
  flex-direction: column;
`

const StyledValue = styled.span`
  color: ${props => props.theme.color.grey[600]};
  font-size: 36px;
  font-weight: 700;
`

const StyledSpacer = styled.div`
  height: ${props => props.theme.spacing[4]}px;
`

export default Stats