import React, { useCallback, useEffect, useState } from 'react'
import BigNumber from 'bignumber.js'
import styled from 'styled-components'

import Countdown, { CountdownRenderProps} from 'react-countdown'
import { useWallet } from 'use-wallet'

import Page from '../../components/Page'
import PageHeader from '../../components/PageHeader'

import { yam as yamAddress } from '../../constants/tokenAddresses'

import useScalingFactor from '../../hooks/useScalingFactor'
import useTokenBalance from '../../hooks/useTokenBalance'
import useYam from '../../hooks/useYam'

import { bnToDec } from '../../utils'
import { getDisplayBalance } from '../../utils/formatBalance'

const Migrate: React.FC = () => {

  const scalingFactor = useScalingFactor()

  const yamV1Balance = bnToDec(useTokenBalance(yamAddress))
  const yamV2ReceiveAmount = yamV1Balance / scalingFactor

  const renderer = useCallback((countdownProps: CountdownRenderProps) => {
    const { hours, minutes, seconds } = countdownProps
    const paddedSeconds = seconds < 10 ? `0${seconds}` : seconds
    const paddedMinutes = minutes < 10 ? `0${minutes}` : minutes
    const paddedHours = hours < 10 ? `0${hours}` : hours
    return (
      <span>{paddedHours}:{paddedMinutes}:{paddedSeconds}</span>
    )
  }, [])

  useEffect(() => {

  }, [])

  return (
    <Page>
      <PageHeader
        icon="🦋"
        subtitle="Convert your YAMV1 tokens to YAMV2 tokens"
        title="Migrate to YAMV2"
      />
      <Countdown date={new Date(Date.now() + 10000000)} renderer={renderer} />
      <div>{yamV1Balance}</div>
      <div>{yamV2ReceiveAmount}</div>
    </Page>
  )
}

export default Migrate