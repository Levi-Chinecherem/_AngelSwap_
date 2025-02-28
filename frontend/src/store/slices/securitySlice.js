// securitySlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ethers } from 'ethers';
import LiquidityPoolABI from '../../contracts/LiquidityPool.sol/LiquidityPool.json';
import OrderBookABI from '../../contracts/OrderBook.sol/OrderBook.json';
import { LIQUIDITY_POOL_ADDRESS, ORDER_BOOK_ADDRESS } from '../../contracts/addresses';

// Helper function to get contract instances
const getContracts = async () => {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = provider.getSigner();
  const liquidityPool = new ethers.Contract(LIQUIDITY_POOL_ADDRESS, LiquidityPoolABI, signer);
  const orderBook = new ethers.Contract(ORDER_BOOK_ADDRESS, OrderBookABI, signer);
  return { liquidityPool, orderBook };
};

// Toggle security across all contracts
export const toggleGlobalSecurity = createAsyncThunk(
  'security/toggleGlobalSecurity',
  async (enabled, { rejectWithValue }) => {
    try {
      const { liquidityPool, orderBook } = await getContracts();
      
      // Toggle security on both contracts
      const tx1 = await liquidityPool.toggleSecurity(enabled);
      await tx1.wait();
      
      const tx2 = await orderBook.toggleSecurity(enabled);
      await tx2.wait();
      
      return enabled;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Reveal transaction across contracts
export const revealGlobalTransaction = createAsyncThunk(
  'security/revealGlobalTransaction',
  async ({ txHash, contractType }, { rejectWithValue }) => {
    try {
      const { liquidityPool, orderBook } = await getContracts();
      let tx;
      
      if (contractType === 'liquidityPool') {
        tx = await liquidityPool.revealTransaction(txHash);
      } else if (contractType === 'orderBook') {
        tx = await orderBook.revealTransaction(txHash);
      }
      
      await tx.wait();
      return { txHash, contractType };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const securitySlice = createSlice({
  name: 'security',
  initialState: {
    securityEnabled: false,
    transactions: {
      liquidityPool: {},
      orderBook: {}
    },
    loading: false,
    error: null,
    delayTime: 5
  },
  reducers: {
    clearTransactions: (state) => {
      state.transactions = {
        liquidityPool: {},
        orderBook: {}
      };
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(toggleGlobalSecurity.pending, (state) => {
        state.loading = true;
      })
      .addCase(toggleGlobalSecurity.fulfilled, (state, action) => {
        state.securityEnabled = action.payload;
        state.loading = false;
      })
      .addCase(toggleGlobalSecurity.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      .addCase(revealGlobalTransaction.pending, (state) => {
        state.loading = true;
      })
      .addCase(revealGlobalTransaction.fulfilled, (state, action) => {
        const { txHash, contractType } = action.payload;
        state.transactions[contractType][txHash] = 'revealed';
        state.loading = false;
      })
      .addCase(revealGlobalTransaction.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      });
  }
});

export const { clearTransactions } = securitySlice.actions;
export default securitySlice.reducer;