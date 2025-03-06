import { ethers } from "ethers";
import CONTRACTS from "./contractConfig";

export const getContractInstance = (contractName, signer) => {
  const contractConfig = CONTRACTS[contractName];
  if (!contractConfig) {
    throw new Error(`Contract ${contractName} is not defined in contractConfig`);
  }
  return new ethers.Contract(contractConfig.address, contractConfig.abi, signer);
};

export const connectWallet = async () => {
  if (window.ethereum) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await window.ethereum.request({ method: "eth_requestAccounts" });
    return provider.getSigner();
  } else {
    alert("MetaMask is not installed. Please install it to use this dApp.");
    throw new Error("MetaMask not installed");
  }
};
