const hre = require("hardhat");

async function main() {
  // Compile contracts
  await hre.run("compile");

  // Define token addresses
  const angelTokenAddress = "<ANGEL_TOKEN_ADDRESS>"; // Replace with the deployed AngelToken address
  const otherTokens = [
    "<NGN_TOKEN_ADDRESS>", // NGN token address
    "<EKE_TOKEN_ADDRESS>", // EKE token address
    "<ONU_TOKEN_ADDRESS>", // ONU token address
    "<HALO_TOKEN_ADDRESS>", // HALO token address
  ];

  // Get the Faucet contract factory
  const Faucet = await hre.ethers.getContractFactory("Faucet");

  // Deploy the Faucet contract
  const faucet = await Faucet.deploy(angelTokenAddress, otherTokens);
  await faucet.deployed();

  console.log(`Faucet deployed at address: ${faucet.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
