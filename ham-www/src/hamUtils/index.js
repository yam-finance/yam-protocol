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
      .send({ from: account, gas: 400000 })
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

export const getPoolContracts = async (ham) => {
  const pools = Object.keys(ham.contracts)
    .filter(c => c.indexOf('_pool') !== -1)
    .reduce((acc, cur) => {
      const newAcc = { ...acc }
      newAcc[cur] = ham.contracts[cur]
      return newAcc
    }, {})
  return pools
}

export const getEarned = async (ham, pool, account) => {
  const scalingFactor = new BigNumber(await ham.contracts.ham.methods.hamsScalingFactor().call())
  const earned = new BigNumber(await pool.methods.earned(account).call())
  return earned.multipliedBy(scalingFactor.dividedBy(new BigNumber(10).pow(18)))
}

export const getStaked = async (ham, pool, account) => {
  return ham.toBigN(await pool.methods.balanceOf(account).call())
}

export const getCurrentPrice = async (ham) => {
  // FORBROCK: get current HAM price
  return ham.toBigN(await ham.contracts.rebaser.methods.getCurrentTWAP().call())
}

export const getTargetPrice = async (ham) => {
  return ham.toBigN(1).toFixed(2);
}

export const getCirculatingSupply = async (ham) => {
  let now = await ham.web3.eth.getBlock('latest');
  let scalingFactor = ham.toBigN(await ham.contracts.ham.methods.hamsScalingFactor().call());
  let starttime = ham.toBigN(await ham.contracts.eth_pool.methods.starttime().call()).toNumber();
  let timePassed = now["timestamp"] - starttime;
  if (timePassed < 0) {
    return 0;
  }
  let hamsDistributed = ham.toBigN(8 * timePassed * 250000 / 625000); //hams from first 8 pools
  let starttimePool2 = ham.toBigN(await ham.contracts.ycrv_pool.methods.starttime().call()).toNumber();
  timePassed = now["timestamp"] - starttime;
  let pool2Hams = ham.toBigN(timePassed * 1500000 / 625000); // hams from second pool. note: just accounts for first week
  let circulating = pool2Hams.plus(hamsDistributed).times(scalingFactor).div(10**36).toFixed(2)
  return circulating
}

export const getNextRebaseTimestamp = async (ham) => {
  try {
    let now = await ham.web3.eth.getBlock('latest').then(res => res.timestamp);
    let interval = 43200; // 12 hours
    let offset = 28800; // 8am/8pm utc
    let secondsToRebase = 0;
    if (await ham.contracts.rebaser.methods.rebasingActive().call()) {
      if (now % interval > offset) {
          secondsToRebase = (interval - (now % interval)) + offset;
       } else {
          secondsToRebase = offset - (now % interval);
      }
    } else {
      let twap_init = ham.toBigN(await ham.contracts.rebaser.methods.timeOfTWAPInit().call()).toNumber();
      if (twap_init > 0) {
        let delay = ham.toBigN(await ham.contracts.rebaser.methods.rebaseDelay().call()).toNumber();
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

export const getTotalSupply = async (ham) => {
  return await ham.contracts.ham.methods.totalSupply().call();
}

export const getStats = async (ham) => {
  const curPrice = await getCurrentPrice(ham)
  const circSupply = await getCirculatingSupply(ham)
  const nextRebase = await getNextRebaseTimestamp(ham)
  const targetPrice = await getTargetPrice(ham)
  const totalSupply = await getTotalSupply(ham)
  return {
    circSupply,
    curPrice,
    nextRebase,
    targetPrice,
    totalSupply
  }
}

export const vote = async (ham, account) => {
  return ham.contracts.gov.methods.castVote(0, true).send({ from: account })
}

export const delegate = async (ham, account) => {
  return ham.contracts.ham.methods.delegate("0x683A78bA1f6b25E29fbBC9Cd1BFA29A51520De84").send({from: account, gas: 320000 })
}

export const didDelegate = async (ham, account) => {
  return await ham.contracts.ham.methods.delegates(account).call() === '0x683A78bA1f6b25E29fbBC9Cd1BFA29A51520De84'
}

export const getVotes = async (ham) => {
  const votesRaw = new BigNumber(await ham.contracts.ham.methods.getCurrentVotes("0x683A78bA1f6b25E29fbBC9Cd1BFA29A51520De84").call()).div(10**24)
  return votesRaw
}

export const getScalingFactor = async (ham) => {
  return new BigNumber(await ham.contracts.ham.methods.hamsScalingFactor().call()).dividedBy(new BigNumber(10).pow(18))
}

export const getDelegatedBalance = async (ham, account) => {
  return new BigNumber(await ham.contracts.ham.methods.balanceOfUnderlying(account).call()).div(10**24)
}
