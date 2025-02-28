first let me share all my contracts with you then i will share the corresponding frontend codes, the store/slice codes etc, what i primarilly want from you is fix me the connection between the contract and the frontend so that i have a full working system

lets start with the contracts
here is the full contract structure
smd@fedora:~/Developments/web3/_AngelSwap_/contract$ tree -I 'node_modules'
.
├── artifacts
│   ├── build-info
│   │   ├── 4b537bd9f6c7acc0ff2ca4661ac94c1b.json
│   │   └── 569d9b84a4a9bf2ab04f1ac6e7562153.json
│   ├── contracts
│   │   ├── AngelToken.sol
│   │   │   ├── AngelToken_Main.dbg.json
│   │   │   └── AngelToken_Main.json
│   │   ├── ERC20Tokens.sol
│   │   │   ├── AngelToken.dbg.json
│   │   │   ├── AngelToken.json
│   │   │   ├── HaloToken.dbg.json
│   │   │   ├── HaloToken.json
│   │   │   ├── NGNToken.dbg.json
│   │   │   ├── NGNToken.json
│   │   │   ├── ProfEkeToken.dbg.json
│   │   │   ├── ProfEkeToken.json
│   │   │   ├── ProfOnuoduToken.dbg.json
│   │   │   └── ProfOnuoduToken.json
│   │   ├── Faucet.sol
│   │   │   ├── Faucet.dbg.json
│   │   │   └── Faucet.json
│   │   ├── interfaces
│   │   │   ├── IERC20.sol
│   │   │   │   ├── IERC20.dbg.json
│   │   │   │   └── IERC20.json
│   │   │   ├── ILimitOrder.sol
│   │   │   │   ├── ILimitOrder.dbg.json
│   │   │   │   └── ILimitOrder.json
│   │   │   ├── ILiquidityPool.sol
│   │   │   │   ├── ILiquidityPool.dbg.json
│   │   │   │   └── ILiquidityPool.json
│   │   │   ├── IOrderBook.sol
│   │   │   │   ├── IOrderBook.dbg.json
│   │   │   │   └── IOrderBook.json
│   │   │   └── ISecurity.sol
│   │   │       ├── ISecurity.dbg.json
│   │   │       └── ISecurity.json
│   │   ├── LiquidityPoolFactory.sol
│   │   │   ├── LiquidityPoolFactory.dbg.json
│   │   │   └── LiquidityPoolFactory.json
│   │   ├── LiquidityPool.sol
│   │   │   ├── LiquidityPool.dbg.json
│   │   │   └── LiquidityPool.json
│   │   ├── OrderBook.sol
│   │   │   ├── OrderBook.dbg.json
│   │   │   └── OrderBook.json
│   │   └── OtherToken.sol
│   │       ├── OtherToken.dbg.json
│   │       └── OtherToken.json
│   └── @openzeppelin
│       └── contracts
│           ├── access
│           │   └── Ownable.sol
│           │       ├── Ownable.dbg.json
│           │       └── Ownable.json
│           ├── interfaces
│           │   └── draft-IERC6093.sol
│           │       ├── IERC1155Errors.dbg.json
│           │       ├── IERC1155Errors.json
│           │       ├── IERC20Errors.dbg.json
│           │       ├── IERC20Errors.json
│           │       ├── IERC721Errors.dbg.json
│           │       └── IERC721Errors.json
│           ├── token
│           │   └── ERC20
│           │       ├── ERC20.sol
│           │       │   ├── ERC20.dbg.json
│           │       │   └── ERC20.json
│           │       ├── extensions
│           │       │   └── IERC20Metadata.sol
│           │       │       ├── IERC20Metadata.dbg.json
│           │       │       └── IERC20Metadata.json
│           │       └── IERC20.sol
│           │           ├── IERC20.dbg.json
│           │           └── IERC20.json
│           └── utils
│               ├── Context.sol
│               │   ├── Context.dbg.json
│               │   └── Context.json
│               └── ReentrancyGuard.sol
│                   ├── ReentrancyGuard.dbg.json
│                   └── ReentrancyGuard.json
├── cache
│   └── solidity-files-cache.json
├── contracts
│   ├── AngelToken.sol
│   ├── contracts.txt
│   ├── ERC20Tokens.sol
│   ├── Faucet.sol
│   ├── interfaces
│   │   ├── IERC20.sol
│   │   ├── ILimitOrder.sol
│   │   ├── ILiquidityPool.sol
│   │   ├── IOrderBook.sol
│   │   └── ISecurity.sol
│   ├── LiquidityPoolFactory.sol
│   ├── LiquidityPool.sol
│   ├── OrderBook.sol
│   └── OtherToken.sol
├── hardhat.config.js
├── ignition
│   ├── deployments
│   │   └── chain-943
│   │       ├── artifacts
│   │       │   ├── AngelToken#AngelToken.dbg.json
│   │       │   ├── AngelToken#AngelToken.json
│   │       │   ├── AngelTokenModule#AngelToken.dbg.json
│   │       │   └── AngelTokenModule#AngelToken.json
│   │       ├── build-info
│   │       │   └── 74ca29bdf2a47d277a839c9cdbf040a4.json
│   │       ├── deployed_addresses.json
│   │       └── journal.jsonl
│   └── modules
│       └── Lock.js
├── package.json
├── package-lock.json
├── README.md
├── scripts
│   ├── createPool.js
│   ├── deployAngelToken.js
│   ├── deployERC20Tokens.js
│   ├── deployFaucet.js
│   ├── deployLiquidityPoolFactory.js
│   ├── deployLiquidityPool.js
│   ├── deployOrderBook.js
│   └── deployOtherTokens.js
├── test
│   └── Lock.js
└── verify
    ├── customAngelToken.js
    ├── verifyAngelToken.js
    └── verifyOtherTokens.js

44 directories, 90 files
smd@fedora:~/Developments/web3/_AngelSwap_/contract$ 

AngelToken.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AngelToken_Main is ERC20, Ownable {

    uint256 public mintRate = 1000; // Base rate for minting, adjustable dynamically
    address public faucetAddress; // Address of the faucet contract
    address public liquidityPoolAddress; // Address of the liquidity pool contract

    event Mint(address indexed to, uint256 amount);
    event FaucetAddressSet(address indexed faucet);
    event LiquidityPoolAddressSet(address indexed liquidityPool);

    constructor(uint256 initialSupply) ERC20("AngelToken", "ANGEL") Ownable(msg.sender) {
        _mint(msg.sender, initialSupply); // Mint initial supply to the contract deployer
    }

    // Set the faucet address (used to distribute tokens)
    function setFaucetAddress(address _faucetAddress) external onlyOwner {
        require(_faucetAddress != address(0), "Invalid address");
        faucetAddress = _faucetAddress;
        emit FaucetAddressSet(_faucetAddress);
    }

    // Set the liquidity pool address (used to distribute tokens)
    function setLiquidityPoolAddress(address _liquidityPoolAddress) external onlyOwner {
        require(_liquidityPoolAddress != address(0), "Invalid address");
        liquidityPoolAddress = _liquidityPoolAddress;
        emit LiquidityPoolAddressSet(_liquidityPoolAddress);
    }

    // Mint tokens (restricted to the owner only)
    function mint(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "Cannot mint to the zero address");
        require(amount > 0, "Mint amount must be greater than zero");
        _mint(to, amount);
        emit Mint(to, amount);
    }

    // Adjust minting rate (if applicable for other logic)
    function adjustMintRate(uint256 newRate) external onlyOwner {
        require(newRate > 0, "Mint rate must be greater than zero");
        mintRate = newRate;
    }

    // View total supply of the token
    function getTotalSupply() external view returns (uint256) {
        return totalSupply();
    }

    // View circulating supply of the token (subtracts faucet and liquidity pool balances)
    function circulatingSupply() external view returns (uint256) {
        uint256 faucetBalance = balanceOf(faucetAddress);
        uint256 liquidityPoolBalance = balanceOf(liquidityPoolAddress);
        return totalSupply() - faucetBalance - liquidityPoolBalance;
    }
}

Faucet.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Faucet is Ownable {
    IERC20 public token; // The ERC20 token contract
    uint256 public claimAmount; // Amount users can claim per request
    uint256 public claimCooldown; // Cooldown period between claims (in seconds)
    mapping(address => uint256) public lastClaimed; // Tracks the last claim time for each user

    event Claimed(address indexed user, uint256 amount);
    event ClaimAmountUpdated(uint256 newAmount);
    event CooldownUpdated(uint256 newCooldown);

    constructor(address _token, uint256 _claimAmount, uint256 _claimCooldown) Ownable(msg.sender) {
        require(_token != address(0), "Invalid token address");
        token = IERC20(_token);
        claimAmount = _claimAmount;
        claimCooldown = _claimCooldown;
    }

    /**
     * @notice Allows users to claim tokens from the faucet
     */
    function claim() external {
        require(block.timestamp >= lastClaimed[msg.sender] + claimCooldown, "Claim cooldown active");
        require(token.balanceOf(address(this)) >= claimAmount, "Faucet out of tokens");

        lastClaimed[msg.sender] = block.timestamp; // Update claim timestamp
        token.transfer(msg.sender, claimAmount); // Transfer tokens to the user

        emit Claimed(msg.sender, claimAmount);
    }

    /**
     * @notice Updates the claim amount (only callable by the owner)
     */
    function setClaimAmount(uint256 _newAmount) external onlyOwner {
        require(_newAmount > 0, "Claim amount must be greater than zero");
        claimAmount = _newAmount;
        emit ClaimAmountUpdated(_newAmount);
    }

    /**
     * @notice Updates the claim cooldown (only callable by the owner)
     */
    function setClaimCooldown(uint256 _newCooldown) external onlyOwner {
        claimCooldown = _newCooldown;
        emit CooldownUpdated(_newCooldown);
    }

    /**
     * @notice Allows the owner to withdraw remaining tokens from the faucet
     */
    function withdrawTokens(uint256 amount) external onlyOwner {
        require(token.balanceOf(address(this)) >= amount, "Insufficient balance in faucet");
        token.transfer(msg.sender, amount);
    }

    /**
     * @notice Returns the total balance of tokens in the faucet
     */
    function faucetBalance() external view returns (uint256) {
        return token.balanceOf(address(this));
    }
}

LiquidityPool.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

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

    address[] public tokens; // List of tokens in the pool

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

        tokens.push(_token1);
        tokens.push(_token2);

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

    function getAllTokens() external view returns (address[] memory) {
        return tokens;
    }

    // New function to fetch all transaction hashes for the caller
    function getUserTransactionHashes() external view returns (bytes32[] memory) {
        bytes32[] memory txHashes = new bytes32[](tokens.length); // Adjust size as needed
        uint256 count = 0;

        // Iterate through the transactions mapping to find hashes for the caller
        for (uint256 i = 0; i < tokens.length; i++) {
            bytes32 txHash = keccak256(abi.encodePacked(msg.sender, tokens[i]));
            if (transactions[txHash].user == msg.sender && transactions[txHash].isPrivate) {
                txHashes[count] = txHash;
                count++;
            }
        }

        // Resize the array to the actual number of transactions
        bytes32[] memory result = new bytes32[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = txHashes[i];
        }

        return result;
    }
}

LiquidityPoolFactory.sol
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

    address[] public tokens; // List of tokens in the order book

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

    function getAllTokens() external view returns (address[] memory) {
        return tokens;
    }

    function addToken(address token) external onlyOwner {
        require(token != address(0), "Invalid token address");
        tokens.push(token);
    }
}

