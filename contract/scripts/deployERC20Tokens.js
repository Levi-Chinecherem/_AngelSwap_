// scripts/deployERC20Tokens.js
const hre = require("hardhat");

async function main() {
    // Get the deployer account
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    // Deploy ProfEkeToken
    const ProfEkeToken = await hre.ethers.getContractFactory("ProfEkeToken");
    const profEkeToken = await ProfEkeToken.deploy(); // Deploy the contract
    await profEkeToken.deployTransaction.wait(); // Wait for the deployment transaction to be mined
    console.log("ProfEkeToken deployed to:", profEkeToken.address);

    // Deploy ProfOnuoduToken
    const ProfOnuoduToken = await hre.ethers.getContractFactory("ProfOnuoduToken");
    const profOnuoduToken = await ProfOnuoduToken.deploy(); // Deploy the contract
    await profOnuoduToken.deployTransaction.wait(); // Wait for the deployment transaction to be mined
    console.log("ProfOnuoduToken deployed to:", profOnuoduToken.address);

    // Deploy NGNToken
    const NGNToken = await hre.ethers.getContractFactory("NGNToken");
    const ngnToken = await NGNToken.deploy(); // Deploy the contract
    await ngnToken.deployTransaction.wait(); // Wait for the deployment transaction to be mined
    console.log("NGNToken deployed to:", ngnToken.address);

    // Deploy AngelToken
    const AngelToken = await hre.ethers.getContractFactory("AngelToken");
    const angelToken = await AngelToken.deploy(); // Deploy the contract
    await angelToken.deployTransaction.wait(); // Wait for the deployment transaction to be mined
    console.log("AngelToken deployed to:", angelToken.address);

    // Deploy HaloToken
    const HaloToken = await hre.ethers.getContractFactory("HaloToken");
    const haloToken = await HaloToken.deploy(); // Deploy the contract
    await haloToken.deployTransaction.wait(); // Wait for the deployment transaction to be mined
    console.log("HaloToken deployed to:", haloToken.address);
}

// Handle errors
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
