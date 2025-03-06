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
