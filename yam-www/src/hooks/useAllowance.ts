import { useCallback, useEffect, useState } from 'react'

import BigNumber from 'bignumber.js'
import { useWallet } from 'use-wallet'
import { provider } from 'web3-core'
import { Contract } from "web3-eth-contract"

import { getAllowance } from '../utils/erc20'

const useAllowance = (tokenContract: Contract, poolContract: Contract) => {
  const [allowance, setAllowance] = useState(new BigNumber(0))
  const { account }: { account: string, ethereum: provider } = useWallet()

  const fetchAllowance = useCallback(async () => {
    const allowance = await getAllowance(tokenContract, poolContract, account)
    setAllowance(new BigNumber(allowance))
  }, [account, poolContract, tokenContract])

  useEffect(() => {
    if (account && poolContract && tokenContract) {
      fetchAllowance()
    }
    let refreshInterval = setInterval(fetchAllowance, 10000)
    return () => clearInterval(refreshInterval)
  }, [account, poolContract, tokenContract])

  return allowance
}

export default useAllowance