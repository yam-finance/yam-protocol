import {ethers} from 'ethers'

import BigNumber from 'bignumber.js'

BigNumber.config({
  EXPONENTIAL_AT: 1000,
  DECIMAL_PLACES: 80,
});

export const getPoolStartTime = async (poolContract) => {
  return await poolContract.methods.starttime().call()
}

export const stake = async (poolContract, amount, account) => {
  let now = new Date().getTime() / 1000;
  if (now >= 1597172400) {
    return poolContract.methods
      .stake((new BigNumber(amount).times(new BigNumber(10).pow(18))).toString())
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
      .withdraw((new BigNumber(amount).times(new BigNumber(10).pow(18))).toString())
      .send({ from: account, gas: 200000 })
      .on('transactionHash', tx => {
        console.log(tx)
        return tx.transactionHash
      })
  } else {
    alert("pool not active");
  }
}

export const harvest = async (poolContract, account) => {
  let now = new Date().getTime() / 1000;
  if (now >= 1597172400) {
    return poolContract.methods
      .getReward()
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
  const scalingFactor = new BigNumber(await yam.contracts.yam.methods.yamsScalingFactor().call())
  const earned = new BigNumber(await pool.methods.earned(account).call())
  return earned.multipliedBy(scalingFactor.dividedBy(new BigNumber(10).pow(18)))
}

export const getStaked = async (yam, pool, account) => {
  return yam.toBigN(await pool.methods.balanceOf(account).call())
}

export const getCurrentPrice = async (yam) => {
  // FORBROCK: get current YAM price
  return yam.toBigN(await yam.contracts.rebaser.methods.getCurrentTWAP().call())
}

export const getTargetPrice = async (yam) => {
  return yam.toBigN(1).toFixed(2);
}

export const getCirculatingSupply = async (yam) => {
  let now = await yam.web3.eth.getBlock('latest');
  let scalingFactor = yam.toBigN(await yam.contracts.yam.methods.yamsScalingFactor().call());
  let starttime = yam.toBigN(await yam.contracts.eth_pool.methods.starttime().call()).toNumber();
  let timePassed = now["timestamp"] - starttime;
  if (timePassed < 0) {
    return 0;
  }
  let yamsDistributed = yam.toBigN(8 * timePassed * 250000 / 625000); //yams from first 8 pools
  let starttimePool2 = yam.toBigN(await yam.contracts.ycrv_pool.methods.starttime().call()).toNumber();
  timePassed = now["timestamp"] - starttime;
  let pool2Yams = yam.toBigN(timePassed * 1500000 / 625000); // yams from second pool. note: just accounts for first week
  let circulating = pool2Yams.plus(yamsDistributed).times(scalingFactor).div(10**36).toFixed(2)
  return circulating
}

export const getNextRebaseTimestamp = async (yam) => {
  try {
    let now = await yam.web3.eth.getBlock('latest').then(res => res.timestamp);
    let interval = 43200; // 12 hours
    let offset = 28800; // 8am/8pm utc
    let secondsToRebase = 0;
    if (await yam.contracts.rebaser.methods.rebasingActive().call()) {
      if (now % interval > offset) {
          secondsToRebase = (interval - (now % interval)) + offset;
       } else {
          secondsToRebase = offset - (now % interval);
      }
    } else {
      let twap_init = yam.toBigN(await yam.contracts.rebaser.methods.timeOfTWAPInit().call()).toNumber();
      if (twap_init > 0) {
        let delay = yam.toBigN(await yam.contracts.rebaser.methods.rebaseDelay().call()).toNumber();
        let endTime = twap_init + delay;
        if (endTime % interval > offset) {
            secondsToRebase = (interval - (endTime % interval)) + offset;
         } else {
            secondsToRebase = offset - (endTime % interval);
        }
        return endTime + secondsToRebase;
      } else {
        return now + 13*60*60; // just know that its greater than 12 hours away
      }
    }
    return secondsToRebase
  } catch (e) {
    console.log(e)
  }
}

export const getTotalSupply = async (yam) => {
  return await yam.contracts.yam.methods.totalSupply().call();
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

export const vote = async (yam, account) => {
  yam.contracts.gov.methods.castVote(0, true).send({ from: account })
}

export const delegate = async (yam, account) => {
  yam.contracts.yam.methods.delegate("0x683A78bA1f6b25E29fbBC9Cd1BFA29A51520De84").send({from: account})
}