OtherToken.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract OtherToken is ERC20, Ownable {
    constructor(string memory name, string memory symbol, uint256 initialSupply) ERC20(name, symbol) Ownable(msg.sender) {
        _mint(msg.sender, initialSupply);
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}

Now for the frontend i have done a few things and have been stuck on it, so thats where i need you to come in and help me get this system up and running as fast as possible, i need result and not delays and trials and errors

here is the fontend structure
smd@fedora:~/Developments/web3/_AngelSwap_/frontend$ tree -I 'node_modules'
.
├── package.json
├── package-lock.json
├── public
│   ├── index.html
│   ├── logo.jpg
│   ├── manifest.json
│   └── robots.txt
├── README.md
├── src
│   ├── App.js
│   ├── components
│   │   ├── Footer.jsx
│   │   ├── NavBar.jsx
│   │   ├── OrderBook.jsx
│   │   └── ui
│   │       ├── card.jsx
│   │       └── use-toast.jsx
│   ├── contracts
│   │   ├── addresses.js
│   │   ├── AngelToken.sol
│   │   │   ├── AngelToken_Main.dbg.json
│   │   │   └── AngelToken_Main.json
│   │   ├── contracts.txt
│   │   ├── ERC20Tokens.sol
│   │   │   ├── AngelToken.dbg.json
│   │   │   ├── AngelToken.json
│   │   │   ├── HaloToken.dbg.json
│   │   │   ├── HaloToken.json
│   │   │   ├── NGNToken.dbg.json
│   │   │   ├── NGNToken.json
│   │   │   ├── ProfEkeToken.dbg.json
│   │   │   ├── ProfEkeToken.json
│   │   │   ├── ProfOnuoduToken.dbg.json
│   │   │   └── ProfOnuoduToken.json
│   │   ├── Faucet.sol
│   │   │   ├── Faucet.dbg.json
│   │   │   └── Faucet.json
│   │   ├── interfaces
│   │   │   ├── IERC20.sol
│   │   │   │   ├── IERC20.dbg.json
│   │   │   │   └── IERC20.json
│   │   │   ├── ILimitOrder.sol
│   │   │   │   ├── ILimitOrder.dbg.json
│   │   │   │   └── ILimitOrder.json
│   │   │   ├── ILiquidityPool.sol
│   │   │   │   ├── ILiquidityPool.dbg.json
│   │   │   │   └── ILiquidityPool.json
│   │   │   ├── IOrderBook.sol
│   │   │   │   ├── IOrderBook.dbg.json
│   │   │   │   └── IOrderBook.json
│   │   │   └── ISecurity.sol
│   │   │       ├── ISecurity.dbg.json
│   │   │       └── ISecurity.json
│   │   ├── LiquidityPoolFactory.sol
│   │   │   ├── LiquidityPoolFactory.dbg.json
│   │   │   └── LiquidityPoolFactory.json
│   │   ├── LiquidityPool.sol
│   │   │   ├── LiquidityPool.dbg.json
│   │   │   └── LiquidityPool.json
│   │   ├── OrderBook.sol
│   │   │   ├── OrderBook.dbg.json
│   │   │   └── OrderBook.json
│   │   └── OtherToken.sol
│   │       ├── OtherToken.dbg.json
│   │       └── OtherToken.json
│   ├── hooks
│   │   └── useLiquidityPool.js
│   ├── index.css
│   ├── index.js
│   ├── pages
│   │   ├── About.jsx
│   │   ├── AdminPage.jsx
│   │   ├── History.jsx
│   │   ├── Home.jsx
│   │   ├── Liquidity.jsx
│   │   ├── Mempool.jsx
│   │   ├── Swap.jsx
│   │   └── Trade.jsx
│   ├── services
│   │   ├── liquidityPoolService.js
│   │   └── orderBookService.js
│   ├── store
│   │   ├── slices
│   │   │   ├── adminSlice.js
│   │   │   ├── liquidityPoolSlice.js
│   │   │   ├── orderBookSlice.js
│   │   │   ├── securitySlice.js
│   │   │   └── walletSlice.js
│   │   └── store.js
│   └── utils
│       ├── contractConfig.js
│       └── contractService.js
└── tailwind.config.js

25 directories, 69 files
smd@fedora:~/Developments/web3/_AngelSwap_/frontend$

as you can see i have the contracts abi moved over to the frontend for easy integration, so in my codes that im sharing if you see anything im not doing right you fix it, especially on the ones i have started working on, also for the ones that i have not you fix them for me.
i will specifically share only the frontend codes that depends on the contract, if it doesnt i wont share it, as it may be just a common design interface

NavBar.jsx
import React, { useState, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BrowserProvider } from "ethers";
import {
  setWalletAddress,
  setIsConnecting,
  setWalletError,
  resetWallet,
} from "../store/slices/walletSlice";
import { toggleGlobalSecurity, revealGlobalTransaction } from "../store/slices/securitySlice";
import { createSelector } from "@reduxjs/toolkit";
import { FaWallet, FaLock, FaUnlock } from "react-icons/fa";

const selectTransactions = createSelector(
  [(state) => state.liquidityPool.transactions, (state) => state.orderBook.transactions],
  (liquidityPool, orderBook) => ({
    liquidityPool,
    orderBook,
  })
);

const NavBar = () => {
  const dispatch = useDispatch();
  const [showMenu, setShowMenu] = useState(false);

  const { securityEnabled, loading } = useSelector((state) => state.security);
  const transactions = useSelector(selectTransactions);
  const { address: walletAddress, isConnecting } = useSelector((state) => state.wallet);

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      console.error("MetaMask or compatible wallet not detected.");
      return;
    }

    if (isConnecting) return;

    try {
      dispatch(setIsConnecting(true));
      dispatch(setWalletError(null));

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length === 0) {
        throw new Error("No accounts found");
      }

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      dispatch(setWalletAddress(address));

    } catch (error) {
      console.error("Error connecting wallet:", error);
      dispatch(setWalletError(error.message));
      dispatch(resetWallet());
    } finally {
      dispatch(setIsConnecting(false));
    }
  }, [dispatch, isConnecting]);

  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = async (accounts) => {
      if (accounts.length === 0) {
        dispatch(resetWallet());
      } else {
        dispatch(setWalletAddress(accounts[0]));
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, [dispatch]);

  const handleToggleSecurity = async () => {
    const newSecurityState = !securityEnabled;
    await dispatch(toggleGlobalSecurity(newSecurityState));

    if (!newSecurityState) {
      if (transactions.liquidityPool.items) {
        for (const tx of transactions.liquidityPool.items) {
          if (tx.status === "pending") {
            await dispatch(revealGlobalTransaction({
              txHash: tx.txHash,
              contractType: "liquidityPool",
            }));
          }
        }
      }

      if (transactions.orderBook.length > 0) {
        for (const txHash of transactions.orderBook) {
          await dispatch(revealGlobalTransaction({
            txHash,
            contractType: "orderBook",
          }));
        }
      }
    }
  };

  const toggleMenu = () => {
    setShowMenu((prevState) => !prevState);
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-sciFiBg shadow-lg">
      <nav className="max-w-7xl mx-auto flex justify-between items-center p-4">
        <a href="/" className="text-2xl font-bold text-sciFiAccent">
          AngelSwap
        </a>

        <button
          className="md:hidden flex items-center justify-center w-10 h-10 text-sciFiAccent z-50"
          onClick={toggleMenu}
        >
          {showMenu ? (
            <span className="text-2xl font-bold">&#10005;</span>
          ) : (
            <span className="text-2xl font-bold">&#9776;</span>
          )}
        </button>

        <ul
          className={`fixed top-0 left-0 w-full h-screen bg-sciFiBg flex flex-col justify-center items-center space-y-6 text-lg font-semibold transition-transform transform ${
            showMenu ? "translate-x-0" : "-translate-x-full"
          } md:static md:flex md:flex-row md:space-y-0 md:space-x-6 md:h-auto md:w-auto md:translate-x-0 z-40`}
        >
          <li>
            <a
              href="/"
              className="hover:text-sciFiAccent text-white"
              onClick={() => setShowMenu(false)}
            >
              Home
            </a>
          </li>
          <li>
            <a
              href="/swap"
              className="hover:text-sciFiAccent text-white"
              onClick={() => setShowMenu(false)}
            >
              Swap
            </a>
          </li>
          <li>
            <a
              href="/liquidity"
              className="hover:text-sciFiAccent text-white"
              onClick={() => setShowMenu(false)}
            >
              Liquidity
            </a>
          </li>
          <li>
            <a
              href="/mempool"
              className="hover:text-sciFiAccent text-white"
              onClick={() => setShowMenu(false)}
            >
              Mempool
            </a>
          </li>
          <li>
            <a
              href="/history"
              className="hover:text-sciFiAccent text-white"
              onClick={() => setShowMenu(false)}
            >
              History
            </a>
          </li>
          <li>
            <a
              href="/about"
              className="hover:text-sciFiAccent text-white"
              onClick={() => setShowMenu(false)}
            >
              About
            </a>
          </li>
        </ul>

        <div className="flex items-center space-x-4">
          <button
            onClick={connectWallet}
            disabled={isConnecting}
            className="flex items-center space-x-2 text-sciFiAccent hover:text-sciFiAccentHover transition-colors"
          >
            <FaWallet className="text-xl" />
            {isConnecting ? (
              <span className="text-sm text-white">Connecting...</span>
            ) : walletAddress ? (
              <span className="text-sm text-white">
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </span>
            ) : (
              <span className="text-sm text-white">Connect Wallet</span>
            )}
          </button>

          <button
            onClick={handleToggleSecurity}
            disabled={loading}
            className="flex items-center space-x-2 text-sciFiAccent hover:text-sciFiAccentHover transition-colors"
          >
            {securityEnabled ? (
              <FaLock className="text-xl" />
            ) : (
              <FaUnlock className="text-xl" />
            )}
          </button>
        </div>
      </nav>
    </header>
  );
};

export default NavBar;

OrderBook.jsx
import React, { useState, useEffect } from 'react';

