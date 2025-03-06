// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ISecurity {
    struct Transaction {
        address user;
        uint256 amount;
        uint256 timestamp;
        bool isPrivate;
    }

    function submitTransaction(uint256 amount, bool isPrivate) external;
    function revealTransaction(bytes32 txHash) external;
    function getTransaction(bytes32 txHash) external view returns (Transaction memory);
}
