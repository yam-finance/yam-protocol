"use strict";

require("core-js/modules/web.dom.iterable");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.yam = void 0;

require("core-js/modules/es6.regexp.to-string");

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
  beforeAll(async () => {
    const accounts = await yam.web3.eth.getAccounts();
    yam.addAccount(accounts[0]);
    user = accounts[0];
    new_user = accounts[1];
    snapshotId = await yam.testing.snapshot();
  });
  beforeEach(async () => {
    await yam.testing.resetEVM("0x2");
  });
  describe("expected fail transfers", () => {
    test("cant transfer from a 0 balance", async () => {
      await yam.testing.expectThrow(yam.contracts.yam.methods.transfer(user, "100").send({
        from: new_user
      }), "SafeMath: subtraction overflow");
    });
    test("cant transferFrom without allowance", async () => {
      await yam.testing.expectThrow(yam.contracts.yam.methods.transferFrom(user, new_user, "100").send({
        from: new_user
      }), "SafeMath: subtraction overflow");
    });
  });
  describe("non-failing transfers", () => {
    test("transfer to self doesnt inflate", async () => {
      let bal0 = await yam.contracts.yam.methods.balanceOf(user).call();
      await yam.contracts.yam.methods.transfer(user, "100").send({
        from: user
      });
      let bal1 = await yam.contracts.yam.methods.balanceOf(user).call();
      expect(bal0).toBe(bal1);
    });
    test("transferFrom works", async () => {
      let bal00 = await yam.contracts.yam.methods.balanceOf(user).call();
      let bal01 = await yam.contracts.yam.methods.balanceOf(new_user).call();
      await yam.contracts.yam.methods.approve(new_user, "100").send({
        from: user
      });
      await yam.contracts.yam.methods.transferFrom(user, new_user, "100").send({
        from: new_user
      });
      let bal10 = await yam.contracts.yam.methods.balanceOf(user).call();
      let bal11 = await yam.contracts.yam.methods.balanceOf(new_user).call();
      expect(yam.toBigN(bal01).plus(yam.toBigN(100)).toString()).toBe(bal11);
      expect(yam.toBigN(bal00).minus(yam.toBigN(100)).toString()).toBe(bal10);
    });
    test("approve", async () => {
      await yam.contracts.yam.methods.approve(new_user, "100").send({
        from: user
      });
      let allowance = await yam.contracts.yam.methods.allowance(user, new_user).call();
      expect(allowance).toBe("100");
    });
    test("increaseAllowance", async () => {
      await yam.contracts.yam.methods.increaseAllowance(new_user, "100").send({
        from: user
      });
      let allowance = await yam.contracts.yam.methods.allowance(user, new_user).call();
      expect(allowance).toBe("100");
    });
    test("decreaseAllowance", async () => {
      await yam.contracts.yam.methods.increaseAllowance(new_user, "100").send({
        from: user
      });
      let allowance = await yam.contracts.yam.methods.allowance(user, new_user).call();
      expect(allowance).toBe("100");
      await yam.contracts.yam.methods.decreaseAllowance(new_user, "100").send({
        from: user
      });
      allowance = await yam.contracts.yam.methods.allowance(user, new_user).call();
      expect(allowance).toBe("0");
    });
    test("decreaseAllowance from 0", async () => {
      await yam.contracts.yam.methods.decreaseAllowance(new_user, "100").send({
        from: user
      });
      let allowance = await yam.contracts.yam.methods.allowance(user, new_user).call();
      expect(allowance).toBe("0");
    });
  });
});