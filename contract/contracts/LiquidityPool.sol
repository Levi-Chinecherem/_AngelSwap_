// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IAngelToken {
    function mint(address to, uint256 amount) external;
}

contract LiquidityPool is Ownable {
    IAngelToken public token1; // Main token (e.g., ANGEL token)
    IERC20 public token2; // Secondary token
    uint256 public totalLiquidity1;
    uint256 public totalLiquidity2;

    mapping(address => uint256) public userLiquidity1;
    mapping(address => uint256) public userLiquidity2;
    mapping(address => uint256) public lastRewardTime;
    mapping(address => bool) public securityToggled; // Tracks user's security preference (default off)
    mapping(bytes32 => Transaction) public transactions; // Track hashed transactions

    uint256 public rewardRate = 1; // Reward rate (ANGEL tokens per 24 hours per liquidity share)
    uint256 public delayTime = 5; // Time delay for transaction revealing (in seconds)

    struct Transaction {
        address user;
        uint256 amountIn;
        uint256 amountOut;
        uint256 timestamp;
        bool isPrivate;
    }

    event SecurityToggled(address indexed user, bool isEnabled);
    event SwapSubmitted(bytes32 indexed txHash, address indexed user, uint256 amountIn, uint256 timestamp, bool isPrivate);
    event SwapRevealed(bytes32 indexed txHash, address indexed user, uint256 amountIn, uint256 amountOut);
    event ProvideLiquidity(address indexed provider, uint256 amount1, uint256 amount2);
    event RemoveLiquidity(address indexed provider, uint256 amount1, uint256 amount2);
    event RewardsDistributed(address indexed provider, uint256 rewardAmount);

    constructor(address _token1, address _token2) {
        token1 = IAngelToken(_token1);
        token2 = IERC20(_token2);
    }

    // Enable or disable security for a user (default: off)
    function toggleSecurity(bool enabled) external {
        securityToggled[msg.sender] = enabled;
        emit SecurityToggled(msg.sender, enabled);
    }

    // Function to swap tokens
    function swap(address fromToken, uint256 amountIn) external {
        require(fromToken == address(token1) || fromToken == address(token2), "Invalid token");

        uint256 amountOut;
        if (fromToken == address(token1)) {
            amountOut = getAmountOut(amountIn, totalLiquidity1, totalLiquidity2);
            token1.transferFrom(msg.sender, address(this), amountIn);
            token2.transfer(msg.sender, amountOut);
            totalLiquidity1 += amountIn;
            totalLiquidity2 -= amountOut;
        } else {
            amountOut = getAmountOut(amountIn, totalLiquidity2, totalLiquidity1);
            token2.transferFrom(msg.sender, address(this), amountIn);
            token1.transfer(msg.sender, amountOut);
            totalLiquidity2 += amountIn;
            totalLiquidity1 -= amountOut;
        }

        if (securityToggled[msg.sender]) {
            // If security is enabled, hash the transaction
            bytes32 txHash = keccak256(abi.encodePacked(msg.sender, amountIn, amountOut, block.timestamp));
            transactions[txHash] = Transaction({
                user: msg.sender,
                amountIn: amountIn,
                amountOut: amountOut,
                timestamp: block.timestamp,
                isPrivate: true
            });

            emit SwapSubmitted(txHash, msg.sender, amountIn, block.timestamp, true);
        } else {
            // Security off: Directly reveal the transaction
            emit SwapRevealed(bytes32(0), msg.sender, amountIn, amountOut);
        }
    }

    // Function to reveal swap details after a delay
    function revealTransaction(bytes32 txHash) external {
        Transaction memory txData = transactions[txHash];
        require(txData.user == msg.sender, "Only the user can reveal the transaction");
        require(block.timestamp >= txData.timestamp + delayTime, "Transaction is still private");

        emit SwapRevealed(txHash, txData.user, txData.amountIn, txData.amountOut);
        delete transactions[txHash];
    }

    // Function to provide liquidity
    function provideLiquidity(uint256 amount1, uint256 amount2) external {
        token1.transferFrom(msg.sender, address(this), amount1);
        token2.transferFrom(msg.sender, address(this), amount2);

        totalLiquidity1 += amount1;
        totalLiquidity2 += amount2;

        userLiquidity1[msg.sender] += amount1;
        userLiquidity2[msg.sender] += amount2;
        lastRewardTime[msg.sender] = block.timestamp;

        emit ProvideLiquidity(msg.sender, amount1, amount2);
    }

    // Function to remove liquidity
    function removeLiquidity(uint256 amount1, uint256 amount2) external {
        require(userLiquidity1[msg.sender] >= amount1, "Insufficient liquidity in token1");
        require(userLiquidity2[msg.sender] >= amount2, "Insufficient liquidity in token2");

        totalLiquidity1 -= amount1;
        totalLiquidity2 -= amount2;

        userLiquidity1[msg.sender] -= amount1;
        userLiquidity2[msg.sender] -= amount2;

        token1.transfer(msg.sender, amount1);
        token2.transfer(msg.sender, amount2);
        lastRewardTime[msg.sender] = 0;

        emit RemoveLiquidity(msg.sender, amount1, amount2);
    }

    // Function to calculate pending rewards
    function calculatePendingRewards(address user) public view returns (uint256) {
        uint256 timeElapsed = block.timestamp - lastRewardTime[user];
        uint256 userLiquidity = userLiquidity1[user] + userLiquidity2[user];
        uint256 pendingRewards = (userLiquidity * rewardRate * timeElapsed) / 1 days;
        return pendingRewards;
    }

    // Function to distribute rewards (mint ANGEL tokens)
    function distributeRewards() external {
        require(userLiquidity1[msg.sender] + userLiquidity2[msg.sender] > 0, "No liquidity provided");

        uint256 pendingRewards = calculatePendingRewards(msg.sender);
        require(pendingRewards > 0, "No rewards available");

        token1.mint(msg.sender, pendingRewards); // Mint ANGEL tokens as rewards
        lastRewardTime[msg.sender] = block.timestamp;

        emit RewardsDistributed(msg.sender, pendingRewards);
    }

    function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut) public pure returns (uint256) {
        require(amountIn > 0, "Invalid input amount");
        uint256 numerator = amountIn * reserveOut;
        uint256 denominator = reserveIn + amountIn;
        return numerator / denominator;
    }
}
