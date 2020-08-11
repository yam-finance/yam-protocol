import {ethers} from 'ethers'

export const stake = async (poolContract, amount,account) => {
  let now = new Date().getTime() / 1000;
  if (now >= 1597172400) {
  return poolContract.methods
    .stake((amount * 10**18).toString())
    .send({ from: account, gas: 200000 })
    .on('transactionHash', tx => {
      console.log(tx)
      return tx.transactionHash
    })
  } else {
    alert("pool not active");
  }
}

export const unstake = async (poolContract, amount, account) => {
  let now = new Date().getTime() / 1000;
  if (now >= 1597172400) {
    return poolContract.methods
      .withdraw((amount*10**18).toString())
      .send({ from: account, gas: 200000 })
      .on('transactionHash', tx => {
        console.log(tx)
        return tx.transactionHash
      })
  } else {
    alert("pool not active");
  }
}

export const redeem = async (poolContract, account) => {
  let now = new Date().getTime() / 1000;
  if (now >= 1597172400) {
    return poolContract.methods
      .exit()
      .send({ from: account, gas: 200000 })
      .on('transactionHash', tx => {
        console.log(tx)
        return tx.transactionHash
      })
  } else {
    alert("pool not active");
  }
}

export const approve = async (tokenContract, poolContract, account) => {
  return tokenContract.methods
    .approve(poolContract.options.address, ethers.constants.MaxUint256)
    .send({ from: account, gas: 80000 })
}

export const getPoolContracts = async (yam) => {
  const pools = Object.keys(yam.contracts)
    .filter(c => c.indexOf('_pool') !== -1)
    .reduce((acc, cur) => {
      const newAcc = { ...acc }
      newAcc[cur] = yam.contracts[cur]
      return newAcc
    }, {})
  return pools
}

export const getEarned = async (yam, pool, account) => {
  return yam.toBigN(await pool.methods.earned(account).call())
}

export const getStaked = async (yam, pool, account) => {
  return yam.toBigN(await pool.methods.balanceOf(account).call())
}

export const getCurrentPrice = async (yam) => {
  // FORBROCK: get current YAM price
  return yam.toBigN(await yam.contracts.rebaser.methods.getCurrentTWAP().call())
}

const getTargetPrice = async (yam) => {
  // FORBROCK: get target YAM price
  return 0
}

const getCirculatingSupply = async (yam) => {
  // FORBROCK: get circulating supply
  return 0
}

const getNextRebaseTimestamp = async (yam) => {
  // FORBROCK: get next rebase timestamp
  return 0
}

const getTotalSupply = async (yam) => {
  // FORBROCK: get total supply
  return 0
}

export const getStats = async (yam) => {
  const curPrice = await getCurrentPrice(yam)
  const circSupply = await getCirculatingSupply(yam)
  const nextRebase = await getNextRebaseTimestamp(yam)
  const targetPrice = await getTargetPrice(yam)
  const totalSupply = await getTotalSupply(yam)
  return {
    circSupply,
    curPrice,
    nextRebase,
    targetPrice,
    totalSupply
  }
}
