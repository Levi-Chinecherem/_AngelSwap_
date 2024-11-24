// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./AngelToken.sol";  // Import the AngelToken contract

contract TokenConfiguration is Ownable {
    AngelToken public angelToken;

    // Track the last time a user interacted with the faucet
    mapping(address => uint256) public faucetUsers;
    // Track the amount minted by faucet users in the last 24 hours
    mapping(address => uint256) public mintedAmount;

    // Amount each faucet user can mint per 24 hours
    uint256 public faucetMintAmount = 10 * 10**18;  // Example: 10 ANGEL tokens

    // Duration of the 24-hour window
    uint256 public faucetMintDuration = 24 hours;

    constructor(address _angelTokenAddress) {
        angelToken = AngelToken(_angelTokenAddress);
    }

    // Set faucet address in the AngelToken contract
    function setFaucetAddress(address faucetAddress) external onlyOwner {
        angelToken.setFaucetAddress(faucetAddress);
    }

    // Set liquidity pool address in the AngelToken contract
    function setLiquidityPoolAddress(address liquidityPoolAddress) external onlyOwner {
        angelToken.setLiquidityPoolAddress(liquidityPoolAddress);
    }

    // Approve minter (anyone adding liquidity or interacting with faucet)
    function approveMinter(address minter, bool approved) external onlyOwner {
        angelToken.approveMinter(minter, approved);
    }

    // Adjust the mint rate in the AngelToken contract
    function adjustMintRate(uint256 mintRate) external onlyOwner {
        angelToken.adjustMintRate(mintRate);
    }

    // Function for faucet users to mint tokens, with a 24-hour limit
    function interactWithFaucet(address user) external {
        // Check if 24 hours have passed since the last mint
        if (faucetUsers[user] + faucetMintDuration <= block.timestamp) {
            // Reset the minted amount after 24 hours
            mintedAmount[user] = 0;
        }

        // Ensure the user hasn't already minted the allowed amount today
        require(mintedAmount[user] + faucetMintAmount <= faucetMintAmount, "Faucet: Already minted the allowed amount for today.");

        // Mint the tokens to the user
        angelToken.transfer(user, faucetMintAmount);
        mintedAmount[user] += faucetMintAmount;  // Track the amount minted

        // Update the last interaction time
        faucetUsers[user] = block.timestamp;
    }

    // Function to allow the owner to change the mint amount for the faucet
    function updateFaucetMintAmount(uint256 newMintAmount) external onlyOwner {
        faucetMintAmount = newMintAmount;
    }
}
