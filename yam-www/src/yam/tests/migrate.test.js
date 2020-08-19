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
  let user = "0x683A78bA1f6b25E29fbBC9Cd1BFA29A51520De84";
  let new_user;
  beforeAll(async () => {
    const accounts = await yam.web3.eth.getAccounts();
    yam.addAccount(accounts[0]);
    new_user = accounts[1];
    snapshotId = await yam.testing.snapshot();
  });

  beforeEach(async () => {
    await yam.testing.resetEVM("0x2");
  });

  // describe("expected fail", () => {
  //   test("before start", async () => {
  //     await yam.testing.resetEVM("0x2");
  //     let startTime = await yam.contracts.yamV2migration.methods.startTime().call();
  //     let timeNow = yam.toBigN((await yam.web3.eth.getBlock('latest'))["timestamp"]);
  //     let waitTime = yam.toBigN(startTime).minus(timeNow);
  //     if (waitTime <= 0) {
  //       // this test is hard to run on ganache as there is no easy way to
  //       // ensure that another test hasnt increased the time already
  //       console.log("WARNING: TEST CANNOT OCCUR DUE TO GANACHE TIMING");
  //     } else {
  //       await yam.testing.expectThrow(yam.contracts.yamV2migration.methods.migrate().send({from: user}), "!started");
  //     }
  //   });
  //   test("user 0 balance", async () => {
  //     // fast forward to startTime
  //     let startTime = await yam.contracts.yamV2migration.methods.startTime().call();
  //     let timeNow = yam.toBigN((await yam.web3.eth.getBlock('latest'))["timestamp"]);
  //     let waitTime = yam.toBigN(startTime).minus(timeNow);
  //     if (waitTime.toNumber() > 0) {
  //       await yam.testing.increaseTime(waitTime.toNumber());
  //     }
  //     await yam.testing.expectThrow(yam.contracts.yamV2migration.methods.migrate().send({from: new_user}), "No yams");
  //   });
  //   test("after end", async () => {
  //     // increase time
  //     let startTime = await yam.contracts.yamV2migration.methods.startTime().call();
  //     let migrationDuration = await yam.contracts.yamV2migration.methods.migrationDuration().call();
  //     let timeNow = yam.toBigN((await yam.web3.eth.getBlock('latest'))["timestamp"]);
  //     let waitTime = yam.toBigN(startTime).plus(yam.toBigN(migrationDuration)).minus(timeNow);
  //     if (waitTime.toNumber() > 0) {
  //       await yam.testing.increaseTime(waitTime.toNumber());
  //     }
  //     // expect fail
  //     await yam.testing.expectThrow(yam.contracts.yamV2migration.methods.migrate().send({from: user}), "migration ended");
  //   });
  //   test("double migrate", async () => {
  //     await yam.contracts.yam.methods.approve(yam.contracts.yamV2migration.options.address, "10000000000000000000000000000000000").send({from: user, gas: 1000000});
  //     await yam.contracts.yamV2migration.methods.migrate().send({from: user, gas: 1000000});
  //     let yam_bal = yam.toBigN(await yam.contracts.yam.methods.balanceOfUnderlying(user).call()).toNumber();
  //     await yam.testing.expectThrow(yam.contracts.yamV2migration.methods.migrate().send({from: user, gas: 1000000}), "No yams");
  //   });
  // });

  describe("non-failing", () => {
    test("zeros balance", async () => {
      let startTime = await yam.contracts.yamV2migration.methods.startTime().call();
      let timeNow = yam.toBigN((await yam.web3.eth.getBlock('latest'))["timestamp"]);
      let waitTime = yam.toBigN(startTime).minus(timeNow);
      if (waitTime.toNumber() > 0) {
        await yam.testing.increaseTime(waitTime.toNumber());
      }
      await yam.contracts.yam.methods.approve(yam.contracts.yamV2migration.options.address, "10000000000000000000000000000000000").send({from: user, gas: 1000000});
      await yam.contracts.yamV2migration.methods.migrate().send({from: user, gas: 1000000});
      let yam_bal = yam.toBigN(await yam.contracts.yam.methods.balanceOf(user).call()).toNumber();
      expect(yam_bal).toBe(0);
    });
    test("v2 balance equal to v1 underlying balance", async () => {
      let startTime = await yam.contracts.yamV2migration.methods.startTime().call();
      let timeNow = yam.toBigN((await yam.web3.eth.getBlock('latest'))["timestamp"]);
      let waitTime = yam.toBigN(startTime).minus(timeNow);
      if (waitTime.toNumber() > 0) {
        await yam.testing.increaseTime(waitTime.toNumber());
      }
      let yam_bal = yam.toBigN(await yam.contracts.yam.methods.balanceOfUnderlying(user).call());
      await yam.contracts.yam.methods.approve(yam.contracts.yamV2migration.options.address, "10000000000000000000000000000000000").send({from: user, gas: 1000000});
      await yam.contracts.yamV2migration.methods.migrate().send({from: user, gas: 1000000});
      let yamV2_bal = yam.toBigN(await yam.contracts.yamV2.methods.balanceOf(user).call());
      expect(yam_bal.toString()).toBe(yamV2_bal.toString());
    });
    test("totalSupply increase equal to yam_underlying_bal", async () => {
      let startTime = await yam.contracts.yamV2migration.methods.startTime().call();
      let timeNow = yam.toBigN((await yam.web3.eth.getBlock('latest'))["timestamp"]);
      let waitTime = yam.toBigN(startTime).minus(timeNow);
      if (waitTime.toNumber() > 0) {
        await yam.testing.increaseTime(waitTime.toNumber());
      }
      let yam_underlying_bal = yam.toBigN(await yam.contracts.yam.methods.balanceOfUnderlying(user).call());
      await yam.contracts.yam.methods.approve(yam.contracts.yamV2migration.options.address, "10000000000000000000000000000000000").send({from: user, gas: 1000000});
      await yam.contracts.yamV2migration.methods.migrate().send({from: user, gas: 1000000});
      let yamV2_ts = yam.toBigN(await yam.contracts.yamV2.methods.totalSupply().call());
      expect(yamV2_ts.toString()).toBe(yam_underlying_bal.toString());
    });
  });
});
