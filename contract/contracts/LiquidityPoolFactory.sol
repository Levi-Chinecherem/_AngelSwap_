// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./LiquidityPool.sol";

contract LiquidityPoolFactory {
    address[] public allLiquidityPools;
    uint256 public poolCount;

    event LiquidityPoolCreated(address indexed creator, address indexed liquidityPool, uint256 poolCount);

    function createLiquidityPool(address token1, address token2) external {
        // Deploy a new LiquidityPool contract
        LiquidityPool newPool = new LiquidityPool();

        // Transfer ownership of the pool to the caller (optional)
        newPool.transferOwnership(msg.sender);

        // Initialize the pool with tokens
        newPool.initialize(token1, token2);

        // Store the pool's address
        allLiquidityPools.push(address(newPool));
        poolCount++;

        emit LiquidityPoolCreated(msg.sender, address(newPool), poolCount);
    }

    function getAllLiquidityPools() external view returns (address[] memory) {
        return allLiquidityPools;
    }
}
