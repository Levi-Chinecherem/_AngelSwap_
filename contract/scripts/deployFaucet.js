// scripts/deployFaucet.js

const { ethers } = require("hardhat");

async function main() {
    // The address of the deployed AngelToken contract
    const angelTokenAddress = "0xYourAngelTokenAddress"; // Replace with your actual AngelToken contract address
    const claimAmount = ethers.utils.parseUnits("10", 18); // The amount of ANGEL tokens to claim (e.g., 10 ANGEL tokens)

    // Deploy the Faucet contract
    const Faucet = await ethers.getContractFactory("Faucet");
    const faucet = await Faucet.deploy(angelTokenAddress, claimAmount);
    await faucet.deployed();

    console.log(`Faucet deployed to: ${faucet.address}`);

    // Optionally, set the Faucet address in the AngelToken contract
    const angelToken = await ethers.getContractAt("AngelToken", angelTokenAddress);
    await angelToken.setFaucetAddress(faucet.address);
    console.log(`Faucet address set in AngelToken: ${faucet.address}`);
}

// Execute the deployment script
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
