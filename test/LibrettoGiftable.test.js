const { expect } = require("chai");
const { time, expectRevert } = require("@openzeppelin/test-helpers");

const LibrettoGiftable = artifacts.require("LibrettoGiftable");

contract("LibrettoGiftable", ([owner, beneficiary, alice]) => {
  let libretto;
  const unlockYears = 1;
  const unlockSeconds = 365 * 24 * 60 * 60;
  const depositAmount = web3.utils.toWei("2", "ether");

  beforeEach(async () => {
    libretto = await LibrettoGiftable.new(
      unlockYears,
      beneficiary,
      { from: owner }
    );
  });

  describe("Deployment", () => {
    it("sets owner correctly", async () => {
      expect(await libretto.owner()).to.equal(owner);
    });

    it("sets beneficiary correctly", async () => {
      expect(await libretto.beneficiary()).to.equal(beneficiary);
    });

    it("sets unlockTime in the future", async () => {
      const now = (await web3.eth.getBlock("latest")).timestamp;
      const unlockTime = await libretto.unlockTime();
      expect(unlockTime.toNumber()).to.be.gt(now);
    });
  });

  describe("Deposits", () => {
    it("accepts ETH deposits", async () => {
      await web3.eth.sendTransaction({
        from: alice,
        to: libretto.address,
        value: depositAmount,
      });

      const balance = await web3.eth.getBalance(libretto.address);
      expect(balance).to.equal(depositAmount);
    });
  });

  describe("Withdrawals", () => {
    beforeEach(async () => {
      await web3.eth.sendTransaction({
        from: alice,
        to: libretto.address,
        value: depositAmount,
      });
    });

    it("rejects withdraw before unlock", async () => {
      await expectRevert(
        libretto.withdraw({ from: beneficiary }),
        "Abort: funds are still locked"
      );
    });

    it("rejects withdraw by non-beneficiary", async () => {
      await time.increase(unlockSeconds + 1);

      await expectRevert(
        libretto.withdraw({ from: alice }),
        "Abort: caller is not the beneficiary"
      );
    });

    it("allows beneficiary to withdraw after unlock", async () => {
      await time.increase(unlockSeconds + 1);

      await libretto.withdraw({ from: beneficiary });

      const contractBalance = await web3.eth.getBalance(libretto.address);
      expect(contractBalance).to.equal("0");
    });

    it("does not allow owner to withdraw unless owner is beneficiary", async () => {
      await time.increase(unlockSeconds + 1);

      await expectRevert(
        libretto.withdraw({ from: owner }),
        "Abort: caller is not the beneficiary"
      );
    });
  });

  describe("Beneficiary updates", () => {
    it("allows owner to update beneficiary", async () => {
      await libretto.updateBeneficiary(owner, { from: owner });
      expect(await libretto.beneficiary()).to.equal(owner);
    });

    it("emits BeneficiaryChanged event", async () => {
      const receipt = await libretto.updateBeneficiary(owner, { from: owner });

      const event = receipt.logs.find(e => e.event === "BeneficiaryChanged");
      expect(event.args.oldBeneficiary).to.equal(beneficiary);
      expect(event.args.newBeneficiary).to.equal(owner);
    });

    it("rejects beneficiary update by non-owner", async () => {
      await expectRevert(
        libretto.updateBeneficiary(alice, { from: alice }),
        "Abort: caller is not the owner"
      );
    });

    it("allows owner to regain withdrawal power by setting self as beneficiary", async () => {
      await libretto.updateBeneficiary(owner, { from: owner });
      await time.increase(unlockSeconds + 1);

      await libretto.withdraw({ from: owner });

      const contractBalance = await web3.eth.getBalance(libretto.address);
      expect(contractBalance).to.equal("0");
    });
  });
});
