require("@nomiclabs/hardhat-ethers"); // Use the current ethers package
require('dotenv').config(); // Ensure dotenv is required
require("@nomiclabs/hardhat-etherscan");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    pulsechain: {
      url: "https://rpc.v4.testnet.pulsechain.com", // PulseChain Testnet RPC URL
      accounts: [process.env.PRIVATE_KEY], // Use environment variable for private key
    },
  },
  etherscan: {
    // Remove the apiKey property since PulseChain does not provide one
    customChains: [
      {
        network: "pulsechain",
        chainId: 943, // PulseChain Testnet Chain ID (adjust accordingly for mainnet)
        urls: {
          apiURL: "https://api.pulsechain.com", // Hypothetical API URL for PulseChain verification (Replace with actual)
          browserURL: "https://explorer.pulsechain.com", // PulseChain block explorer URL
        },
      },
    ],
  },
};
