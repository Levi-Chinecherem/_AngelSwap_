const { ethers, run } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const TOKEN_ADDRESSES = [
    "0x3955FFBB3e63F898eDe0DD3DAd6fb1e1685c3b52",  // NGN Token deployed address
    "0x30dBE7909a36bEd5f51C9a91B9856B8314772c4F",  // EKE Token deployed address
    "0xdC7fD7f7DF8a0b9A4E2b78120d00D7A0fc512c9b",  // ONU Token deployed address
    "0x8b6216C7aEf94a93f2556FD936ed8f55Cf65f9aC"   // HALO Token deployed address
  ];

  const ABI_PATH = path.resolve(__dirname, "../artifacts/contracts/OtherToken.sol/OtherToken.json");  // Replace with the actual ABI file path

  // Read the contract ABI from the file
  const OtherTokenABI = JSON.parse(fs.readFileSync(ABI_PATH, "utf8")).abi;

  for (const address of TOKEN_ADDRESSES) {
    await verifyContract(address, OtherTokenABI);
  }
}

async function verifyContract(address, abi) {
  const contract = new ethers.Contract(address, abi, ethers.provider);
  const network = await ethers.provider.getNetwork();
  const networkName = network.name;

  if (networkName === "pulsechain") {
    const constructorArgs = [];

    console.log(`Verifying contract ${address} on PulseChain...`);

    try {
      await run("verify:verify", {
        address: address,
        constructorArguments: constructorArgs,
        contract: "contracts/OtherToken.sol:OtherToken",  // Replace with the actual contract name and path
      });
      console.log(`Contract ${address} verified successfully on PulseChain!`);
    } catch (error) {
      console.error(`Verification failed for contract ${address}:`, error.message);
    }
  } else {
    console.log("Verification only supported on PulseChain.");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error in deployment verification:", error);
    process.exit(1);
  });
