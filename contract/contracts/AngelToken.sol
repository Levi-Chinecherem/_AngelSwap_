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
