import { useCallback, useEffect, useState } from 'react'

import BigNumber from 'bignumber.js'
import { useWallet } from 'use-wallet'
import { Contract } from "web3-eth-contract"

import { getEarned } from '../hamUtils'
import useHam from './useHam'

const useEarnings = (pool: Contract) => {
  const [balance, setBalance] = useState(new BigNumber(0))
  const { account }: { account: string } = useWallet()
  const ham = useHam()

  const fetchBalance = useCallback(async () => {
    const balance = await getEarned(ham, pool, account)
    setBalance(new BigNumber(balance))
  }, [account, pool, ham])

  useEffect(() => {
    if (account && pool && ham) {
      fetchBalance()
    }
  }, [account, pool, setBalance, ham])

  return balance
}

export default useEarnings
