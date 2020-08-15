import { useCallback, useEffect, useState } from 'react'

import BigNumber from 'bignumber.js'
import { useWallet } from 'use-wallet'
import { Contract } from "web3-eth-contract"

import { getStaked } from '../hamUtils'
import useHam from './useYam'

const useStakedBalance = (pool: Contract) => {
  const [balance, setBalance] = useState(new BigNumber(0))
  const { account }: { account: string } = useWallet()
  const ham = useHam()

  const fetchBalance = useCallback(async () => {
    const balance = await getStaked(ham, pool, account)
    setBalance(new BigNumber(balance))
  }, [account, pool, ham])

  useEffect(() => {
    if (account && pool && ham) {
      fetchBalance()
    }
  }, [account, pool, setBalance, ham])

  return balance
}

export default useStakedBalance
