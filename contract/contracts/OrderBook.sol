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
