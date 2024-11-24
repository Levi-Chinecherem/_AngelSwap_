// scripts/deployOtherToken.js

const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    const OtherToken = await ethers.getContractFactory("OtherToken");

    // Initialize the tokens with name, symbol, and initial supply
    const ngnToken = await OtherToken.deploy("NGN Token", "NGN", ethers.utils.parseUnits("1000000", 18));
    await ngnToken.deployed();
    console.log("NGN Token deployed to:", ngnToken.address);

    const ekeToken = await OtherToken.deploy("EKE", "EKE", ethers.utils.parseUnits("1000000", 18));
    await ekeToken.deployed();
    console.log("EKE Token deployed to:", ekeToken.address);

    const onuToken = await OtherToken.deploy("ONU", "ONU", ethers.utils.parseUnits("1000000", 18));
    await onuToken.deployed();
    console.log("ONU Token deployed to:", onuToken.address);

    const haloToken = await OtherToken.deploy("HALO", "HALO", ethers.utils.parseUnits("1000000", 18));
    await haloToken.deployed();
    console.log("HALO Token deployed to:", haloToken.address);

    // Optionally, you can return the addresses of these tokens for later use
    return {
        ngnToken: ngnToken.address,
        ekeToken: ekeToken.address,
        onuToken: onuToken.address,
        haloToken: haloToken.address,
    };
}

// Run the deployment script
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
