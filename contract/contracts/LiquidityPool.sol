// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract LiquidityPool is Ownable, ReentrancyGuard {
    IERC20 public token1; // Main token
    IERC20 public token2; // Secondary token
    uint256 public totalLiquidity1;
    uint256 public totalLiquidity2;

    mapping(address => uint256) public userLiquidity1;
    mapping(address => uint256) public userLiquidity2;
    mapping(address => uint256) public lastRewardTime;
    mapping(address => bool) public securityToggled; // Tracks user's security preference
    mapping(bytes32 => Transaction) public transactions; // Track hashed transactions

    uint256 public rewardRate = 1; // Reward rate (tokens per 24 hours per liquidity share)
    uint256 public delayTime = 5; // Time delay for transaction revealing (in seconds)

    bool public isInitialized; // Ensures the pool is initialized only once

    uint256 public feeRate = 20; // Fee rate in basis points (0.2%)

    constructor() Ownable(msg.sender) {
        // msg.sender is automatically set as the owner
    }

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
    event RewardsDeposited(uint256 amount);
    event Initialized(address indexed token1, address indexed token2);

    modifier onlyInitialized() {
        require(isInitialized, "Liquidity pool not initialized");
        _;
    }

    // Initialize the pool with token addresses
    function initialize(address _token1, address _token2) external onlyOwner {
        require(!isInitialized, "Already initialized");
        require(_token1 != address(0) && _token2 != address(0), "Invalid token addresses");

        token1 = IERC20(_token1);
        token2 = IERC20(_token2);
        isInitialized = true;

        emit Initialized(_token1, _token2);
    }

    function toggleSecurity(bool enabled) external {
        securityToggled[msg.sender] = enabled;
        emit SecurityToggled(msg.sender, enabled);
    }

    function depositRewards(uint256 amount) external onlyOwner onlyInitialized {
        require(amount > 0, "Amount must be greater than zero");
        require(token1.transferFrom(msg.sender, address(this), amount), "Reward deposit failed");
        emit RewardsDeposited(amount);
    }

    function swap(address fromToken, uint256 amountIn, uint256 minAmountOut) external nonReentrant onlyInitialized {
        require(fromToken == address(token1) || fromToken == address(token2), "Invalid token");
        require(amountIn > 0, "Amount must be greater than zero");

        uint256 amountOut;
        uint256 fee = (amountIn * feeRate) / 10000; // Calculate the fee (0.2%)
        uint256 netAmountIn = amountIn - fee;

        if (fromToken == address(token1)) {
            amountOut = getAmountOut(netAmountIn, totalLiquidity1, totalLiquidity2);
            require(amountOut >= minAmountOut, "Slippage protection failed");

            require(token1.transferFrom(msg.sender, address(this), amountIn), "Token transfer failed");
            require(token2.transfer(msg.sender, amountOut), "Token transfer failed");

            totalLiquidity1 += netAmountIn;
            totalLiquidity2 -= amountOut;
        } else {
            amountOut = getAmountOut(netAmountIn, totalLiquidity2, totalLiquidity1);
            require(amountOut >= minAmountOut, "Slippage protection failed");

            require(token2.transferFrom(msg.sender, address(this), amountIn), "Token transfer failed");
            require(token1.transfer(msg.sender, amountOut), "Token transfer failed");

            totalLiquidity2 += netAmountIn;
            totalLiquidity1 -= amountOut;
        }

        if (securityToggled[msg.sender]) {
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
            emit SwapRevealed(bytes32(0), msg.sender, amountIn, amountOut);
        }
    }

    function revealTransaction(bytes32 txHash) external onlyInitialized {
        Transaction memory txData = transactions[txHash];
        require(txData.user == msg.sender, "Unauthorized transaction reveal");
        require(block.timestamp >= txData.timestamp + delayTime, "Reveal delay not met");

        emit SwapRevealed(txHash, txData.user, txData.amountIn, txData.amountOut);
        delete transactions[txHash];
    }

    function provideLiquidity(uint256 amount1, uint256 amount2) external nonReentrant onlyInitialized {
        require(amount1 > 0 && amount2 > 0, "Amounts must be greater than zero");
        require(token1.transferFrom(msg.sender, address(this), amount1), "Token1 transfer failed");
        require(token2.transferFrom(msg.sender, address(this), amount2), "Token2 transfer failed");

        totalLiquidity1 += amount1;
        totalLiquidity2 += amount2;

        userLiquidity1[msg.sender] += amount1;
        userLiquidity2[msg.sender] += amount2;
        lastRewardTime[msg.sender] = block.timestamp;

        emit ProvideLiquidity(msg.sender, amount1, amount2);
    }

    function removeLiquidity(uint256 amount1, uint256 amount2) external nonReentrant onlyInitialized {
        require(userLiquidity1[msg.sender] >= amount1, "Insufficient liquidity in token1");
        require(userLiquidity2[msg.sender] >= amount2, "Insufficient liquidity in token2");

        totalLiquidity1 -= amount1;
        totalLiquidity2 -= amount2;

        userLiquidity1[msg.sender] -= amount1;
        userLiquidity2[msg.sender] -= amount2;

        require(token1.transfer(msg.sender, amount1), "Token1 transfer failed");
        require(token2.transfer(msg.sender, amount2), "Token2 transfer failed");

        emit RemoveLiquidity(msg.sender, amount1, amount2);
    }

    function calculatePendingRewards(address user) public view onlyInitialized returns (uint256) {
        uint256 timeElapsed = block.timestamp - lastRewardTime[user];
        uint256 userLiquidity = userLiquidity1[user] + userLiquidity2[user];
        uint256 pendingRewards = (userLiquidity * rewardRate * timeElapsed) / 1 days;
        return pendingRewards;
    }

    function distributeRewards() external nonReentrant onlyInitialized {
        require(userLiquidity1[msg.sender] + userLiquidity2[msg.sender] > 0, "No liquidity provided");

        uint256 pendingRewards = calculatePendingRewards(msg.sender);
        require(pendingRewards > 0, "No rewards available");

        require(token1.transfer(msg.sender, pendingRewards), "Reward transfer failed");
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
