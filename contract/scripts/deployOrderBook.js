// scripts/deployOrderBook.js

const { ethers } = require("hardhat");

async function main() {
    // Deploy the OrderBook contract
    const OrderBook = await ethers.getContractFactory("OrderBook");
    const orderBook = await OrderBook.deploy();
    await orderBook.deployed();

    console.log(`OrderBook deployed to: ${orderBook.address}`);

    // Optionally, you can interact with the deployed contract (e.g., place an order, toggle security, etc.)
}

// Execute the deployment script
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
