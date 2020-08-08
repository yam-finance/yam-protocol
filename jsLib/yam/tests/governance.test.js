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

// describe("token_tests", () => {
//   let snapshotId;
//   let user;
//   let a1;
//   beforeAll(async () => {
//     const accounts = await yam.web3.eth.getAccounts();
//     yam.addAccount(accounts[0]);
//     user = accounts[0];
//     a1 = accounts[1];
//     snapshotId = await yam.testing.snapshot();
//   });
//
//   beforeEach(async () => {
//     await yam.testing.resetEVM("0x2");
//   });
//
//   describe("expected fail transfers", () => {
//     test("cant transfer from a 0 balance", async () => {
//       await yam.testing.expectThrow(yam.contracts.yam.methods.transfer(user, "100").send({from: a1}), "SafeMath: subtraction overflow");
//     });
//     test("cant transferFrom without allowance", async () => {
//       await yam.testing.expectThrow(yam.contracts.yam.methods.transferFrom(user, a1, "100").send({from: a1}), "SafeMath: subtraction overflow");
//     });
//
//   });
//
// })


const EIP712 = require('./EIP712.js');

describe('YAM governance', () => {
  let name = "YAM"
  let chainId = 1001
  let snapshotId;
  let user;
  let a1;
  beforeAll(async () => {
    const accounts = await yam.web3.eth.getAccounts();
    yam.addAccount(accounts[0]);
    user = accounts[0];
    a1 = accounts[1];
    snapshotId = await yam.testing.snapshot();
  });

  beforeEach(async () => {
    await yam.testing.resetEVM("0x2");
  });

  describe('delegateBySig', () => {
    const Domain = () => ({ name, chainId, verifyingContract: yam.contracts.yam.options.address });
    const Types = {
      Delegation: [
        { name: 'delegatee', type: 'address' },
        { name: 'nonce', type: 'uint256' },
        { name: 'expiry', type: 'uint256' }
      ]
    };

    const pvk = "0xf2f48ee19680706196e2e339e5da3491186e0c4c5030670656b0e0164837257d";
    const pvk_a1 = "0x5d862464fe9303452126c8bc94274b8c5f9874cbd219789b3eb2128075a76f72";
    test('reverts if the signatory is invalid', async () => {
      const delegatee = user, nonce = 0, expiry = 0;
      await yam.testing.expectThrow(yam.contracts.yam.methods.delegateBySig(delegatee, nonce, expiry, 0, '0xbad', '0xbad').send({from: a1}), "YAM::delegateBySig: invalid signature");
    });

    test('reverts if the nonce is bad ', async () => {
      const delegatee = user, nonce = 1, expiry = 0;
      const { v, r, s } = EIP712.sign(Domain(), 'Delegation', { delegatee, nonce, expiry }, Types, pvk_a1);
      await yam.testing.expectThrow(yam.contracts.yam.methods.delegateBySig(delegatee, nonce, expiry, v, r, s).send({from: a1}), "YAM::delegateBySig: invalid nonce");
    });

    test('reverts if the signature has expired', async () => {
      const delegatee = user, nonce = 0, expiry = 0;
      const { v, r, s } = EIP712.sign(Domain(), 'Delegation', { delegatee, nonce, expiry }, Types, pvk_a1);
      await yam.testing.expectThrow(yam.contracts.yam.methods.delegateBySig(delegatee, nonce, expiry, v, r, s).send({from: a1}), "YAM::delegateBySig: signature expired");
    });

    test('delegates on behalf of the signatory', async () => {
      const delegatee = user, nonce = 0, expiry = 10e9;
      const { v, r, s } = EIP712.sign(Domain(), 'Delegation', { delegatee, nonce, expiry }, Types, pvk_a1);
      let d = await yam.contracts.yam.methods.delegates(a1).call();
      expect(d).toBe("0x0000000000000000000000000000000000000000");
      let tx = await yam.contracts.yam.methods.delegateBySig(delegatee, nonce, expiry, v, r, s).send({from: a1, gas: 500000});
      expect(tx.gasUsed < 80000);
      console.log(tx.events);
      let k = await yam.contracts.yam.methods.delegates(a1).call();
      console.log(k);
      let j = await yam.contracts.yam.methods.delegates(user).call();
      console.log(j)
      expect(k).toBe(user);
    });

    test('delegate', async () => {
      let d = await yam.contracts.yam.methods.delegates(a1).call()
      expect(d).toBe("0x0000000000000000000000000000000000000000");
      let tx = await yam.contracts.yam.methods.delegate(user).send({from: a1});;
      expect(tx.gasUsed < 80000);
      console.log(tx.events);
      let k = await yam.contracts.yam.methods.delegates(a1).call();
      expect(k).toBe(user);
    });
  });

  // describe('numCheckpoints', () => {
  //   it('returns the number of checkpoints for a delegate', async () => {
  //     let guy = accounts[0];
  //     await send(comp, 'transfer', [guy, '100']); //give an account a few tokens for readability
  //     await expect(call(comp, 'numCheckpoints', [a1])).resolves.toEqual('0');
  //
  //     const t1 = await send(comp, 'delegate', [a1], { from: guy });
  //     await expect(call(comp, 'numCheckpoints', [a1])).resolves.toEqual('1');
  //
  //     const t2 = await send(comp, 'transfer', [a2, 10], { from: guy });
  //     await expect(call(comp, 'numCheckpoints', [a1])).resolves.toEqual('2');
  //
  //     const t3 = await send(comp, 'transfer', [a2, 10], { from: guy });
  //     await expect(call(comp, 'numCheckpoints', [a1])).resolves.toEqual('3');
  //
  //     const t4 = await send(comp, 'transfer', [guy, 20], { from: root });
  //     await expect(call(comp, 'numCheckpoints', [a1])).resolves.toEqual('4');
  //
  //     await expect(call(comp, 'checkpoints', [a1, 0])).resolves.toEqual(expect.objectContaining({ fromBlock: t1.blockNumber.toString(), votes: '100' }));
  //     await expect(call(comp, 'checkpoints', [a1, 1])).resolves.toEqual(expect.objectContaining({ fromBlock: t2.blockNumber.toString(), votes: '90' }));
  //     await expect(call(comp, 'checkpoints', [a1, 2])).resolves.toEqual(expect.objectContaining({ fromBlock: t3.blockNumber.toString(), votes: '80' }));
  //     await expect(call(comp, 'checkpoints', [a1, 3])).resolves.toEqual(expect.objectContaining({ fromBlock: t4.blockNumber.toString(), votes: '100' }));
  //   });
  //
  //   it('does not add more than one checkpoint in a block', async () => {
  //     let guy = accounts[0];
  //
  //     await send(comp, 'transfer', [guy, '100']); //give an account a few tokens for readability
  //     await expect(call(comp, 'numCheckpoints', [a1])).resolves.toEqual('0');
  //     await minerStop();
  //
  //     let t1 = send(comp, 'delegate', [a1], { from: guy });
  //     let t2 = send(comp, 'transfer', [a2, 10], { from: guy });
  //     let t3 = send(comp, 'transfer', [a2, 10], { from: guy });
  //
  //     await minerStart();
  //     t1 = await t1;
  //     t2 = await t2;
  //     t3 = await t3;
  //
  //     await expect(call(comp, 'numCheckpoints', [a1])).resolves.toEqual('1');
  //
  //     await expect(call(comp, 'checkpoints', [a1, 0])).resolves.toEqual(expect.objectContaining({ fromBlock: t1.blockNumber.toString(), votes: '80' }));
  //     await expect(call(comp, 'checkpoints', [a1, 1])).resolves.toEqual(expect.objectContaining({ fromBlock: '0', votes: '0' }));
  //     await expect(call(comp, 'checkpoints', [a1, 2])).resolves.toEqual(expect.objectContaining({ fromBlock: '0', votes: '0' }));
  //
  //     const t4 = await send(comp, 'transfer', [guy, 20], { from: root });
  //     await expect(call(comp, 'numCheckpoints', [a1])).resolves.toEqual('2');
  //     await expect(call(comp, 'checkpoints', [a1, 1])).resolves.toEqual(expect.objectContaining({ fromBlock: t4.blockNumber.toString(), votes: '100' }));
  //   });
  // });
  //
  // describe('getPriorVotes', () => {
  //   it('reverts if block number >= current block', async () => {
  //     await expect(call(comp, 'getPriorVotes', [a1, 5e10])).rejects.toRevert("revert Comp::getPriorVotes: not yet determined");
  //   });
  //
  //   it('returns 0 if there are no checkpoints', async () => {
  //     expect(await call(comp, 'getPriorVotes', [a1, 0])).toEqual('0');
  //   });
  //
  //   it('returns the latest block if >= last checkpoint block', async () => {
  //     const t1 = await send(comp, 'delegate', [a1], { from: root });
  //     await mineBlock();
  //     await mineBlock();
  //
  //     expect(await call(comp, 'getPriorVotes', [a1, t1.blockNumber])).toEqual('10000000000000000000000000');
  //     expect(await call(comp, 'getPriorVotes', [a1, t1.blockNumber + 1])).toEqual('10000000000000000000000000');
  //   });
  //
  //   it('returns zero if < first checkpoint block', async () => {
  //     await mineBlock();
  //     const t1 = await send(comp, 'delegate', [a1], { from: root });
  //     await mineBlock();
  //     await mineBlock();
  //
  //     expect(await call(comp, 'getPriorVotes', [a1, t1.blockNumber - 1])).toEqual('0');
  //     expect(await call(comp, 'getPriorVotes', [a1, t1.blockNumber + 1])).toEqual('10000000000000000000000000');
  //   });
  //
  //   it('generally returns the voting balance at the appropriate checkpoint', async () => {
  //     const t1 = await send(comp, 'delegate', [a1], { from: root });
  //     await mineBlock();
  //     await mineBlock();
  //     const t2 = await send(comp, 'transfer', [a2, 10], { from: root });
  //     await mineBlock();
  //     await mineBlock();
  //     const t3 = await send(comp, 'transfer', [a2, 10], { from: root });
  //     await mineBlock();
  //     await mineBlock();
  //     const t4 = await send(comp, 'transfer', [root, 20], { from: a2 });
  //     await mineBlock();
  //     await mineBlock();
  //
  //     expect(await call(comp, 'getPriorVotes', [a1, t1.blockNumber - 1])).toEqual('0');
  //     expect(await call(comp, 'getPriorVotes', [a1, t1.blockNumber])).toEqual('10000000000000000000000000');
  //     expect(await call(comp, 'getPriorVotes', [a1, t1.blockNumber + 1])).toEqual('10000000000000000000000000');
  //     expect(await call(comp, 'getPriorVotes', [a1, t2.blockNumber])).toEqual('9999999999999999999999990');
  //     expect(await call(comp, 'getPriorVotes', [a1, t2.blockNumber + 1])).toEqual('9999999999999999999999990');
  //     expect(await call(comp, 'getPriorVotes', [a1, t3.blockNumber])).toEqual('9999999999999999999999980');
  //     expect(await call(comp, 'getPriorVotes', [a1, t3.blockNumber + 1])).toEqual('9999999999999999999999980');
  //     expect(await call(comp, 'getPriorVotes', [a1, t4.blockNumber])).toEqual('10000000000000000000000000');
  //     expect(await call(comp, 'getPriorVotes', [a1, t4.blockNumber + 1])).toEqual('10000000000000000000000000');
  //   });
  // });
});
