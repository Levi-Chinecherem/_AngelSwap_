// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Security {
    struct Transaction {
        address user;
        uint256 amount;
        uint256 timestamp;
        bool isPrivate;
    }

    mapping(bytes32 => Transaction) public transactions;
    uint256 public delayTime = 5; // Delay for unhashing (in seconds)

    event TransactionSubmitted(bytes32 indexed txHash, address indexed user, uint256 amount, uint256 timestamp, bool isPrivate);
    event TransactionRevealed(bytes32 indexed txHash);

    function submitTransaction(uint256 amount, bool isPrivate) external {
        bytes32 txHash = keccak256(abi.encodePacked(msg.sender, amount, block.timestamp));
        transactions[txHash] = Transaction({
            user: msg.sender,
            amount: amount,
            timestamp: block.timestamp,
            isPrivate: isPrivate
        });

        emit TransactionSubmitted(txHash, msg.sender, amount, block.timestamp, isPrivate);
    }

    function revealTransaction(bytes32 txHash) external {
        require(block.timestamp >= transactions[txHash].timestamp + delayTime, "Transaction is still private");
        require(msg.sender == transactions[txHash].user, "Only the user can reveal the transaction");

        emit TransactionRevealed(txHash);
        delete transactions[txHash];
    }
}
