const Web3 = require("web3");
const YAMDelegate = require("./YAMDelegate");
const YAMProxy = require("YAMProxy");

const provider = new Web3("http://localhost:8454");

describe('YAMToken', async accounts => {
  let impl;
  let yam;
  beforeEach(async () => {
    [root, ...accounts] = saddle.accounts;
    impl = await deployer.deploy(YAMDelegate);
    yam = await deployer.deploy(YAMProxy,
    
    );
  });

  describe('transfer', () => {
    it("cannot transfer from a zero balance", async () => {
      const cToken = await makeCToken({supportMarket: true});
      expect(await call(cToken, 'balanceOf', [root])).toEqualNumber(0);
      expect(await send(cToken, 'transfer', [accounts[0], 100])).toHaveTokenFailure('MATH_ERROR', 'TRANSFER_NOT_ENOUGH');
    });

    it("transfers 50 tokens", async () => {
      const cToken = await makeCToken({supportMarket: true});
      await send(cToken, 'harnessSetBalance', [root, 100]);
      expect(await call(cToken, 'balanceOf', [root])).toEqualNumber(100);
      await send(cToken, 'transfer', [accounts[0], 50]);
      expect(await call(cToken, 'balanceOf', [root])).toEqualNumber(50);
      expect(await call(cToken, 'balanceOf', [accounts[0]])).toEqualNumber(50);
    });

    it("doesn't transfer when src == dst", async () => {
      const cToken = await makeCToken({supportMarket: true});
      await send(cToken, 'harnessSetBalance', [root, 100]);
      expect(await call(cToken, 'balanceOf', [root])).toEqualNumber(100);
      expect(await send(cToken, 'transfer', [root, 50])).toHaveTokenFailure('BAD_INPUT', 'TRANSFER_NOT_ALLOWED');
    });

    it("rejects transfer when not allowed and reverts if not verified", async () => {
      const cToken = await makeCToken({comptrollerOpts: {kind: 'bool'}});
      await send(cToken, 'harnessSetBalance', [root, 100]);
      expect(await call(cToken, 'balanceOf', [root])).toEqualNumber(100);

      await send(cToken.comptroller, 'setTransferAllowed', [false])
      expect(await send(cToken, 'transfer', [root, 50])).toHaveTrollReject('TRANSFER_COMPTROLLER_REJECTION');

      await send(cToken.comptroller, 'setTransferAllowed', [true])
      await send(cToken.comptroller, 'setTransferVerify', [false])
      await expect(send(cToken, 'transfer', [accounts[0], 50])).rejects.toRevert("revert transferVerify rejected transfer");
    });
  });
});
