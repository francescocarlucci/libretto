// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

contract LibrettoGiftable {
    address payable public immutable owner;
    address payable public beneficiary;
    uint256 public immutable unlockTime;

    constructor(uint256 _unlockInYears, address payable _beneficiary) {
        require(_beneficiary != address(0), "Invalid beneficiary");
        owner = payable(msg.sender);
        beneficiary = _beneficiary;
        unlockTime = block.timestamp + (_unlockInYears * 365 days);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Abort: caller is not the owner");
        _;
    }

    modifier onlyBeneficiary() {
        require(msg.sender == beneficiary, "Abort: caller is not the beneficiary");
        _;
    }

    modifier onlyIfUnlocked() {
        require(block.timestamp > unlockTime, "Abort: funds are still locked");
        _;
    }

    event Deposit(address indexed from, uint256 amount);
    event Withdraw(address indexed to, uint256 amount);
    event BeneficiaryChanged(address indexed oldBeneficiary, address indexed newBeneficiary);

    function withdraw() external onlyBeneficiary onlyIfUnlocked {
        uint256 balance = address(this).balance;

        (bool ok, ) = beneficiary.call{value: balance}("");
        require(ok, "Failed: ETH transfer failed");

        emit Withdraw(beneficiary, balance);
    }

    function updateBeneficiary(address payable newBeneficiary) external onlyOwner {
        require(newBeneficiary != address(0), "Invalid beneficiary");

        address oldBeneficiary = beneficiary;
        beneficiary = newBeneficiary;

        emit BeneficiaryChanged(oldBeneficiary, newBeneficiary);
    }

    receive() external payable {
        emit Deposit(msg.sender, msg.value);
    }
}
