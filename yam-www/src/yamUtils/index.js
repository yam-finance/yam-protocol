const getPoolContracts = async (yam) => {
  const pools = Object.keys(yam.contracts).filter(c => c.indexOf('_pool') !== -1).map(k => yam.contracts[k])
  return pools
}

const getCurrentPrice = async (yam) => {
  try {
    return yam.toBigN(await yam.contracts.rebaser.methods.getCurrentTWAP().call()).toFixed(2);
  } catch (e) {
    return '0'
  }
}

const getTargetPrice = async (yam) => {
  return yam.toBigN(1).toFixed(2);
}

const getCirculatingSupply = async (yam) => {
  let now = await yam.web3.eth.getBlock('latest');
  let scalingFactor = yam.toBigN(await yam.contracts.yam.methods.yamsScalingFactor().call());
  let starttime = yam.toBigN(await yam.contracts.eth_pool.methods.starttime().call()).toNumber();
  let timePassed = now["timestamp"] - starttime;
  if (timePassed < 0) {
    return 0;
  }
  let yamsDistributed = yam.toBigN(8 * timePassed * 250000 / 625000); //yams from first 8 pools

  timePassed = now["timestamp"] - starttime;
  let pool2Yams = yam.toBigN(timePassed * 1500000 / 625000); // yams from second pool. note: just accounts for first week
  let circulating = pool2Yams.plus(yamsDistributed).times(scalingFactor).div(10**36).toFixed(2)
  return circulating
}

const getNextRebaseTimestamp = async (yam) => {
  let now = await yam.web3.eth.getBlock('latest');
  let interval = 43200; // 12 hours
  let offset = 28800; // 8am/8pm utc
  let secondsToRebase = 0;
  if (await yam.contracts.rebaser.rebasingActive().call()) {
    if (now % interval > offset) {
        secondsToRebase = (interval - (now % interval)) + offset;
     } else {
        secondsToRebase = offset - (now % interval);
    }
  } else {
    let twap_init = yam.toBigN(await yam.contracts.rebaser.timeOfTWAPInit().call()).toNumber();
    if (twap_init > 0) {
      let delay = yam.toBigN(await yam.contracts.rebaser.rebaseDelay().call()).toNumber();
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
  return 0
}

const getTotalSupply = async (yam) => {
  return yam.toBigN(await yam.contracts.yam.methods.totalSupply().call()).div(10**18).toFixed(2);
}

export const getStats = async (yam) => {
  return {
    circSupply: await getCirculatingSupply(yam),
    curPrice: await getCurrentPrice(yam),
    nextRebase: await getNextRebaseTimestamp(yam),
    targetPrice: await getTargetPrice(yam),
    totalSupply: await getTotalSupply(yam)
  }
}
