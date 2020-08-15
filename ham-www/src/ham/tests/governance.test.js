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

const ethUtil = require('ethereumjs-util');

// import { EIP712Domain } from 'eth-typed-data'

// const ethUtil = require('ethereumjs-util');

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


const EIP712 = require('./EIP712.js');

describe('HAM governance', () => {
  let name = "HAM";
  let chainId = 1001;
  let snapshotId;
  let user;
  let a1;
  let a2;
  let guy;
  let address = "0x4BC6657283f8f24e27EAc1D21D1deE566C534A9A";


  beforeAll(async () => {
    const accounts = await ham.web3.eth.getAccounts();
    ham.addAccount(accounts[0]);
    user = accounts[0];
    a1 = accounts[1];
    a2 = accounts[2];
    guy = accounts[3];
    snapshotId = await ham.testing.snapshot();
  });

  beforeEach(async () => {
    await ham.testing.resetEVM("0x2");
  });

  describe('delegateBySig', () => {

    // we publish the mnemonic. its is a well known test mnemonic so these pvks
    // arent a security issue.
    const pvk = "0xf2f48ee19680706196e2e339e5da3491186e0c4c5030670656b0e0164837257d";
    const pvk_a1 = "0x5d862464fe9303452126c8bc94274b8c5f9874cbd219789b3eb2128075a76f72";
    test('reverts if the signatory is invalid', async () => {
      const delegatee = user, nonce = 0, expiry = 0;
      await ham.testing.expectThrow(ham.contracts.ham.methods.delegateBySig(delegatee, nonce, expiry, 0, '0xbad', '0xbad').send({from: a1}), "HAM::delegateBySig: invalid signature");
    });

    test('reverts if the nonce is bad ', async () => {
      // const delegatee = user, nonce = 1, expiry = 0;
      // const { v, r, s } = EIP712.sign(Domain(), 'Delegation', { delegatee, nonce, expiry }, Types, pvk_a1);

      const typedData = {
           types: {
               EIP712Domain: [
                   { name: 'name', type: 'string' },
                   { name: 'chainId', type: 'uint256' },
                   { name: 'verifyingContract', type: 'address' },
               ],
               Delegation: [
                 { name: 'delegatee', type: 'address' },
                 { name: 'nonce', type: 'uint256' },
                 { name: 'expiry', type: 'uint256' }
               ]
           },
           primaryType: 'Delegation',
           domain: {
               name: 'HAM',
               chainId: 1, // since we are using --fork, it respects that chainID
               verifyingContract: '0x4BC6657283f8f24e27EAc1D21D1deE566C534A9A',
           },
           message: {
               delegatee: user,
               nonce: 1, // bad
               expiry: 0,
           },
       };

      let sigHash = EIP712.encodeTypedData(typedData)
     const sig = ethUtil.ecsign(ethUtil.toBuffer(sigHash, 'hex'), ethUtil.toBuffer(pvk_a1, 'hex'));


      // const encoded = EIP712.signer.encodeMessageData(delegation.types, delegation.primaryType, delegation.message);

      await ham.testing.expectThrow(ham.contracts.ham.methods.delegateBySig(user, 1, 0, sig.v, sig.r, sig.s).send({from: a1}), "HAM::delegateBySig: invalid nonce");
    });

    test('reverts if the signature has expired', async () => {
      // const delegatee = user, nonce = 0, expiry = 0;
      // const { v, r, s } = EIP712.sign(Domain(), 'Delegation', { delegatee, nonce, expiry }, Types, pvk_a1);

      const typedData = {
           types: {
               EIP712Domain: [
                   { name: 'name', type: 'string' },
                   { name: 'chainId', type: 'uint256' },
                   { name: 'verifyingContract', type: 'address' },
               ],
               Delegation: [
                 { name: 'delegatee', type: 'address' },
                 { name: 'nonce', type: 'uint256' },
                 { name: 'expiry', type: 'uint256' }
               ]
           },
           primaryType: 'Delegation',
           domain: {
               name: 'HAM',
               chainId: 1,
               verifyingContract: '0x4BC6657283f8f24e27EAc1D21D1deE566C534A9A',
           },
           message: {
               delegatee: user,
               nonce: 0,
               expiry: 0, //bad
           },
       };

      let sigHash = EIP712.encodeTypedData(typedData)
      const sig = ethUtil.ecsign(ethUtil.toBuffer(sigHash, 'hex'), ethUtil.toBuffer(pvk_a1, 'hex'));


      await ham.testing.expectThrow(ham.contracts.ham.methods.delegateBySig(user, 0, 0, sig.v, sig.r, sig.s).send({from: a1}), "HAM::delegateBySig: signature expired");
    });

    test('delegates on behalf of the signatory', async () => {

      const typedData = {
           types: {
               EIP712Domain: [
                   { name: 'name', type: 'string' },
                   { name: 'chainId', type: 'uint256' },
                   { name: 'verifyingContract', type: 'address' },
               ],
               Delegation: [
                 { name: 'delegatee', type: 'address' },
                 { name: 'nonce', type: 'uint256' },
                 { name: 'expiry', type: 'uint256' }
               ]
           },
           primaryType: 'Delegation',
           domain: {
               name: 'HAM',
               chainId: 1,
               verifyingContract: '0x4BC6657283f8f24e27EAc1D21D1deE566C534A9A',
           },
           message: {
               delegatee: user,
               nonce: 0,
               expiry: 10e9,
           },
       };

      let sigHash = EIP712.encodeTypedData(typedData)
      const sig = ethUtil.ecsign(ethUtil.toBuffer(sigHash, 'hex'), ethUtil.toBuffer(pvk_a1, 'hex'));

      let tx = await ham.contracts.ham.methods.delegateBySig(user, 0, 10e9, sig.v, sig.r, sig.s).send({from: a1, gas: 500000});
      expect(tx.gasUsed < 80000);
      let k = await ham.contracts.ham.methods.delegates(a1).call();
      let j = await ham.contracts.ham.methods.delegates(user).call();
      expect(k).toBe(user);
    });

    test('delegate', async () => {
      let d = await ham.contracts.ham.methods.delegates(a1).call()
      expect(d).toBe("0x0000000000000000000000000000000000000000");
      let tx = await ham.contracts.ham.methods.delegate(user).send({from: a1});;
      expect(tx.gasUsed < 80000);
      let k = await ham.contracts.ham.methods.delegates(a1).call();
      expect(k).toBe(user);
    });
  });

  describe('numCheckpoints', () => {
    it('returns the number of checkpoints for a delegate', async () => {

      let one_hundred = ham.toBigN(100).times(ham.toBigN(10**18));
      await ham.contracts.ham.methods.transfer(guy, one_hundred.toString()).send({from: user});
      let nc = await ham.contracts.ham.methods.numCheckpoints(a1).call();
      expect(nc).toBe('0');

      await ham.contracts.ham.methods.delegate(a1).send({from: guy});
      nc = await ham.contracts.ham.methods.numCheckpoints(a1).call();
      expect(nc).toBe('1');


      await ham.contracts.ham.methods.transfer(a2, one_hundred.minus(one_hundred.times(.9)).toString()).send({from: guy});
      nc = await ham.contracts.ham.methods.numCheckpoints(a1).call();
      expect(nc).toBe('2');

      await ham.contracts.ham.methods.transfer(a2, one_hundred.minus(one_hundred.times(.9)).toString()).send({from: guy});
      nc = await ham.contracts.ham.methods.numCheckpoints(a1).call();
      expect(nc).toBe('3');


      await ham.contracts.ham.methods.transfer(guy, one_hundred.minus(one_hundred.times(.8)).toString()).send({from: user});
      nc = await ham.contracts.ham.methods.numCheckpoints(a1).call();
      expect(nc).toBe('4');

      let cs = await ham.contracts.ham.methods.checkpoints(a1, 0).call();
      expect(cs.votes).toBe("100000000000000000000000000"); // 100 * 1e24

      cs = await ham.contracts.ham.methods.checkpoints(a1, 1).call();
      expect(cs.votes).toBe("90000000000000000000000000"); // 90 * 1e24


      cs = await ham.contracts.ham.methods.checkpoints(a1, 2).call();
      expect(cs.votes).toBe("80000000000000000000000000"); // 90 * 1e24

      cs = await ham.contracts.ham.methods.checkpoints(a1, 3).call();
      expect(cs.votes).toBe("100000000000000000000000000"); // 90 * 1e24
    });

    it('does not add more than one checkpoint in a block', async () => {
      // For this test to pass, you must enable blocktimes. it will fail otherwise


      let one_hundred = ham.toBigN(100).times(ham.toBigN(10**18));
      await ham.contracts.ham.methods.transfer(guy, one_hundred.toString()).send({from: user});
      let nc = await ham.contracts.ham.methods.numCheckpoints(a1).call();
      expect(nc).toBe('0');

      await ham.testing.stopMining();

      let t1 = ham.contracts.ham.methods.delegate(a1).send({from: guy});
      let t2 = ham.contracts.ham.methods.transfer(a2, ham.toBigN(100).times(yam.toBigN(10**18)).times(.1).toString()).send({from: guy});
      let t3 = ham.contracts.ham.methods.transfer(a2, ham.toBigN(100).times(yam.toBigN(10**18)).times(.1).toString()).send({from: guy});

      await ham.testing.startMining();
      t1 = await t1;
      t2 = await t2;
      t3 = await t3;

      if (t1.blockNumber != t2.blockNumber) {
        console.log("WARNING: 'does not add more than one checkpoint in a block' REQUIRES DIFFERENT GANACHE PARAMs. RUN IN MINING MODE");
        return;
      }

      nc = await ham.contracts.ham.methods.numCheckpoints(a1).call();
      expect(nc).toBe('1');

      let cs = await ham.contracts.ham.methods.checkpoints(a1, 0).call();
      expect(cs.votes).toBe("80000000000000000000000000"); // 80 * 1e24

      cs = await ham.contracts.ham.methods.checkpoints(a1, 1).call();
      expect(cs.votes).toBe("0"); // 0

      cs = await ham.contracts.ham.methods.checkpoints(a1, 2).call();
      expect(cs.votes).toBe("0"); // 0

      let t4 = await ham.contracts.ham.methods.transfer(guy, ham.toBigN(100).times(yam.toBigN(10**18)).times(.2).toString()).send({from: user});

      nc = await ham.contracts.ham.methods.numCheckpoints(a1).call();
      expect(nc).toBe('2');


      cs = await ham.contracts.ham.methods.checkpoints(a1, 1).call();
      expect(cs.votes).toBe("100000000000000000000000000"); // 0

    });
  });

  describe('getPriorVotes', () => {
    test('reverts if block number >= current block', async () => {
      await ham.testing.expectThrow(
        ham.contracts.ham.methods.getPriorVotes(a1, 5e10).call(),
        "HAM::getPriorVotes: not yet determined"
      )
    });

    test('returns 0 if there are no checkpoints', async () => {
      let pv = await ham.contracts.ham.methods.getPriorVotes(a1, 0).call();
      expect(pv).toBe('0');
    });

    test('returns the latest block if >= last checkpoint block', async () => {
      let t1 = await ham.contracts.ham.methods.delegate(a1).send({from: user});
      await ham.testing.mineBlock();
      await ham.testing.mineBlock();

      let pv = await ham.contracts.ham.methods.getPriorVotes(a1, t1.blockNumber).call();
      expect(pv).toBe('7000000000000000000000000000000');

      pv = await ham.contracts.ham.methods.getPriorVotes(a1, t1.blockNumber + 1).call();
      expect(pv).toBe('7000000000000000000000000000000');
    });

    test('returns zero if < first checkpoint block', async () => {
      await ham.testing.mineBlock();
      let t1 = await ham.contracts.ham.methods.delegate(a1).send({from: user});
      await ham.testing.mineBlock();
      await ham.testing.mineBlock();

      let pv = await ham.contracts.ham.methods.getPriorVotes(a1, t1.blockNumber - 1).call();
      expect(pv).toBe('0');

      pv = await ham.contracts.ham.methods.getPriorVotes(a1, t1.blockNumber + 1).call();
      expect(pv).toBe('7000000000000000000000000000000');
    });

    it('generally returns the voting balance at the appropriate checkpoint', async () => {
      let one_hundred = ham.toBigN(100).times(ham.toBigN(10**18));
      await ham.contracts.ham.methods.transfer(guy, one_hundred.toString()).send({from: user});

      let t1 = await ham.contracts.ham.methods.delegate(a1).send({from: guy});
      await ham.testing.mineBlock();
      await ham.testing.mineBlock();
      let t2 = await ham.contracts.ham.methods.transfer(a2, ham.toBigN(100).times(yam.toBigN(10**18)).times(.1).toString()).send({from: guy});
      await ham.testing.mineBlock();
      await ham.testing.mineBlock();
      let t3 = await ham.contracts.ham.methods.transfer(a2, ham.toBigN(100).times(yam.toBigN(10**18)).times(.1).toString()).send({from: guy});
      await ham.testing.mineBlock();
      await ham.testing.mineBlock();
      let t4 = await ham.contracts.ham.methods.transfer(guy, ham.toBigN(100).times(yam.toBigN(10**18)).times(.2).toString()).send({from: a2});
      await ham.testing.mineBlock();
      await ham.testing.mineBlock();


      let pv = await ham.contracts.ham.methods.getPriorVotes(a1, t1.blockNumber - 1).call();
      expect(pv).toBe('0');

      pv = await ham.contracts.ham.methods.getPriorVotes(a1, t1.blockNumber).call();
      expect(pv).toBe('100000000000000000000000000');

      pv = await ham.contracts.ham.methods.getPriorVotes(a1, t1.blockNumber + 1).call();
      expect(pv).toBe('100000000000000000000000000');

      pv = await ham.contracts.ham.methods.getPriorVotes(a1, t2.blockNumber).call();
      expect(pv).toBe('90000000000000000000000000');

      pv = await ham.contracts.ham.methods.getPriorVotes(a1, t2.blockNumber + 1).call();
      expect(pv).toBe('90000000000000000000000000');

      pv = await ham.contracts.ham.methods.getPriorVotes(a1, t3.blockNumber).call();
      expect(pv).toBe('80000000000000000000000000');

      pv = await ham.contracts.ham.methods.getPriorVotes(a1, t3.blockNumber + 1).call();
      expect(pv).toBe('80000000000000000000000000');

      pv = await ham.contracts.ham.methods.getPriorVotes(a1, t4.blockNumber).call();
      expect(pv).toBe('100000000000000000000000000');

      pv = await ham.contracts.ham.methods.getPriorVotes(a1, t4.blockNumber + 1).call();
      expect(pv).toBe('100000000000000000000000000');
    });
  });
});
