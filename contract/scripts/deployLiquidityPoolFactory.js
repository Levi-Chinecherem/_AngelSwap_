const hre = require("hardhat");

async function main() {
    const LiquidityPoolFactory = await hre.ethers.getContractFactory("LiquidityPoolFactory");
    const factory = await LiquidityPoolFactory.deploy();

    await factory.deployed();
    console.log("LiquidityPoolFactory deployed to:", factory.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
