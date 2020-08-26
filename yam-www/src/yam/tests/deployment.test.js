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

describe("post-deployment", () => {
  let snapshotId;
  let user;

  beforeAll(async () => {
    const accounts = await yam.web3.eth.getAccounts();
    user = accounts[0];
    yam.addAccount(user);
    snapshotId = await yam.testing.snapshot();
  });

  beforeEach(async () => {
    await yam.testing.resetEVM("0x2");
  });

  describe("supply ownership", () => {

    test("owner balance", async () => {
      const balance = await yam.contracts.yam.methods.balanceOf(user).call();
      expect(balance).toBe(yam.toBigN(7000000).times(yam.toBigN(10**18)).toString())
    });

    test("pool balances", async () => {
      const ycrv_balance = await yam.contracts.yam.methods.balanceOf(yam.contracts.ycrv_pool.options.address).call();

      expect(ycrv_balance).toBe(yam.toBigN(1500000).times(yam.toBigN(10**18)).times(yam.toBigN(1)).toString())

      const yfi_balance = await yam.contracts.yam.methods.balanceOf(yam.contracts.yfi_pool.options.address).call();

      expect(yfi_balance).toBe(yam.toBigN(250000).times(yam.toBigN(10**18)).times(yam.toBigN(1)).toString())

      const ampl_balance = await yam.contracts.yam.methods.balanceOf(yam.contracts.ampl_pool.options.address).call();

      expect(ampl_balance).toBe(yam.toBigN(250000).times(yam.toBigN(10**18)).times(yam.toBigN(1)).toString())

      const eth_balance = await yam.contracts.yam.methods.balanceOf(yam.contracts.eth_pool.options.address).call();

      expect(eth_balance).toBe(yam.toBigN(250000).times(yam.toBigN(10**18)).times(yam.toBigN(1)).toString())

      const snx_balance = await yam.contracts.yam.methods.balanceOf(yam.contracts.snx_pool.options.address).call();

      expect(snx_balance).toBe(yam.toBigN(250000).times(yam.toBigN(10**18)).times(yam.toBigN(1)).toString())

      const comp_balance = await yam.contracts.yam.methods.balanceOf(yam.contracts.comp_pool.options.address).call();

      expect(comp_balance).toBe(yam.toBigN(250000).times(yam.toBigN(10**18)).times(yam.toBigN(1)).toString())

      const lend_balance = await yam.contracts.yam.methods.balanceOf(yam.contracts.lend_pool.options.address).call();

      expect(lend_balance).toBe(yam.toBigN(250000).times(yam.toBigN(10**18)).times(yam.toBigN(1)).toString())

      const link_balance = await yam.contracts.yam.methods.balanceOf(yam.contracts.link_pool.options.address).call();

      expect(link_balance).toBe(yam.toBigN(250000).times(yam.toBigN(10**18)).times(yam.toBigN(1)).toString())

      const mkr_balance = await yam.contracts.yam.methods.balanceOf(yam.contracts.mkr_pool.options.address).call();

      expect(mkr_balance).toBe(yam.toBigN(250000).times(yam.toBigN(10**18)).times(yam.toBigN(1)).toString())

    });

    test("total supply", async () => {
      const ts = await yam.contracts.yam.methods.totalSupply().call();
      expect(ts).toBe("10500000000000000000000000")
    });

    test("init supply", async () => {
      const init_s = await yam.contracts.yam.methods.initSupply().call();
      expect(init_s).toBe("10500000000000000000000000000000")
    });
  });

  describe("contract ownership", () => {

    test("yam gov", async () => {
      const gov = await yam.contracts.yam.methods.gov().call();
      expect(gov).toBe(yam.contracts.timelock.options.address)
    });

    test("rebaser gov", async () => {
      const gov = await yam.contracts.rebaser.methods.gov().call();
      expect(gov).toBe(yam.contracts.timelock.options.address)
    });

    test("reserves gov", async () => {
      const gov = await yam.contracts.reserves.methods.gov().call();
      expect(gov).toBe(yam.contracts.timelock.options.address)
    });

    test("timelock admin", async () => {
      const gov = await yam.contracts.timelock.methods.admin().call();
      expect(gov).toBe(yam.contracts.gov.options.address)
    });

    test("gov timelock", async () => {
      const tl = await yam.contracts.gov.methods.timelock().call();
      expect(tl).toBe(yam.contracts.timelock.options.address)
    });

    test("gov guardian", async () => {
      const grd = await yam.contracts.gov.methods.guardian().call();
      expect(grd).toBe("0x0000000000000000000000000000000000000000")
    });

    test("pool owner", async () => {
      const owner = await yam.contracts.eth_pool.methods.owner().call();
      expect(owner).toBe(yam.contracts.timelock.options.address)
    });

    test("incentives owner", async () => {
      const owner = await yam.contracts.ycrv_pool.methods.owner().call();
      expect(owner).toBe(yam.contracts.timelock.options.address)
    });

    test("pool rewarder", async () => {
      const rewarder = await yam.contracts.eth_pool.methods.rewardDistribution().call();
      expect(rewarder).toBe(yam.contracts.timelock.options.address)
    });
  });

  describe("timelock delay initiated", () => {
    test("timelock delay initiated", async () => {
      const inited = await yam.contracts.timelock.methods.admin_initialized().call();
      expect(inited).toBe(true);
    })
  })
})
