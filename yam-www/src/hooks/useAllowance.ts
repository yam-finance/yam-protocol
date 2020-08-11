import { useCallback, useEffect, useState } from 'react'

import BigNumber from 'bignumber.js'
import { useWallet } from 'use-wallet'
import { provider } from 'web3-core'

import { getAllowance } from '../utils/erc20'

const useAllowance = (tokenAddress: string, contractAddress: string) => {
  const [allowance, setAllowance] = useState(new BigNumber(0))
  const { account, ethereum }: { account: string, ethereum: provider } = useWallet()

  const fetchAllowance = useCallback(async () => {
    const allowance = await getAllowance(ethereum, tokenAddress, account)
    setAllowance(new BigNumber(allowance))
  }, [account, ethereum, tokenAddress])

  useEffect(() => {
    if (account && ethereum) {
      fetchAllowance()
    }
  }, [account, ethereum, setAllowance, tokenAddress])

  return allowance
}

export default useAllowance