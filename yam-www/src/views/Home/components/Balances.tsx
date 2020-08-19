import React from 'react'
import styled from 'styled-components'
import numeral from 'numeral'

import Card from '../../../components/Card'
import CardContent from '../../../components/CardContent'
import Label from '../../../components/Label'
import Separator from '../../../components/Separator'
import Spacer from '../../../components/Spacer'
import Value from '../../../components/Value'
import YamIcon from '../../../components/YamIcon'

import { yam as yamAddress, yamv2 as yamV2Address } from '../../../constants/tokenAddresses'

import useTokenBalance from '../../../hooks/useTokenBalance'

import { bnToDec } from '../../../utils'

const Balances: React.FC = () => {
  const v1Balance = useTokenBalance(yamAddress)
  const v2Balance = useTokenBalance(yamV2Address)
  return (
    <Card>
      <CardContent>
        <StyledBalances>
          <StyledBalance>
            <YamIcon />
            <Spacer />
            <div style={{ flex: 1 }}>
              <Value value={numeral(bnToDec(v2Balance, 24)).format('0.00a')} />
              <Label text="YAMV2 Balance" />
            </div>
          </StyledBalance>
          <Spacer />
          <Separator
            orientation="vertical"
            stretch
          />
          <Spacer />
          <StyledBalance>
            <YamIcon v1 />
            <Spacer />
            <div style={{ flex: 1 }}>
              <Value value={numeral(bnToDec(v1Balance)).format('0.00a')} />
              <Label text="YAMV1 Balance" />
            </div>
          </StyledBalance>
        </StyledBalances>
      </CardContent>
    </Card>
  )
}

const StyledBalances = styled.div`
  display: flex;
`

const StyledBalance = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
`

export default Balances