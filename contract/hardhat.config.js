require("@nomiclabs/hardhat-ethers"); // Use the current ethers package
require('dotenv').config(); // Ensure dotenv is required

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    pulsechain: {
      url: "https://rpc.v4.testnet.pulsechain.com",
      accounts: [process.env.PRIVATE_KEY], // Use environment variable for private key
    },
  }
};


// require("@nomiclabs/hardhat-ethers");
// require("dotenv").config();

// /** @type import('hardhat/config').HardhatUserConfig */
// module.exports = {
//   solidity: "0.8.20",
//   networks: {
//     pulsechain: {
//       url: "https://rpc.v4.testnet.pulsechain.com",
//       chainId: 943,
//       accounts: [process.env.PRIVATE_KEY], // Use environment variable for private key
//     },
//   }
// };


// module.exports = {
//   solidity: "0.8.0",
//   networks: {
//     hardhat: {},
//     testnet: {
//       url: process.env.RPC_URL,
//       accounts: [process.env.PRIVATE_KEY],
//     },
//     mainnet: {
//       url: process.env.RPC_URL,
//       accounts: [process.env.PRIVATE_KEY],
//     },
//   },
// };
