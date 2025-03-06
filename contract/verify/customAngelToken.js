const axios = require('axios');
require('dotenv').config();
const path = require("path");

// Environment Variables for Contract and API
const PULSECHAIN_API_URL = "https://api.scan.v4.testnet.pulsechain.com/api"; // Hypothetical URL, replace if different
const PULSECHAIN_EXPLORER_URL = "https://explorer.pulsechain.com"; // Hypothetical browser URL
const CONTRACT_ADDRESS = "0xC28a443f94F01dB36796b9dcE0A5f880aAe43c6f"; // Contract Address to verify
const CONTRACT_SOURCE_CODE = path.resolve(__dirname, "../contracts/AngelToken_Main.sol"); // Path to your contract's source code
const CONTRACT_ABI = path.resolve(__dirname, "../artifacts/contracts/AngelToken.sol/AngelToken_Main.json"); // ABI JSON file path

// Sample Contract Verification Parameters
const contractParams = {
    contractAddress: CONTRACT_ADDRESS,
    contractSourceCode: CONTRACT_SOURCE_CODE,
    contractAbi: CONTRACT_ABI,
    compilerVersion: "0.8.0", // Specify the compiler version you used
    optimizationUsed: false, // If you used Solidity optimization
    runs: 200, // Number of optimization runs used (usually 200 or similar)
};

async function verifyContract() {
    try {
        console.log("Starting contract verification for address:", CONTRACT_ADDRESS);

        // Prepare the data to send
        const verificationData = {
            address: CONTRACT_ADDRESS,
            sourceCode: contractParams.contractSourceCode,
            abi: contractParams.contractAbi,
            compilerVersion: contractParams.compilerVersion,
            optimizationUsed: contractParams.optimizationUsed,
            runs: contractParams.runs,
        };

        // Send verification request to PulseChain API
        const response = await axios.post(`${PULSECHAIN_API_URL}/contract/verify`, verificationData);

        if (response.data.success) {
            console.log(`Contract verified successfully! Check the contract here: ${PULSECHAIN_EXPLORER_URL}/address/${CONTRACT_ADDRESS}`);
        } else {
            console.error("Verification failed:", response.data.message);
        }
    } catch (error) {
        console.error("Error during contract verification:", error);
    }
}

// Run the verification
verifyContract();
