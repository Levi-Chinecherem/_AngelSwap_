require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config(); // Ensure dotenv is required

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.27",
  networks: {
    pulsechain: {
      url: "https://rpc.v4.testnet.pulsechain.com",
      chainId: 943,
      accounts: [process.env.PRIVATE_KEY], // Use environment variable for private key
    },
  }
};
