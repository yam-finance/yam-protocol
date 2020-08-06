import {
  Yam
} from "../index.js";
import * as Types from "../lib/types.js";
import {
  addressMap
} from "../lib/constants.js";
import {
  decimalToString,
  stringToDecimal
} from "../lib/Helpers.js"


export const yam = new Yam(
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

describe("token_tests", () => {
  let snapshotId;
  let user;
  let new_user;
  let unlocked_account = "0x0eb4add4ba497357546da7f5d12d39587ca24606";

  beforeAll(async () => {
    const accounts = await yam.web3.eth.getAccounts();
    yam.addAccount(accounts[0]);
    user = accounts[0];
    new_user = accounts[1];
    snapshotId = await yam.testing.snapshot();
  });

  beforeEach(async () => {
    await yam.testing.resetEVM("0x2");
    let a = await yam.contracts.ycrv.methods.transfer(user, "15000000000000000000000000").send({from: unlocked_account});
  });

  describe("rebase", () => {
    test("user has ycrv", async() => {
      let bal0 = await yam.contracts.ycrv.methods.balanceOf(user).call();
      expect(bal0).toBe("15000000000000000000000000");
    });
    test("create pair", async () => {
        await yam.contracts.uni_fact.methods.createPair(
            yam.contracts.ycrv.options.address,
            yam.contracts.yam.options.address
        ).send({from: user, gas: 8000000})
    });
    test("mint pair", async () => {
        await yam.contracts.yam.methods.approve(
          yam.contracts.uni_router.options.address,
          -1
        ).send({from: user, gas: 80000});
        await yam.contracts.ycrv.methods.approve(
          yam.contracts.uni_router.options.address,
          -1
        ).send({from: user, gas: 80000});

        await yam.contracts.uni_router.methods.addLiquidity(
          yam.contracts.yam.options.address,
          yam.contracts.ycrv.options.address,
          10000000,
          10000000,
          10000000,
          10000000,
          user,
          1596740361 + 100000
        ).send({from: user, gas: 8000000});
        let pair = await yam.contracts.uni_fact.methods.getPair(
          yam.contracts.yam.options.address,
          yam.contracts.ycrv.options.address
        ).call();
        yam.contracts.uni_pair.options.address = pair;
        let bal = await yam.contracts.uni_pair.methods.balanceOf(user).call();
        expect(yam.toBigN(bal).toNumber()).toBeGreaterThan(100)
    });
    test("init_twap", async () => {
        await yam.contracts.yam.methods.approve(
          yam.contracts.uni_router.options.address,
          -1
        ).send({from: user, gas: 80000});
        await yam.contracts.ycrv.methods.approve(
          yam.contracts.uni_router.options.address,
          -1
        ).send({from: user, gas: 80000});

        await yam.contracts.uni_router.methods.addLiquidity(
          yam.contracts.yam.options.address,
          yam.contracts.ycrv.options.address,
          100000,
          100000,
          100000,
          100000,
          user,
          1596740361 + 10000000
        ).send({from: user, gas: 8000000});
        let pair = await yam.contracts.uni_fact.methods.getPair(
          yam.contracts.yam.options.address,
          yam.contracts.ycrv.options.address
        ).call();
        yam.contracts.uni_pair.options.address = pair;
        let bal = await yam.contracts.uni_pair.methods.balanceOf(user).call();

        // make a trade to get init values in uniswap
        await yam.contracts.uni_router.methods.swapExactTokensForTokens(
          1000,
          100,
          [
            yam.contracts.yam.options.address,
            yam.contracts.ycrv.options.address
          ],
          user,
          1596740361 + 10000000
        ).send({from: user, gas: 1000000});

        await yam.testing.increaseTime(1000);

        await yam.contracts.rebaser.methods.init_twap().send({from: user, gas: 500000});



        let init_twap = await yam.contracts.rebaser.methods.timeOfTWAPInit().call();
        let priceCumulativeLast = await yam.contracts.rebaser.methods.priceCumulativeLast().call();
        expect(yam.toBigN(init_twap).toNumber()).toBeGreaterThan(0);
        expect(yam.toBigN(priceCumulativeLast).toNumber()).toBeGreaterThan(0);
    });

    test("activate rebasing", async () => {
        await yam.contracts.yam.methods.approve(
          yam.contracts.uni_router.options.address,
          -1
        ).send({from: user, gas: 80000});
        await yam.contracts.ycrv.methods.approve(
          yam.contracts.uni_router.options.address,
          -1
        ).send({from: user, gas: 80000});

        await yam.contracts.uni_router.methods.addLiquidity(
          yam.contracts.yam.options.address,
          yam.contracts.ycrv.options.address,
          100000,
          100000,
          100000,
          100000,
          user,
          1596740361 + 10000000
        ).send({from: user, gas: 8000000});
        let pair = await yam.contracts.uni_fact.methods.getPair(
          yam.contracts.yam.options.address,
          yam.contracts.ycrv.options.address
        ).call();
        yam.contracts.uni_pair.options.address = pair;
        let bal = await yam.contracts.uni_pair.methods.balanceOf(user).call();

        // make a trade to get init values in uniswap
        await yam.contracts.uni_router.methods.swapExactTokensForTokens(
          1000,
          100,
          [
            yam.contracts.yam.options.address,
            yam.contracts.ycrv.options.address
          ],
          user,
          1596740361 + 10000000
        ).send({from: user, gas: 1000000});

        await yam.testing.increaseTime(1000);

        await yam.contracts.rebaser.methods.init_twap().send({from: user, gas: 500000});



        let init_twap = await yam.contracts.rebaser.methods.timeOfTWAPInit().call();
        let priceCumulativeLast = await yam.contracts.rebaser.methods.priceCumulativeLast().call();
        expect(yam.toBigN(init_twap).toNumber()).toBeGreaterThan(0);
        expect(yam.toBigN(priceCumulativeLast).toNumber()).toBeGreaterThan(0);

        await yam.testing.increaseTime(12*60*60);

        await yam.contracts.rebaser.methods.activate_rebasing().send({from: user, gas: 500000});
    });

    test("positive rebasing", async () => {
        await yam.contracts.yam.methods.approve(
          yam.contracts.uni_router.options.address,
          -1
        ).send({from: user, gas: 80000});
        await yam.contracts.ycrv.methods.approve(
          yam.contracts.uni_router.options.address,
          -1
        ).send({from: user, gas: 80000});

        await yam.contracts.uni_router.methods.addLiquidity(
          yam.contracts.yam.options.address,
          yam.contracts.ycrv.options.address,
          "5000000000000000000000000",
          "5000000000000000000000000",
          "5000000000000000000000000",
          "5000000000000000000000000",
          user,
          1596740361 + 10000000
        ).send({from: user, gas: 8000000});
        let pair = await yam.contracts.uni_fact.methods.getPair(
          yam.contracts.yam.options.address,
          yam.contracts.ycrv.options.address
        ).call();
        yam.contracts.uni_pair.options.address = pair;
        let bal = await yam.contracts.uni_pair.methods.balanceOf(user).call();

        // make a trade to get init values in uniswap
        await yam.contracts.uni_router.methods.swapExactTokensForTokens(
          "100000000000",
          100000,
          [
            yam.contracts.ycrv.options.address,
            yam.contracts.yam.options.address
          ],
          user,
          1596740361 + 10000000
        ).send({from: user, gas: 1000000});

        await yam.testing.increaseTime(43200);

        await yam.contracts.rebaser.methods.init_twap().send({from: user, gas: 500000});


        await yam.contracts.uni_router.methods.swapExactTokensForTokens(
          "1000000000000000000000000",
          100000,
          [
            yam.contracts.ycrv.options.address,
            yam.contracts.yam.options.address
          ],
          user,
          1596740361 + 10000000
        ).send({from: user, gas: 1000000});

        await yam.testing.increaseTime(1000);

        let q = await yam.contracts.uni_pair.methods.getReserves().call();

        console.log(q)
        let quote = await yam.contracts.uni_router.methods.quote("1000000000000000000", q[0], q[1]).call();

        console.log(quote)

        let init_twap = await yam.contracts.rebaser.methods.timeOfTWAPInit().call();

        await yam.contracts.uni_router.methods.swapExactTokensForTokens(
          "10000000000000000000",
          100000,
          [
            yam.contracts.ycrv.options.address,
            yam.contracts.yam.options.address
          ],
          user,
          1596740361 + 10000000
        ).send({from: user, gas: 1000000});

        await yam.testing.increaseTime(12*60*60);

        await yam.contracts.rebaser.methods.activate_rebasing().send({from: user, gas: 500000});


        bal = await yam.contracts.yam.methods.balanceOf(user).call();

        let a = await yam.web3.eth.getBlock('latest');

        let i;
        if (a["timestamp"] % 43200 > 36000) {
          i = (43200 - (a["timestamp"] % 43200)) + 36000;
        } else {
          i = 36000 - (a["timestamp"] % 43200);
        }
        await yam.testing.increaseTime(i);

        console.log("rebasing");

        let b = await yam.contracts.rebaser.methods.rebase().send({from: user, gas: 2500000});

        console.log(b.events["NewMaxSlippageFactor"])

        let bal1 = await yam.contracts.yam.methods.balanceOf(user).call();

        let resYAM = await yam.contracts.yam.methods.balanceOf(yam.contracts.reserves.options.address).call();

        let resycrv = await yam.contracts.ycrv.methods.balanceOf(yam.contracts.reserves.options.address).call();

        console.log(bal, bal1, resYAM, resycrv);
    });
  });

  describe("failing", () => {
    test("no early rebasing", async() => {
      await yam.testing.expectThrow(yam.contracts.rebaser.methods.activate_rebasing().send({from: user, gas: 500000}), "twap wasnt intitiated, call init_twap()");
    });
    test("no early twap", async() => {
      await yam.testing.expectThrow(yam.contracts.rebaser.methods.init_twap().send({from: user, gas: 500000}), "");
    });
  })

})
