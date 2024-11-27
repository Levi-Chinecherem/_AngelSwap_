const hre = require("hardhat");

async function main() {
    // Get the LiquidityPool contract to deploy
    const LiquidityPool = await hre.ethers.getContractFactory("LiquidityPool");

    console.log("Deploying LiquidityPool implementation...");
    const liquidityPool = await LiquidityPool.deploy();

    await liquidityPool.deployed();
    console.log("LiquidityPool implementation deployed to:", liquidityPool.address);

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