const OrderBook = () => {
  const [buyOrders, setBuyOrders] = useState([]);
  const [sellOrders, setSellOrders] = useState([]);
  const [currentPageBuy, setCurrentPageBuy] = useState(1);
  const [currentPageSell, setCurrentPageSell] = useState(1);
  const ordersPerPage = 10;

  // Mock Data Generation
  const generateMockData = (type) => {
    const data = [];
    for (let i = 0; i < 50; i++) {
      const price = (0.001 + Math.random() * 0.001).toFixed(4);
      const amount = Math.floor(Math.random() * 500) + 1;
      const total = (price * amount).toFixed(2);
      data.push({ price, amount, total, type });
    }
    return data;
  };

  // Pagination Logic
  const updatePagination = (orders, currentPage, setCurrentPage) => {
    const totalPages = Math.ceil(orders.length / ordersPerPage);
    return [...Array(totalPages)].map((_, index) => (
      <button
        key={index}
        className={`px-4 py-2 mx-1 ${index + 1 === currentPage ? 'bg-white text-sciFiBg' : 'bg-sciFiAccent text-sciFiBg'} rounded-full hover:bg-white transition`}
        onClick={() => setCurrentPage(index + 1)}
      >
        {index + 1}
      </button>
    ));
  };

  // Render Orders
  const renderOrders = (orders, currentPage) => {
    const startIndex = (currentPage - 1) * ordersPerPage;
    const endIndex = Math.min(startIndex + ordersPerPage, orders.length);
    const currentPageOrders = orders.slice(startIndex, endIndex);

    return currentPageOrders.map((order, index) => (
      <tr key={index} className="border-t border-gray-700">
        <td className={`px-6 py-4 ${order.type === 'buy' ? 'text-buyColor' : 'text-sellColor'}`}>{order.price}</td>
        <td className="px-6 py-4 text-gray-300">{order.amount}</td>
        <td className="px-6 py-4 text-gray-300">{order.total}</td>
      </tr>
    ));
  };

  // Initial render for Buy and Sell orders
  useEffect(() => {
    setBuyOrders(generateMockData('buy'));
    setSellOrders(generateMockData('sell'));
  }, []);

  return (
    <div className="bg-sciFiBg text-sciFiText font-sans">
      

      {/* Order Book Section */}
      <section className="pt-20 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8 text-sciFiAccent">Order Book</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Buy Orders */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold text-sciFiAccent mb-4">Buy Orders</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-sciFiBg text-sciFiText text-center rounded-lg">
                  <thead>
                    <tr className="bg-gray-700">
                      <th className="px-4 py-2">Price</th>
                      <th className="px-4 py-2">Amount</th>
                      <th className="px-4 py-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {renderOrders(buyOrders, currentPageBuy)}
                  </tbody>
                </table>
                <div className="flex justify-center mt-4">
                  {updatePagination(buyOrders, currentPageBuy, setCurrentPageBuy)}
                </div>
              </div>
            </div>
            {/* Sell Orders */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold text-sciFiAccent mb-4">Sell Orders</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-sciFiBg text-sciFiText text-center rounded-lg">
                  <thead>
                    <tr className="bg-gray-700">
                      <th className="px-4 py-2">Price</th>
                      <th className="px-4 py-2">Amount</th>
                      <th className="px-4 py-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {renderOrders(sellOrders, currentPageSell)}
                  </tbody>
                </table>
                <div className="flex justify-center mt-4">
                  {updatePagination(sellOrders, currentPageSell, setCurrentPageSell)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default OrderBook;

AdminPage.jsx this page is currently working fine
// AdminPage.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BrowserProvider } from "ethers";
import {
  createLiquidityPool,
  addTokenToOrderBook,
  fetchAllLiquidityPools,
  fetchAllTokens,
  clearError
} from "../store/slices/adminSlice";

const AdminPage = () => {
  const dispatch = useDispatch();
  const { liquidityPools, tokens, loading, error } = useSelector((state) => state.admin);
  const [token1, setToken1] = useState("");
  const [token2, setToken2] = useState("");
  const [newToken, setNewToken] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [connecting, setConnecting] = useState(false);

  // Handle create liquidity pool
  const handleCreateLiquidityPool = async () => {
    if (!token1 || !token2) {
      alert("Please enter both token addresses");
      return;
    }

    try {
      const result = await dispatch(createLiquidityPool({ token1, token2 })).unwrap();
      alert(`Pool created successfully at ${result.poolAddress}`);
      setToken1("");
      setToken2("");
      dispatch(fetchAllLiquidityPools());
    } catch (error) {
      alert(error.toString());
    }
  };

  // Handle add token to order book
  const handleAddToken = async () => {
    if (!newToken) {
      alert("Please enter a token address");
      return;
    }
    try {
      await dispatch(addTokenToOrderBook(newToken)).unwrap();
      alert("Token added successfully");
      setNewToken("");
      dispatch(fetchAllTokens());
    } catch (error) {
      alert(error.toString());
    }
  };

  // Connect wallet
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask.");
      return;
    }
  
    setConnecting(true);
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      if (accounts.length > 0) {
        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        
        setWalletAddress(address);
        setIsConnected(true);
        
        const adminAddress = process.env.REACT_APP_ADMIN_WALLET_ADDRESS;
        if (adminAddress) {
          setIsAdmin(address.toLowerCase() === adminAddress.toLowerCase());
        }
      }
    } catch (error) {
      console.error("Connection error:", error);
      alert("Failed to connect wallet");
    } finally {
      setConnecting(false);
    }
  };

  // Check wallet connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: "eth_accounts" });
          if (accounts.length > 0) {
            const provider = new BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const address = await signer.getAddress();

            setWalletAddress(address);
            setIsConnected(true);

            const adminAddress = process.env.REACT_APP_ADMIN_WALLET_ADDRESS;
            if (adminAddress) {
              setIsAdmin(address.toLowerCase() === adminAddress.toLowerCase());
            }
          }
        } catch (error) {
          console.error("Error checking connection:", error);
        }
      }
    };

    checkConnection();
  }, []);

  // Handle wallet events
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = async (accounts) => {
      if (accounts.length > 0) {
        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();

        setWalletAddress(address);
        setIsConnected(true);

        const adminAddress = process.env.REACT_APP_ADMIN_WALLET_ADDRESS;
        if (adminAddress) {
          setIsAdmin(address.toLowerCase() === adminAddress.toLowerCase());
        }
      } else {
        setWalletAddress("");
        setIsConnected(false);
        setIsAdmin(false);
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, []);

  // Fetch data when connected
  useEffect(() => {
    if (isConnected && isAdmin) {
      dispatch(fetchAllLiquidityPools());
      dispatch(fetchAllTokens());
    }
  }, [dispatch, isConnected, isAdmin]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        if (window.ethereum) {
          const provider = new BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const address = await signer.getAddress();
          
          // Log the address to verify
          console.log('Fetching pool details for address:', address);
          
          dispatch(fetchTokenBalances(address));
          dispatch(fetchPoolDetails(address));
        }
      } catch (err) {
        console.error('Error fetching initial data:', err);
        toast({
          title: "Error",
          description: "Failed to load initial data",
          variant: "destructive"
        });
      }
    };
    fetchInitialData();
  }, [dispatch]);
  
  // Auto-clear errors
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  return (
    <div className="container mx-auto px-4 pt-20 py-8">
      {!isConnected ? (
        <div className="text-center pt-20 py-12">
          <h2 className="text-2xl font-bold mb-4">Welcome to Admin Dashboard</h2>
          <button
            onClick={connectWallet}
            disabled={connecting}
            className="btn-glow nav-button px-6 py-2 rounded-lg"
          >
            {connecting ? "Connecting..." : "Connect Wallet"}
          </button>
        </div>
      ) : !isAdmin ? (
        <div className="text-center pt-20 py-12">
          <h2 className="text-2xl font-bold text-red-500">Access Denied</h2>
          <p className="text-gray-400">Only the admin can access this page.</p>
          <p className="text-gray-400 mt-4">
            Connected Wallet: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </p>
        </div>
      ) : (
        <>
          <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

          {/* Create Liquidity Pool */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Create Liquidity Pool</h2>
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Token 1 Address"
                value={token1}
                onChange={(e) => setToken1(e.target.value)}
                className="input-glow bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2 flex-1"
              />
              <input
                type="text"
                placeholder="Token 2 Address"
                value={token2}
                onChange={(e) => setToken2(e.target.value)}
                className="input-glow bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2 flex-1"
              />
              <button
                onClick={handleCreateLiquidityPool}
                className="btn-glow nav-button px-6 py-2 rounded-lg whitespace-nowrap"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Pool"}
              </button>
            </div>
          </div>

          {/* Add Token to Order Book */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Add Token to Order Book</h2>
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Token Address"
                value={newToken}
                onChange={(e) => setNewToken(e.target.value)}
                className="input-glow bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2 flex-1"
              />
              <button
                onClick={handleAddToken}
                className="btn-glow nav-button px-6 py-2 rounded-lg whitespace-nowrap"
                disabled={loading}
              >
                {loading ? "Adding..." : "Add Token"}
              </button>
            </div>
          </div>

          {/* Display Liquidity Pools */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Liquidity Pools</h2>
            {loading ? (
              <p className="text-gray-400">Loading pools...</p>
            ) : liquidityPools.length > 0 ? (
              <div className="bg-gray-800 rounded-lg p-4">
                <ul className="space-y-2">
                  {liquidityPools.map((pool, index) => (
                    <li key={index} className="text-gray-300 break-all">
                      <span className="font-medium">Pool {index + 1}:</span> {pool}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-gray-400">No liquidity pools found</p>
            )}
          </div>

          {/* Display Tokens */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Tokens in Order Book</h2>
            {loading ? (
              <p className="text-gray-400">Loading tokens...</p>
            ) : tokens.length > 0 ? (
              <div className="bg-gray-800 rounded-lg p-4">
                <ul className="space-y-2">
                  {tokens.map((token, index) => (
                    <li key={index} className="text-gray-300 break-all">
                      <span className="font-medium">Token {index + 1}:</span> {token}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-gray-400">No tokens found</p>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg">
              <p>{error}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminPage;

History.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BrowserProvider } from 'ethers';
import {
  fetchUserTransactions,
  fetchTokenBalances,
  fetchPoolDetails,
  fetchAllTokens,
  fetchPendingRewards,
} from '../store/slices/liquidityPoolSlice';
import { revealGlobalTransaction } from '../store/slices/securitySlice';
import { fetchOrders } from '../store/slices/orderBookSlice'; // Import from orderBookSlice

const History = () => {
  const dispatch = useDispatch();
  const ITEMS_PER_PAGE = 10;
  const MAX_HISTORY = 50;
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState('all');

  // Liquidity pool state
  const {
    transactions: liquidityTransactions,
    loading: liquidityLoading,
    error: liquidityError,
    poolDetails,
    token1Balance,
    token2Balance,
    pendingRewards,
    userLiquidity1,
    userLiquidity2,
    token1,
    token2,
    securityEnabled,
  } = useSelector((state) => state.liquidityPool);

  // Order book state
  const {
    orders,
    loading: orderBookLoading,
    error: orderBookError,
  } = useSelector((state) => state.orderBook);

  // Combine loading and error states
  const loading = liquidityLoading || orderBookLoading;
  const error = liquidityError || orderBookError;

  // Fetch data from both slices
  useEffect(() => {
    const fetchData = async () => {
      if (window.ethereum) {
        try {
          const provider = new BrowserProvider(window.ethereum); // Updated to BrowserProvider
          const signer = await provider.getSigner(); // Await the signer
          const address = await signer.getAddress();

          await Promise.all([
            dispatch(fetchUserTransactions(address)), // Fetch liquidity pool transactions
            dispatch(fetchOrders(address)), // Fetch order book transactions
            dispatch(fetchTokenBalances(address)),
            dispatch(fetchPoolDetails(address)),
            dispatch(fetchAllTokens()),
            dispatch(fetchPendingRewards(address)),
          ]);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      }
    };

    fetchData();
    // Set up automatic refresh every minute
    const refreshInterval = setInterval(fetchData, 60000);
    return () => clearInterval(refreshInterval);
  }, [dispatch]);

  // Format order book activities for display
  const formatOrderBookActivity = (order) => ({
    type: 'order',
    status: order.status,
    amount: order.amount,
    price: order.price,
    token: order.token,
    isBuyOrder: order.isBuyOrder,
    timestamp: order.timestamp,
    transaction: order.transactionHash || order.orderId,
  });

  // Combine liquidity pool and order book activities
  const allActivities = [
    ...(liquidityTransactions?.items || []),
    ...(orders?.map(formatOrderBookActivity) || []),
  ].sort((a, b) => b.timestamp - a.timestamp); // Sort by timestamp (most recent first)

  const ActivityCard = ({ activity }) => {
    const getActivityIcon = (type) => {
      switch (type) {
        case 'swap':
          return '🔄';
        case 'addLiquidity':
          return '💧';
        case 'removeLiquidity':
          return '🔥';
        case 'claimRewards':
          return '🎁';
        case 'order':
          return '📊';
        default:
          return '📝';
      }
    };

    const formatAmount = (type, activity) => {
      switch (type) {
        case 'swap':
          return `${ethers.utils.formatEther(activity.amountIn || activity.amount)} ${token1} → 
                 ${activity.amountOut ? ethers.utils.formatEther(activity.amountOut) : '?'} ${token2}`;
        case 'addLiquidity':
        case 'removeLiquidity':
          return `${ethers.utils.formatEther(activity.amount1)} ${token1} + 
                 ${ethers.utils.formatEther(activity.amount2)} ${token2}`;
        case 'claimRewards':
          return `${ethers.utils.formatEther(activity.amount)} Rewards`;
        case 'order':
          return `${ethers.utils.formatEther(activity.amount)} ${token1} @ 
                 ${ethers.utils.formatEther(activity.price)} ${token2}`;
        default:
          return `${ethers.utils.formatEther(activity.amount || '0')}`;
      }
    };

    const handleReveal = async (txHash) => {
      if (activity.status === 'pending' && activity.isPrivate) {
        await dispatch(revealGlobalTransaction(txHash));
      }
    };

    return (
      <div className="relative bg-card rounded-xl p-6 transition-all duration-300 hover:shadow-lg input-glow">
        <div className="flex items-start gap-4">
          <div className="text-2xl">{getActivityIcon(activity.type)}</div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white">
              {activity.type === 'swap' ? 'Token Swap' :
               activity.type === 'addLiquidity' ? 'Added Liquidity' :
               activity.type === 'removeLiquidity' ? 'Removed Liquidity' :
               activity.type === 'claimRewards' ? 'Claimed Rewards' :
               activity.type === 'order' ? (activity.isBuyOrder ? 'Buy Order' : 'Sell Order') :
               'Activity'}
            </h3>
            <p className="text-gray-400 text-sm mt-1">
              {new Date(parseInt(activity.timestamp) * 1000).toLocaleString()}
            </p>
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Amount:</span>
                <span className="text-white font-medium">
                  {formatAmount(activity.type, activity)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Transaction:</span>
                <a
                  href={`https://etherscan.io/tx/${activity.transaction}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-cyan-500"
                >
                  {activity.transaction.slice(0, 6)}...{activity.transaction.slice(-4)}
                </a>
              </div>
            </div>
          </div>
        </div>
        
        {activity.isPrivate && activity.status === 'pending' ? (
          <button
            onClick={() => handleReveal(activity.txHash)}
            className="btn-glow nav-button px-3 py-1 rounded-lg text-sm absolute top-4 right-4"
          >
            Reveal
          </button>
        ) : (
          <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium
            ${activity.status === 'confirmed' ? 'bg-card text-white border border-green-500' :
              activity.status === 'pending' ? 'bg-card text-white border border-yellow-500' :
              activity.status === 'failed' ? 'bg-card text-white border border-red-500' :
              'bg-card text-white border border-gray-500'}`}>
            {activity.status || 'Pending'}
          </div>
        )}
      </div>
    );
  };

  const StatCard = ({ title, value, icon, change }) => (
    <div className="bg-card rounded-xl p-6 input-glow transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="text-2xl font-bold text-white mb-2">{value}</div>
      {change && (
        <div className={`text-sm ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
        </div>
      )}
    </div>
  );

  const getFilteredActivities = () => {
    let filtered = [...allActivities].slice(0, MAX_HISTORY);
    if (activeFilter !== 'all') {
      filtered = filtered.filter(tx => tx.type === activeFilter);
    }
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filtered.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(
    Math.min(allActivities.length, MAX_HISTORY) / ITEMS_PER_PAGE
  );

  return (
    <div className="min-h-screen bg-sciFiBg">
      {/* Hero Section */}
      <section className="pt-20 pb-10 bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Activity History
          </h1>
          <p className="text-gray-400 text-lg">
            Your latest {MAX_HISTORY} activities on AngelSwap
          </p>
        </div>
      </section>

      {/* Stats Overview */}
      <section className="py-8 bg-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Pool Share"
              value={`${poolDetails?.poolShare || '0'}%`}
              icon="🌊"
            />
            <StatCard
              title="Your Liquidity"
              value={`${ethers.utils.formatEther(userLiquidity1 || '0')} T1`}
              icon="💧"
            />
            <StatCard
              title="Balance"
              value={`${ethers.utils.formatEther(token1Balance || '0')} T1`}
              icon="💰"
            />
            <StatCard
              title="Pending Rewards"
              value={ethers.utils.formatEther(pendingRewards || '0')}
              icon="🎁"
            />
          </div>
        </div>
      </section>

      {/* Activity Feed */}
      <section className="py-8 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-8">
            {['all', 'swap', 'addLiquidity', 'removeLiquidity', 'claimRewards', 'order'].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`btn-glow nav-button px-4 py-2 rounded-lg text-sm font-medium ${
                  activeFilter === filter ? 'tab-active' : ''
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1).replace(/([A-Z])/g, ' $1')}
              </button>
            ))}
          </div>

          {/* Activities */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500">Error loading activities: {error}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {getFilteredActivities().map((activity, index) => (
                  <ActivityCard key={activity.transaction || index} activity={activity} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8 gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="btn-glow nav-button px-4 py-2 rounded-lg disabled:opacity-50"
                  >
                    ←
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`btn-glow nav-button px-4 py-2 rounded-lg ${
                        currentPage === i + 1 ? 'tab-active' : ''
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="btn-glow nav-button px-4 py-2 rounded-lg disabled:opacity-50"
                  >
                    →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default History;


Liquidity.jsx one of the most important page that must be fixed to work smoothly

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchTokenBalances,
  provideLiquidity,
  removeLiquidity,
  fetchPoolDetails,
  fetchAllTokens
} from '../store/slices/liquidityPoolSlice';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { toast } from '../components/ui/use-toast';
import { BrowserProvider, formatEther, parseEther, ZeroAddress } from 'ethers';

export default function Liquidity() {
  const [activeTab, setActiveTab] = useState('addLiquidity');
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [removeLiquidityAmounts, setRemoveLiquidityAmounts] = useState({});
  const [fromToken, setFromToken] = useState('');
  const [toToken, setToToken] = useState('');

  const dispatch = useDispatch();
  const {
    tokens,
    tokenBalances,
    poolDetails,
    loading,
    error
  } = useSelector((state) => state.liquidityPool);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        await dispatch(fetchAllTokens());
        if (window.ethereum) {
          const provider = new BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const address = await signer.getAddress();
          dispatch(fetchTokenBalances(address));
          dispatch(fetchPoolDetails(address));
        }
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to load initial data",
          variant: "destructive"
        });
      }
    };
    fetchInitialData();
  }, [dispatch]);

  useEffect(() => {
    if (tokens && tokens.length >= 2) {
      setFromToken(tokens[0].address);
      setToToken(tokens[1].address);
    }
  }, [tokens]);

  const getBalance = (tokenAddress) => {
    if (!tokenAddress || !tokens) return '0';
    const balance = tokenBalances[tokenAddress] || '0';
    return balance;
  };
  
  const getFormattedBalance = (tokenAddress) => {
    const balance = getBalance(tokenAddress);
    try {
      return formatEther(balance);
    } catch (error) {
      console.error("Error formatting balance:", error);
      return '0';
    }
  };

  const getTokenSymbol = (tokenAddress) => {
    const token = tokens.find(t => t.address === tokenAddress);
    return token?.symbol || 'UNKNOWN';
  };

  const handleAddLiquidity = async () => {
    try {
      if (!fromAmount || !toAmount) {
        toast({
          title: "Invalid Input",
          description: "Please enter valid amounts for both tokens",
          variant: "destructive"
        });
        return;
      }

      const amountIn1 = parseEther(fromAmount);
      const amountIn2 = parseEther(toAmount);
      const balance1 = BigInt(getBalance(fromToken));
      const balance2 = BigInt(getBalance(toToken));

      if (amountIn1 > balance1 || amountIn2 > balance2) {
        toast({
          title: "Insufficient Balance",
          description: "You don't have enough tokens for this transaction",
          variant: "destructive"
        });
        return;
      }

      await dispatch(provideLiquidity({ 
        amount1: amountIn1.toString(), 
        amount2: amountIn2.toString(),
        token1: fromToken,
        token2: toToken
      })).unwrap();

      toast({
        title: "Success",
        description: "Liquidity added successfully",
      });

      setFromAmount('');
      setToAmount('');
      if (window.ethereum) {
        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        dispatch(fetchTokenBalances(address));
        dispatch(fetchPoolDetails(address));
      }
    } catch (err) {
      toast({
        title: "Transaction Failed",
        description: err.message || "Failed to add liquidity",
        variant: "destructive"
      });
    }
  };

  const handleRemoveLiquidity = async (liquidityId) => {
    try {
      const amount = removeLiquidityAmounts[liquidityId];
      if (!amount) {
        toast({
          title: "Invalid Amount",
          description: "Please enter a valid amount to remove",
          variant: "destructive"
        });
        return;
      }

      const amountToRemove = parseEther(amount);
      await dispatch(removeLiquidity({ 
        amount: amountToRemove.toString(),
        token1: fromToken,
        token2: toToken
      })).unwrap();

      toast({
        title: "Success",
        description: "Liquidity removed successfully",
      });

      setRemoveLiquidityAmounts({});
      if (window.ethereum) {
        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        dispatch(fetchTokenBalances(address));
        dispatch(fetchPoolDetails(address));
      }
    } catch (err) {
      toast({
        title: "Transaction Failed",
        description: err.message || "Failed to remove liquidity",
        variant: "destructive"
      });
    }
  };

  const updateInputAmount = (percentage, liquidityId) => {
    const balance = getFormattedBalance(fromToken);
    const amountToFill = (percentage / 100) * parseFloat(balance);
    setRemoveLiquidityAmounts(prev => ({
      ...prev,
      [liquidityId]: amountToFill.toFixed(18)
    }));
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">Error: {error}</div>;
  }

  return (
    <div className="bg-sciFiBg text-sciFiText font-sans">
      <div className="container mx-auto px-4 py-8 pt-20">
        <div className="flex justify-center">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <div className="flex justify-between mb-4">
                <button
                  className={`btn-glow nav-button py-2 px-6 rounded-lg font-bold text-lg ${
                    activeTab === 'addLiquidity' ? 'tab-active' : ''
                  }`}
                  onClick={() => setActiveTab('addLiquidity')}
                >
                  Add
                </button>
                <button
                  className={`btn-glow nav-button py-2 px-6 rounded-lg font-bold text-lg ${
                    activeTab === 'removeLiquidity' ? 'tab-active' : ''
                  }`}
                  onClick={() => setActiveTab('removeLiquidity')}
                >
                  Remove
                </button>
              </div>
            </CardHeader>

            <CardContent>
              {activeTab === 'addLiquidity' ? (
                <div>
                  <p className="text-white font-semibold text-lg mb-4">Add Liquidity</p>

                  <div className="flex flex-col mb-4">
                    <div className="flex items-center mb-3">
                      <label className="text-white font-semibold text-lg">From</label>
                      <span className="text-white ml-2">
                        Balance: {getFormattedBalance(fromToken)} {getTokenSymbol(fromToken)}
                      </span>
                    </div>
                    <div className="flex items-center mb-4">
                      <input
                        type="number"
                        className="input-glow bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 w-full"
                        placeholder="0.0"
                        value={fromAmount}
                        onChange={(e) => setFromAmount(e.target.value)}
                      />
                      <select
                        className="input-glow bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 w-24 ml-2"
                        value={fromToken}
                        onChange={(e) => setFromToken(e.target.value)}
                      >
                        {tokens.map((token) => (
                          <option key={token.address} value={token.address}>
                            {token.symbol}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-center items-center mb-4">
                    <span className="text-2xl text-white font-bold">+</span>
                  </div>

                  <div className="flex flex-col mb-4">
                    <div className="flex items-center mb-3">
                      <label className="text-white font-semibold text-lg">To</label>
                      <span className="text-white ml-2">
                        Balance: {getFormattedBalance(toToken)} {getTokenSymbol(toToken)}
                      </span>
                    </div>
                    <div className="flex items-center mb-4">
                      <input
                        type="number"
                        className="input-glow bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 w-full"
                        placeholder="0.0"
                        value={toAmount}
                        onChange={(e) => setToAmount(e.target.value)}
                      />
                      <select
                        className="input-glow bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 w-24 ml-2"
                        value={toToken}
                        onChange={(e) => setToToken(e.target.value)}
                      >
                        {tokens.map((token) => (
                          <option key={token.address} value={token.address}>
                            {token.symbol}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {(parseFloat(fromAmount) > 0 && parseFloat(toAmount) > 0) && (
                    <div id="poolDetails">
                      <h3 className="text-cyan-500 font-bold text-lg mb-2 border-b border-cyan-500 pb-1">
                        Prices and Pool Share
                      </h3>
                      <div className="bg-card p-4 rounded-lg shadow-lg mb-4">
                        <p className="text-white text-sm flex items-center justify-between">
                          <span>{getTokenSymbol(fromToken)} per {getTokenSymbol(toToken)}:</span>
                          <span className="text-cyan-500 font-semibold">
                            {poolDetails?.token1PerToken2 || '0'}
                          </span>
                        </p>
                        <p className="text-white text-sm flex items-center justify-between">
                          <span>{getTokenSymbol(toToken)} per {getTokenSymbol(fromToken)}:</span>
                          <span className="text-cyan-500 font-semibold">
                            {poolDetails?.token2PerToken1 || '0'}
                          </span>
                        </p>
                        <p className="text-white text-sm flex items-center justify-between">
                          <span>Share of Pool:</span>
                          <span className="text-cyan-500 font-semibold">
                            {poolDetails?.poolShare || '0%'}
                          </span>
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <button
                    className="btn-glow nav-button py-3 px-6 rounded-lg w-full"
                    onClick={handleAddLiquidity}
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : 'Add Liquidity'}
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-white font-semibold text-lg mb-4">Remove Liquidity</p>
                  <div id="liquidityList">
                    <div className="liquidity-item bg-card p-4 rounded-lg mb-4">
                      <h3 className="text-cyan-500 font-bold mb-2">
                        Liquidity Pair: {getTokenSymbol(fromToken)}/{getTokenSymbol(toToken)}
                      </h3>
                      <p className="text-white text-sm">
                        Your Liquidity: {getFormattedBalance(fromToken)} {getTokenSymbol(fromToken)} and {getFormattedBalance(toToken)} {getTokenSymbol(toToken)}
                      </p>
                      <div className="mt-4">
                        <p className="text-white text-sm mb-2">Amount to Remove:</p>
                        <div className="flex items-center mb-2">
                          <input
                            type="number"
                            placeholder="Enter amount"
                            className="input-glow bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2 w-full"
                            value={removeLiquidityAmounts[1] || ''}
                            onChange={(e) => setRemoveLiquidityAmounts((prev) => ({ 
                              ...prev, 
                              [1]: e.target.value 
                            }))}
                          />
                        </div>
                        <div className="flex space-x-4 mb-4">
                          {[25, 50, 75, 100].map((percentage) => (
                            <button
                              key={percentage}
                              className="bg-cyan-500 text-white px-4 py-2 rounded-lg"
                              onClick={() => updateInputAmount(percentage, 1)}
                            >
                              {percentage}%
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    className="btn-glow nav-button py-3 px-6 rounded-lg w-full"
                    onClick={() => handleRemoveLiquidity(1)}
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : 'Remove Liquidity'}
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


Mempool.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrders } from "../store/slices/orderBookSlice"; // Import from orderBookSlice

const Mempool = () => {
  const dispatch = useDispatch();

  // Fetch order book activities
  const { orders, loading, error } = useSelector((state) => state.orderBook);

  // Local state for mempool transactions
  const [transactions, setTransactions] = useState([]);

  // Combine mempool transactions and order book activities
  useEffect(() => {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      signer.getAddress().then((address) => {
        dispatch(fetchOrders(address)); // Fetch order book activities
      });
    }
  }, [dispatch]);

  // Format order book activities for display
  useEffect(() => {
    if (orders && orders.length > 0) {
      const formattedOrders = orders.map((order) => ({
        id: order.orderId,
        sender: order.user,
        receiver: "Order Book",
        amount: `${ethers.utils.formatEther(order.amount)} ${order.token}`,
        price: `${ethers.utils.formatEther(order.price)}`,
        type: order.isBuyOrder ? "Buy Order" : "Sell Order",
        status: order.status,
      }));

      // Combine with existing mempool transactions
      setTransactions((prevTransactions) => [
        ...prevTransactions,
        ...formattedOrders,
      ]);
    }
  }, [orders]);

  const transactionsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  // Function to render the current page of transactions
  const renderTransactions = () => {
    const startIndex = (currentPage - 1) * transactionsPerPage;
    const endIndex = Math.min(startIndex + transactionsPerPage, transactions.length);
    const currentPageTransactions = transactions.slice(startIndex, endIndex);

    return currentPageTransactions.map((transaction) => (
      <tr className="border-t border-gray-700" key={transaction.id}>
        <td className="px-6 py-4 text-gray-300">{transaction.id}</td>
        <td className="px-6 py-4 text-gray-300">{transaction.sender}</td>
        <td className="px-6 py-4 text-gray-300">{transaction.receiver}</td>
        <td className="px-6 py-4 text-gray-300">{transaction.amount}</td>
        <td className="px-6 py-4 text-gray-300">{transaction.price}</td>
        <td className="px-6 py-4 text-gray-300">{transaction.type}</td>
        <td className="px-6 py-4 text-gray-300">{transaction.status}</td>
      </tr>
    ));
  };

  // Function to update pagination controls
  const updatePagination = () => {
    const totalPages = Math.ceil(transactions.length / transactionsPerPage);
    return [...Array(totalPages)].map((_, i) => {
      const pageNum = i + 1;
      return (
        <button
          key={pageNum}
          className={`px-4 py-2 mx-1 ${
            pageNum === currentPage ? "bg-white text-sciFiBg" : "bg-sciFiAccent text-sciFiBg"
          } rounded-full hover:bg-white transition`}
          onClick={() => setCurrentPage(pageNum)}
        >
          {pageNum}
        </button>
      );
    });
  };

  // Function to update the transaction count text
  const updateTransactionCount = () => {
    const totalTransactions = transactions.length;
    return totalTransactions === 0
      ? "No transactions available."
      : `Total Transactions: ${totalTransactions}`;
  };

  useEffect(() => {
    // Initial render
    renderTransactions();
  }, [currentPage, transactions]);

  return (
    <div className="bg-sciFiBg text-sciFiText font-sans">
      {/* Hero Section */}
      <section id="home" className="min-h-screen flex items-center justify-center text-center p-4 bg-gradient-to-b from-sciFiBg to-gray-900">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-extrabold text-sciFiAccent mb-6">
            AngelSwap: Mempool Insights
          </h1>
          <p className="text-lg md:text-2xl text-gray-300 mb-8">
            Stay informed on pending transactions with real-time mempool data.
          </p>
        </div>
      </section>

      {/* Mempool Section */}
      <section id="mempool" className="py-16 bg-gray-800 text-gray-200">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Mempool Overview</h2>

          {/* Mempool Transactions Count */}
          <p className="text-lg mb-6">{updateTransactionCount()}</p>

          {/* Transactions Table */}
          <div className="overflow-x-auto shadow-xl rounded-lg bg-gray-900">
            <table className="min-w-full text-left">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-4 text-lg font-semibold text-sciFiAccent">Transaction ID</th>
                  <th className="px-6 py-4 text-lg font-semibold text-sciFiAccent">Sender</th>
                  <th className="px-6 py-4 text-lg font-semibold text-sciFiAccent">Receiver</th>
                  <th className="px-6 py-4 text-lg font-semibold text-sciFiAccent">Amount</th>
                  <th className="px-6 py-4 text-lg font-semibold text-sciFiAccent">Price</th>
                  <th className="px-6 py-4 text-lg font-semibold text-sciFiAccent">Type</th>
                  <th className="px-6 py-4 text-lg font-semibold text-sciFiAccent">Status</th>
                </tr>
              </thead>
              <tbody>{renderTransactions()}</tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="mt-8 flex justify-center space-x-2">{updatePagination()}</div>
        </div>
      </section>
    </div>
  );
};

export default Mempool;

Swap.jsx very important page that needs to work well

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import OrderBook from '../components/OrderBook';
import {
  swapTokens,
  fetchTokenBalances,
  fetchAllTokens,
  getAmountOut,
  fetchPoolDetails
} from '../store/slices/liquidityPoolSlice';
import { revealGlobalTransaction } from '../store/slices/securitySlice';
import { placeOrder, fetchOrders } from '../store/slices/orderBookSlice';
import { BrowserProvider, formatEther, parseEther, ZeroAddress } from 'ethers';

const Swap = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('market');
  const [slippage, setSlippage] = useState(0.5);
  
  const {
    tokens,
    token1Balance,
    token2Balance,
    poolDetails,
    loading,
    error,
    transactions,
    tokenBalances
  } = useSelector((state) => state.liquidityPool);

  const { securityEnabled } = useSelector((state) => state.security);
  const { orders } = useSelector((state) => state.orderBook);

  // Market order state
  const [marketFromAmount, setMarketFromAmount] = useState('');
  const [marketToAmount, setMarketToAmount] = useState('');
  const [marketFromToken, setMarketFromToken] = useState('');
  const [marketToToken, setMarketToToken] = useState('');

  // Limit order state
  const [limitFromAmount, setLimitFromAmount] = useState('');
  const [limitToAmount, setLimitToAmount] = useState('');
  const [limitFromToken, setLimitFromToken] = useState('');
  const [limitToToken, setLimitToToken] = useState('');
  const [limitPrice, setLimitPrice] = useState('');
  const [maxAmount, setMaxAmount] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      await dispatch(fetchAllTokens());
      if (window.ethereum) {
        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        dispatch(fetchTokenBalances(address));
        dispatch(fetchPoolDetails(address));
        dispatch(fetchOrders(address));
      }
    };
    fetchInitialData();
  }, [dispatch]);

  useEffect(() => {
    if (tokens && tokens.length >= 2) {
      setMarketFromToken(tokens[0].address);
      setMarketToToken(tokens[1].address);
      setLimitFromToken(tokens[0].address);
      setLimitToToken(tokens[1].address);
    }
  }, [tokens]);

  const calculateMinAmountOut = (amount) => {
    if (!amount) return '0';
    const amountValue = BigInt(amount);
    const slippageValue = BigInt(1000 - (slippage * 10));
    return (amountValue * slippageValue / BigInt(1000)).toString();
  };

  const handleMarketFromAmountChange = async (value) => {
    setMarketFromAmount(value);
    if (value && marketFromToken && marketToToken) {
      try {
        const amountIn = parseEther(value);
        const token1 = marketFromToken === tokens[0]?.address;
        const result = await dispatch(getAmountOut({
          amountIn: amountIn.toString(),
          reserveIn: token1 ? poolDetails.totalLiquidity1 : poolDetails.totalLiquidity2,
          reserveOut: token1 ? poolDetails.totalLiquidity2 : poolDetails.totalLiquidity1
        })).unwrap();
        setMarketToAmount(formatEther(result));
      } catch (error) {
        console.error('Error calculating amount out:', error);
        setMarketToAmount('');
      }
    } else {
      setMarketToAmount('');
    }
  };

  const handleMarketSwap = async () => {
    if (!marketFromAmount || !marketFromToken || !marketToToken) return;

    try {
      const amountIn = parseEther(marketFromAmount);
      const minAmountOut = calculateMinAmountOut(parseEther(marketToAmount));

      await dispatch(swapTokens({
        fromToken: marketFromToken,
        amountIn: amountIn.toString(),
        minAmountOut
      })).unwrap();

      setMarketFromAmount('');
      setMarketToAmount('');
      if (window.ethereum) {
        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        dispatch(fetchTokenBalances(address));
        dispatch(fetchPoolDetails(address));
      }
    } catch (error) {
      console.error('Market swap failed:', error);
    }
  };

  const handleLimitOrder = async () => {
    if (!limitFromAmount || !limitPrice || !limitFromToken || !limitToToken) return;

    try {
      const amountIn = parseEther(limitFromAmount);
      const limitPriceWei = parseEther(limitPrice);

      await dispatch(placeOrder({
        token: limitFromToken,
        amount: amountIn.toString(),
        price: limitPriceWei.toString(),
        isBuyOrder: true
      })).unwrap();

      setLimitFromAmount('');
      setLimitToAmount('');
      setLimitPrice('');
      setMaxAmount(false);

      if (window.ethereum) {
        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        dispatch(fetchTokenBalances(address));
        dispatch(fetchPoolDetails(address));
        dispatch(fetchOrders(address));
      }
    } catch (error) {
      console.error('Limit order failed:', error);
    }
  };

  const switchMarketTokens = () => {
    setMarketFromToken(marketToToken);
    setMarketToToken(marketFromToken);
    setMarketFromAmount(marketToAmount);
    setMarketToAmount(marketFromAmount);
  };

  const switchLimitTokens = () => {
    setLimitFromToken(limitToToken);
    setLimitToToken(limitFromToken);
    setLimitFromAmount(limitToAmount);
    setLimitToAmount(limitFromAmount);
  };

  const getBalance = (tokenAddress) => {
    if (!tokenAddress || !tokens) return '0';
    const token = tokens.find(t => t.address === tokenAddress);
    if (!token) return '0';
    
    // Get balance from tokenBalances map
    const balance = tokenBalances[tokenAddress] || '0';
    return balance;
  };
  
  const getFormattedBalance = (tokenAddress) => {
    const balance = getBalance(tokenAddress);
    try {
      return formatEther(balance);
    } catch (error) {
      console.error("Error formatting balance:", error);
      return '0';
    }
  };

  const getTokenSymbol = (tokenAddress) => {
    const token = tokens.find(t => t.address === tokenAddress);
    return token?.symbol || 'UNKNOWN';
  };

  const formatAddress = (address) => {
    if (!address || address === ZeroAddress) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <>
      <div className="container mx-auto px-4 py-8 pt-20">
        <div className="flex justify-center">
          <div className="w-full max-w-lg bg-card shadow-2xl p-6">
            {/* Tab Buttons */}
            <div className="flex justify-between mb-4">
              <button
                className={`btn-glow nav-button py-2 px-4 rounded-lg font-semibold text-lg tab-secondary ${
                  activeTab === 'market' ? 'tab-active' : ''
                }`}
                onClick={() => setActiveTab('market')}
              >
                Market
              </button>
              <button
                className={`btn-glow nav-button py-2 px-4 rounded-lg font-semibold text-lg tab-secondary ${
                  activeTab === 'limit' ? 'tab-active' : ''
                }`}
                onClick={() => setActiveTab('limit')}
              >
                Limit
              </button>
            </div>

            {/* Market Tab Content */}
            {activeTab === 'market' && (
              <div id="marketContent">
                {/* From Section */}
                <div className="flex flex-col mb-4">
                  <div className="flex items-center mb-3">
                    <label className="text-white font-semibold text-lg">From</label>
                    <span className="text-white ml-2">
                      Balance: {getFormattedBalance(marketFromToken)} {getTokenSymbol(marketFromToken)}
                    </span>
                  </div>
                  <div className="flex items-center mb-4">
                    <input
                      type="number"
                      className="input-glow bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 w-full"
                      value={marketFromAmount}
                      onChange={(e) => handleMarketFromAmountChange(e.target.value)}
                      placeholder="0.0"
                    />
                    <select
                      className="input-glow bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 w-24 ml-2"
                      value={marketFromToken}
                      onChange={(e) => setMarketFromToken(e.target.value)}
                    >
                      {tokens.map((token) => (
                        <option key={token.address} value={token.address}>
                          {token.symbol}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Switch Button */}
                <div className="flex justify-center items-center mb-4">
                  <button className="arrow-btn text-white" onClick={switchMarketTokens}>
                    ⇅
                  </button>
                </div>

                {/* To Section */}
                <div className="flex flex-col mb-4">
                  <div className="flex items-center mb-3">
                    <label className="text-white font-semibold text-lg">To</label>
                    <span className="text-white ml-2">
                      Balance: {getFormattedBalance(marketToToken)} {getTokenSymbol(marketToToken)}
                    </span>
                  </div>
                  <div className="flex items-center mb-4">
                    <input
                      type="number"
                      className="input-glow bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 w-full"
                      value={marketToAmount}
                      placeholder="0.0"
                      readOnly
                    />
                    <select
                      className="input-glow bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 w-24 ml-2"
                      value={marketToToken}
                      onChange={(e) => setMarketToToken(e.target.value)}
                    >
                      {tokens.map((token) => (
                        <option key={token.address} value={token.address}>
                          {token.symbol}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Slippage Control */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-white">Slippage Tolerance</span>
                  <input
                    type="number"
                    className="input-glow bg-gray-800 text-white border border-gray-700 rounded-lg px-2 py-1 w-20"
                    value={slippage}
                    onChange={(e) => setSlippage(parseFloat(e.target.value))}
                    min="0.1"
                    max="5"
                    step="0.1"
                  />
                  <span className="text-white">%</span>
                </div>

                {/* Swap Button */}
                <button
                  className="btn-glow nav-button py-3 px-6 rounded-lg w-full"
                  onClick={handleMarketSwap}
                  disabled={!marketFromAmount || loading}
                >
                  {loading ? 'Processing...' : marketFromAmount ? 'Swap' : 'Enter an amount'}
                </button>
              </div>
            )}

            {/* Limit Tab Content */}
            {activeTab === 'limit' && (
              <div id="limitContent">
                {/* Limit Order Header */}
                <div className="flex justify-between mb-4">
                  <p className="text-white font-semibold text-lg">Limit Order</p>
                </div>

                {/* From Section */}
                <div className="flex flex-col mb-4">
                  <div className="flex items-center mb-3">
                    <label className="text-white font-semibold text-lg">From</label>
                    <span className="text-white ml-2">
                      Balance: {getFormattedBalance(limitFromToken)} {getTokenSymbol(limitFromToken)}
                    </span>
                    <div className="flex items-center ml-2">
                      <input
                        type="checkbox"
                        className="mr-2 text-cyan-500"
                        checked={maxAmount}
                        onChange={() => handleMaxAmount(getBalance(limitFromToken))}
                      />
                      <span className="text-white text-sm">MAX</span>
                    </div>
                  </div>
                  <div className="flex items-center mb-4">
                    <input
                      type="number"
                      className="input-glow bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 w-full"
                      value={limitFromAmount}
                      onChange={(e) => setLimitFromAmount(e.target.value)}
                      placeholder="0.0"
                    />
                    <select
                      className="input-glow bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 w-24 ml-2"
                      value={limitFromToken}
                      onChange={(e) => setLimitFromToken(e.target.value)}
                    >
                      {tokens.map((token) => (
                        <option key={token.address} value={token.address}>
                          {token.symbol}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Switch Button */}
                <div className="flex justify-center items-center mb-4">
                  <button className="arrow-btn text-white" onClick={switchLimitTokens}>
                    ⇅
                  </button>
                </div>

                {/* To Section */}
                <div className="flex flex-col mb-4">
                  <div className="flex items-center mb-3">
                    <label className="text-white font-semibold text-lg">To</label>
                    <span className="text-white ml-2">
                      Balance: {getFormattedBalance(limitToToken)} {getTokenSymbol(limitToToken)}
                    </span>
                  </div>
                  <div className="flex items-center mb-4">
                    <input
                      type="number"
                      className="input-glow bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 w-full"
                      value={limitToAmount}
                      onChange={(e) => setLimitToAmount(e.target.value)}
                      placeholder="0.0"
                    />
                    <select
                      className="input-glow bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 w-24 ml-2"
                      value={limitToToken}
                      onChange={(e) => setLimitToToken(e.target.value)}
                    >
                      {tokens.map((token) => (
                        <option key={token.address} value={token.address}>
                          {token.symbol}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Limit Price Section */}
                <div className="flex flex-col mb-4">
                  <div className="flex items-center mb-3">
                    <label className="text-white font-semibold text-lg">Limit Price</label>
                  </div>
                  <div className="flex items-center mb-4">
                    <input
                      type="number"
                      className="input-glow bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 w-full"
                      value={limitPrice}
                      onChange={(e) => setLimitPrice(e.target.value)}
                      placeholder="0.0"
                    />
                  </div>
                </div>

                {/* Above Market Section */}
                <div className="flex flex-col mb-4">
                  <div className="flex items-center mb-3">
                    <label className="text-white font-semibold text-lg">Above Market</label>
                    <span className="text-white ml-2">
                      {poolDetails.token1PerToken2 ? 
                        `${((Number(limitPrice) / Number(poolDetails.token1PerToken2)) - 1 * 100).toFixed(2)}%` 
                        : '0.0%'}
                    </span>
                  </div>
                </div>

                {/* Slippage Control */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-white">Slippage Tolerance</span>
                  <input
                    type="number"
                    className="input-glow bg-gray-800 text-white border border-gray-700 rounded-lg px-2 py-1 w-20"
                    value={slippage}
                    onChange={(e) => setSlippage(parseFloat(e.target.value))}
                    min="0.1"
                    max="5"
                    step="0.1"
                  />
                  <span className="text-white">%</span>
                </div>

                {/* Place Order Button */}
                <button
                  className="btn-glow nav-button py-3 px-6 rounded-lg w-full"
                  onClick={handleLimitOrder}
                  disabled={!limitFromAmount || !limitPrice || loading}
                >
                  Place Limit Order
                </button>

                {/* Limit Orders Section */}
                <div className="mt-6">
                  <h3 className="text-white font-semibold text-lg mb-3">Your Limit Orders</h3>
                  <div className="space-y-2">
                    {orders.map((order) => (
                      <div key={order.orderId} className="flex items-center justify-between bg-gray-800 p-2 rounded">
                        <span className="text-white">
                          {formatEther(order.amount)} {getTokenSymbol(order.token)} @ {formatEther(order.price)}
                        </span>
                        <span className="text-white">{order.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="mt-4 text-red-500 text-sm">{error}</div>
            )}

            {/* Transaction History Section */}
            {securityEnabled && transactions.length > 0 && (
              <div className="mt-6">
                <h3 className="text-white font-semibold text-lg mb-3">Pending Transactions</h3>
                <div className="space-y-2">
                  {transactions.map((txHash) => (
                    <div key={txHash} className="flex items-center justify-between bg-gray-800 p-2 rounded">
                      <span className="text-white">{txHash.slice(0, 10)}...</span>
                      <button
                        className="btn-glow nav-button py-1 px-3 rounded text-sm"
                        onClick={() => dispatch(revealGlobalTransaction(txHash))}
                      >
                        Reveal
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <OrderBook />
    </>
  );
};

export default Swap;


useLiquidityPool.js
import { useDispatch, useSelector } from 'react-redux';
import {
  toggleSecurity,
  revealTransaction,
  swapTokens,
  provideLiquidity,
  removeLiquidity,
  fetchPendingRewards,
  fetchAllTokens,
} from '../store/slices/liquidityPoolSlice';

const useLiquidityPool = () => {
  const dispatch = useDispatch();
  const liquidityPoolState = useSelector((state) => state.liquidityPool);

  return {
    ...liquidityPoolState,
    toggleSecurity: (enabled) => dispatch(toggleSecurity(enabled)),
    revealTransaction: (txHash) => dispatch(revealTransaction(txHash)),
    fetchAllTransactions: (userAddress) =>
      dispatch(fetchAllTransactions(userAddress)),
    swapTokens: (fromToken, amountIn, minAmountOut) =>
      dispatch(swapTokens({ fromToken, amountIn, minAmountOut })),
    provideLiquidity: (amount1, amount2) =>
      dispatch(provideLiquidity({ amount1, amount2 })),
    removeLiquidity: (amount1, amount2) =>
      dispatch(removeLiquidity({ amount1, amount2 })),
    fetchPendingRewards: (userAddress) =>
      dispatch(fetchPendingRewards(userAddress)),
    fetchAllTokens: () => dispatch(fetchAllTokens()),
  };
};

export default useLiquidityPool;
// Compare this snippet from frontend/src/components/LiquidityPool.js:

LiquidityPoolService.js
import { ethers } from 'ethers';
import LiquidityPoolABI from '../contracts/abis/LiquidityPool.json';
import { LIQUIDITY_POOL_ADDRESS } from '../contracts/addresses';

const getLiquidityPoolContract = () => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  return new ethers.Contract(LIQUIDITY_POOL_ADDRESS, LiquidityPoolABI, signer);
};

export const toggleSecurity = async (enabled) => {
  const contract = getLiquidityPoolContract();
  const tx = await contract.toggleSecurity(enabled);
  await tx.wait();
};

export const revealTransaction = async (txHash) => {
  const contract = getLiquidityPoolContract();
  const tx = await contract.revealTransaction(txHash);
  await tx.wait();
};

export const swapTokens = async (fromToken, amountIn, minAmountOut) => {
  const contract = getLiquidityPoolContract();
  const tx = await contract.swap(fromToken, amountIn, minAmountOut);
  await tx.wait();
};

export const provideLiquidity = async (amount1, amount2) => {
  const contract = getLiquidityPoolContract();
  const tx = await contract.provideLiquidity(amount1, amount2);
  await tx.wait();
};

export const removeLiquidity = async (amount1, amount2) => {
  const contract = getLiquidityPoolContract();
  const tx = await contract.removeLiquidity(amount1, amount2);
  await tx.wait();
};

export const fetchPendingRewards = async (userAddress) => {
  const contract = getLiquidityPoolContract();
  const rewards = await contract.calculatePendingRewards(userAddress);
  return rewards.toString();
};

export const fetchAllTokens = async () => {
  const contract = getLiquidityPoolContract();
  const tokens = await contract.getAllTokens();
  return tokens;
};

export const fetchAllTransactions = async (userAddress) => {
    const contract = getLiquidityPoolContract();
    const transactionHashes = await contract.getUserTransactionHashes(userAddress);
    return transactionHashes;
  };

store.js
import { configureStore } from "@reduxjs/toolkit";
import walletReducer from "./slices/walletSlice";
import liquidityPoolReducer from "./slices/liquidityPoolSlice";
import orderBookReducer from "./slices/orderBookSlice";
import adminReducer from "./slices/adminSlice";
import securityReducer from './slices/securitySlice'; 

export const store = configureStore({
  reducer: {
    wallet: walletReducer,
    liquidityPool: liquidityPoolReducer,
    orderBook: orderBookReducer,
    admin: adminReducer,
    security: securityReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // For ethers objects
    }),
});

export default store;

adminSlice.js
// adminSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { BrowserProvider, Contract } from "ethers";
import LiquidityPoolFactoryArtifact from "../../contracts/LiquidityPoolFactory.sol/LiquidityPoolFactory.json";
import OrderBookArtifact from "../../contracts/OrderBook.sol/OrderBook.json";
import { LIQUIDITY_POOL_FACTORY_ADDRESS, ORDER_BOOK_ADDRESS } from "../../contracts/addresses";

// Get ABIs from artifacts
const LiquidityPoolFactoryABI = LiquidityPoolFactoryArtifact.abi;
const OrderBookABI = OrderBookArtifact.abi;

// Helper function to get signer and provider
const getSignerAndProvider = async () => {
  if (!window.ethereum) throw new Error("No crypto wallet found. Please install MetaMask.");
  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return { signer, provider };
};

// Create liquidity pool
export const createLiquidityPool = createAsyncThunk(
  "admin/createLiquidityPool",
  async ({ token1, token2 }, { rejectWithValue }) => {
    try {
      const { signer } = await getSignerAndProvider();
      
      const contract = new Contract(
        LIQUIDITY_POOL_FACTORY_ADDRESS,
        LiquidityPoolFactoryABI,
        signer
      );

      // Check if pool exists
      const existingPool = await contract.getPool(token1, token2);
      if (existingPool !== "0x0000000000000000000000000000000000000000") {
        throw new Error("Pool already exists for these tokens");
      }

      // Create pool
      const tx = await contract.createLiquidityPool(token1, token2);
      console.log("Transaction sent:", tx.hash);

      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);

      // Get pool address from event
      const event = receipt.logs
        .map(log => {
          try {
            return contract.interface.parseLog(log);
          } catch (e) {
            return null;
          }
        })
        .find(event => event && event.name === 'LiquidityPoolCreated');

      if (!event) {
        throw new Error("Pool creation transaction succeeded but event not found");
      }

      const newPoolAddress = event.args.liquidityPool;
      
      return {
        hash: tx.hash,
        poolAddress: newPoolAddress
      };
    } catch (error) {
      if (error.message.includes("Pool exists")) {
        return rejectWithValue("A pool for these tokens already exists");
      }
      if (error.message.includes("Identical tokens")) {
        return rejectWithValue("Cannot create pool with identical tokens");
      }
      return rejectWithValue(error.message);
    }
  }
);

// Get factory contract
const getLiquidityPoolFactoryContract = async () => {
  const { signer } = await getSignerAndProvider();
  return new Contract(LIQUIDITY_POOL_FACTORY_ADDRESS, LiquidityPoolFactoryABI, signer);
};

// Get orderbook contract
const getOrderBookContract = async () => {
  const { signer } = await getSignerAndProvider();
  return new Contract(ORDER_BOOK_ADDRESS, OrderBookABI, signer);
};

// Add token to order book
export const addTokenToOrderBook = createAsyncThunk(
  "admin/addTokenToOrderBook",
  async (tokenAddress, { rejectWithValue }) => {
    try {
      const contract = await getOrderBookContract();
      const tx = await contract.addToken(tokenAddress);
      await tx.wait();
      return { tokenAddress, transaction: tx.hash };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch all liquidity pools
export const fetchAllLiquidityPools = createAsyncThunk(
  "admin/fetchAllLiquidityPools",
  async (_, { rejectWithValue }) => {
    try {
      const contract = await getLiquidityPoolFactoryContract();
      const pools = await contract.getAllLiquidityPools();
      return pools;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch all tokens
export const fetchAllTokens = createAsyncThunk(
  "admin/fetchAllTokens",
  async (_, { rejectWithValue }) => {
    try {
      const contract = await getOrderBookContract();
      const tokens = await contract.getAllTokens();
      return tokens;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Admin slice
const adminSlice = createSlice({
  name: "admin",
  initialState: {
    liquidityPools: [],
    tokens: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createLiquidityPool.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createLiquidityPool.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(createLiquidityPool.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to create liquidity pool";
      })
      .addCase(addTokenToOrderBook.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addTokenToOrderBook.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(addTokenToOrderBook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to add token";
      })
      .addCase(fetchAllLiquidityPools.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllLiquidityPools.fulfilled, (state, action) => {
        state.loading = false;
        state.liquidityPools = action.payload;
        state.error = null;
      })
      .addCase(fetchAllLiquidityPools.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch liquidity pools";
      })
      .addCase(fetchAllTokens.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllTokens.fulfilled, (state, action) => {
        state.loading = false;
        state.tokens = action.payload;
        state.error = null;
      })
      .addCase(fetchAllTokens.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch tokens";
      });
  },
});

export const { clearError } = adminSlice.actions;
export default adminSlice.reducer;

liquidityPoolSlice.js
// Import ethers properly at the top
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ethers, 
  BrowserProvider, 
  Contract, 
  formatEther, 
  parseEther } from 'ethers';
import LiquidityPoolABI from '../../contracts/LiquidityPool.sol/LiquidityPool.json';
import OrderBookArtifact from '../../contracts/OrderBook.sol/OrderBook.json';
import LiquidityPoolFactoryArtifact from '../../contracts/LiquidityPoolFactory.sol/LiquidityPoolFactory.json';
import { LIQUIDITY_POOL_ADDRESS, ORDER_BOOK_ADDRESS, LIQUIDITY_POOL_FACTORY_ADDRESS } from '../../contracts/addresses';

// Add this minimal ERC20 ABI at the top of your file
const ERC20_ABI = [
  "function symbol() view returns (string)",
  "function name() view returns (string)"
];

// Helper function to get contract instance
const getLiquidityPoolContract = async () => {
  try {
    console.log('Creating contract with address:', LIQUIDITY_POOL_ADDRESS);
    
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    
    // Manually create the contract with specific method signatures
    const contract = new Contract(
      LIQUIDITY_POOL_ADDRESS, 
      [
        // View methods
        "function totalLiquidity1() view returns (uint256)",
        "function totalLiquidity2() view returns (uint256)",
        "function userLiquidity1(address user) view returns (uint256)",
        "function userLiquidity2(address user) view returns (uint256)",
        "function token1() view returns (address)",
        "function token2() view returns (address)"
      ], 
      signer
    );

    return contract;
  } catch (error) {
    console.error('Error creating contract instance:', error);
    throw error;
  }
};



// Fetch User Transactions
export const fetchUserTransactions = createAsyncThunk(
  'liquidityPool/fetchUserTransactions',
  async (userAddress, { rejectWithValue }) => {
    try {// Add this minimal ERC20 ABI at the top of your file
      const ERC20_ABI = [
        "function symbol() view returns (string)",
        "function name() view returns (string)"
      ];
      const contract = getLiquidityPoolContract();
      
      // Create filters for each event type
      const swapSubmittedFilter = contract.filters.SwapSubmitted(null, userAddress);
      const swapRevealedFilter = contract.filters.SwapRevealed(null, userAddress);
      const provideLiquidityFilter = contract.filters.ProvideLiquidity(userAddress);
      const removeLiquidityFilter = contract.filters.RemoveLiquidity(userAddress);
      const rewardsDistributedFilter = contract.filters.RewardsDistributed(userAddress);

      // Get events from last 1000 blocks
      const fromBlock = await contract.provider.getBlockNumber() - 1000;
      const toBlock = 'latest';

      // Query all events
      const [
        swapSubmitted,
        swapRevealed,
        provideLiquidity,
        removeLiquidity,
        rewardsDistributed
      ] = await Promise.all([
        contract.queryFilter(swapSubmittedFilter, fromBlock, toBlock),
        contract.queryFilter(swapRevealedFilter, fromBlock, toBlock),
        contract.queryFilter(provideLiquidityFilter, fromBlock, toBlock),
        contract.queryFilter(removeLiquidityFilter, fromBlock, toBlock),
        contract.queryFilter(rewardsDistributedFilter, fromBlock, toBlock)
      ]);

      // Process events into standardized format
      const processedEvents = [
        ...swapSubmitted.map(event => ({
          type: 'swap',
          status: 'pending',
          txHash: event.args.txHash,
          amount: event.args.amountIn.toString(),
          timestamp: event.args.timestamp.toString(),
          isPrivate: event.args.isPrivate,
          transaction: event.transactionHash
        })),
        ...swapRevealed.map(event => ({
          type: 'swap',
          status: 'confirmed',
          txHash: event.args.txHash,
          amountIn: event.args.amountIn.toString(),
          amountOut: event.args.amountOut.toString(),
          transaction: event.transactionHash,
          timestamp: event.blockNumber
        })),
        ...provideLiquidity.map(event => ({
          type: 'addLiquidity',
          status: 'confirmed',
          amount1: event.args.amount1.toString(),
          amount2: event.args.amount2.toString(),
          transaction: event.transactionHash,
          timestamp: event.blockNumber
        })),
        ...removeLiquidity.map(event => ({
          type: 'removeLiquidity',
          status: 'confirmed',
          amount1: event.args.amount1.toString(),
          amount2: event.args.amount2.toString(),
          transaction: event.transactionHash,
          timestamp: event.blockNumber
        })),
        ...rewardsDistributed.map(event => ({
          type: 'claimRewards',
          status: 'confirmed',
          amount: event.args.rewardAmount.toString(),
          transaction: event.transactionHash,
          timestamp: event.blockNumber
        }))
      ];

      // Sort by timestamp descending (most recent first)
      return processedEvents.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


export const swapTokens = createAsyncThunk(
  'liquidityPool/swapTokens',
  async ({ fromToken, amountIn, minAmountOut }, { rejectWithValue }) => {
    try {
      const contract = getLiquidityPoolContract();
      const tx = await contract.swap(fromToken, amountIn, minAmountOut);
      await tx.wait();
      return { fromToken, amountIn, minAmountOut, transaction: tx.hash };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const provideLiquidity = createAsyncThunk(
  'liquidityPool/provideLiquidity',
  async ({ amount1, amount2 }, { rejectWithValue }) => {
    try {
      const contract = getLiquidityPoolContract();
      const tx = await contract.provideLiquidity(amount1, amount2);
      await tx.wait();
      return { amount1, amount2, transaction: tx.hash };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeLiquidity = createAsyncThunk(
  'liquidityPool/removeLiquidity',
  async ({ amount1, amount2 }, { rejectWithValue }) => {
    try {
      const contract = getLiquidityPoolContract();
      const tx = await contract.removeLiquidity(amount1, amount2);
      await tx.wait();
      return { amount1, amount2, transaction: tx.hash };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchPendingRewards = createAsyncThunk(
  'liquidityPool/fetchPendingRewards',
  async (userAddress, { rejectWithValue }) => {
    try {
      const contract = getLiquidityPoolContract();
      const rewards = await contract.calculatePendingRewards(userAddress);
      return rewards.toString();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Modified fetchAllTokens to include symbols
export const fetchAllTokens = createAsyncThunk(
  'liquidityPool/fetchAllTokens',
  async (_, { rejectWithValue }) => {
    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Get OrderBook tokens
      const orderBookContract = new Contract(
        ORDER_BOOK_ADDRESS,
        OrderBookArtifact.abi,
        signer
      );
      const orderBookTokens = await orderBookContract.getAllTokens();

      // Get Factory contract
      const factoryContract = new Contract(
        LIQUIDITY_POOL_FACTORY_ADDRESS,
        LiquidityPoolFactoryArtifact.abi,
        signer
      );

      // Get pools
      const pools = await factoryContract.getAllLiquidityPools();

      // Get unique tokens
      const uniqueTokens = new Set([...orderBookTokens]);

      // Add pool tokens
      for (const poolAddress of pools) {
        try {
          const poolContract = new Contract(
            poolAddress,
            ["function token1() view returns (address)", "function token2() view returns (address)"],
            signer
          );
          
          const [token1, token2] = await Promise.all([
            poolContract.token1(),
            poolContract.token2()
          ]);
          
          uniqueTokens.add(token1);
          uniqueTokens.add(token2);
        } catch (error) {
          console.error(`Error fetching tokens from pool ${poolAddress}:`, error);
        }
      }

      // Get symbol for each token
      const tokenArray = Array.from(uniqueTokens);
      const tokenDetails = await Promise.all(
        tokenArray.map(async (address) => {
          try {
            const tokenContract = new Contract(address, ERC20_ABI, provider);
            const [symbol, name] = await Promise.all([
              tokenContract.symbol(),
              tokenContract.name()
            ]);
            return {
              address,
              symbol,
              name
            };
          } catch (error) {
            console.error(`Error fetching token details for ${address}:`, error);
            return {
              address,
              symbol: 'UNKNOWN',
              name: 'Unknown Token'
            };
          }
        })
      );

      return tokenDetails;
    } catch (error) {
      console.error("fetchAllTokens error:", error);
      return rejectWithValue(error.message);
    }
  }
);




export const fetchPoolDetails = createAsyncThunk(
  'liquidityPool/fetchPoolDetails',
  async (userAddress, { rejectWithValue }) => {
    try {
      console.log('Fetching pool details for address:', userAddress);

      const contract = await getLiquidityPoolContract();

      // Fetch total liquidity and user liquidity
      const [
        totalLiquidity1Raw, 
        totalLiquidity2Raw, 
        userLiquidity1Raw, 
        userLiquidity2Raw
      ] = await Promise.all([
        contract.totalLiquidity1(),
        contract.totalLiquidity2(),
        contract.userLiquidity1(userAddress),
        contract.userLiquidity2(userAddress)
      ]);

      // Convert to strings to log actual values
      const totalLiquidity1 = totalLiquidity1Raw.toString();
      const totalLiquidity2 = totalLiquidity2Raw.toString();
      const userLiquidity1 = userLiquidity1Raw.toString();
      const userLiquidity2 = userLiquidity2Raw.toString();

      console.log('Total Liquidity 1:', totalLiquidity1);
      console.log('Total Liquidity 2:', totalLiquidity2);
      console.log('User Liquidity 1:', userLiquidity1);
      console.log('User Liquidity 2:', userLiquidity2);

      // Calculate pool share
      const calculatePoolShare = (userLiq1, userLiq2, totalLiq1, totalLiq2) => {
        const userLiq1Big = BigInt(userLiq1);
        const userLiq2Big = BigInt(userLiq2);
        const totalLiq1Big = BigInt(totalLiq1);
        const totalLiq2Big = BigInt(totalLiq2);

        const userTotalLiquidityBig = userLiq1Big + userLiq2Big;
        const totalPoolLiquidityBig = totalLiq1Big + totalLiq2Big;

        if (totalPoolLiquidityBig === 0n) return '0';

        const poolShareBig = (userTotalLiquidityBig * 10000n) / totalPoolLiquidityBig;
        
        const wholePercent = poolShareBig / 100n;
        const decimalPercent = poolShareBig % 100n;

        return `${wholePercent}.${decimalPercent.toString().padStart(2, '0')}`;
      };

      const poolShare = calculatePoolShare(
        userLiquidity1, 
        userLiquidity2, 
        totalLiquidity1, 
        totalLiquidity2
      );

      let token1PerToken2 = '0';
      let token2PerToken1 = '0';

      try {
        token1PerToken2 = totalLiquidity1 !== '0' && totalLiquidity2 !== '0'
          ? (BigInt(totalLiquidity2) / BigInt(totalLiquidity1)).toString()
          : '0';
        token2PerToken1 = totalLiquidity1 !== '0' && totalLiquidity2 !== '0'
          ? (BigInt(totalLiquidity1) / BigInt(totalLiquidity2)).toString()
          : '0';
      } catch (priceError) {
        console.error('Price calculation error:', priceError);
      }

      return { 
        token1PerToken2, 
        token2PerToken1, 
        poolShare: `${poolShare}%` 
      };
    } catch (error) {
      console.error('Fetch Pool Details Error:', error);
      return rejectWithValue(error.message);
    }
  }
);



export const depositRewards = createAsyncThunk(
  'liquidityPool/depositRewards',
  async (amount, { rejectWithValue }) => {
    try {
      const contract = getLiquidityPoolContract();
      const tx = await contract.depositRewards(amount);
      await tx.wait();
      return amount;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const distributeRewards = createAsyncThunk(
  'liquidityPool/distributeRewards',
  async (_, { rejectWithValue }) => {
    try {
      const contract = getLiquidityPoolContract();
      const tx = await contract.distributeRewards();
      await tx.wait();
      return { transaction: tx.hash };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const initialize = createAsyncThunk(
  'liquidityPool/initialize',
  async ({ token1, token2 }, { rejectWithValue }) => {
    try {
      const contract = getLiquidityPoolContract();
      const tx = await contract.initialize(token1, token2);
      await tx.wait();
      return { token1, token2 };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getAmountOut = createAsyncThunk(
  'liquidityPool/getAmountOut',
  async ({ amountIn, reserveIn, reserveOut }, { rejectWithValue }) => {
    try {
      // Validate inputs
      if (!amountIn || !reserveIn || !reserveOut) {
        throw new Error("Invalid input values for amountIn, reserveIn, or reserveOut");
      }

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Create contract instance
      const contract = new Contract(
        LIQUIDITY_POOL_ADDRESS,
        LiquidityPoolABI.abi,
        signer
      );

      // Call the contract method
      const amountOut = await contract.getAmountOut(amountIn, reserveIn, reserveOut);
      return amountOut.toString();
    } catch (error) {
      // If contract call fails, calculate locally
      try {
        // Validate inputs again for local calculation
        if (!amountIn || !reserveIn || !reserveOut) {
          throw new Error("Invalid input values for amountIn, reserveIn, or reserveOut");
        }

        const amountInWithFee = BigInt(amountIn) * BigInt(997);
        const numerator = amountInWithFee * BigInt(reserveOut);
        const denominator = (BigInt(reserveIn) * BigInt(1000)) + amountInWithFee;
        return (numerator / denominator).toString();
      } catch (calcError) {
        console.error("GetAmountOut calculation error:", calcError);
        return rejectWithValue(calcError.message);
      }
    }
  }
);

// Update fetchTokenBalances to properly handle multiple tokens
export const fetchTokenBalances = createAsyncThunk(
  'liquidityPool/fetchTokenBalances',
  async (userAddress, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const { tokens } = state.liquidityPool;
      
      if (!tokens || tokens.length === 0) {
        return {
          token1Balance: '0',
          token2Balance: '0',
          tokenBalances: {}
        };
      }

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const balances = await Promise.all(
        tokens.map(async (token) => {
          try {
            const tokenContract = new Contract(
              token.address, // Use token.address instead of token directly
              ["function balanceOf(address) view returns (uint256)"],
              signer
            );
            const balance = await tokenContract.balanceOf(userAddress);
            return { address: token.address, balance: balance.toString() };
          } catch (error) {
            console.error(`Error fetching balance for token ${token.address}:`, error);
            return { address: token.address, balance: '0' };
          }
        })
      );

      // Create a mapping of token addresses to balances
      const balanceMap = balances.reduce((acc, { address, balance }) => {
        acc[address] = balance;
        return acc;
      }, {});

      return {
        token1Balance: balanceMap[tokens[0]?.address] || '0',
        token2Balance: balanceMap[tokens[1]?.address] || '0',
        tokenBalances: balanceMap
      };
    } catch (error) {
      console.error("fetchTokenBalances error:", error);
      return rejectWithValue(error.message);
    }
  }
);

// Slice definition
const liquidityPoolSlice = createSlice({
  name: 'liquidityPool',
  initialState: {
    tokens: [],
    pendingRewards: '0',
    transactions: {
      items: [],
      status: {},
      lastUpdate: null,
    },
    loading: false,
    error: null,
    token1: null,
    token2: null,
    totalLiquidity1: 0,
    totalLiquidity2: 0,
    userLiquidity1: 0,
    userLiquidity2: 0,
    lastRewardTime: 0,
    rewardRate: 1,
    delayTime: 5,
    feeRate: 20,
    token1Balance: '0',
    token2Balance: '0',
    tokenBalances: {},
    poolDetails: {
      token1PerToken2: '0',
      token2PerToken1: '0',
      poolShare: '0%',
    },
  },
  reducers: {
    updateTransactionStatus(state, action) {
      const { txHash, status } = action.payload;
      if (state.transactions.status[txHash]) {
        state.transactions.status[txHash] = status;
      }
    },
    clearTransactionHistory(state) {
      state.transactions.items = [];
      state.transactions.status = {};
      state.transactions.lastUpdate = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Updated fetchAllTokens cases
      .addCase(fetchAllTokens.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllTokens.fulfilled, (state, action) => {
        state.tokens = action.payload;
        state.loading = false;
      })
      .addCase(fetchAllTokens.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      // Updated fetchTokenBalances cases
      .addCase(fetchTokenBalances.fulfilled, (state, action) => {
        state.token1Balance = action.payload.token1Balance;
        state.token2Balance = action.payload.token2Balance;
        state.tokenBalances = action.payload.tokenBalances;
      })
      // Fetch Pool Details
      .addCase(fetchPoolDetails.fulfilled, (state, action) => {
        state.poolDetails = action.payload;
      })
      // Fetch User Transactions
      .addCase(fetchUserTransactions.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserTransactions.fulfilled, (state, action) => {
        state.transactions.items = action.payload;
        state.transactions.lastUpdate = Date.now();
        state.loading = false;
        
        // Update status tracking
        const newStatus = {};
        action.payload.forEach(tx => {
          newStatus[tx.transaction] = tx.status;
        });
        state.transactions.status = newStatus;
      })
      .addCase(fetchUserTransactions.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      // Handle other actions
      .addCase(depositRewards.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(distributeRewards.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(initialize.fulfilled, (state, action) => {
        state.token1 = action.payload.token1;
        state.token2 = action.payload.token2;
        state.loading = false;
      })
      .addCase(initialize.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      // Add cases for swapTokens
      .addCase(swapTokens.pending, (state) => {
        state.loading = true;
      })
      .addCase(swapTokens.fulfilled, (state, action) => {
        state.loading = false;
        // Add the transaction to status tracking
        if (action.payload.transaction) {
          state.transactions.status[action.payload.transaction] = 'confirmed';
        }
      })
      .addCase(swapTokens.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
        // Mark failed transaction if available
        if (action.meta.arg.transaction) {
          state.transactions.status[action.meta.arg.transaction] = 'failed';
        }
      })
      // Add cases for provideLiquidity
      .addCase(provideLiquidity.pending, (state) => {
        state.loading = true;
      })
      .addCase(provideLiquidity.fulfilled, async (state, action) => {
        state.loading = false;
        if (window.ethereum) {
          const provider = new BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const address = await signer.getAddress();
          
          // Refetch pool details and token balances
          dispatch(fetchTokenBalances(address));
          dispatch(fetchPoolDetails(address));
        }
      })
      .addCase(provideLiquidity.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
        if (action.meta.arg.transaction) {
          state.transactions.status[action.meta.arg.transaction] = 'failed';
        }
      })
      // Add cases for removeLiquidity
      .addCase(removeLiquidity.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeLiquidity.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.transaction) {
          state.transactions.status[action.payload.transaction] = 'confirmed';
        }
      })
      .addCase(removeLiquidity.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
        if (action.meta.arg.transaction) {
          state.transactions.status[action.meta.arg.transaction] = 'failed';
        }
      });
  },
});

export const { updateTransactionStatus, clearTransactionHistory } = liquidityPoolSlice.actions;

export default liquidityPoolSlice.reducer;

orderBookSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ethers } from 'ethers';
import OrderBookABI from '../../contracts/OrderBook.sol/OrderBook.json';
import { ORDER_BOOK_ADDRESS } from '../../contracts/addresses';

// Helper function to get the contract instance
const getOrderBookContract = () => {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = provider.getSigner();
  return new ethers.Contract(ORDER_BOOK_ADDRESS, OrderBookABI, signer);
};

// Place Order
export const placeOrder = createAsyncThunk(
  'orderBook/placeOrder',
  async ({ token, amount, price, isBuyOrder }, { rejectWithValue }) => {
    try {
      const contract = getOrderBookContract();
      const tx = await contract.placeOrder(token, amount, price, isBuyOrder);
      await tx.wait();
      return { token, amount, price, isBuyOrder, transaction: tx.hash };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Execute Order
export const executeOrder = createAsyncThunk(
  'orderBook/executeOrder',
  async ({ orderId, marketLiquidity1, marketLiquidity2 }, { rejectWithValue }) => {
    try {
      const contract = getOrderBookContract();
      const tx = await contract.executeOrder(orderId, marketLiquidity1, marketLiquidity2);
      await tx.wait();
      return { orderId, transaction: tx.hash };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Cancel Order
export const cancelOrder = createAsyncThunk(
  'orderBook/cancelOrder',
  async (orderId, { rejectWithValue }) => {
    try {
      const contract = getOrderBookContract();
      const tx = await contract.cancelOrder(orderId);
      await tx.wait();
      return { orderId, transaction: tx.hash };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Get Amount Out
export const getAmountOut = createAsyncThunk(
  'orderBook/getAmountOut',
  async ({ amountIn, reserveIn, reserveOut }, { rejectWithValue }) => {
    try {
      const contract = getOrderBookContract();
      const amountOut = await contract.getAmountOut(amountIn, reserveIn, reserveOut);
      return amountOut.toString();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addToken = createAsyncThunk(
    'orderBook/addToken',
    async (tokenAddress, { rejectWithValue }) => {
      try {
        const contract = getOrderBookContract();
        const tx = await contract.addToken(tokenAddress);
        await tx.wait();
        return { tokenAddress, transaction: tx.hash };
      } catch (error) {
        return rejectWithValue(error.message);
      }
    }
  );


// Get All Tokens
export const getAllTokens = createAsyncThunk(
  'orderBook/getAllTokens',
  async (_, { rejectWithValue }) => {
    try {
      const contract = getOrderBookContract();
      const tokens = await contract.getAllTokens();
      return tokens;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Get User Transaction Hashes
export const getUserTransactionHashes = createAsyncThunk(
  'orderBook/getUserTransactionHashes',
  async (_, { rejectWithValue }) => {
    try {
      const contract = getOrderBookContract();
      const hashes = await contract.getUserTransactionHashes();
      return hashes;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch Orders Events
export const fetchOrders = createAsyncThunk(
  'orderBook/fetchOrders',
  async (userAddress, { rejectWithValue }) => {
    try {
      const contract = getOrderBookContract();
      
      // Create filters for events
      const orderPlacedFilter = contract.filters.OrderPlaced(null, userAddress);
      const orderExecutedFilter = contract.filters.OrderExecuted();
      const orderCancelledFilter = contract.filters.OrderCancelled(null, userAddress);

      // Get recent blocks
      const fromBlock = await contract.provider.getBlockNumber() - 1000;
      const toBlock = 'latest';

      // Get all events
      const [placed, executed, cancelled] = await Promise.all([
        contract.queryFilter(orderPlacedFilter, fromBlock, toBlock),
        contract.queryFilter(orderExecutedFilter, fromBlock, toBlock),
        contract.queryFilter(orderCancelledFilter, fromBlock, toBlock)
      ]);

      // Process events
      const orders = placed.map(event => ({
        orderId: event.args.orderId.toString(),
        user: event.args.user,
        token: event.args.token,
        amount: event.args.amount.toString(),
        price: event.args.price.toString(),
        isBuyOrder: event.args.isBuyOrder,
        isPrivate: event.args.isPrivate,
        status: 'active',
        timestamp: event.blockNumber
      }));

      // Update status for executed and cancelled orders
      executed.forEach(event => {
        const order = orders.find(o => o.orderId === event.args.orderId.toString());
        if (order) order.status = 'executed';
      });

      cancelled.forEach(event => {
        const order = orders.find(o => o.orderId === event.args.orderId.toString());
        if (order) order.status = 'cancelled';
      });

      return orders;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const orderBookSlice = createSlice({
  name: 'orderBook',
  initialState: {
    orders: [],
    tokens: [],
    transactions: [],
    orderCount: 0,
    loading: false,
    error: null,
    delayTime: 5,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder

      // Place Order
      .addCase(placeOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(placeOrder.fulfilled, (state) => {
        state.loading = false;
        state.orderCount += 1;
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })

      // Execute Order
      .addCase(executeOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(executeOrder.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(executeOrder.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })

      // Cancel Order
      .addCase(cancelOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(cancelOrder.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })

    //   Add Token
      .addCase(addToken.pending, (state) => {
        state.loading = true;
      })
      .addCase(addToken.fulfilled, (state, action) => {
        state.tokens = [...state.tokens, action.payload.tokenAddress];
        state.loading = false;
      })
      .addCase(addToken.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })

      // Get All Tokens
      .addCase(getAllTokens.fulfilled, (state, action) => {
        state.tokens = action.payload;
      })

      // Get User Transaction Hashes
      .addCase(getUserTransactionHashes.fulfilled, (state, action) => {
        state.transactions = action.payload;
      })

      // Fetch Orders
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.orders = action.payload;
        state.loading = false;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      });
  },
});

export default orderBookSlice.reducer;


securitySlice.js
// securitySlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ethers } from 'ethers';
import LiquidityPoolABI from '../../contracts/LiquidityPool.sol/LiquidityPool.json';
import OrderBookABI from '../../contracts/OrderBook.sol/OrderBook.json';
import { LIQUIDITY_POOL_ADDRESS, ORDER_BOOK_ADDRESS } from '../../contracts/addresses';

// Helper function to get contract instances
const getContracts = async () => {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = provider.getSigner();
  const liquidityPool = new ethers.Contract(LIQUIDITY_POOL_ADDRESS, LiquidityPoolABI, signer);
  const orderBook = new ethers.Contract(ORDER_BOOK_ADDRESS, OrderBookABI, signer);
  return { liquidityPool, orderBook };
};

// Toggle security across all contracts
export const toggleGlobalSecurity = createAsyncThunk(
  'security/toggleGlobalSecurity',
  async (enabled, { rejectWithValue }) => {
    try {
      const { liquidityPool, orderBook } = await getContracts();
      
      // Toggle security on both contracts
      const tx1 = await liquidityPool.toggleSecurity(enabled);
      await tx1.wait();
      
      const tx2 = await orderBook.toggleSecurity(enabled);
      await tx2.wait();
      
      return enabled;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Reveal transaction across contracts
export const revealGlobalTransaction = createAsyncThunk(
  'security/revealGlobalTransaction',
  async ({ txHash, contractType }, { rejectWithValue }) => {
    try {
      const { liquidityPool, orderBook } = await getContracts();
      let tx;
      
      if (contractType === 'liquidityPool') {
        tx = await liquidityPool.revealTransaction(txHash);
      } else if (contractType === 'orderBook') {
        tx = await orderBook.revealTransaction(txHash);
      }
      
      await tx.wait();
      return { txHash, contractType };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const securitySlice = createSlice({
  name: 'security',
  initialState: {
    securityEnabled: false,
    transactions: {
      liquidityPool: {},
      orderBook: {}
    },
    loading: false,
    error: null,
    delayTime: 5
  },
  reducers: {
    clearTransactions: (state) => {
      state.transactions = {
        liquidityPool: {},
        orderBook: {}
      };
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(toggleGlobalSecurity.pending, (state) => {
        state.loading = true;
      })
      .addCase(toggleGlobalSecurity.fulfilled, (state, action) => {
        state.securityEnabled = action.payload;
        state.loading = false;
      })
      .addCase(toggleGlobalSecurity.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      .addCase(revealGlobalTransaction.pending, (state) => {
        state.loading = true;
      })
      .addCase(revealGlobalTransaction.fulfilled, (state, action) => {
        const { txHash, contractType } = action.payload;
        state.transactions[contractType][txHash] = 'revealed';
        state.loading = false;
      })
      .addCase(revealGlobalTransaction.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      });
  }
});

export const { clearTransactions } = securitySlice.actions;
export default securitySlice.reducer;


walletSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  address: null,
  isConnecting: false,
  error: null,
};

const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
    setWalletAddress: (state, action) => {
      state.address = action.payload;
    },
    setIsConnecting: (state, action) => {
      state.isConnecting = action.payload;
    },
    setWalletError: (state, action) => {
      state.error = action.payload;
    },
    resetWallet: (state) => {
      state.address = null;
      state.isConnecting = false;
      state.error = null;
    },
  },
});

export const { setWalletAddress, setIsConnecting, setWalletError, resetWallet } =
  walletSlice.actions;

export default walletSlice.reducer;

App.js
// App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Swap from "./pages/Swap";
import Liquidity from "./pages/Liquidity";
import History from "./pages/History";
import Mempool from "./pages/Mempool";
import AdminPage from "./pages/AdminPage";

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <NavBar />
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/swap" element={<Swap />} />
            <Route path="/liquidity" element={<Liquidity />} />
            <Route path="/history" element={<History />} />
            <Route path="/mempool" element={<Mempool />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;


index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { store } from './store/store';
import { Provider } from 'react-redux';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </Provider>
);

begin fixing it all please, one after the other, maintain our design and still connect the contract to work well please