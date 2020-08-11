import React, { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'

import Card from '../../../components/Card'
import CardContent from '../../../components/CardContent'
import Label from '../../../components/Label'

interface StatsProps {
  circSupply?: number,
  curPrice?: number,
  targetPrice?: number,
  totalSupply?: number
}
const Stats: React.FC<StatsProps> = ({
  circSupply,
  curPrice,
  targetPrice,
  totalSupply,
}) => {
  return (
    <StyledStats>
      <Card>
        <CardContent>
          <StyledStat>
            <StyledValue>{curPrice ? `$${curPrice}` : '--'}</StyledValue>
            <Label text="Current Price" />
          </StyledStat>
        </CardContent>
      </Card>

      <StyledSpacer />

      <Card>
        <CardContent>
          <StyledStat>
            <StyledValue>{targetPrice ? `$${targetPrice}` : '--'}</StyledValue>
            <Label text="Target Price" />
          </StyledStat>
        </CardContent>
      </Card>

      <StyledSpacer />

      <Card>
        <CardContent>
          <StyledStat>
            <StyledValue>
              {circSupply ? circSupply : '-- '}
              /
              {totalSupply ? totalSupply : ' --'}
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