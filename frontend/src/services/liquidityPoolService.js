import { ethers } from 'ethers';
import LiquidityPoolABI from '../contracts/abis/LiquidityPool.json';
import { LIQUIDITY_POOL_ADDRESS } from '../contracts/addresses';

const getLiquidityPoolContract = () => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  return new ethers.Contract(LIQUIDITY_POOL_ADDRESS, LiquidityPoolABI, signer);
};

export const toggleSecurity = async (enabled) => {
  const contract = getLiquidityPoolContract();
  const tx = await contract.toggleSecurity(enabled);
  await tx.wait();
};

export const revealTransaction = async (txHash) => {
  const contract = getLiquidityPoolContract();
  const tx = await contract.revealTransaction(txHash);
  await tx.wait();
};

export const swapTokens = async (fromToken, amountIn, minAmountOut) => {
  const contract = getLiquidityPoolContract();
  const tx = await contract.swap(fromToken, amountIn, minAmountOut);
  await tx.wait();
};

export const provideLiquidity = async (amount1, amount2) => {
  const contract = getLiquidityPoolContract();
  const tx = await contract.provideLiquidity(amount1, amount2);
  await tx.wait();
};

export const removeLiquidity = async (amount1, amount2) => {
  const contract = getLiquidityPoolContract();
  const tx = await contract.removeLiquidity(amount1, amount2);
  await tx.wait();
};

export const fetchPendingRewards = async (userAddress) => {
  const contract = getLiquidityPoolContract();
  const rewards = await contract.calculatePendingRewards(userAddress);
  return rewards.toString();
};

export const fetchAllTokens = async () => {
  const contract = getLiquidityPoolContract();
  const tokens = await contract.getAllTokens();
  return tokens;
};

export const fetchAllTransactions = async (userAddress) => {
    const contract = getLiquidityPoolContract();
    const transactionHashes = await contract.getUserTransactionHashes(userAddress);
    return transactionHashes;
  };