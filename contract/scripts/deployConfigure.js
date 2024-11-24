const { ethers } = require("hardhat");

async function main() {
    // Get the AngelToken contract address
    const angelTokenAddress = "0xYourAngelTokenAddress"; // Replace with the actual deployed AngelToken address

    // Deploy the TokenConfiguration contract
    const TokenConfiguration = await ethers.getContractFactory("TokenConfiguration");
    const tokenConfiguration = await TokenConfiguration.deploy(angelTokenAddress);
    await tokenConfiguration.deployed();

    console.log(`TokenConfiguration contract deployed to: ${tokenConfiguration.address}`);

    // Optionally, you can set the initial configurations here if needed
    // Example: Set faucet address, liquidity pool address, mint rate, etc.
    const faucetAddress = "0xYourFaucetAddress"; // Replace with actual faucet contract address
    const liquidityPoolAddress = "0xYourLiquidityPoolAddress"; // Replace with actual liquidity pool contract address

    // Set the faucet address in the TokenConfiguration contract
    await tokenConfiguration.setFaucetAddress(faucetAddress);
    console.log(`Faucet address set: ${faucetAddress}`);

    // Set the liquidity pool address in the TokenConfiguration contract
    await tokenConfiguration.setLiquidityPoolAddress(liquidityPoolAddress);
    console.log(`Liquidity pool address set: ${liquidityPoolAddress}`);

    // Optionally, set the mint rate and approve minters
    const initialMintRate = 1000; // Example mint rate
    await tokenConfiguration.adjustMintRate(initialMintRate);
    console.log(`Initial mint rate set to: ${initialMintRate}`);
}

// Execute the deployment script
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
