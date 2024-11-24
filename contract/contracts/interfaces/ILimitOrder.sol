// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ILimitOrder {
    function placeLimitOrder(address token, uint256 amount, uint256 price, bool isBuyOrder) external;
    function cancelLimitOrder(uint256 orderId) external;
    function getLimitOrder(uint256 orderId) external view returns (address user, address token, uint256 amount, uint256 price, bool isBuyOrder);
}
