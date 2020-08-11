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

const ethUtil = require('ethereumjs-util');

async function enfranchise(actor, amount, user) {
  await yam.contracts.yam.methods.transfer(actor, amount.toString()).send({from: user});
  await yam.contracts.yam.methods.delegate(actor).send({from: actor});
}

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

const EIP712 = require('./EIP712');

describe("governorAlpha#castVote/2", () => {
  let name = "YAM";
  let chainId = 1001;
  let snapshotId;
  let user;
  let a1;
  let a2;
  let a3;
  let a4;
  let guy;
  let address = "0x4BC6657283f8f24e27EAc1D21D1deE566C534A9A";
  let targets, values, signatures, callDatas, proposalId;
  let accounts;
  // we publish the mnemonic. its is a well known test mnemonic so these pvks
  // arent a security issue.
  const pvk = "0xf2f48ee19680706196e2e339e5da3491186e0c4c5030670656b0e0164837257d";
  const pvk_a1 = "0x5d862464fe9303452126c8bc94274b8c5f9874cbd219789b3eb2128075a76f72";
  const pvk_a2 = "0xdf02719c4df8b9b8ac7f551fcb5d9ef48fa27eef7a66453879f4d8fdc6e78fb1";
  const pvk_a3 = "0x752dd9cf65e68cfaba7d60225cbdbc1f4729dd5e5507def72815ed0d8abc6249";
  const pvk_a4 = "0xefb595a0178eb79a8df953f87c5148402a224cdf725e88c0146727c6aceadccd";
  beforeAll(async () => {
    await yam.testing.resetEVM("0x2");
    accounts = await yam.web3.eth.getAccounts();
    yam.addAccount(accounts[0]);
    user = accounts[0];
    a1 = accounts[1];
    a2 = accounts[2];
    guy = accounts[3];
    a3 = accounts[4];
    a4 = accounts[5];
    let one_hundred = yam.toBigN(100).times(yam.toBigN(10**18));
    // await yam.contracts.yam.methods.transfer(guy, one_hundred.toString()).send({from: user});

    snapshotId = await yam.testing.snapshot();

    targets = [a1];
    values = ["0"];
    signatures = ["getBalanceOf(address)"];
    callDatas = [yam.web3.eth.abi.encodeParameters(['address'], [a1])];
  });

  beforeEach(async () => {
    await yam.testing.resetEVM("0x2");
    await yam.contracts.yam.methods.delegate(a1).send({from: user, gas: 400000});
    await yam.contracts.gov.methods.propose(targets, values, signatures, callDatas, "do nothing").send({from: a1, gas: 400000});
    proposalId = await yam.contracts.gov.methods.latestProposalIds(a1).call();
  });

  describe("We must revert if:", () => {
    it("There does not exist a proposal with matching proposal id where the current block number is between the proposal's start block (exclusive) and end block (inclusive)", async () => {
      await yam.testing.expectThrow(
        yam.contracts.gov.methods.castVote(proposalId, true).call(),
        "GovernorAlpha::_castVote: voting is closed"
      );
    });

    test("Such proposal already has an entry in its voters set matching the sender", async () => {
      await yam.testing.mineBlock();
      await yam.testing.mineBlock();

      await yam.contracts.gov.methods.castVote(proposalId, true).send({from: accounts[4]});
      await yam.testing.expectThrow(
        yam.contracts.gov.methods.castVote(proposalId, true).call({ from: accounts[4] }),
        "GovernorAlpha::_castVote: voter already voted"
      );
    });
  });

  describe("Otherwise", () => {
    it("we add the sender to the proposal's voters set", async () => {
      await yam.testing.mineBlock();
      await yam.testing.mineBlock();
      let r = await yam.contracts.gov.methods.getReceipt(proposalId, accounts[2]).call();
      expect(r.hasVoted).toBe(false);

      await yam.contracts.gov.methods.castVote(proposalId, true).send({from: accounts[2]});
      r = await yam.contracts.gov.methods.getReceipt(proposalId, accounts[2]).call();
      expect(r.hasVoted).toBe(true);
    });

    describe("and we take the balance returned by GetPriorVotes for the given sender and the proposal's start block, which may be zero,", () => {
      let actor; // an account that will propose, receive tokens, delegate to self, and vote on own proposal

      test("and we add that ForVotes", async () => {
        await yam.testing.mineBlock();
        await yam.testing.mineBlock();
        actor = a2;
        await enfranchise(actor, yam.toBigN(400001).times(10**18), user);

        await yam.contracts.gov.methods.propose(targets, values, signatures, callDatas, "do nothing").send({from: actor, gas: 400000});

        proposalId = await yam.contracts.gov.methods.latestProposalIds(actor).call();

        let beforeFors = (await yam.contracts.gov.methods.proposals(proposalId).call()).forVotes;
        await yam.testing.mineBlock();
        await yam.contracts.gov.methods.castVote(proposalId, true).send({ from: actor });

        let afterFors = (await yam.contracts.gov.methods.proposals(proposalId).call()).forVotes;
        expect(yam.toBigN(afterFors).toString()).toBe(yam.toBigN(beforeFors).plus(yam.toBigN(400001).times(10**24)).toString());
      })

      test("or AgainstVotes corresponding to the caller's support flag.", async () => {
        await yam.testing.mineBlock();
        await yam.testing.mineBlock();
        actor = accounts[4];
        await enfranchise(actor, yam.toBigN(400001).times(10**18), user);

        await yam.contracts.gov.methods.propose(targets, values, signatures, callDatas, "do nothing").send({from: actor, gas: 400000});

        proposalId = await yam.contracts.gov.methods.latestProposalIds(actor).call();

        let beforeFors = (await yam.contracts.gov.methods.proposals(proposalId).call()).againstVotes;
        await yam.testing.mineBlock();
        await yam.contracts.gov.methods.castVote(proposalId, false).send({ from: actor });

        let afterFors = (await yam.contracts.gov.methods.proposals(proposalId).call()).againstVotes;
        expect(yam.toBigN(afterFors).toString()).toBe(yam.toBigN(beforeFors).plus(yam.toBigN(400001).times(10**24)).toString());
      });
    });

    describe('castVoteBySig', () => {

      it('reverts if the signatory is invalid', async () => {
        const typedData = {
             types: {
                 EIP712Domain: [
                     { name: 'name', type: 'string' },
                     { name: 'chainId', type: 'uint256' },
                     { name: 'verifyingContract', type: 'address' },
                 ],
                 Ballot: [
                   { name: 'proposalId', type: 'uint256' },
                   { name: 'support', type: 'bool' }
                 ]
             },
             primaryType: 'Ballot',
             domain: {
                 name: 'YAM Governor Alpha',
                 chainId: 1,
                 verifyingContract: yam.contracts.gov.options.address,
             },
             message: {
                 proposalId: proposalId,
                 support: false,
             },
         };

        let sigHash = EIP712.encodeTypedData(typedData)
        const sig = ethUtil.ecsign(ethUtil.toBuffer(sigHash, 'hex'), ethUtil.toBuffer(pvk_a1, 'hex'));

        await yam.testing.expectThrow(
            yam.contracts.gov.methods.castVoteBySig(proposalId, false, 0, '0xbad', '0xbad').send({from: user}),
            "GovernorAlpha::castVoteBySig: invalid signature"
        );
      });

      it('casts vote on behalf of the signatory', async () => {


        await enfranchise(a4, yam.toBigN(400001).times(10**18), user);
        await yam.contracts.gov.methods.propose(targets, values, signatures, callDatas, "do nothing").send({ from: a4, gas: 400000 });
        proposalId = await yam.contracts.gov.methods.latestProposalIds(a4).call();

        const typedData = {
             types: {
                 EIP712Domain: [
                     { name: 'name', type: 'string' },
                     { name: 'chainId', type: 'uint256' },
                     { name: 'verifyingContract', type: 'address' },
                 ],
                 Ballot: [
                   { name: 'proposalId', type: 'uint256' },
                   { name: 'support', type: 'bool' }
                 ]
             },
             primaryType: 'Ballot',
             domain: {
                 name: 'YAM Governor Alpha',
                 chainId: 1,
                 verifyingContract: "0x47Ff9D00cDAE31B4E09DEf8081bb3a1282e8061D",
             },
             message: {
                 proposalId: proposalId,
                 support: true,
             },
         };

        let sigHash = EIP712.encodeTypedData(typedData)
        const sig = ethUtil.ecsign(ethUtil.toBuffer(sigHash, 'hex'), ethUtil.toBuffer(pvk_a4, 'hex'));

        let beforeFors = (await yam.contracts.gov.methods.proposals(proposalId).call()).forVotes;
        await yam.testing.mineBlock();
        const tx = await yam.contracts.gov.methods.castVoteBySig(proposalId, true, sig.v, sig.r, sig.s).send({from: a4, gas: 100000});
        console.log(tx.events)
        expect(tx.gasUsed < 80000);

        let afterFors = (await yam.contracts.gov.methods.proposals(proposalId).call()).forVotes;
        expect(yam.toBigN(afterFors).toString()).toBe(yam.toBigN(beforeFors).plus(yam.toBigN(400001).times(10**24)).toString());
      });
    });
  });
});
