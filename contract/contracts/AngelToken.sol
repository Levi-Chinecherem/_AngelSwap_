// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AngelToken is ERC20, Ownable {

    uint256 public mintRate = 1000; // Base rate for minting, adjusts dynamically
    mapping(address => bool) public approvedMinters; // Track approved minters
    address public faucetAddress; // Address of the faucet contract
    address public liquidityPoolAddress; // Address of the liquidity pool contract

    event Mint(address indexed user, uint256 amount);
    event MinterApproved(address indexed minter, bool approved);
    event FaucetAddressSet(address indexed faucet);
    event LiquidityPoolAddressSet(address indexed liquidityPool);

    constructor(uint256 initialSupply) ERC20("AngelToken", "ANGEL") {
        _mint(msg.sender, initialSupply);
    }

    // Set the faucet address (used to mint tokens directly to users)
    function setFaucetAddress(address _faucetAddress) external onlyOwner {
        faucetAddress = _faucetAddress;
        emit FaucetAddressSet(_faucetAddress);
    }

    // Set the liquidity pool address (used to mint tokens to the liquidity pool)
    function setLiquidityPoolAddress(address _liquidityPoolAddress) external onlyOwner {
        liquidityPoolAddress = _liquidityPoolAddress;
        emit LiquidityPoolAddressSet(_liquidityPoolAddress);
    }

    // Approve or revoke minters
    function approveMinter(address minter, bool approved) external onlyOwner {
        approvedMinters[minter] = approved;
        emit MinterApproved(minter, approved);
    }

    // Mint tokens directly (used by approved contracts like LiquidityPool and Faucet)
    function mint(address to, uint256 amount) external {
        require(approvedMinters[msg.sender], "Not an approved minter");
        _mint(to, amount);
        emit Mint(to, amount);
    }

    // Adjust minting rate based on owner preferences
    function adjustMintRate(uint256 newRate) external onlyOwner {
        mintRate = newRate;
    }

    // Owner can check total supply of the token
    function getTotalSupply() external view onlyOwner returns (uint256) {
        return totalSupply();
    }

    // Owner can check circulating supply of the token (subtracts faucet and liquidity pool balances)
    function circulatingSupply() external view onlyOwner returns (uint256) {
        uint256 totalSupply = totalSupply();
        uint256 faucetBalance = balanceOf(faucetAddress);
        uint256 liquidityPoolBalance = balanceOf(liquidityPoolAddress);
        
        return totalSupply - faucetBalance - liquidityPoolBalance;
    }
}
