// scripts/deployAngelToken.js

const { ethers } = require("hardhat");

async function main() {
    // Set the initial supply of the token
    const initialSupply = ethers.utils.parseUnits("1000000", 18); // 1,000,000 tokens with 18 decimals

    // Deploy the AngelToken contract
    const AngelToken = await ethers.getContractFactory("AngelToken");
    const angelToken = await AngelToken.deploy(initialSupply);
    await angelToken.deployed();

    console.log(`AngelToken deployed to: ${angelToken.address}`);

    // Set the initial mint rate (optional)
    const initialMintRate = 1000; // Set an appropriate mint rate
    await angelToken.adjustMintRate(initialMintRate);
    console.log(`Initial mint rate set to: ${initialMintRate}`);

    return angelToken.address; // Return AngelToken address for further use
}

main()
    .then((angelTokenAddress) => {
        console.log("AngelToken deployed at:", angelTokenAddress);
        process.exit(0);
    })
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
