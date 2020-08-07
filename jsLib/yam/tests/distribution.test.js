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

describe("Distribution", () => {
  let snapshotId;
  let user;
  let ycrv_account = "0x0eb4add4ba497357546da7f5d12d39587ca24606";
  let weth_account = "0xf9e11762d522ea29dd78178c9baf83b7b093aacc";
  let uni_ampl_account = "0x8c545be506a335e24145edd6e01d2754296ff018";

  beforeAll(async () => {
    const accounts = await yam.web3.eth.getAccounts();
    yam.addAccount(accounts[0]);
    user = accounts[0];
    snapshotId = await yam.testing.snapshot();
    await yam.contracts.ycrv.methods.transfer(user, "12000000000000000000000000").send({
      from: ycrv_account
    });
    await yam.contracts.weth.methods.transfer(user, yam.toBigN(2000).times(yam.toBigN(10**18)).toString()).send({
      from: weth_account
    });
    await yam.contracts.UNIAmpl.methods.transfer(user, "8016536322915819").send({
      from: uni_ampl_account
    });
  });

  beforeEach(async () => {
    await yam.testing.resetEVM("0x2");
  });

  describe("distribution", () => {

    test("joining pool 1s", async () => {

    });

    test("leaving pool 1s", async () => {

    });

    test("rewards from pool 1s", async () => {

    });

    test("rewards from pool 1s with rebase", async () => {

    });

    test("joining pool 2", async () => {

    });

    test("rewards from pool 2", async () => {

    });

    test("rewards from pool 2 with rebase", async () => {

    });

    test("leaving pool 2", async () => {

    });
  });

  describe("pool 2 failure", () => {
    test("cant leave pool 2 early", async () => {

    });

    test("cant withdraw more than deposited", async () => {

    });
  })
})
