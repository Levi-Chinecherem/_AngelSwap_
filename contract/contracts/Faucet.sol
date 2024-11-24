// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// Define an interface for the ANGEL token to call the mint function
interface IAngelToken {
    function totalSupply() external view returns (uint256);
    function circulatingSupply() external view returns (uint256);
    function mint(address to, uint256 amount) external;
}

contract Faucet is Ownable {
    
    address public token;
    uint256 public claimAmount;

    modifier onlyOwner() {
        require(msg.sender == owner(), "Not the owner");
        _;
    }

    event Claimed(address indexed user, uint256 amount);

    constructor(address _token, uint256 _claimAmount) {
        token = _token;
        claimAmount = _claimAmount;
    }

    // Claim function for users: Mint new tokens directly
    function claim() external {
        // Mint the claim amount of ANGEL tokens to the user's address
        IAngelToken(token).mint(msg.sender, claimAmount);
        emit Claimed(msg.sender, claimAmount);
    }

    // Only owner can update claim amount
    function setClaimAmount(uint256 _newAmount) external onlyOwner {
        claimAmount = _newAmount;
    }

    // Owner can check total supply of the token
    function getTotalSupply() external view onlyOwner returns (uint256) {
        return IAngelToken(token).totalSupply();
    }

    // Owner can check circulating supply of the token
    function getCirculatingSupply() external view onlyOwner returns (uint256) {
        return IAngelToken(token).circulatingSupply();
    }
}
