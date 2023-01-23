import { expect, assert } from "chai";
import { ethers } from "hardhat";
import { Staking } from "../typechain-types/contracts/Staking"

describe("Staking contract", function () {
  let staking: Staking;

  beforeEach(async function () {
    [this.owner, this.addr1, ...this.addrs] = await ethers.getSigners(); // on recupère les addresses de la blockchain local hardhat (à lancer d'abord)
    const Staking = await ethers.getContractFactory("Staking");
    staking = await Staking.deploy();
  })

  describe("constructor testing", function () {
    it("should create djeToken with 1000000 supply", async function () {
      let tokenName: string = await staking.name()
      assert.equal(tokenName, "djeToken")
      let balanceOfOwner: string = await (await staking.balanceOf(this.owner.address)).toString()
      let awaitedBalance: string = ethers.utils.parseEther("1000000").toString()
      assert.equal(balanceOfOwner, awaitedBalance);
    })
  })

  describe("mint function testing", function () {
    it("should revert if not the owner", async function () {
      await expect(staking.connect(this.addr1).mint(this.addr1.address, ethers.BigNumber.from("1000000"))).to.be.revertedWith("Ownable: caller is not the owner")
    })
    it("should mint 1000000 to addr1", async function () {
      await staking.mint(this.addr1.address, ethers.BigNumber.from("1000000"));
      let awaitedBalance: string = await (await staking.balanceOf(this.addr1.address)).toString();
      assert.equal(awaitedBalance, "1000000");
    })
    it("should emit a event with data of mint", async function () {
      await expect(staking.mint(this.addr1.address, ethers.BigNumber.from("1000000")))
        .to.emit(staking, "tokenMinted")
        .withArgs(this.addr1.address, 1000000);
    })
  })

  describe("stake function testing", function () {
    it("should revert if not enough token", async function () {
      await expect(staking.stake(ethers.utils.parseEther("2000000"))).to.be.revertedWith("not enough token")
    })
    it("should transfert the amount to the contract address", async function () {
      await staking.stake(ethers.BigNumber.from('500000'))
      let contractBalance: string = await (await staking.balanceOf(staking.address)).toString()
      assert.equal(contractBalance, '500000')
    })
    it("should update the staking account of the user", async function () {
      await staking.stake(ethers.BigNumber.from('500000'))
      let stakedAmount: string = await (await staking.stakingBalance(this.owner.address)).toString()
      assert.equal(stakedAmount, "500000")
    })
    it("should emit an event of the updated staking balance", async function () {
      await expect(staking.stake(ethers.BigNumber.from("500000"))).to.emit(staking, "stakingBalanceUpdate").withArgs(this.owner.address, 500000)
    })
  })

  describe("unstake function testing", function () {
    beforeEach(async function () {
      await staking.stake(ethers.utils.parseEther("500000"))
    })
    it("should revert if not enought token to unstake", async function () {
      await expect(staking.unstake(staking.address, ethers.utils.parseEther("700000"))).to.be.revertedWith("not enough token")
    })
    it("should transfer token to user account", async function () {
      await staking.unstake(staking.address, ethers.utils.parseEther("200000"))
      let updatedBalance: string = await (await staking.balanceOf(this.owner.address)).toString()
      // console.log("updateBalance=>", updatedBalance)
      assert.equal(updatedBalance, ethers.utils.parseEther("700000").toString())
    })
    it("should decrease user's staked token balance", async function () {
      await staking.unstake(staking.address, ethers.utils.parseEther("200000"))
      let updatedBalance: string = await (await staking.stakingBalance(this.owner.address)).toString()
      // console.log("updateBalance=>", updatedBalance)
      assert.equal(updatedBalance, ethers.utils.parseEther("300000").toString())
    })
    it("should emit an event of the updated staking balance", async function () {
      await expect(staking.unstake(staking.address, ethers.utils.parseEther("200000"))).to.emit(staking, "stakingBalanceUpdate").withArgs(this.owner.address, ethers.utils.parseEther("300000"))
    })
  })

  describe("getStakedBalance function testing", function () {
    beforeEach(async function () {
      await staking.stake(ethers.utils.parseEther("500000"))
    })
    it("should emit an event of the staking balance", async function () {
      let balance = await (await staking.getStakedBalance(this.owner.address)).toString()
      assert.equal(balance, ethers.utils.parseEther("500000").toString())
    })
  })


});
