// scripts/deployLiquidityPool.js

const { ethers } = require("hardhat");

async function main() {
    // The addresses of the ANGEL token (mintable token) and the secondary token
    const angelTokenAddress = "0xYourAngelTokenAddress"; // Replace with your ANGEL token address
    const secondaryTokenAddress = "0xYourSecondaryTokenAddress"; // Replace with your secondary ERC20 token address

    // Deploy the LiquidityPool contract
    const LiquidityPool = await ethers.getContractFactory("LiquidityPool");
    const liquidityPool = await LiquidityPool.deploy(angelTokenAddress, secondaryTokenAddress);
    await liquidityPool.deployed();

    console.log(`LiquidityPool deployed to: ${liquidityPool.address}`);

    // Optionally, you can also interact with the deployed contract (e.g., set initial configurations, etc.)
}

// Execute the deployment script
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
