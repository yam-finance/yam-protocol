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

describe("post-deployment", () => {
  let snapshotId;
  let user;

  beforeAll(async () => {
    const accounts = await ham.web3.eth.getAccounts();
    ham.addAccount(accounts[0]);
    user = accounts[0];
    snapshotId = await ham.testing.snapshot();
  });

  beforeEach(async () => {
    await ham.testing.resetEVM("0x2");
  });

  describe("supply ownership", () => {

    test("owner balance", async () => {
      let balance = await ham.contracts.ham.methods.balanceOf(user).call();
      expect(balance).toBe(ham.toBigN(7000000).times(ham.toBigN(10**18)).toString())
    });

    test("pool balances", async () => {
      let ycrv_balance = await ham.contracts.ham.methods.balanceOf(ham.contracts.ycrv_pool.options.address).call();

      expect(ycrv_balance).toBe(ham.toBigN(1500000).times(ham.toBigN(10**18)).times(ham.toBigN(1)).toString())

      let yfi_balance = await ham.contracts.ham.methods.balanceOf(ham.contracts.yfi_pool.options.address).call();

      expect(yfi_balance).toBe(ham.toBigN(250000).times(ham.toBigN(10**18)).times(ham.toBigN(1)).toString())

      let ampl_balance = await ham.contracts.ham.methods.balanceOf(ham.contracts.ampl_pool.options.address).call();

      expect(ampl_balance).toBe(ham.toBigN(250000).times(ham.toBigN(10**18)).times(ham.toBigN(1)).toString())

      let eth_balance = await ham.contracts.ham.methods.balanceOf(ham.contracts.eth_pool.options.address).call();

      expect(eth_balance).toBe(ham.toBigN(250000).times(ham.toBigN(10**18)).times(ham.toBigN(1)).toString())

      let snx_balance = await ham.contracts.ham.methods.balanceOf(ham.contracts.snx_pool.options.address).call();

      expect(snx_balance).toBe(ham.toBigN(250000).times(ham.toBigN(10**18)).times(ham.toBigN(1)).toString())

      let comp_balance = await ham.contracts.ham.methods.balanceOf(ham.contracts.comp_pool.options.address).call();

      expect(comp_balance).toBe(ham.toBigN(250000).times(ham.toBigN(10**18)).times(ham.toBigN(1)).toString())

      let lend_balance = await ham.contracts.ham.methods.balanceOf(ham.contracts.lend_pool.options.address).call();

      expect(lend_balance).toBe(ham.toBigN(250000).times(ham.toBigN(10**18)).times(ham.toBigN(1)).toString())

      let link_balance = await ham.contracts.ham.methods.balanceOf(ham.contracts.link_pool.options.address).call();

      expect(link_balance).toBe(ham.toBigN(250000).times(ham.toBigN(10**18)).times(ham.toBigN(1)).toString())

      let mkr_balance = await ham.contracts.ham.methods.balanceOf(ham.contracts.mkr_pool.options.address).call();

      expect(mkr_balance).toBe(ham.toBigN(250000).times(ham.toBigN(10**18)).times(ham.toBigN(1)).toString())

    });

    test("total supply", async () => {
      let ts = await ham.contracts.ham.methods.totalSupply().call();
      expect(ts).toBe("10500000000000000000000000")
    });

    test("init supply", async () => {
      let init_s = await ham.contracts.ham.methods.initSupply().call();
      expect(init_s).toBe("10500000000000000000000000000000")
    });
  });

  describe("contract ownership", () => {

    test("ham gov", async () => {
      let gov = await ham.contracts.ham.methods.gov().call();
      expect(gov).toBe(ham.contracts.timelock.options.address)
    });

    test("rebaser gov", async () => {
      let gov = await ham.contracts.rebaser.methods.gov().call();
      expect(gov).toBe(ham.contracts.timelock.options.address)
    });

    test("reserves gov", async () => {
      let gov = await ham.contracts.reserves.methods.gov().call();
      expect(gov).toBe(ham.contracts.timelock.options.address)
    });

    test("timelock admin", async () => {
      let gov = await ham.contracts.timelock.methods.admin().call();
      expect(gov).toBe(ham.contracts.gov.options.address)
    });

    test("gov timelock", async () => {
      let tl = await ham.contracts.gov.methods.timelock().call();
      expect(tl).toBe(ham.contracts.timelock.options.address)
    });

    test("gov guardian", async () => {
      let grd = await ham.contracts.gov.methods.guardian().call();
      expect(grd).toBe("0x0000000000000000000000000000000000000000")
    });

    test("pool owner", async () => {
      let owner = await ham.contracts.eth_pool.methods.owner().call();
      expect(owner).toBe(ham.contracts.timelock.options.address)
    });

    test("incentives owner", async () => {
      let owner = await ham.contracts.ycrv_pool.methods.owner().call();
      expect(owner).toBe(ham.contracts.timelock.options.address)
    });

    test("pool rewarder", async () => {
      let rewarder = await ham.contracts.eth_pool.methods.rewardDistribution().call();
      expect(rewarder).toBe(ham.contracts.timelock.options.address)
    });
  });

  describe("timelock delay initiated", () => {
    test("timelock delay initiated", async () => {
      let inited = await ham.contracts.timelock.methods.admin_initialized().call();
      expect(inited).toBe(true);
    })
  })
})
