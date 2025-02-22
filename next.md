first we need to add get all tokens functions to the liquidity pool and also same to the orderbook, because we need to list out the tokens for the user to be able to do anything with it
next we need to add slipage so that user can set a certain slipage level for their trade

here are my contracts

LiquidityPool.sol
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

LiquidityPoolFactory.sol
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

OrderBook.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract OrderBook is Ownable {
    struct Order {
        address user;
        address token;
        uint256 amount;
        uint256 price;
        bool isBuyOrder;
        bool isPrivate;
        uint256 timestamp;
    }

    constructor() Ownable(msg.sender) {
        // msg.sender is automatically set as the owner
    }
    
    struct Transaction {
        address user;
        uint256 orderId;
        uint256 amount;
        uint256 timestamp;
        bool isPrivate;
    }

    mapping(uint256 => Order) public orders;
    mapping(bytes32 => Transaction) public transactions; // Tracks private transactions
    mapping(address => bool) public securityToggled; // Tracks user security preference (default off)
    uint256 public orderCount;
    uint256 public delayTime = 5; // Time delay for unhashing transactions (seconds)

    // Events
    event SecurityToggled(address indexed user, bool isEnabled);
    event OrderPlaced(uint256 indexed orderId, address indexed user, address indexed token, uint256 amount, uint256 price, bool isBuyOrder, bool isPrivate);
    event OrderExecuted(uint256 indexed orderId, address indexed executor, uint256 amount);
    event OrderCancelled(uint256 indexed orderId, address indexed user);
    event TransactionSubmitted(bytes32 indexed txHash, address indexed user, uint256 orderId, uint256 amount, uint256 timestamp, bool isPrivate);
    event TransactionRevealed(bytes32 indexed txHash, address indexed user);

    // Enable or disable security for a user (default: off)
    function toggleSecurity(bool enabled) external {
        securityToggled[msg.sender] = enabled;
        emit SecurityToggled(msg.sender, enabled);
    }

    // Place a new order (buy/sell)
    function placeOrder(address token, uint256 amount, uint256 price, bool isBuyOrder) external {
        orderCount++;
        bool isPrivate = securityToggled[msg.sender];

        orders[orderCount] = Order({
            user: msg.sender,
            token: token,
            amount: amount,
            price: price,
            isBuyOrder: isBuyOrder,
            isPrivate: isPrivate,
            timestamp: block.timestamp
        });

        emit OrderPlaced(orderCount, msg.sender, token, amount, price, isBuyOrder, isPrivate);
    }

    // Execute an order based on market conditions
    function executeOrder(uint256 orderId, uint256 marketLiquidity1, uint256 marketLiquidity2) external {
        Order storage order = orders[orderId];
        require(order.amount > 0, "Order does not exist");

        uint256 currentPrice = getAmountOut(order.amount, marketLiquidity1, marketLiquidity2);
        bool conditionsMet = (order.isBuyOrder && currentPrice <= order.price) || (!order.isBuyOrder && currentPrice >= order.price);
        require(conditionsMet, "Order conditions not met");

        if (order.isPrivate) {
            bytes32 txHash = keccak256(abi.encodePacked(msg.sender, orderId, order.amount, block.timestamp));
            transactions[txHash] = Transaction({
                user: msg.sender,
                orderId: orderId,
                amount: order.amount,
                timestamp: block.timestamp,
                isPrivate: true
            });

            emit TransactionSubmitted(txHash, msg.sender, orderId, order.amount, block.timestamp, true);
        }

        // Execute trade (token transfer logic)
        if (order.isBuyOrder) {
            IERC20(order.token).transferFrom(order.user, msg.sender, order.amount);
        } else {
            IERC20(order.token).transferFrom(msg.sender, order.user, order.amount);
        }

        emit OrderExecuted(orderId, msg.sender, order.amount);
        delete orders[orderId];
    }

    // Cancel an existing order
    function cancelOrder(uint256 orderId) external {
        Order storage order = orders[orderId];
        require(order.amount > 0, "Order does not exist");
        require(order.user == msg.sender, "Only the order creator can cancel");

        emit OrderCancelled(orderId, msg.sender);
        delete orders[orderId];
    }

    // Reveal a private transaction after a delay
    function revealTransaction(bytes32 txHash) external {
        Transaction memory txData = transactions[txHash];
        require(txData.user == msg.sender, "Only the user can reveal this transaction");
        require(block.timestamp >= txData.timestamp + delayTime, "Transaction is still private");

        emit TransactionRevealed(txHash, txData.user);
        delete transactions[txHash];
    }

    // Calculate market price using liquidity reserves
    function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut) public pure returns (uint256) {
        require(amountIn > 0, "Invalid input amount");
        uint256 numerator = amountIn * reserveOut;
        uint256 denominator = reserveIn + amountIn;
        return numerator / denominator;
    }
}


i dont know the exact best way you will include those token list so that i can get them at the frontend to display them, so any best way you feel is the best approach to get them done lets go ahead with that 
tell me about it first lets have an agreement before you provide me the working code