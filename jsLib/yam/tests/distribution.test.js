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

describe("Distribution", () => {
  let snapshotId;
  let user;
  let ycrv_account = "0x0eb4add4ba497357546da7f5d12d39587ca24606";
  let weth_account = "0xf9e11762d522ea29dd78178c9baf83b7b093aacc";
  let uni_ampl_account = "0x8c545be506a335e24145edd6e01d2754296ff018";
  let comp_account = "0xc89b6f0146642688bb254bf93c28fccf1e182c81";
  let lend_account = "0x3b08aa814bea604917418a9f0907e7fc430e742c";
  let link_account = "0xbe6977e08d4479c0a6777539ae0e8fa27be4e9d6";
  let mkr_account = "0xf37216a8ac034d08b4663108d7532dfcb44583ed";
  let snx_account = "0xd85a7a3c5f08e3e709c233e133ce1335fbbf5518"
  let yfi_account = "0x0eb4add4ba497357546da7f5d12d39587ca24606";
  beforeAll(async () => {
    const accounts = await yam.web3.eth.getAccounts();
    yam.addAccount(accounts[0]);
    user = accounts[0];
    snapshotId = await yam.testing.snapshot();
  });

  beforeEach(async () => {
    await yam.testing.resetEVM("0x2");
    await yam.contracts.ycrv.methods.transfer(user, "12000000000000000000000000").send({
      from: ycrv_account
    });

    await yam.contracts.weth.methods.transfer(user, yam.toBigN(2000).times(yam.toBigN(10**18)).toString()).send({
      from: weth_account
    });

    await yam.contracts.UNIAmpl.methods.transfer(user, "5000000000000000").send({
      from: uni_ampl_account
    });

    await yam.contracts.comp.methods.transfer(user, "50000000000000000000000").send({
      from: comp_account
    });

    await yam.contracts.link.methods.transfer(user, "10000000000000000000000000").send({
      from: link_account
    });

    await yam.contracts.mkr.methods.transfer(user, "10000000000000000000000").send({
      from: mkr_account
    });

    await yam.contracts.lend.methods.transfer(user, "10000000000000000000000000").send({
      from: lend_account
    });

    await yam.contracts.snx.methods.transfer(user, "3000000000000000000000000").send({
      from: snx_account
    });

    await yam.contracts.yfi.methods.transfer(user, "500000000000000000000").send({
      from: yfi_account
    });
  });

  describe("pool failures", () => {
    test("cant join pool 1s early", async () => {
      let a = await yam.web3.eth.getBlock('latest');

      let starttime = await yam.contracts.eth_pool.methods.starttime().call();

      expect(yam.toBigN(a["timestamp"]).toNumber()).toBeLessThan(yam.toBigN(starttime).toNumber());

      console.log("starttime", a["timestamp"], starttime);
      await yam.contracts.weth.methods.approve(yam.contracts.eth_pool.options.address, -1).send({from: user});

      await yam.testing.expectThrow(
        yam.contracts.eth_pool.methods.stake(
          yam.toBigN(200).times(yam.toBigN(10**18)).toString()
        ).send({
          from: user,
          gas: 300000
        })
      , "not start");


      a = await yam.web3.eth.getBlock('latest');

      starttime = await yam.contracts.ampl_pool.methods.starttime().call();

      expect(yam.toBigN(a["timestamp"]).toNumber()).toBeLessThan(yam.toBigN(starttime).toNumber());

      console.log("starttime", a["timestamp"], starttime);

      await yam.contracts.UNIAmpl.methods.approve(yam.contracts.ampl_pool.options.address, -1).send({from: user});

      await yam.testing.expectThrow(yam.contracts.ampl_pool.methods.stake(
        "5016536322915819"
      ).send({
        from: user,
        gas: 300000
      }), "not start");
    });

    test("cant join pool 2 early", async () => {

    });

    test("cant leave pool 2 early", async () => {

    });

    test("cant withdraw more than deposited", async () => {
      let a = await yam.web3.eth.getBlock('latest');

      let starttime = await yam.contracts.eth_pool.methods.starttime().call();

      let waittime = starttime - a["timestamp"];
      if (waittime > 0) {
        await yam.testing.increaseTime(waittime);
      }

      await yam.contracts.weth.methods.approve(yam.contracts.eth_pool.options.address, -1).send({from: user});

      await yam.contracts.eth_pool.methods.stake(
        yam.toBigN(200).times(yam.toBigN(10**18)).toString()
      ).send({
        from: user,
        gas: 300000
      });

      await yam.contracts.UNIAmpl.methods.approve(yam.contracts.ampl_pool.options.address, -1).send({from: user});

      await yam.contracts.ampl_pool.methods.stake(
        "5016536322915819"
      ).send({
        from: user,
        gas: 300000
      });

      await yam.testing.expectThrow(yam.contracts.ampl_pool.methods.withdraw(
        "5016536322915820"
      ).send({
        from: user,
        gas: 300000
      }), "");

      await yam.testing.expectThrow(yam.contracts.eth_pool.methods.withdraw(
        yam.toBigN(201).times(yam.toBigN(10**18)).toString()
      ).send({
        from: user,
        gas: 300000
      }), "");

    });
  })

  describe("distribution", () => {

    test("user has tokens", async () => {
      let bal = await yam.contracts.ycrv.methods.balanceOf(user).call();
      expect(bal).toBe("12000000000000000000000000");

      bal = await yam.contracts.weth.methods.balanceOf(user).call();
      expect(bal).toBe(yam.toBigN(2000).times(yam.toBigN(10**18)).toString());

      bal = await yam.contracts.UNIAmpl.methods.balanceOf(user).call();
      expect(bal).toBe("5000000000000000");
    });

    test("joining pool 1s", async () => {

      let a = await yam.web3.eth.getBlock('latest');

      let starttime = await yam.contracts.eth_pool.methods.starttime().call();

      let waittime = starttime - a["timestamp"];
      if (waittime > 0) {
        await yam.testing.increaseTime(waittime);
      }

      await yam.contracts.weth.methods.approve(yam.contracts.eth_pool.options.address, -1).send({from: user});

      await yam.contracts.eth_pool.methods.stake(
        yam.toBigN(200).times(yam.toBigN(10**18)).toString()
      ).send({
        from: user,
        gas: 300000
      });

      await yam.contracts.UNIAmpl.methods.approve(yam.contracts.ampl_pool.options.address, -1).send({from: user});

      await yam.contracts.ampl_pool.methods.stake(
        "5000000000000000"
      ).send({
        from: user,
        gas: 300000
      });
    });

    test("leaving pool 1s", async () => {
      let a = await yam.web3.eth.getBlock('latest');

      let starttime = await yam.contracts.eth_pool.methods.starttime().call();

      let waittime = starttime - a["timestamp"];
      if (waittime > 0) {
        await yam.testing.increaseTime(waittime);
      }

      await yam.contracts.weth.methods.approve(yam.contracts.eth_pool.options.address, -1).send({from: user});

      await yam.contracts.eth_pool.methods.stake(
        yam.toBigN(200).times(yam.toBigN(10**18)).toString()
      ).send({
        from: user,
        gas: 300000
      });

      await yam.contracts.UNIAmpl.methods.approve(yam.contracts.ampl_pool.options.address, -1).send({from: user});

      await yam.contracts.ampl_pool.methods.stake(
        "5000000000000000"
      ).send({
        from: user,
        gas: 300000
      });

      await yam.contracts.ampl_pool.methods.withdraw(
        "5000000000000000"
      ).send({
        from: user,
        gas: 300000
      });

      await yam.contracts.eth_pool.methods.withdraw(
        yam.toBigN(200).times(yam.toBigN(10**18)).toString()
      ).send({
        from: user,
        gas: 300000
      });

      let weth_bal = await yam.contracts.weth.methods.balanceOf(user).call()

      expect(weth_bal).toBe(yam.toBigN(2000).times(yam.toBigN(10**18)).toString())

      let ampl_bal = await yam.contracts.UNIAmpl.methods.balanceOf(user).call()

      expect(ampl_bal).toBe("5000000000000000")

    });

    test("rewards from pool 1s ampl", async () => {
        let a = await yam.web3.eth.getBlock('latest');

        let starttime = await yam.contracts.eth_pool.methods.starttime().call();

        let waittime = starttime - a["timestamp"];
        if (waittime > 0) {
          await yam.testing.increaseTime(waittime);
        } else {
          console.log("missed entry");
        }

        await yam.contracts.UNIAmpl.methods.approve(yam.contracts.ampl_pool.options.address, -1).send({from: user});

        await yam.contracts.ampl_pool.methods.stake(
          "5000000000000000"
        ).send({
          from: user,
          gas: 300000
        });

        let earned = await yam.contracts.ampl_pool.methods.earned(user).call();

        let rr = await yam.contracts.ampl_pool.methods.rewardRate().call();

        let rpt = await yam.contracts.ampl_pool.methods.rewardPerToken().call();
        console.log(earned, rr, rpt);
        await yam.testing.increaseTime(625000 + 10);
        // await yam.testing.mineBlock();

        earned = await yam.contracts.ampl_pool.methods.earned(user).call();

        rpt = await yam.contracts.ampl_pool.methods.rewardPerToken().call();

        let ysf = await yam.contracts.yam.methods.yamsScalingFactor().call();

        console.log(earned, ysf, rpt);


        let yam_bal = await yam.contracts.yam.methods.balanceOf(user).call()

        let j = await yam.contracts.ampl_pool.methods.exit().send({
          from: user,
          gas: 300000
        });

        console.log(j.events)

        // let k = await yam.contracts.eth_pool.methods.exit().send({
        //   from: user,
        //   gas: 300000
        // });
        //
        // console.log(k.events)

        // weth_bal = await yam.contracts.weth.methods.balanceOf(user).call()

        // expect(weth_bal).toBe(yam.toBigN(2000).times(yam.toBigN(10**18)).toString())

        let ampl_bal = await yam.contracts.UNIAmpl.methods.balanceOf(user).call()

        expect(ampl_bal).toBe("5000000000000000")


        let yam_bal2 = await yam.contracts.yam.methods.balanceOf(user).call()

        let two_fity = yam.toBigN(250).times(yam.toBigN(10**3)).times(yam.toBigN(10**18))
        expect(yam.toBigN(yam_bal2).minus(yam.toBigN(yam_bal)).toString()).toBe(two_fity.times(1).toString())
    });

    test("rewards from pool 1s eth", async () => {
        let a = await yam.web3.eth.getBlock('latest');

        let starttime = await yam.contracts.eth_pool.methods.starttime().call();

        let waittime = starttime - a["timestamp"];
        if (waittime > 0) {
          await yam.testing.increaseTime(waittime);
        } else {
          console.log("late entry")
        }

        await yam.contracts.weth.methods.approve(yam.contracts.eth_pool.options.address, -1).send({from: user});

        await yam.contracts.eth_pool.methods.stake(
          "2000000000000000000000"
        ).send({
          from: user,
          gas: 300000
        });

        let earned = await yam.contracts.eth_pool.methods.earned(user).call();

        let rr = await yam.contracts.eth_pool.methods.rewardRate().call();

        let rpt = await yam.contracts.eth_pool.methods.rewardPerToken().call();
        console.log(earned, rr, rpt);
        await yam.testing.increaseTime(625000 + 10);
        // await yam.testing.mineBlock();

        earned = await yam.contracts.eth_pool.methods.earned(user).call();

        rpt = await yam.contracts.eth_pool.methods.rewardPerToken().call();

        let ysf = await yam.contracts.yam.methods.yamsScalingFactor().call();

        console.log(earned, ysf, rpt);


        let yam_bal = await yam.contracts.yam.methods.balanceOf(user).call()

        let j = await yam.contracts.eth_pool.methods.exit().send({
          from: user,
          gas: 300000
        });

        console.log(j.events)

        let weth_bal = await yam.contracts.weth.methods.balanceOf(user).call()

        expect(weth_bal).toBe("2000000000000000000000")


        let yam_bal2 = await yam.contracts.yam.methods.balanceOf(user).call()

        let two_fity = yam.toBigN(250).times(yam.toBigN(10**3)).times(yam.toBigN(10**18))
        expect(yam.toBigN(yam_bal2).minus(yam.toBigN(yam_bal)).toString()).toBe(two_fity.times(1).toString())
    });

    // test("rewards from pool 1s with rebase", async () => {
    //
    // });
    //
    // test("joining pool 2", async () => {
    //
    // });
    //
    // test("rewards from pool 2", async () => {
    //
    // });
    //
    // test("rewards from pool 2 with rebase", async () => {
    //
    // });
    //
    // test("leaving pool 2", async () => {
    //
    // });
  });
})
