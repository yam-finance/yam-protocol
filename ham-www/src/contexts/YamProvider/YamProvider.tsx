import React, { createContext, useEffect, useState } from 'react'

import { useWallet } from 'use-wallet'

import { Ham } from '../../yam'

export interface HamContext {
  yam?: typeof Ham
}

export const Context = createContext<HamContext>({
  yam: undefined,
})

declare global {
  interface Window {
    yamsauce: any
  }
}

const HamProvider: React.FC = ({ children }) => {
  const { ethereum } = useWallet()
  const [yam, setHam] = useState<any>()

  useEffect(() => {
    if (ethereum) {
      const yamLib = new Ham(
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
      setHam(yamLib)
      window.yamsauce = yamLib
    }
  }, [ethereum])

  return (
    <Context.Provider value={{ yam }}>
      {children}
    </Context.Provider>
  )
}

export default HamProvider
