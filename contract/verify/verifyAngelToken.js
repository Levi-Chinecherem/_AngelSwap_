const { ethers, run } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const ANGEL_TOKEN_ADDRESS = "0xC28a443f94F01dB36796b9dcE0A5f880aAe43c6f";  // Replace with actual deployed address
  const ABI_PATH = path.resolve(__dirname, "../artifacts/contracts/AngelToken.sol/AngelToken_Main.json");  // Replace with the actual ABI file path

  // Read the contract ABI from the file
  const AngelTokenABI = JSON.parse(fs.readFileSync(ABI_PATH, "utf8")).abi;

  // Directly specify that we're verifying on PulseChain
  await verifyContract(ANGEL_TOKEN_ADDRESS, AngelTokenABI);
}

async function verifyContract(address, abi) {
  const contract = new ethers.Contract(address, abi, ethers.provider);

  // Bypass network check and directly verify on PulseChain
  const constructorArgs = [];

  console.log(`Verifying contract ${address} on PulseChain...`);

  try {
    await run("verify:verify", {
      address: address,
      constructorArguments: constructorArgs,
      contract: "contracts/AngelToken_Main.sol:AngelToken_Main",  // Replace with the actual contract name and path
    });
    console.log(`Contract ${address} verified successfully on PulseChain!`);
  } catch (error) {
    console.error(`Verification failed for contract ${address}:`, error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error in deployment verification:", error);
    process.exit(1);
  });
