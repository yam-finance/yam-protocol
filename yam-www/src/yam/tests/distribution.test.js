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
    defaultGasPrice: "1",
    accounts: [],
    ethereumNodeTimeout: 10000
  }
)
const oneEther = 10 ** 18;

describe("Distribution", () => {
  let snapshotId;
  let user;
  let user2;
  let ycrv_account = "0x0eb4add4ba497357546da7f5d12d39587ca24606";
  let weth_account = "0xf9e11762d522ea29dd78178c9baf83b7b093aacc";
  let uni_ampl_account = "0x8c545be506a335e24145edd6e01d2754296ff018";
  let comp_account = "0xc89b6f0146642688bb254bf93c28fccf1e182c81";
  let lend_account = "0x3b08aa814bea604917418a9f0907e7fc430e742c";
  let link_account = "0xbe6977e08d4479c0a6777539ae0e8fa27be4e9d6";
  let mkr_account = "0xf37216a8ac034d08b4663108d7532dfcb44583ed";
  let snx_account = "0xb696d629cd0a00560151a434f6b4478ad6c228d7"
  let yfi_account = "0x0eb4add4ba497357546da7f5d12d39587ca24606";
  beforeAll(async () => {
    const accounts = await yam.web3.eth.getAccounts();
    yam.addAccount(accounts[0]);
    user = accounts[0];
    yam.addAccount(accounts[1]);
    user2 = accounts[1];
    snapshotId = await yam.testing.snapshot();
  });

  beforeEach(async () => {
    await yam.testing.resetEVM("0x2");
  });

  describe("pool failures", () => {
    test("cant join pool 1s early", async () => {
      await yam.testing.resetEVM("0x2");
      let a = await yam.web3.eth.getBlock('latest');

      let starttime = await yam.contracts.eth_pool.methods.starttime().call();

      expect(yam.toBigN(a["timestamp"]).toNumber()).toBeLessThan(yam.toBigN(starttime).toNumber());

      //console.log("starttime", a["timestamp"], starttime);
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

      //console.log("starttime", a["timestamp"], starttime);

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

    test("cant withdraw more than deposited", async () => {
      await yam.testing.resetEVM("0x2");
      let a = await yam.web3.eth.getBlock('latest');

      await yam.contracts.weth.methods.transfer(user, yam.toBigN(2000).times(yam.toBigN(10**18)).toString()).send({
        from: weth_account
      });
      await yam.contracts.UNIAmpl.methods.transfer(user, "5000000000000000").send({
        from: uni_ampl_account
      });

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
  });

  describe("incentivizer pool", () => {
    test("joining and exiting", async() => {
      await yam.testing.resetEVM("0x2");

      await yam.contracts.ycrv.methods.transfer(user, "12000000000000000000000000").send({
        from: ycrv_account
      });

      await yam.contracts.weth.methods.transfer(user, yam.toBigN(2000).times(yam.toBigN(10**18)).toString()).send({
        from: weth_account
      });

      let a = await yam.web3.eth.getBlock('latest');

      let starttime = await yam.contracts.eth_pool.methods.starttime().call();

      let waittime = starttime - a["timestamp"];
      if (waittime > 0) {
        await yam.testing.increaseTime(waittime);
      } else {
        console.log("late entry", waittime)
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
      //console.log(earned, rr, rpt);
      await yam.testing.increaseTime(86400);
      // await yam.testing.mineBlock();

      earned = await yam.contracts.eth_pool.methods.earned(user).call();

      rpt = await yam.contracts.eth_pool.methods.rewardPerToken().call();

      let ysf = await yam.contracts.yam.methods.yamsScalingFactor().call();

      console.log(earned, ysf, rpt);

      let j = await yam.contracts.eth_pool.methods.getReward().send({
        from: user,
        gas: 300000
      });

      let yam_bal = await yam.contracts.yam.methods.balanceOf(user).call()

      console.log("yam bal", yam_bal)
      // start rebasing
        //console.log("approve yam")
        await yam.contracts.yam.methods.approve(
          yam.contracts.uni_router.options.address,
          -1
        ).send({
          from: user,
          gas: 80000
        });
        //console.log("approve ycrv")
        await yam.contracts.ycrv.methods.approve(
          yam.contracts.uni_router.options.address,
          -1
        ).send({
          from: user,
          gas: 80000
        });

        let ycrv_bal = await yam.contracts.ycrv.methods.balanceOf(user).call()

        console.log("ycrv_bal bal", ycrv_bal)

        console.log("add liq/ create pool")
        await yam.contracts.uni_router.methods.addLiquidity(
          yam.contracts.yam.options.address,
          yam.contracts.ycrv.options.address,
          yam_bal,
          yam_bal,
          yam_bal,
          yam_bal,
          user,
          1596740361 + 10000000
        ).send({
          from: user,
          gas: 8000000
        });

        let pair = await yam.contracts.uni_fact.methods.getPair(
          yam.contracts.yam.options.address,
          yam.contracts.ycrv.options.address
        ).call();

        yam.contracts.uni_pair.options.address = pair;
        let bal = await yam.contracts.uni_pair.methods.balanceOf(user).call();

        await yam.contracts.uni_pair.methods.approve(
          yam.contracts.ycrv_pool.options.address,
          -1
        ).send({
          from: user,
          gas: 300000
        });

        starttime = await yam.contracts.ycrv_pool.methods.starttime().call();

        a = await yam.web3.eth.getBlock('latest');

        waittime = starttime - a["timestamp"];
        if (waittime > 0) {
          await yam.testing.increaseTime(waittime);
        } else {
          console.log("late entry, pool 2", waittime)
        }

        await yam.contracts.ycrv_pool.methods.stake(bal).send({from: user, gas: 400000});


        earned = await yam.contracts.ampl_pool.methods.earned(user).call();

        rr = await yam.contracts.ampl_pool.methods.rewardRate().call();

        rpt = await yam.contracts.ampl_pool.methods.rewardPerToken().call();

        console.log(earned, rr, rpt);

        await yam.testing.increaseTime(625000 + 1000);

        earned = await yam.contracts.ampl_pool.methods.earned(user).call();

        rr = await yam.contracts.ampl_pool.methods.rewardRate().call();

        rpt = await yam.contracts.ampl_pool.methods.rewardPerToken().call();

        console.log(earned, rr, rpt);

        await yam.contracts.ycrv_pool.methods.exit().send({from: user, gas: 400000});

        yam_bal = await yam.contracts.yam.methods.balanceOf(user).call();


        expect(yam.toBigN(yam_bal).toNumber()).toBeGreaterThan(0)
        console.log("yam bal after staking in pool 2", yam_bal);
    });
  });

  describe("ampl", () => {
    test("rewards from pool 1s ampl", async () => {
        await yam.testing.resetEVM("0x2");

        await yam.contracts.UNIAmpl.methods.transfer(user, "5000000000000000").send({
          from: uni_ampl_account
        });
        let a = await yam.web3.eth.getBlock('latest');

        let starttime = await yam.contracts.eth_pool.methods.starttime().call();

        let waittime = starttime - a["timestamp"];
        if (waittime > 0) {
          await yam.testing.increaseTime(waittime);
        } else {
          //console.log("missed entry");
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
        //console.log(earned, rr, rpt);
        await yam.testing.increaseTime(625000 + 100);
        // await yam.testing.mineBlock();

        earned = await yam.contracts.ampl_pool.methods.earned(user).call();

        rpt = await yam.contracts.ampl_pool.methods.rewardPerToken().call();

        let ysf = await yam.contracts.yam.methods.yamsScalingFactor().call();

        //console.log(earned, ysf, rpt);


        let yam_bal = await yam.contracts.yam.methods.balanceOf(user).call()

        let j = await yam.contracts.ampl_pool.methods.exit().send({
          from: user,
          gas: 300000
        });

        //console.log(j.events)

        // let k = await yam.contracts.eth_pool.methods.exit().send({
        //   from: user,
        //   gas: 300000
        // });
        //
        // //console.log(k.events)

        // weth_bal = await yam.contracts.weth.methods.balanceOf(user).call()

        // expect(weth_bal).toBe(yam.toBigN(2000).times(yam.toBigN(10**18)).toString())

        let ampl_bal = await yam.contracts.UNIAmpl.methods.balanceOf(user).call()

        expect(ampl_bal).toBe("5000000000000000")


        let yam_bal2 = await yam.contracts.yam.methods.balanceOf(user).call()

        let two_fity = yam.toBigN(250).times(yam.toBigN(10**3)).times(yam.toBigN(10**18))
        expect(yam.toBigN(yam_bal2).minus(yam.toBigN(yam_bal)).toString()).toBe(two_fity.times(1).toString())
    });
  });

  describe("eth", () => {
    test("rewards from pool 1s eth", async () => {
        await yam.testing.resetEVM("0x2");

        await yam.contracts.weth.methods.transfer(user, yam.toBigN(2000).times(yam.toBigN(10**18)).toString()).send({
          from: weth_account
        });

        let a = await yam.web3.eth.getBlock('latest');

        let starttime = await yam.contracts.eth_pool.methods.starttime().call();

        let waittime = starttime - a["timestamp"];
        if (waittime > 0) {
          await yam.testing.increaseTime(waittime);
        } else {
          console.log("late entry", waittime)
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
        //console.log(earned, rr, rpt);
        await yam.testing.increaseTime(625000 + 100);
        // await yam.testing.mineBlock();

        earned = await yam.contracts.eth_pool.methods.earned(user).call();

        rpt = await yam.contracts.eth_pool.methods.rewardPerToken().call();

        let ysf = await yam.contracts.yam.methods.yamsScalingFactor().call();

        //console.log(earned, ysf, rpt);


        let yam_bal = await yam.contracts.yam.methods.balanceOf(user).call()

        let j = await yam.contracts.eth_pool.methods.exit().send({
          from: user,
          gas: 300000
        });

        //console.log(j.events)

        let weth_bal = await yam.contracts.weth.methods.balanceOf(user).call()

        expect(weth_bal).toBe("2000000000000000000000")


        let yam_bal2 = await yam.contracts.yam.methods.balanceOf(user).call()

        let two_fity = yam.toBigN(250).times(yam.toBigN(10**3)).times(yam.toBigN(10**18))
        expect(yam.toBigN(yam_bal2).minus(yam.toBigN(yam_bal)).toString()).toBe(two_fity.times(1).toString())
    });
    test("rewards from pool 1s eth with rebase", async () => {
        await yam.testing.resetEVM("0x2");

        await yam.contracts.ycrv.methods.transfer(user, "12000000000000000000000000").send({
          from: ycrv_account
        });

        await yam.contracts.weth.methods.transfer(user, yam.toBigN(2000).times(yam.toBigN(10**18)).toString()).send({
          from: weth_account
        });

        let a = await yam.web3.eth.getBlock('latest');

        let starttime = await yam.contracts.eth_pool.methods.starttime().call();

        let waittime = starttime - a["timestamp"];
        if (waittime > 0) {
          await yam.testing.increaseTime(waittime);
        } else {
          console.log("late entry", waittime)
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
        //console.log(earned, rr, rpt);
        await yam.testing.increaseTime(125000 + 100);
        // await yam.testing.mineBlock();

        earned = await yam.contracts.eth_pool.methods.earned(user).call();

        rpt = await yam.contracts.eth_pool.methods.rewardPerToken().call();

        let ysf = await yam.contracts.yam.methods.yamsScalingFactor().call();

        //console.log(earned, ysf, rpt);




        let j = await yam.contracts.eth_pool.methods.getReward().send({
          from: user,
          gas: 300000
        });

        let yam_bal = await yam.contracts.yam.methods.balanceOf(user).call()

        console.log("yam bal", yam_bal)
        // start rebasing
          //console.log("approve yam")
          await yam.contracts.yam.methods.approve(
            yam.contracts.uni_router.options.address,
            -1
          ).send({
            from: user,
            gas: 80000
          });
          //console.log("approve ycrv")
          await yam.contracts.ycrv.methods.approve(
            yam.contracts.uni_router.options.address,
            -1
          ).send({
            from: user,
            gas: 80000
          });

          let ycrv_bal = await yam.contracts.ycrv.methods.balanceOf(user).call()

          console.log("ycrv_bal bal", ycrv_bal)

          console.log("add liq/ create pool")
          await yam.contracts.uni_router.methods.addLiquidity(
            yam.contracts.yam.options.address,
            yam.contracts.ycrv.options.address,
            yam_bal,
            yam_bal,
            yam_bal,
            yam_bal,
            user,
            1596740361 + 10000000
          ).send({
            from: user,
            gas: 8000000
          });

          let pair = await yam.contracts.uni_fact.methods.getPair(
            yam.contracts.yam.options.address,
            yam.contracts.ycrv.options.address
          ).call();

          yam.contracts.uni_pair.options.address = pair;
          let bal = await yam.contracts.uni_pair.methods.balanceOf(user).call();

          // make a trade to get init values in uniswap
          //console.log("init swap")
          await yam.contracts.uni_router.methods.swapExactTokensForTokens(
            "100000000000000000000000",
            100000,
            [
              yam.contracts.ycrv.options.address,
              yam.contracts.yam.options.address
            ],
            user,
            1596740361 + 10000000
          ).send({
            from: user,
            gas: 1000000
          });

          // trade back for easier calcs later
          //console.log("swap 0")
          await yam.contracts.uni_router.methods.swapExactTokensForTokens(
            "10000000000000000",
            100000,
            [
              yam.contracts.ycrv.options.address,
              yam.contracts.yam.options.address
            ],
            user,
            1596740361 + 10000000
          ).send({
            from: user,
            gas: 1000000
          });

          await yam.testing.increaseTime(43200);

          //console.log("init twap")
          await yam.contracts.rebaser.methods.init_twap().send({
            from: user,
            gas: 500000
          });

          //console.log("first swap")
          await yam.contracts.uni_router.methods.swapExactTokensForTokens(
            "1000000000000000000000",
            100000,
            [
              yam.contracts.ycrv.options.address,
              yam.contracts.yam.options.address
            ],
            user,
            1596740361 + 10000000
          ).send({
            from: user,
            gas: 1000000
          });

          // init twap
          let init_twap = await yam.contracts.rebaser.methods.timeOfTWAPInit().call();

          // wait 12 hours
          await yam.testing.increaseTime(12 * 60 * 60);

          // perform trade to change price
          //console.log("second swap")
          await yam.contracts.uni_router.methods.swapExactTokensForTokens(
            "10000000000000000000",
            100000,
            [
              yam.contracts.ycrv.options.address,
              yam.contracts.yam.options.address
            ],
            user,
            1596740361 + 10000000
          ).send({
            from: user,
            gas: 1000000
          });

          // activate rebasing
          await yam.contracts.rebaser.methods.activate_rebasing().send({
            from: user,
            gas: 500000
          });


          bal = await yam.contracts.yam.methods.balanceOf(user).call();

          a = await yam.web3.eth.getBlock('latest');

          let offset = await yam.contracts.rebaser.methods.rebaseWindowOffsetSec().call();
          offset = yam.toBigN(offset).toNumber();
          let interval = await yam.contracts.rebaser.methods.minRebaseTimeIntervalSec().call();
          interval = yam.toBigN(interval).toNumber();

          let i;
          if (a["timestamp"] % interval > offset) {
            i = (interval - (a["timestamp"] % interval)) + offset;
          } else {
            i = offset - (a["timestamp"] % interval);
          }

          await yam.testing.increaseTime(i);

          let r = await yam.contracts.uni_pair.methods.getReserves().call();
          let q = await yam.contracts.uni_router.methods.quote(yam.toBigN(10**18).toString(), r[0], r[1]).call();
          console.log("quote pre positive rebase", q);

          let b = await yam.contracts.rebaser.methods.rebase().send({
            from: user,
            gas: 2500000
          });

          let bal1 = await yam.contracts.yam.methods.balanceOf(user).call();

          let resYAM = await yam.contracts.yam.methods.balanceOf(yam.contracts.reserves.options.address).call();

          let resycrv = await yam.contracts.ycrv.methods.balanceOf(yam.contracts.reserves.options.address).call();

          // new balance > old balance
          expect(yam.toBigN(bal).toNumber()).toBeLessThan(yam.toBigN(bal1).toNumber());
          // increases reserves
          expect(yam.toBigN(resycrv).toNumber()).toBeGreaterThan(0);

          r = await yam.contracts.uni_pair.methods.getReserves().call();
          q = await yam.contracts.uni_router.methods.quote(yam.toBigN(10**18).toString(), r[0], r[1]).call();
          console.log("quote", q);
          // not below peg
          expect(yam.toBigN(q).toNumber()).toBeGreaterThan(yam.toBigN(10**18).toNumber());


        await yam.testing.increaseTime(525000 + 100);


        j = await yam.contracts.eth_pool.methods.exit().send({
          from: user,
          gas: 300000
        });
        //console.log(j.events)

        let weth_bal = await yam.contracts.weth.methods.balanceOf(user).call()

        expect(weth_bal).toBe("2000000000000000000000")


        let yam_bal2 = await yam.contracts.yam.methods.balanceOf(user).call()

        let two_fity = yam.toBigN(250).times(yam.toBigN(10**3)).times(yam.toBigN(10**18))
        expect(
          yam.toBigN(yam_bal2).minus(yam.toBigN(yam_bal)).toNumber()
        ).toBeGreaterThan(two_fity.toNumber())
    });
    test("rewards from pool 1s eth with negative rebase", async () => {
        await yam.testing.resetEVM("0x2");

        await yam.contracts.ycrv.methods.transfer(user, "12000000000000000000000000").send({
          from: ycrv_account
        });

        await yam.contracts.weth.methods.transfer(user, yam.toBigN(2000).times(yam.toBigN(10**18)).toString()).send({
          from: weth_account
        });

        let a = await yam.web3.eth.getBlock('latest');

        let starttime = await yam.contracts.eth_pool.methods.starttime().call();

        let waittime = starttime - a["timestamp"];
        if (waittime > 0) {
          await yam.testing.increaseTime(waittime);
        } else {
          console.log("late entry", waittime)
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
        //console.log(earned, rr, rpt);
        await yam.testing.increaseTime(125000 + 100);
        // await yam.testing.mineBlock();

        earned = await yam.contracts.eth_pool.methods.earned(user).call();

        rpt = await yam.contracts.eth_pool.methods.rewardPerToken().call();

        let ysf = await yam.contracts.yam.methods.yamsScalingFactor().call();

        //console.log(earned, ysf, rpt);




        let j = await yam.contracts.eth_pool.methods.getReward().send({
          from: user,
          gas: 300000
        });

        let yam_bal = await yam.contracts.yam.methods.balanceOf(user).call()

        console.log("yam bal", yam_bal)
        // start rebasing
          //console.log("approve yam")
          await yam.contracts.yam.methods.approve(
            yam.contracts.uni_router.options.address,
            -1
          ).send({
            from: user,
            gas: 80000
          });
          //console.log("approve ycrv")
          await yam.contracts.ycrv.methods.approve(
            yam.contracts.uni_router.options.address,
            -1
          ).send({
            from: user,
            gas: 80000
          });

          let ycrv_bal = await yam.contracts.ycrv.methods.balanceOf(user).call()

          console.log("ycrv_bal bal", ycrv_bal)

          yam_bal = yam.toBigN(yam_bal);
          console.log("add liq/ create pool")
          await yam.contracts.uni_router.methods.addLiquidity(
            yam.contracts.yam.options.address,
            yam.contracts.ycrv.options.address,
            yam_bal.times(.1).toString(),
            yam_bal.times(.1).toString(),
            yam_bal.times(.1).toString(),
            yam_bal.times(.1).toString(),
            user,
            1596740361 + 10000000
          ).send({
            from: user,
            gas: 8000000
          });

          let pair = await yam.contracts.uni_fact.methods.getPair(
            yam.contracts.yam.options.address,
            yam.contracts.ycrv.options.address
          ).call();

          yam.contracts.uni_pair.options.address = pair;
          let bal = await yam.contracts.uni_pair.methods.balanceOf(user).call();

          // make a trade to get init values in uniswap
          //console.log("init swap")
          await yam.contracts.uni_router.methods.swapExactTokensForTokens(
            "1000000000000000000000",
            100000,
            [
              yam.contracts.yam.options.address,
              yam.contracts.ycrv.options.address
            ],
            user,
            1596740361 + 10000000
          ).send({
            from: user,
            gas: 1000000
          });

          // trade back for easier calcs later
          //console.log("swap 0")
          await yam.contracts.uni_router.methods.swapExactTokensForTokens(
            "100000000000000",
            100000,
            [
              yam.contracts.yam.options.address,
              yam.contracts.ycrv.options.address
            ],
            user,
            1596740361 + 10000000
          ).send({
            from: user,
            gas: 1000000
          });

          await yam.testing.increaseTime(43200);

          //console.log("init twap")
          await yam.contracts.rebaser.methods.init_twap().send({
            from: user,
            gas: 500000
          });

          //console.log("first swap")
          await yam.contracts.uni_router.methods.swapExactTokensForTokens(
            "100000000000000",
            100000,
            [
              yam.contracts.yam.options.address,
              yam.contracts.ycrv.options.address
            ],
            user,
            1596740361 + 10000000
          ).send({
            from: user,
            gas: 1000000
          });

          // init twap
          let init_twap = await yam.contracts.rebaser.methods.timeOfTWAPInit().call();

          // wait 12 hours
          await yam.testing.increaseTime(12 * 60 * 60);

          // perform trade to change price
          //console.log("second swap")
          await yam.contracts.uni_router.methods.swapExactTokensForTokens(
            "1000000000000000000",
            100000,
            [
              yam.contracts.yam.options.address,
              yam.contracts.ycrv.options.address
            ],
            user,
            1596740361 + 10000000
          ).send({
            from: user,
            gas: 1000000
          });

          // activate rebasing
          await yam.contracts.rebaser.methods.activate_rebasing().send({
            from: user,
            gas: 500000
          });


          bal = await yam.contracts.yam.methods.balanceOf(user).call();

          a = await yam.web3.eth.getBlock('latest');

          let offset = await yam.contracts.rebaser.methods.rebaseWindowOffsetSec().call();
          offset = yam.toBigN(offset).toNumber();
          let interval = await yam.contracts.rebaser.methods.minRebaseTimeIntervalSec().call();
          interval = yam.toBigN(interval).toNumber();

          let i;
          if (a["timestamp"] % interval > offset) {
            i = (interval - (a["timestamp"] % interval)) + offset;
          } else {
            i = offset - (a["timestamp"] % interval);
          }

          await yam.testing.increaseTime(i);

          let r = await yam.contracts.uni_pair.methods.getReserves().call();
          let q = await yam.contracts.uni_router.methods.quote(yam.toBigN(10**18).toString(), r[0], r[1]).call();
          console.log("quote pre positive rebase", q);

          let b = await yam.contracts.rebaser.methods.rebase().send({
            from: user,
            gas: 2500000
          });

          let bal1 = await yam.contracts.yam.methods.balanceOf(user).call();

          let resYAM = await yam.contracts.yam.methods.balanceOf(yam.contracts.reserves.options.address).call();

          let resycrv = await yam.contracts.ycrv.methods.balanceOf(yam.contracts.reserves.options.address).call();

          expect(yam.toBigN(bal1).toNumber()).toBeLessThan(yam.toBigN(bal).toNumber());
          expect(yam.toBigN(resycrv).toNumber()).toBe(0);

          r = await yam.contracts.uni_pair.methods.getReserves().call();
          q = await yam.contracts.uni_router.methods.quote(yam.toBigN(10**18).toString(), r[0], r[1]).call();
          console.log("quote", q);
          // not below peg
          expect(yam.toBigN(q).toNumber()).toBeLessThan(yam.toBigN(10**18).toNumber());


        await yam.testing.increaseTime(525000 + 100);


        j = await yam.contracts.eth_pool.methods.exit().send({
          from: user,
          gas: 300000
        });
        //console.log(j.events)

        let weth_bal = await yam.contracts.weth.methods.balanceOf(user).call()

        expect(weth_bal).toBe("2000000000000000000000")


        let yam_bal2 = await yam.contracts.yam.methods.balanceOf(user).call()

        let two_fity = yam.toBigN(250).times(yam.toBigN(10**3)).times(yam.toBigN(10**18))
        expect(
          yam.toBigN(yam_bal2).minus(yam.toBigN(yam_bal)).toNumber()
        ).toBeLessThan(two_fity.toNumber())
    });
  });

  describe("yfi", () => {
    test("rewards from pool 1s yfi", async () => {
        await yam.testing.resetEVM("0x2");
        await yam.contracts.yfi.methods.transfer(user, "500000000000000000000").send({
          from: yfi_account
        });

        let a = await yam.web3.eth.getBlock('latest');

        let starttime = await yam.contracts.yfi_pool.methods.starttime().call();

        let waittime = starttime - a["timestamp"];
        if (waittime > 0) {
          await yam.testing.increaseTime(waittime);
        } else {
          console.log("late entry", waittime)
        }

        await yam.contracts.yfi.methods.approve(yam.contracts.yfi_pool.options.address, -1).send({from: user});

        await yam.contracts.yfi_pool.methods.stake(
          "500000000000000000000"
        ).send({
          from: user,
          gas: 300000
        });

        let earned = await yam.contracts.yfi_pool.methods.earned(user).call();

        let rr = await yam.contracts.yfi_pool.methods.rewardRate().call();

        let rpt = await yam.contracts.yfi_pool.methods.rewardPerToken().call();
        //console.log(earned, rr, rpt);
        await yam.testing.increaseTime(625000 + 100);
        // await yam.testing.mineBlock();

        earned = await yam.contracts.yfi_pool.methods.earned(user).call();

        rpt = await yam.contracts.yfi_pool.methods.rewardPerToken().call();

        let ysf = await yam.contracts.yam.methods.yamsScalingFactor().call();

        //console.log(earned, ysf, rpt);


        let yam_bal = await yam.contracts.yam.methods.balanceOf(user).call()

        let j = await yam.contracts.yfi_pool.methods.exit().send({
          from: user,
          gas: 300000
        });

        //console.log(j.events)

        let weth_bal = await yam.contracts.yfi.methods.balanceOf(user).call()

        expect(weth_bal).toBe("500000000000000000000")


        let yam_bal2 = await yam.contracts.yam.methods.balanceOf(user).call()

        let two_fity = yam.toBigN(250).times(yam.toBigN(10**3)).times(yam.toBigN(10**18))
        expect(yam.toBigN(yam_bal2).minus(yam.toBigN(yam_bal)).toString()).toBe(two_fity.times(1).toString())
    });
  });

  describe("comp", () => {
    test("rewards from pool 1s comp", async () => {
        await yam.testing.resetEVM("0x2");
        await yam.contracts.comp.methods.transfer(user, "50000000000000000000000").send({
          from: comp_account
        });

        let a = await yam.web3.eth.getBlock('latest');

        let starttime = await yam.contracts.comp_pool.methods.starttime().call();

        let waittime = starttime - a["timestamp"];
        if (waittime > 0) {
          await yam.testing.increaseTime(waittime);
        } else {
          console.log("late entry", waittime)
        }

        await yam.contracts.comp.methods.approve(yam.contracts.comp_pool.options.address, -1).send({from: user});

        await yam.contracts.comp_pool.methods.stake(
          "50000000000000000000000"
        ).send({
          from: user,
          gas: 300000
        });

        let earned = await yam.contracts.comp_pool.methods.earned(user).call();

        let rr = await yam.contracts.comp_pool.methods.rewardRate().call();

        let rpt = await yam.contracts.comp_pool.methods.rewardPerToken().call();
        //console.log(earned, rr, rpt);
        await yam.testing.increaseTime(625000 + 100);
        // await yam.testing.mineBlock();

        earned = await yam.contracts.comp_pool.methods.earned(user).call();

        rpt = await yam.contracts.comp_pool.methods.rewardPerToken().call();

        let ysf = await yam.contracts.yam.methods.yamsScalingFactor().call();

        //console.log(earned, ysf, rpt);


        let yam_bal = await yam.contracts.yam.methods.balanceOf(user).call()

        let j = await yam.contracts.comp_pool.methods.exit().send({
          from: user,
          gas: 300000
        });

        //console.log(j.events)

        let weth_bal = await yam.contracts.comp.methods.balanceOf(user).call()

        expect(weth_bal).toBe("50000000000000000000000")


        let yam_bal2 = await yam.contracts.yam.methods.balanceOf(user).call()

        let two_fity = yam.toBigN(250).times(yam.toBigN(10**3)).times(yam.toBigN(10**18))
        expect(yam.toBigN(yam_bal2).minus(yam.toBigN(yam_bal)).toString()).toBe(two_fity.times(1).toString())
    });
  });

  describe("lend", () => {
    test("rewards from pool 1s lend", async () => {
        await yam.testing.resetEVM("0x2");
        await yam.web3.eth.sendTransaction({from: user2, to: lend_account, value : yam.toBigN(100000*10**18).toString()});

        await yam.contracts.lend.methods.transfer(user, "10000000000000000000000000").send({
          from: lend_account
        });

        let a = await yam.web3.eth.getBlock('latest');

        let starttime = await yam.contracts.lend_pool.methods.starttime().call();

        let waittime = starttime - a["timestamp"];
        if (waittime > 0) {
          await yam.testing.increaseTime(waittime);
        } else {
          console.log("late entry", waittime)
        }

        await yam.contracts.lend.methods.approve(yam.contracts.lend_pool.options.address, -1).send({from: user});

        await yam.contracts.lend_pool.methods.stake(
          "10000000000000000000000000"
        ).send({
          from: user,
          gas: 300000
        });

        let earned = await yam.contracts.lend_pool.methods.earned(user).call();

        let rr = await yam.contracts.lend_pool.methods.rewardRate().call();

        let rpt = await yam.contracts.lend_pool.methods.rewardPerToken().call();
        //console.log(earned, rr, rpt);
        await yam.testing.increaseTime(625000 + 100);
        // await yam.testing.mineBlock();

        earned = await yam.contracts.lend_pool.methods.earned(user).call();

        rpt = await yam.contracts.lend_pool.methods.rewardPerToken().call();

        let ysf = await yam.contracts.yam.methods.yamsScalingFactor().call();

        //console.log(earned, ysf, rpt);


        let yam_bal = await yam.contracts.yam.methods.balanceOf(user).call()

        let j = await yam.contracts.lend_pool.methods.exit().send({
          from: user,
          gas: 300000
        });

        //console.log(j.events)

        let weth_bal = await yam.contracts.lend.methods.balanceOf(user).call()

        expect(weth_bal).toBe("10000000000000000000000000")


        let yam_bal2 = await yam.contracts.yam.methods.balanceOf(user).call()

        let two_fity = yam.toBigN(250).times(yam.toBigN(10**3)).times(yam.toBigN(10**18))
        expect(yam.toBigN(yam_bal2).minus(yam.toBigN(yam_bal)).toString()).toBe(two_fity.times(1).toString())
    });
  });

  describe("link", () => {
    test("rewards from pool 1s link", async () => {
        await yam.testing.resetEVM("0x2");

        await yam.web3.eth.sendTransaction({from: user2, to: link_account, value : yam.toBigN(100000*10**18).toString()});

        await yam.contracts.link.methods.transfer(user, "10000000000000000000000000").send({
          from: link_account
        });

        let a = await yam.web3.eth.getBlock('latest');

        let starttime = await yam.contracts.link_pool.methods.starttime().call();

        let waittime = starttime - a["timestamp"];
        if (waittime > 0) {
          await yam.testing.increaseTime(waittime);
        } else {
          console.log("late entry", waittime)
        }

        await yam.contracts.link.methods.approve(yam.contracts.link_pool.options.address, -1).send({from: user});

        await yam.contracts.link_pool.methods.stake(
          "10000000000000000000000000"
        ).send({
          from: user,
          gas: 300000
        });

        let earned = await yam.contracts.link_pool.methods.earned(user).call();

        let rr = await yam.contracts.link_pool.methods.rewardRate().call();

        let rpt = await yam.contracts.link_pool.methods.rewardPerToken().call();
        //console.log(earned, rr, rpt);
        await yam.testing.increaseTime(625000 + 100);
        // await yam.testing.mineBlock();

        earned = await yam.contracts.link_pool.methods.earned(user).call();

        rpt = await yam.contracts.link_pool.methods.rewardPerToken().call();

        let ysf = await yam.contracts.yam.methods.yamsScalingFactor().call();

        //console.log(earned, ysf, rpt);


        let yam_bal = await yam.contracts.yam.methods.balanceOf(user).call()

        let j = await yam.contracts.link_pool.methods.exit().send({
          from: user,
          gas: 300000
        });

        //console.log(j.events)

        let weth_bal = await yam.contracts.link.methods.balanceOf(user).call()

        expect(weth_bal).toBe("10000000000000000000000000")


        let yam_bal2 = await yam.contracts.yam.methods.balanceOf(user).call()

        let two_fity = yam.toBigN(250).times(yam.toBigN(10**3)).times(yam.toBigN(10**18))
        expect(yam.toBigN(yam_bal2).minus(yam.toBigN(yam_bal)).toString()).toBe(two_fity.times(1).toString())
    });
  });

  describe("mkr", () => {
    test("rewards from pool 1s mkr", async () => {
        await yam.testing.resetEVM("0x2");
        await yam.web3.eth.sendTransaction({from: user2, to: mkr_account, value : yam.toBigN(100000*10**18).toString()});
        let eth_bal = await yam.web3.eth.getBalance(mkr_account);

        await yam.contracts.mkr.methods.transfer(user, "10000000000000000000000").send({
          from: mkr_account
        });

        let a = await yam.web3.eth.getBlock('latest');

        let starttime = await yam.contracts.mkr_pool.methods.starttime().call();

        let waittime = starttime - a["timestamp"];
        if (waittime > 0) {
          await yam.testing.increaseTime(waittime);
        } else {
          console.log("late entry", waittime)
        }

        await yam.contracts.mkr.methods.approve(yam.contracts.mkr_pool.options.address, -1).send({from: user});

        await yam.contracts.mkr_pool.methods.stake(
          "10000000000000000000000"
        ).send({
          from: user,
          gas: 300000
        });

        let earned = await yam.contracts.mkr_pool.methods.earned(user).call();

        let rr = await yam.contracts.mkr_pool.methods.rewardRate().call();

        let rpt = await yam.contracts.mkr_pool.methods.rewardPerToken().call();
        //console.log(earned, rr, rpt);
        await yam.testing.increaseTime(625000 + 100);
        // await yam.testing.mineBlock();

        earned = await yam.contracts.mkr_pool.methods.earned(user).call();

        rpt = await yam.contracts.mkr_pool.methods.rewardPerToken().call();

        let ysf = await yam.contracts.yam.methods.yamsScalingFactor().call();

        //console.log(earned, ysf, rpt);


        let yam_bal = await yam.contracts.yam.methods.balanceOf(user).call()

        let j = await yam.contracts.mkr_pool.methods.exit().send({
          from: user,
          gas: 300000
        });

        //console.log(j.events)

        let weth_bal = await yam.contracts.mkr.methods.balanceOf(user).call()

        expect(weth_bal).toBe("10000000000000000000000")


        let yam_bal2 = await yam.contracts.yam.methods.balanceOf(user).call()

        let two_fity = yam.toBigN(250).times(yam.toBigN(10**3)).times(yam.toBigN(10**18))
        expect(yam.toBigN(yam_bal2).minus(yam.toBigN(yam_bal)).toString()).toBe(two_fity.times(1).toString())
    });
  });

  describe("snx", () => {
    test("rewards from pool 1s snx", async () => {
        await yam.testing.resetEVM("0x2");

        await yam.web3.eth.sendTransaction({from: user2, to: snx_account, value : yam.toBigN(100000*10**18).toString()});

        let snx_bal = await yam.contracts.snx.methods.balanceOf(snx_account).call();

        console.log(snx_bal)

        await yam.contracts.snx.methods.transfer(user, snx_bal).send({
          from: snx_account
        });

        snx_bal = await yam.contracts.snx.methods.balanceOf(user).call();

        console.log(snx_bal)

        let a = await yam.web3.eth.getBlock('latest');

        let starttime = await yam.contracts.snx_pool.methods.starttime().call();

        let waittime = starttime - a["timestamp"];
        if (waittime > 0) {
          await yam.testing.increaseTime(waittime);
        } else {
          console.log("late entry", waittime)
        }

        await yam.contracts.snx.methods.approve(yam.contracts.snx_pool.options.address, -1).send({from: user});

        await yam.contracts.snx_pool.methods.stake(
          snx_bal
        ).send({
          from: user,
          gas: 300000
        });

        let earned = await yam.contracts.snx_pool.methods.earned(user).call();

        let rr = await yam.contracts.snx_pool.methods.rewardRate().call();

        let rpt = await yam.contracts.snx_pool.methods.rewardPerToken().call();
        //console.log(earned, rr, rpt);
        await yam.testing.increaseTime(625000 + 100);
        // await yam.testing.mineBlock();

        earned = await yam.contracts.snx_pool.methods.earned(user).call();

        rpt = await yam.contracts.snx_pool.methods.rewardPerToken().call();

        let ysf = await yam.contracts.yam.methods.yamsScalingFactor().call();

        //console.log(earned, ysf, rpt);


        let yam_bal = await yam.contracts.yam.methods.balanceOf(user).call()

        let j = await yam.contracts.snx_pool.methods.exit().send({
          from: user,
          gas: 300000
        });

        //console.log(j.events)

        let weth_bal = await yam.contracts.snx.methods.balanceOf(user).call()

        expect(weth_bal).toBe(snx_bal)


        let yam_bal2 = await yam.contracts.yam.methods.balanceOf(user).call()

        let two_fity = yam.toBigN(250).times(yam.toBigN(10**3)).times(yam.toBigN(10**18))
        expect(yam.toBigN(yam_bal2).minus(yam.toBigN(yam_bal)).toString()).toBe(two_fity.times(1).toString())
    });
  });
})
