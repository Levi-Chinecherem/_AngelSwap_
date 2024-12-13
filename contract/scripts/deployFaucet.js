const hre = require("hardhat");

async function main() {
  // Compile contracts
  await hre.run("compile");

  // Define token addresses
  const angelTokenAddress = "0xCB32472D3cf39dD88Aeb261139D9906a12dA7403"; // Replace with the deployed AngelToken address
  const claimAmount = ethers.utils.parseUnits("5", 18); // Example: 5 ANGEL tokens (adjust decimals as needed)
  const claimCooldown = 86400; // Example: 24 hours in seconds

  // Get the Faucet contract factory
  const Faucet = await hre.ethers.getContractFactory("Faucet");

  // Deploy the Faucet contract
  const faucet = await Faucet.deploy(angelTokenAddress, claimAmount, claimCooldown);
  await faucet.deployed();

  console.log(`Faucet deployed at address: ${faucet.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
