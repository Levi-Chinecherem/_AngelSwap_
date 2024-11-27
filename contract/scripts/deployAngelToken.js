const { ethers } = require("hardhat");

async function main() {
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Define the initial supply for the token (1 trillion tokens with 18 decimals)
  const initialSupply = ethers.utils.parseUnits("1000000000000", 18); // 1 trillion ANGEL tokens

  // Get the contract factory
  const AngelToken_Main = await ethers.getContractFactory("AngelToken_Main");

  // Deploy the contract with the required constructor argument
  const angelToken = await AngelToken_Main.deploy(initialSupply);

  // Wait for the deployment to be mined
  await angelToken.deployed();

  // Log the deployed contract address
  console.log("AngelToken_Main deployed to:", angelToken.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error deploying contract:", error);
    process.exit(1);
  });
