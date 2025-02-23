// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./LiquidityPool.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LiquidityPoolFactory is Ownable {
    address[] public allLiquidityPools;
    mapping(address => bool) public isValidPool;
    uint256 public poolCount;

    // Mapping to track token pairs to their pools
    mapping(address => mapping(address => address)) public getPool;

    event LiquidityPoolCreated(address indexed creator, address indexed liquidityPool, uint256 poolCount);

    constructor() Ownable(msg.sender) {}

    function createLiquidityPool(address token1, address token2) external {
        require(token1 != address(0) && token2 != address(0), "Invalid token address");
        require(token1 != token2, "Identical tokens");
        require(getPool[token1][token2] == address(0), "Pool exists");

        // Deploy a new LiquidityPool contract
        LiquidityPool newPool = new LiquidityPool();
        
        // Initialize the pool with tokens while factory still owns it
        newPool.initialize(token1, token2);

        // Store the pool's address
        address poolAddress = address(newPool);
        allLiquidityPools.push(poolAddress);
        isValidPool[poolAddress] = true;
        
        // Map both token combinations to this pool
        getPool[token1][token2] = poolAddress;
        getPool[token2][token1] = poolAddress;
        
        poolCount++;

        // Transfer ownership to the caller after setup
        newPool.transferOwnership(msg.sender);

        emit LiquidityPoolCreated(msg.sender, poolAddress, poolCount);
    }

    function getAllLiquidityPools() external view returns (address[] memory) {
        return allLiquidityPools;
    }

    function getPoolByTokens(address token1, address token2) external view returns (address) {
        return getPool[token1][token2];
    }

    function isPoolValid(address pool) external view returns (bool) {
        return isValidPool[pool];
    }

    // Get the number of pools
    function getPoolCount() external view returns (uint256) {
        return poolCount;
    }
}