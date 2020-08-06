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
    let a = await yam.contracts.ycrv.methods.transfer(user, "10000000").send({
      from: unlocked_account
    });
  });
  describe("rebase", () => {
    test("user has ycrv", async () => {
      let bal0 = await yam.contracts.ycrv.methods.balanceOf(user).call();
      expect(bal0).toBe("10000000");
    });
    test("create pair", async () => {
      await yam.contracts.uni_fact.methods.createPair(yam.contracts.ycrv.options.address, yam.contracts.yam.options.address).send({
        from: user,
        gas: 8000000
      });
    });
  });
});