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
    let a = await yam.contracts.ycrv.methods.transfer(user, "10000000").send({from: unlocked_account});
  });

  describe("rebase", () => {
    test("user has ycrv", async() => {
      let bal0 = await yam.contracts.ycrv.methods.balanceOf(user).call();
      expect(bal0).toBe("10000000");
    });
    test("create pair", async () => {
        await yam.contracts.uni_fact.methods.createPair(
            yam.contracts.ycrv.options.address,
            yam.contracts.yam.options.address
        ).send({from: user, gas: 8000000})
    });
  });

})
