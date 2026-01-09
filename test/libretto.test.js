const { expectRevert, time } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const Libretto = artifacts.require("Libretto");

// This describes the test suite for the Libretto contract
contract("Libretto", (accounts) => {
    const [owner, user] = accounts; // account[0] is owner (deployer), account[1] is test user

    let libretto;
    const unlockYears = 1;

    beforeEach(async () => {
        libretto = await Libretto.new(unlockYears);
    });

    it("should set the correct owner and unlock time", async () => {
        // Check owner is correctly set
        expect(await libretto.owner()).to.equal(owner);

        // Check unlockTime is in the future relative to now
        const unlockTime = await libretto.unlockTime();
        const now = Math.floor(Date.now() / 1000);
        expect(unlockTime.toNumber()).to.be.above(now);
    });

    it("should accept ETH deposits", async () => {
        const depositAmount = web3.utils.toWei("1", "ether");

        // Send 1 ETH from user to the Libretto contract
        await web3.eth.sendTransaction({
            from: user,
            to: libretto.address,
            value: depositAmount
        });

        // Check contract balance increased
        const balance = await web3.eth.getBalance(libretto.address);
        expect(balance.toString()).to.equal(depositAmount);
    });

    it("should not allow withdrawal before unlock", async () => {
        // Attempting to withdraw immediately should revert
        await expectRevert(
            libretto.withdraw({ from: owner }),
            "Abort: funds are still locked"
        );
    });

    it("should not allow non-owner to withdraw", async () => {
        // User (non-owner) tries to withdraw → should revert
        await expectRevert(
            libretto.withdraw({ from: user }),
            "Abort: caller is not the owner"
        );
    });

    it("should allow withdrawal after unlock", async () => {
        const depositAmount = web3.utils.toWei("2", "ether");

        // Deposit ETH first
        await web3.eth.sendTransaction({ from: user, to: libretto.address, value: depositAmount });

        // Move blockchain time forward past unlock
        await time.increase(time.duration.years(unlockYears + 1));

        // Capture owner's initial ETH balance
        const initialOwnerBalance = web3.utils.toBN(await web3.eth.getBalance(owner));

        // Withdraw funds
        const tx = await libretto.withdraw({ from: owner });

        // Calculate gas used to account for ETH spent
        const gasUsed = web3.utils.toBN(tx.receipt.gasUsed);
        const txDetails = await web3.eth.getTransaction(tx.tx);
        const gasPrice = web3.utils.toBN(txDetails.gasPrice);
        const gasCost = gasUsed.mul(gasPrice);

        // Owner's final balance
        const finalOwnerBalance = web3.utils.toBN(await web3.eth.getBalance(owner));

        // Check that owner received exactly the deposited amount minus gas cost
        expect(finalOwnerBalance.sub(initialOwnerBalance).add(gasCost).toString()).to.equal(depositAmount);

        // Contract balance should now be zero
        const finalBalance = await web3.eth.getBalance(libretto.address);
        expect(finalBalance.toString()).to.equal("0");
    });

    it("should emit Withdraw event when withdrawing", async () => {
        const depositAmount = web3.utils.toWei("1", "ether");

        // Deposit first
        await web3.eth.sendTransaction({ from: user, to: libretto.address, value: depositAmount });

        // Fast-forward time
        await time.increase(time.duration.years(unlockYears + 1));

        // Withdraw and capture transaction logs
        const tx = await libretto.withdraw({ from: owner });
        const logs = tx.logs;

        // Check the Withdraw event exists and has correct values
        expect(logs.length).to.be.above(0);
        expect(logs[0].event).to.equal("Withdraw");
        expect(logs[0].args.to).to.equal(owner);
        expect(logs[0].args.amount.toString()).to.equal(depositAmount);
    });
});
