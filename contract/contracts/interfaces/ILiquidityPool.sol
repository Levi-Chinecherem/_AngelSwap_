// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ILiquidityPool {
    function swap(address fromToken, uint256 amountIn) external returns (uint256 amountOut);
    function provideLiquidity(uint256 amount1, uint256 amount2) external;
    function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut) external view returns (uint256);
}
