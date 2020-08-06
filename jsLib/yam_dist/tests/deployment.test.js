"use strict";

require("core-js/modules/web.dom.iterable");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.yam = void 0;

var _index = require("../index.js");

var Types = _interopRequireWildcard(require("../lib/types.js"));

var _constants = require("../lib/constants.js");

var _Helpers = require("../lib/Helpers.js");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const yam = new _index.Yam("http://localhost:8545/", // "http://127.0.0.1:9545/",
"1001", true, {
  defaultAccount: "",
  defaultConfirmations: 1,
  autoGasMultiplier: 1.5,
  testing: false,
  defaultGas: "6000000",
  defaultGasPrice: "1000000000000",
  accounts: [],
  ethereumNodeTimeout: 10000
});
exports.yam = yam;
const oneEther = 10 ** 18;
describe("post-deployment", () => {
  let snapshotId;
  let user;
  beforeAll(async () => {
    const accounts = await yam.web3.eth.getAccounts();
    yam.addAccount(accounts[0]);
    user = accounts[0];
    snapshotId = await yam.testing.snapshot();
  });
  beforeEach(async () => {
    await yam.testing.resetEVM("0x2");
  });
  describe("supply ownership", () => {
    test("owner balance", async () => {
      let balance = await yam.contracts.yam.methods.balanceOf(user).call();
      expect(balance).toBe("6000000000000000000000000");
    });
    test("total supply", async () => {
      let ts = await yam.contracts.yam.methods.totalSupply().call();
      expect(ts).toBe("6000000000000000000000000");
    });
    test("init supply", async () => {
      let init_s = await yam.contracts.yam.methods.initSupply().call();
      expect(init_s).toBe("6000000000000000000000000000000");
    });
  });
  describe("contract ownership", () => {
    test("yam gov", async () => {
      let gov = await yam.contracts.yam.methods.gov().call();
      expect(gov).toBe(yam.contracts.gov.options.address);
    });
    test("rebaser gov", async () => {
      let gov = await yam.contracts.rebaser.methods.gov().call();
      expect(gov).toBe(yam.contracts.gov.options.address);
    });
    test("reserves gov", async () => {
      let gov = await yam.contracts.reserves.methods.gov().call();
      expect(gov).toBe(yam.contracts.gov.options.address);
    });
    test("timelock admin", async () => {
      let gov = await yam.contracts.timelock.methods.admin().call();
      expect(gov).toBe(yam.contracts.gov.options.address);
    });
    test("gov timelock", async () => {
      let tl = await yam.contracts.gov.methods.timelock().call();
      expect(tl).toBe(yam.contracts.timelock.options.address);
    });
    test("gov guardian", async () => {
      let grd = await yam.contracts.gov.methods.guardian().call();
      expect(grd).toBe("0x0000000000000000000000000000000000000000");
    });
  });
});