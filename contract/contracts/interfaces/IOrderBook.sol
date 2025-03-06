// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IOrderBook {
    struct Order {
        address user;
        address token;
        uint256 amount;
        uint256 price;
        bool isBuyOrder;
    }

    function placeOrder(address token, uint256 amount, uint256 price, bool isBuyOrder) external;
    function executeOrder(uint256 orderId, uint256 currentPrice) external;
    function getOrder(uint256 orderId) external view returns (Order memory);
}
