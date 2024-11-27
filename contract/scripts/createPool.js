const hre = require("hardhat");

async function main() {
    const factoryAddress = "<FACTORY_CONTRACT_ADDRESS>"; // Replace with deployed factory address
    const token1 = "<TOKEN_1_ADDRESS>"; // Replace with first token address
    const token2 = "<TOKEN_2_ADDRESS>"; // Replace with second token address

    const factory = await hre.ethers.getContractAt("LiquidityPoolFactory", factoryAddress);

    const tx = await factory.createLiquidityPool(token1, token2);
    const receipt = await tx.wait();

    const poolAddress = receipt.events[0].args.liquidityPool;
    const poolCount = receipt.events[0].args.poolCount;

    console.log("New Liquidity Pool created at:", poolAddress);
    console.log("Total Pools:", poolCount.toString());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
