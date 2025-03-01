// securitySlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ethers } from 'ethers';
import LiquidityPoolABI from '../../contracts/LiquidityPool.sol/LiquidityPool.json';
import OrderBookABI from '../../contracts/OrderBook.sol/OrderBook.json';
import { LIQUIDITY_POOL_ADDRESS, ORDER_BOOK_ADDRESS } from '../../contracts/addresses';

const getContracts = async () => {
  if (!window.ethereum) throw new Error("No Ethereum provider found");
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const liquidityPool = new ethers.Contract(LIQUIDITY_POOL_ADDRESS, LiquidityPoolABI.abi, signer);
  const orderBook = new ethers.Contract(ORDER_BOOK_ADDRESS, OrderBookABI.abi, signer);
  return { liquidityPool, orderBook };
};

export const toggleGlobalSecurity = createAsyncThunk(
  'security/toggleGlobalSecurity',
  async (enabled, { rejectWithValue }) => {
    try {
      const { liquidityPool, orderBook } = await getContracts();
      console.log("Calling toggleSecurity on LiquidityPool:", enabled);
      const tx1 = await liquidityPool.toggleSecurity(enabled);
      console.log("LiquidityPool tx:", tx1.hash);
      await tx1.wait();
      
      console.log("Calling toggleSecurity on OrderBook:", enabled);
      const tx2 = await orderBook.toggleSecurity(enabled);
      console.log("OrderBook tx:", tx2.hash);
      await tx2.wait();
      
      return enabled;
    } catch (error) {
      console.error("Toggle security error:", error);
      return rejectWithValue(error.reason || error.message || "Failed to toggle security");
    }
  }
);

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
      } else {
        throw new Error("Invalid contract type");
      }
      console.log(`Revealing ${contractType} transaction:`, tx.hash);
      await tx.wait();
      return { txHash, contractType };
    } catch (error) {
      console.error("Reveal transaction error:", error);
      return rejectWithValue(error.reason || error.message || "Failed to reveal transaction");
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
      state.transactions = { liquidityPool: {}, orderBook: {} };
    },
    setSecurityEnabled: (state, action) => { // New action
      state.securityEnabled = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(toggleGlobalSecurity.pending, (state) => {
        state.loading = true;
        state.error = null;
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
        state.error = null;
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

export const { clearTransactions, setSecurityEnabled } = securitySlice.actions;
export default securitySlice.reducer;