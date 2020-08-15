import {
  Ham
} from "../index.js";
import * as Types from "../lib/types.js";
import {
  addressMap
} from "../lib/constants.js";
import {
  decimalToString,
  stringToDecimal
} from "../lib/Helpers.js"


export const ham = new Ham(
  "http://localhost:8545/",
  // "http://127.0.0.1:9545/",
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
const oneEther = 10 ** 18;

describe("rebase_tests", () => {
  let snapshotId;
  let user;
  let new_user;
  // let unlocked_account = "0x0eb4add4ba497357546da7f5d12d39587ca24606";
  let unlocked_account = "0x681148725731f213b0187a3cbef215c291d85a3e";

  beforeAll(async () => {
    const accounts = await ham.web3.eth.getAccounts();
    ham.addAccount(accounts[0]);
    user = accounts[0];
    new_user = accounts[1];
    snapshotId = await ham.testing.snapshot();
  });

  beforeEach(async () => {
    await ham.testing.resetEVM("0x2");
    let a = await ham.contracts.ycrv.methods.transfer(user, "2000000000000000000000000").send({
      from: unlocked_account
    });
  });

  describe("rebase", () => {
    test("user has ycrv", async () => {
      let bal0 = await ham.contracts.ycrv.methods.balanceOf(user).call();
      expect(bal0).toBe("2000000000000000000000000");
    });
    test("create pair", async () => {
      await ham.contracts.uni_fact.methods.createPair(
        ham.contracts.ycrv.options.address,
        ham.contracts.ham.options.address
      ).send({
        from: user,
        gas: 8000000
      })
    });
    test("mint pair", async () => {
      await ham.contracts.ham.methods.approve(
        ham.contracts.uni_router.options.address,
        -1
      ).send({
        from: user,
        gas: 80000
      });
      await ham.contracts.ycrv.methods.approve(
        ham.contracts.uni_router.options.address,
        -1
      ).send({
        from: user,
        gas: 80000
      });

      await ham.contracts.uni_router.methods.addLiquidity(
        ham.contracts.ham.options.address,
        ham.contracts.ycrv.options.address,
        10000000,
        10000000,
        10000000,
        10000000,
        user,
        1596740361 + 100000000
      ).send({
        from: user,
        gas: 8000000
      });
      let pair = await ham.contracts.uni_fact.methods.getPair(
        ham.contracts.ham.options.address,
        ham.contracts.ycrv.options.address
      ).call();
      ham.contracts.uni_pair.options.address = pair;
      let bal = await ham.contracts.uni_pair.methods.balanceOf(user).call();
      expect(ham.toBigN(bal).toNumber()).toBeGreaterThan(100)
    });
    test("init_twap", async () => {
      await ham.contracts.ham.methods.approve(
        ham.contracts.uni_router.options.address,
        -1
      ).send({
        from: user,
        gas: 80000
      });
      await ham.contracts.ycrv.methods.approve(
        ham.contracts.uni_router.options.address,
        -1
      ).send({
        from: user,
        gas: 80000
      });

      await ham.contracts.uni_router.methods.addLiquidity(
        ham.contracts.ham.options.address,
        ham.contracts.ycrv.options.address,
        100000,
        100000,
        100000,
        100000,
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 8000000
      });
      let pair = await ham.contracts.uni_fact.methods.getPair(
        ham.contracts.ham.options.address,
        ham.contracts.ycrv.options.address
      ).call();
      ham.contracts.uni_pair.options.address = pair;
      let bal = await ham.contracts.uni_pair.methods.balanceOf(user).call();

      // make a trade to get init values in uniswap
      await ham.contracts.uni_router.methods.swapExactTokensForTokens(
        1000,
        100,
        [
          ham.contracts.ham.options.address,
          ham.contracts.ycrv.options.address
        ],
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 1000000
      });

      await ham.testing.increaseTime(1000);

      await ham.contracts.rebaser.methods.init_twap().send({
        from: user,
        gas: 500000
      });



      let init_twap = await ham.contracts.rebaser.methods.timeOfTWAPInit().call();
      let priceCumulativeLast = await ham.contracts.rebaser.methods.priceCumulativeLast().call();
      expect(ham.toBigN(init_twap).toNumber()).toBeGreaterThan(0);
      expect(ham.toBigN(priceCumulativeLast).toNumber()).toBeGreaterThan(0);
    });
    test("activate rebasing", async () => {
      await ham.contracts.ham.methods.approve(
        ham.contracts.uni_router.options.address,
        -1
      ).send({
        from: user,
        gas: 80000
      });
      await ham.contracts.ycrv.methods.approve(
        ham.contracts.uni_router.options.address,
        -1
      ).send({
        from: user,
        gas: 80000
      });

      await ham.contracts.uni_router.methods.addLiquidity(
        ham.contracts.ham.options.address,
        ham.contracts.ycrv.options.address,
        100000,
        100000,
        100000,
        100000,
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 8000000
      });
      let pair = await ham.contracts.uni_fact.methods.getPair(
        ham.contracts.ham.options.address,
        ham.contracts.ycrv.options.address
      ).call();
      ham.contracts.uni_pair.options.address = pair;
      let bal = await ham.contracts.uni_pair.methods.balanceOf(user).call();

      // make a trade to get init values in uniswap
      await ham.contracts.uni_router.methods.swapExactTokensForTokens(
        1000,
        100,
        [
          ham.contracts.ham.options.address,
          ham.contracts.ycrv.options.address
        ],
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 1000000
      });

      await ham.testing.increaseTime(1000);

      await ham.contracts.rebaser.methods.init_twap().send({
        from: user,
        gas: 500000
      });



      let init_twap = await ham.contracts.rebaser.methods.timeOfTWAPInit().call();
      let priceCumulativeLast = await ham.contracts.rebaser.methods.priceCumulativeLast().call();
      expect(ham.toBigN(init_twap).toNumber()).toBeGreaterThan(0);
      expect(ham.toBigN(priceCumulativeLast).toNumber()).toBeGreaterThan(0);

      await ham.testing.increaseTime(12 * 60 * 60);

      await ham.contracts.rebaser.methods.activate_rebasing().send({
        from: user,
        gas: 500000
      });
    });
    test("positive rebasing", async () => {
      await ham.contracts.ham.methods.approve(
        ham.contracts.uni_router.options.address,
        -1
      ).send({
        from: user,
        gas: 80000
      });
      await ham.contracts.ycrv.methods.approve(
        ham.contracts.uni_router.options.address,
        -1
      ).send({
        from: user,
        gas: 80000
      });

      await ham.contracts.uni_router.methods.addLiquidity(
        ham.contracts.ham.options.address,
        ham.contracts.ycrv.options.address,
        "1000000000000000000000000",
        "1000000000000000000000000",
        "1000000000000000000000000",
        "1000000000000000000000000",
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 8000000
      });

      let pair = await ham.contracts.uni_fact.methods.getPair(
        ham.contracts.ham.options.address,
        ham.contracts.ycrv.options.address
      ).call();

      ham.contracts.uni_pair.options.address = pair;
      let bal = await ham.contracts.uni_pair.methods.balanceOf(user).call();

      // make a trade to get init values in uniswap
      await ham.contracts.uni_router.methods.swapExactTokensForTokens(
        "100000000000",
        100000,
        [
          ham.contracts.ycrv.options.address,
          ham.contracts.ham.options.address
        ],
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 1000000
      });

      // trade back for easier calcs later
      await ham.contracts.uni_router.methods.swapExactTokensForTokens(
        "100000000000",
        100000,
        [
          ham.contracts.ham.options.address,
          ham.contracts.ycrv.options.address
        ],
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 1000000
      });

      await ham.testing.increaseTime(43200);

      await ham.contracts.rebaser.methods.init_twap().send({
        from: user,
        gas: 500000
      });


      await ham.contracts.uni_router.methods.swapExactTokensForTokens(
        "100000000000000000000000",
        100000,
        [
          ham.contracts.ycrv.options.address,
          ham.contracts.ham.options.address
        ],
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 1000000
      });

      // init twap
      let init_twap = await ham.contracts.rebaser.methods.timeOfTWAPInit().call();

      // wait 12 hours
      await ham.testing.increaseTime(12 * 60 * 60);

      // perform trade to change price
      await ham.contracts.uni_router.methods.swapExactTokensForTokens(
        "10000000000000000000",
        100000,
        [
          ham.contracts.ycrv.options.address,
          ham.contracts.ham.options.address
        ],
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 1000000
      });

      // activate rebasing
      await ham.contracts.rebaser.methods.activate_rebasing().send({
        from: user,
        gas: 500000
      });


      let res_bal = await ham.contracts.ham.methods.balanceOf(
          ham.contracts.reserves.options.address
      ).call();

      expect(res_bal).toBe("0");

      bal = await ham.contracts.ham.methods.balanceOf(user).call();

      let a = await ham.web3.eth.getBlock('latest');

      let offset = await ham.contracts.rebaser.methods.rebaseWindowOffsetSec().call();
      offset = ham.toBigN(offset).toNumber();
      let interval = await ham.contracts.rebaser.methods.minRebaseTimeIntervalSec().call();
      interval = ham.toBigN(interval).toNumber();

      let i;
      if (a["timestamp"] % interval > offset) {
        i = (interval - (a["timestamp"] % interval)) + offset;
      } else {
        i = offset - (a["timestamp"] % interval);
      }

      await ham.testing.increaseTime(i);

      let r = await ham.contracts.uni_pair.methods.getReserves().call();
      let q = await ham.contracts.uni_router.methods.quote(ham.toBigN(10**18).toString(), r[0], r[1]).call();
      console.log("quote pre positive rebase", q);

      let b = await ham.contracts.rebaser.methods.rebase().send({
        from: user,
        gas: 2500000
      });

      //console.log(b.events)
      console.log("positive rebase gas used:", b["gasUsed"]);

      let bal1 = await ham.contracts.ham.methods.balanceOf(user).call();

      let resHAM = await ham.contracts.ham.methods.balanceOf(ham.contracts.reserves.options.address).call();

      let resycrv = await ham.contracts.ycrv.methods.balanceOf(ham.contracts.reserves.options.address).call();

      console.log("bal user, bal ham res, bal res crv", bal1, resHAM, resycrv);
      r = await ham.contracts.uni_pair.methods.getReserves().call();
      q = await ham.contracts.uni_router.methods.quote(ham.toBigN(10**18).toString(), r[0], r[1]).call();
      console.log("post positive rebase quote", q);

      // new balance > old balance
      expect(ham.toBigN(bal).toNumber()).toBeLessThan(ham.toBigN(bal1).toNumber());
      // used full ham reserves
      expect(ham.toBigN(resHAM).toNumber()).toBe(0);
      // increases reserves
      expect(ham.toBigN(resycrv).toNumber()).toBeGreaterThan(0);


      // not below peg
      expect(ham.toBigN(q).toNumber()).toBeGreaterThan(ham.toBigN(10**18).toNumber());
    });
    test("negative rebasing", async () => {
      await ham.contracts.ham.methods.approve(
        ham.contracts.uni_router.options.address,
        -1
      ).send({
        from: user,
        gas: 80000
      });
      await ham.contracts.ycrv.methods.approve(
        ham.contracts.uni_router.options.address,
        -1
      ).send({
        from: user,
        gas: 80000
      });

      await ham.contracts.uni_router.methods.addLiquidity(
        ham.contracts.ham.options.address,
        ham.contracts.ycrv.options.address,
        "1000000000000000000000000",
        "1000000000000000000000000",
        "1000000000000000000000000",
        "1000000000000000000000000",
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 8000000
      });

      let pair = await ham.contracts.uni_fact.methods.getPair(
        ham.contracts.ham.options.address,
        ham.contracts.ycrv.options.address
      ).call();

      ham.contracts.uni_pair.options.address = pair;
      let bal = await ham.contracts.uni_pair.methods.balanceOf(user).call();

      // make a trade to get init values in uniswap
      await ham.contracts.uni_router.methods.swapExactTokensForTokens(
        "100000000000",
        100000,
        [
          ham.contracts.ycrv.options.address,
          ham.contracts.ham.options.address
        ],
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 1000000
      });

      // trade back for easier calcs later
      await ham.contracts.uni_router.methods.swapExactTokensForTokens(
        "100000000000",
        100000,
        [
          ham.contracts.ham.options.address,
          ham.contracts.ycrv.options.address
        ],
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 1000000
      });

      await ham.testing.increaseTime(43200);

      await ham.contracts.rebaser.methods.init_twap().send({
        from: user,
        gas: 500000
      });


      await ham.contracts.uni_router.methods.swapExactTokensForTokens(
        "500000000000000000000000",
        100000,
        [
          ham.contracts.ham.options.address,
          ham.contracts.ycrv.options.address
        ],
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 1000000
      });

      // init twap
      let init_twap = await ham.contracts.rebaser.methods.timeOfTWAPInit().call();

      // wait 12 hours
      await ham.testing.increaseTime(12 * 60 * 60);

      // perform trade to change price
      await ham.contracts.uni_router.methods.swapExactTokensForTokens(
        "10000000000000000000",
        100000,
        [
          ham.contracts.ham.options.address,
          ham.contracts.ycrv.options.address
        ],
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 1000000
      });

      // activate rebasing
      await ham.contracts.rebaser.methods.activate_rebasing().send({
        from: user,
        gas: 500000
      });


      bal = await ham.contracts.ham.methods.balanceOf(user).call();

      let a = await ham.web3.eth.getBlock('latest');

      let offset = await ham.contracts.rebaser.methods.rebaseWindowOffsetSec().call();
      offset = ham.toBigN(offset).toNumber();
      let interval = await ham.contracts.rebaser.methods.minRebaseTimeIntervalSec().call();
      interval = ham.toBigN(interval).toNumber();

      let i;
      if (a["timestamp"] % interval > offset) {
        i = (interval - (a["timestamp"] % interval)) + offset;
      } else {
        i = offset - (a["timestamp"] % interval);
      }

      await ham.testing.increaseTime(i);

      let r = await ham.contracts.uni_pair.methods.getReserves().call();
      let q = await ham.contracts.uni_router.methods.quote(ham.toBigN(10**18).toString(), r[0], r[1]).call();
      console.log("quote pre negative rebase", q);

      let b = await ham.contracts.rebaser.methods.rebase().send({
        from: user,
        gas: 2500000
      });

      //console.log(b.events)
      console.log("negative rebase gas used:", b["gasUsed"]);

      let bal1 = await ham.contracts.ham.methods.balanceOf(user).call();

      let resHAM = await ham.contracts.ham.methods.balanceOf(ham.contracts.reserves.options.address).call();

      let resycrv = await ham.contracts.ycrv.methods.balanceOf(ham.contracts.reserves.options.address).call();

      // balance decreases
      expect(ham.toBigN(bal1).toNumber()).toBeLessThan(ham.toBigN(bal).toNumber());
      // no increases to reserves
      expect(ham.toBigN(resHAM).toNumber()).toBe(0);
      expect(ham.toBigN(resycrv).toNumber()).toBe(0);
    });
    test("no rebasing", async () => {
      await ham.contracts.ham.methods.approve(
        ham.contracts.uni_router.options.address,
        -1
      ).send({
        from: user,
        gas: 80000
      });
      await ham.contracts.ycrv.methods.approve(
        ham.contracts.uni_router.options.address,
        -1
      ).send({
        from: user,
        gas: 80000
      });

      await ham.contracts.uni_router.methods.addLiquidity(
        ham.contracts.ham.options.address,
        ham.contracts.ycrv.options.address,
        "1000000000000000000000000",
        "1000000000000000000000000",
        "1000000000000000000000000",
        "1000000000000000000000000",
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 8000000
      });

      let pair = await ham.contracts.uni_fact.methods.getPair(
        ham.contracts.ham.options.address,
        ham.contracts.ycrv.options.address
      ).call();

      ham.contracts.uni_pair.options.address = pair;
      let bal = await ham.contracts.uni_pair.methods.balanceOf(user).call();

      // make a trade to get init values in uniswap
      await ham.contracts.uni_router.methods.swapExactTokensForTokens(
        "100000000000",
        100000,
        [
          ham.contracts.ycrv.options.address,
          ham.contracts.ham.options.address
        ],
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 1000000
      });

      // trade back for easier calcs later
      await ham.contracts.uni_router.methods.swapExactTokensForTokens(
        "100000000000",
        100000,
        [
          ham.contracts.ham.options.address,
          ham.contracts.ycrv.options.address
        ],
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 1000000
      });

      await ham.testing.increaseTime(43200);

      await ham.contracts.rebaser.methods.init_twap().send({
        from: user,
        gas: 500000
      });


      await ham.contracts.uni_router.methods.swapExactTokensForTokens(
        "10000000000000000000000",
        100000,
        [
          ham.contracts.ham.options.address,
          ham.contracts.ycrv.options.address
        ],
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 1000000
      });

      await ham.contracts.uni_router.methods.swapExactTokensForTokens(
        "10000000000000000000000",
        100000,
        [
          ham.contracts.ycrv.options.address,
          ham.contracts.ham.options.address
        ],
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 1000000
      });

      // init twap
      let init_twap = await ham.contracts.rebaser.methods.timeOfTWAPInit().call();

      // wait 12 hours
      await ham.testing.increaseTime(12 * 60 * 60);

      // perform trade to change price
      await ham.contracts.uni_router.methods.swapExactTokensForTokens(
        "10000000000000000000",
        100000,
        [
          ham.contracts.ham.options.address,
          ham.contracts.ycrv.options.address
        ],
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 1000000
      });

      await ham.contracts.uni_router.methods.swapExactTokensForTokens(
        "10000000000000000000",
        100000,
        [
          ham.contracts.ycrv.options.address,
          ham.contracts.ham.options.address
        ],
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 1000000
      });

      // activate rebasing
      await ham.contracts.rebaser.methods.activate_rebasing().send({
        from: user,
        gas: 500000
      });


      bal = await ham.contracts.ham.methods.balanceOf(user).call();

      let a = await ham.web3.eth.getBlock('latest');

      let offset = await ham.contracts.rebaser.methods.rebaseWindowOffsetSec().call();
      offset = ham.toBigN(offset).toNumber();
      let interval = await ham.contracts.rebaser.methods.minRebaseTimeIntervalSec().call();
      interval = ham.toBigN(interval).toNumber();

      let i;
      if (a["timestamp"] % interval > offset) {
        i = (interval - (a["timestamp"] % interval)) + offset;
      } else {
        i = offset - (a["timestamp"] % interval);
      }

      await ham.testing.increaseTime(i);

      let r = await ham.contracts.uni_pair.methods.getReserves().call();
      console.log(r, r[0], r[1]);
      let q = await ham.contracts.uni_router.methods.quote(ham.toBigN(10**18).toString(), r[0], r[1]).call();
      console.log("quote pre no rebase", q);
      let b = await ham.contracts.rebaser.methods.rebase().send({
        from: user,
        gas: 2500000
      });

      console.log("no rebase gas used:", b["gasUsed"]);

      let bal1 = await ham.contracts.ham.methods.balanceOf(user).call();

      let resHAM = await ham.contracts.ham.methods.balanceOf(ham.contracts.reserves.options.address).call();

      let resycrv = await ham.contracts.ycrv.methods.balanceOf(ham.contracts.reserves.options.address).call();

      // no change
      expect(ham.toBigN(bal1).toNumber()).toBe(ham.toBigN(bal).toNumber());
      // no increases to reserves
      expect(ham.toBigN(resHAM).toNumber()).toBe(0);
      expect(ham.toBigN(resycrv).toNumber()).toBe(0);
      r = await ham.contracts.uni_pair.methods.getReserves().call();
      q = await ham.contracts.uni_router.methods.quote(ham.toBigN(10**18).toString(), r[0], r[1]).call();
      console.log("quote post no rebase", q);
    });
    test("rebasing with HAM in reserves", async () => {
      await ham.contracts.ham.methods.transfer(ham.contracts.reserves.options.address, yam.toBigN(60000*10**18).toString()).send({from: user});
      await ham.contracts.ham.methods.approve(
        ham.contracts.uni_router.options.address,
        -1
      ).send({
        from: user,
        gas: 80000
      });
      await ham.contracts.ycrv.methods.approve(
        ham.contracts.uni_router.options.address,
        -1
      ).send({
        from: user,
        gas: 80000
      });

      await ham.contracts.uni_router.methods.addLiquidity(
        ham.contracts.ham.options.address,
        ham.contracts.ycrv.options.address,
        "1000000000000000000000000",
        "1000000000000000000000000",
        "1000000000000000000000000",
        "1000000000000000000000000",
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 8000000
      });

      let pair = await ham.contracts.uni_fact.methods.getPair(
        ham.contracts.ham.options.address,
        ham.contracts.ycrv.options.address
      ).call();

      ham.contracts.uni_pair.options.address = pair;
      let bal = await ham.contracts.uni_pair.methods.balanceOf(user).call();

      // make a trade to get init values in uniswap
      await ham.contracts.uni_router.methods.swapExactTokensForTokens(
        "100000000000",
        100000,
        [
          ham.contracts.ycrv.options.address,
          ham.contracts.ham.options.address
        ],
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 1000000
      });

      // trade back for easier calcs later
      await ham.contracts.uni_router.methods.swapExactTokensForTokens(
        "100000000000",
        100000,
        [
          ham.contracts.ham.options.address,
          ham.contracts.ycrv.options.address
        ],
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 1000000
      });

      await ham.testing.increaseTime(43200);

      await ham.contracts.rebaser.methods.init_twap().send({
        from: user,
        gas: 500000
      });


      await ham.contracts.uni_router.methods.swapExactTokensForTokens(
        "500000000000000000000000",
        100000,
        [
          ham.contracts.ycrv.options.address,
          ham.contracts.ham.options.address
        ],
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 1000000
      });

      // init twap
      let init_twap = await ham.contracts.rebaser.methods.timeOfTWAPInit().call();

      // wait 12 hours
      await ham.testing.increaseTime(12 * 60 * 60);

      // perform trade to change price
      await ham.contracts.uni_router.methods.swapExactTokensForTokens(
        "10000000000000000000",
        100000,
        [
          ham.contracts.ycrv.options.address,
          ham.contracts.ham.options.address
        ],
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 1000000
      });

      // activate rebasing
      await ham.contracts.rebaser.methods.activate_rebasing().send({
        from: user,
        gas: 500000
      });


      bal = await ham.contracts.ham.methods.balanceOf(user).call();

      let a = await ham.web3.eth.getBlock('latest');

      let offset = await ham.contracts.rebaser.methods.rebaseWindowOffsetSec().call();
      offset = ham.toBigN(offset).toNumber();
      let interval = await ham.contracts.rebaser.methods.minRebaseTimeIntervalSec().call();
      interval = ham.toBigN(interval).toNumber();

      let i;
      if (a["timestamp"] % interval > offset) {
        i = (interval - (a["timestamp"] % interval)) + offset;
      } else {
        i = offset - (a["timestamp"] % interval);
      }

      await ham.testing.increaseTime(i);


      let r = await ham.contracts.uni_pair.methods.getReserves().call();
      let q = await ham.contracts.uni_router.methods.quote(ham.toBigN(10**18).toString(), r[0], r[1]).call();
      console.log("quote pre pos rebase with reserves", q);

      let b = await ham.contracts.rebaser.methods.rebase().send({
        from: user,
        gas: 2500000
      });
      //console.log(b.events)

      console.log("positive  with reserves gas used:", b["gasUsed"]);

      let bal1 = await ham.contracts.ham.methods.balanceOf(user).call();

      let resHAM = await ham.contracts.ham.methods.balanceOf(ham.contracts.reserves.options.address).call();

      let resycrv = await ham.contracts.ycrv.methods.balanceOf(ham.contracts.reserves.options.address).call();

      console.log(bal, bal1, resHAM, resycrv);
      expect(ham.toBigN(bal).toNumber()).toBeLessThan(ham.toBigN(bal1).toNumber());
      expect(ham.toBigN(resHAM).toNumber()).toBeGreaterThan(0);
      expect(ham.toBigN(resycrv).toNumber()).toBeGreaterThan(0);
      r = await ham.contracts.uni_pair.methods.getReserves().call();
      q = await ham.contracts.uni_router.methods.quote(ham.toBigN(10**18).toString(), r[0], r[1]).call();
      console.log("quote post rebase w/ reserves", q);
      expect(ham.toBigN(q).toNumber()).toBeGreaterThan(ham.toBigN(10**18).toNumber());
    });
  });

  describe("failing", () => {
    test("unitialized rebasing", async () => {
      await ham.testing.expectThrow(ham.contracts.rebaser.methods.activate_rebasing().send({
        from: user,
        gas: 500000
      }), "twap wasnt intitiated, call init_twap()");
    });
    test("no early twap", async () => {
      await ham.testing.expectThrow(ham.contracts.rebaser.methods.init_twap().send({
        from: user,
        gas: 500000
      }), "");
    });
    test("too late rebasing", async () => {
      await ham.contracts.ham.methods.approve(
        ham.contracts.uni_router.options.address,
        -1
      ).send({
        from: user,
        gas: 80000
      });
      await ham.contracts.ycrv.methods.approve(
        ham.contracts.uni_router.options.address,
        -1
      ).send({
        from: user,
        gas: 80000
      });

      await ham.contracts.uni_router.methods.addLiquidity(
        ham.contracts.ham.options.address,
        ham.contracts.ycrv.options.address,
        "1000000000000000000000000",
        "1000000000000000000000000",
        "1000000000000000000000000",
        "1000000000000000000000000",
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 8000000
      });

      let pair = await ham.contracts.uni_fact.methods.getPair(
        ham.contracts.ham.options.address,
        ham.contracts.ycrv.options.address
      ).call();

      ham.contracts.uni_pair.options.address = pair;
      let bal = await ham.contracts.uni_pair.methods.balanceOf(user).call();

      // make a trade to get init values in uniswap
      await ham.contracts.uni_router.methods.swapExactTokensForTokens(
        "100000000000",
        100000,
        [
          ham.contracts.ycrv.options.address,
          ham.contracts.ham.options.address
        ],
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 1000000
      });

      // trade back for easier calcs later
      await ham.contracts.uni_router.methods.swapExactTokensForTokens(
        "100000000000",
        100000,
        [
          ham.contracts.ham.options.address,
          ham.contracts.ycrv.options.address
        ],
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 1000000
      });

      await ham.testing.increaseTime(43200);

      await ham.contracts.rebaser.methods.init_twap().send({
        from: user,
        gas: 500000
      });


      await ham.contracts.uni_router.methods.swapExactTokensForTokens(
        "500000000000000000000000",
        100000,
        [
          ham.contracts.ycrv.options.address,
          ham.contracts.ham.options.address
        ],
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 1000000
      });

      // init twap
      let init_twap = await ham.contracts.rebaser.methods.timeOfTWAPInit().call();

      // wait 12 hours
      await ham.testing.increaseTime(12 * 60 * 60);

      // perform trade to change price
      await ham.contracts.uni_router.methods.swapExactTokensForTokens(
        "10000000000000000000",
        100000,
        [
          ham.contracts.ycrv.options.address,
          ham.contracts.ham.options.address
        ],
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 1000000
      });

      // activate rebasing
      await ham.contracts.rebaser.methods.activate_rebasing().send({
        from: user,
        gas: 500000
      });


      bal = await ham.contracts.ham.methods.balanceOf(user).call();

      let a = await ham.web3.eth.getBlock('latest');

      let offset = await ham.contracts.rebaser.methods.rebaseWindowOffsetSec().call();
      offset = ham.toBigN(offset).toNumber();
      let interval = await ham.contracts.rebaser.methods.minRebaseTimeIntervalSec().call();
      interval = ham.toBigN(interval).toNumber();

      let i;
      if (a["timestamp"] % interval > offset) {
        i = (interval - (a["timestamp"] % interval)) + offset;
      } else {
        i = offset - (a["timestamp"] % interval);
      }

      let len = await ham.contracts.rebaser.methods.rebaseWindowLengthSec().call();

      await ham.testing.increaseTime(i + ham.toBigN(len).toNumber()+1);

      let b = await ham.testing.expectThrow(ham.contracts.rebaser.methods.rebase().send({
        from: user,
        gas: 2500000
      }), "too late");
    });
    test("too early rebasing", async () => {
      await ham.contracts.ham.methods.approve(
        ham.contracts.uni_router.options.address,
        -1
      ).send({
        from: user,
        gas: 80000
      });
      await ham.contracts.ycrv.methods.approve(
        ham.contracts.uni_router.options.address,
        -1
      ).send({
        from: user,
        gas: 80000
      });

      await ham.contracts.uni_router.methods.addLiquidity(
        ham.contracts.ham.options.address,
        ham.contracts.ycrv.options.address,
        "1000000000000000000000000",
        "1000000000000000000000000",
        "1000000000000000000000000",
        "1000000000000000000000000",
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 8000000
      });

      let pair = await ham.contracts.uni_fact.methods.getPair(
        ham.contracts.ham.options.address,
        ham.contracts.ycrv.options.address
      ).call();

      ham.contracts.uni_pair.options.address = pair;
      let bal = await ham.contracts.uni_pair.methods.balanceOf(user).call();

      // make a trade to get init values in uniswap
      await ham.contracts.uni_router.methods.swapExactTokensForTokens(
        "100000000000",
        100000,
        [
          ham.contracts.ycrv.options.address,
          ham.contracts.ham.options.address
        ],
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 1000000
      });

      // trade back for easier calcs later
      await ham.contracts.uni_router.methods.swapExactTokensForTokens(
        "100000000000",
        100000,
        [
          ham.contracts.ham.options.address,
          ham.contracts.ycrv.options.address
        ],
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 1000000
      });

      await ham.testing.increaseTime(43200);

      await ham.contracts.rebaser.methods.init_twap().send({
        from: user,
        gas: 500000
      });


      await ham.contracts.uni_router.methods.swapExactTokensForTokens(
        "500000000000000000000000",
        100000,
        [
          ham.contracts.ycrv.options.address,
          ham.contracts.ham.options.address
        ],
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 1000000
      });

      // init twap
      let init_twap = await ham.contracts.rebaser.methods.timeOfTWAPInit().call();

      // wait 12 hours
      await ham.testing.increaseTime(12 * 60 * 60);

      // perform trade to change price
      await ham.contracts.uni_router.methods.swapExactTokensForTokens(
        "10000000000000000000",
        100000,
        [
          ham.contracts.ycrv.options.address,
          ham.contracts.ham.options.address
        ],
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 1000000
      });

      // activate rebasing
      await ham.contracts.rebaser.methods.activate_rebasing().send({
        from: user,
        gas: 500000
      });

      bal = await ham.contracts.ham.methods.balanceOf(user).call();

      let a = await ham.web3.eth.getBlock('latest');

      let offset = await ham.contracts.rebaser.methods.rebaseWindowOffsetSec().call();
      offset = ham.toBigN(offset).toNumber();
      let interval = await ham.contracts.rebaser.methods.minRebaseTimeIntervalSec().call();
      interval = ham.toBigN(interval).toNumber();

      let i;
      if (a["timestamp"] % interval > offset) {
        i = (interval - (a["timestamp"] % interval)) + offset;
      } else {
        i = offset - (a["timestamp"] % interval);
      }

      await ham.testing.increaseTime(i - 1);



      let b = await ham.testing.expectThrow(ham.contracts.rebaser.methods.rebase().send({
        from: user,
        gas: 2500000
      }), "too early");
    });
  });
});
