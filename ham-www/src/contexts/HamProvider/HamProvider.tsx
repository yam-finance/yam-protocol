import React, { createContext, useEffect, useState } from 'react'

import { useWallet } from 'use-wallet'

import { Ham } from '../../ham'

export interface HamContext {
  ham?: typeof Ham
}

export const Context = createContext<HamContext>({
  ham: undefined,
})

declare global {
  interface Window {
    hamsauce: any
  }
}

const HamProvider: React.FC = ({ children }) => {
  const { ethereum } = useWallet()
  const [ham, setHam] = useState<any>()

  useEffect(() => {
    if (ethereum) {
      const hamLib = new Ham(
        ethereum,
        "1",
        false, {
          defaultAccount: "",
          defaultConfirmations: 1,
          autoGasMultiplier: 1.5,
          testing: false,
          defaultGas: "6000000",
          defaultGasPrice: "1000000000000",
          accounts: [],
          ethereumNodeTimeout: 10000
        }
      )
      setHam(hamLib)
      window.hamsauce = hamLib
    }
  }, [ethereum])

  return (
    <Context.Provider value={{ ham }}>
      {children}
    </Context.Provider>
  )
}

export default HamProvider
