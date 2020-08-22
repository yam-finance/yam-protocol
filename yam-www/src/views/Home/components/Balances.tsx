import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import numeral from 'numeral'
import { useWallet } from 'use-wallet'

import Card from '../../../components/Card'
import CardContent from '../../../components/CardContent'
import Label from '../../../components/Label'
import Spacer from '../../../components/Spacer'
import Value from '../../../components/Value'
import YamIcon from '../../../components/YamIcon'

import { yam as yamAddress, yamv2 as yamV2Address } from '../../../constants/tokenAddresses'

import useFarms from '../../../hooks/useFarms'
import useTokenBalance from '../../../hooks/useTokenBalance'
import useUnharvested from '../../../hooks/useUnharvested'
import useYam from '../../../hooks/useYam'

import { bnToDec } from '../../../utils'
import { getV2Supply } from '../../../yamUtils'

const Balances: React.FC = () => {
  const [totalSupply, setTotalSupply] = useState<number>()
  const v2Balance = useTokenBalance(yamV2Address)
  const yam = useYam()
  const { account } = useWallet()

  useEffect(() => {
    async function fetchTotalSupply () {
      const supply = await getV2Supply(yam)
      setTotalSupply(bnToDec(supply, 24))
    }
    if (yam) {
      fetchTotalSupply()
    }
  }, [yam, setTotalSupply])

  return (
    <StyledWrapper>
      <Card>
        <CardContent>
          <StyledBalances>
            <StyledBalance>
              <YamIcon />
              <Spacer />
              <div style={{ flex: 1 }}>
                <Value value={!!account ? numeral(bnToDec(v2Balance, 24)).format('0.00a') : '--'} />
                <Label text="YAMV2 Balance" />
              </div>
            </StyledBalance>
          </StyledBalances>
        </CardContent>
      </Card>
      <Spacer />
      <Card>
        <CardContent>
          <Value value={totalSupply ? totalSupply.toLocaleString() : '--'} />
          <Label text="Total supply" />
        </CardContent>
      </Card>
    </StyledWrapper>
  )
}

const StyledWrapper = styled.div`
  align-items: center;
  display: flex;
  @media (max-width: 768px) {
    width: 100%;
    flex-flow: column nowrap;
    align-items: stretch;
  }
`

const StyledBalances = styled.div`
  display: flex;
`

const StyledBalance = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
`

export default Balances