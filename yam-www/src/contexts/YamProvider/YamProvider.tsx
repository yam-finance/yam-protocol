import React, { createContext, useEffect, useState } from 'react'

import { useWallet } from 'use-wallet'

import { Yam } from '../../yam_dist'

export interface YamContext {
  yam?: typeof Yam
}

export const Context = createContext<YamContext>({
  yam: undefined,
})

const YamProvider: React.FC = ({ children }) => {
  const { ethereum } = useWallet()
  const [yam, setYam] = useState<any>()

  useEffect(() => {
    if (ethereum) {
      const yamLib = new Yam(
        ethereum,
        "1001",
        true, {
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
      setYam(yamLib)
    }
  }, [ethereum])

  return (
    <Context.Provider value={{ yam }}>
      {children}
    </Context.Provider>
  )
}

export default YamProvider