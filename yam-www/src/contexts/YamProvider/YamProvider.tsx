import React, { createContext, useEffect, useState } from 'react'

import { useWallet } from 'use-wallet'

import { Yam } from '../../yam_dist'

export interface YamContext {
  yam?: typeof Yam
}

const Context = createContext<YamContext>({
  yam: undefined,
})

const YamProvider: React.FC = ({ children }) => {
  const { account } = useWallet()
  const [yam, setYam] = useState<typeof Yam>()

  useEffect(() => {
    const yam = new Yam(
      'http://localhost:8545/',
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
    );
  }, [])

  console.log(account)
  return (
    <Context.Provider value={{
      yam: undefined
    }}>
      {children}
    </Context.Provider>
  )
}

export default YamProvider