import React, { useMemo, useEffect, useState } from 'react'
import styled from 'styled-components'
import axios from "axios";

import { useWallet } from 'use-wallet';

import numeral from 'numeral'

import TVL from './TVL';
import Card from '../../../components/Card'
import CardContent from '../../../components/CardContent'
import Label from '../../../components/Label'

import { getDisplayBalance } from '../../../utils/formatBalance'
import BigNumber from 'bignumber.js'

import AdButton from '../../../components/TopBar/components/AdvertisementFormButton';

interface StatsProps {
  circSupply?: string,
  curPrice?: number,
  targetPrice?: number,
  totalSupply?: string
}
const Stats: React.FC<StatsProps> = ({
  circSupply,
  curPrice,
  targetPrice,
  totalSupply,
}) => {
  const [currentPrice, setCurrentPrice] = useState(new Number)
  
  const { account, ethereum } = useWallet()

  const formattedTotalSupply = useMemo(() => {
    if (totalSupply) {
      const supplyStr = getDisplayBalance(new BigNumber(totalSupply))
      return numeral(supplyStr).format('0.0a')
    } else return '--'
  }, [totalSupply])

  useEffect(() => {
    axios.get('https://api.coingecko.com/api/v3/simple/price?ids=Cethereum%2Cshrimp-finance&vs_currencies=usd').then((res) => {
      if (res.status === 200) {
        setCurrentPrice(Number(res.data['shrimp-finance'].usd))
      }
    })
  }, [setCurrentPrice])

  return (
    <StyledStats>
      <Card>
        <CardContent>
          <StyledStat>
            <StyledValue>{Number(currentPrice).toLocaleString()}</StyledValue>
            <Label text="Current Price" />
          </StyledStat>
        </CardContent>
      </Card>

      <StyledSpacer />

      <Card>
        <CardContent>
          <StyledStat>
          {!account ? (
           <div style={{marginBottom: '5px'}}>
           <AdButton />
         </div>
          ) : (
            <StyledValue>
             <TVL/>
            </StyledValue>
          )}
            <Label text="Total Value Locked" />
          </StyledStat>
        </CardContent>
      </Card>

      <StyledSpacer />

      <Card>
        <CardContent>
          <StyledStat>
            <StyledValue>
            253,220.6
            </StyledValue>
            <Label text="Total Supply" />
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