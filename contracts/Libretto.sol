// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

contract Libretto {
    address payable public immutable owner;
    uint256 public immutable unlockTime;

    constructor(uint256 _unlockInYears) {
        owner = payable(msg.sender);
        unlockTime = block.timestamp + (_unlockInYears * 365 days);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Abort: caller is not the owner");
        _;
    }

    modifier onlyIfUnlocked() {
        require(block.timestamp > unlockTime, "Abort: funds are still locked");
        _;
    }

    event Deposit(address indexed from, uint256 amount);
    event Withdraw(address indexed to, uint256 amount);

    function withdraw() external onlyOwner onlyIfUnlocked {
        uint256 balance = address(this).balance;

        (bool ok, ) = owner.call{value: balance}("");
        require(ok, "Failed: ETH transfer failed");

        emit Withdraw(owner, balance);
    }

    receive() external payable {
        emit Deposit(msg.sender, msg.value);
    }
}
