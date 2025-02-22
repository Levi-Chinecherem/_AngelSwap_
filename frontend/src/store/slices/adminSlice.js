import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { ethers } from "ethers";
import LiquidityPoolFactoryABI from "../contracts/abis/LiquidityPoolFactory.json";
import OrderBookABI from "../contracts/abis/OrderBook.json";
import { LIQUIDITY_POOL_FACTORY_ADDRESS, ORDER_BOOK_ADDRESS } from "../contracts/addresses";

// Helper function to get the contract instance
const getLiquidityPoolFactoryContract = () => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  return new ethers.Contract(LIQUIDITY_POOL_FACTORY_ADDRESS, LiquidityPoolFactoryABI, signer);
};

const getOrderBookContract = () => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  return new ethers.Contract(ORDER_BOOK_ADDRESS, OrderBookABI, signer);
};

// Create a new liquidity pool
export const createLiquidityPool = createAsyncThunk(
  "admin/createLiquidityPool",
  async ({ token1, token2 }, { rejectWithValue }) => {
    try {
      const contract = getLiquidityPoolFactoryContract();
      const tx = await contract.createLiquidityPool(token1, token2);
      await tx.wait();
      return { token1, token2, transaction: tx.hash };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Add a token to the order book
export const addTokenToOrderBook = createAsyncThunk(
  "admin/addTokenToOrderBook",
  async (tokenAddress, { rejectWithValue }) => {
    try {
      const contract = getOrderBookContract();
      const tx = await contract.addToken(tokenAddress);
      await tx.wait();
      return { tokenAddress, transaction: tx.hash };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch all liquidity pools
export const fetchAllLiquidityPools = createAsyncThunk(
  "admin/fetchAllLiquidityPools",
  async (_, { rejectWithValue }) => {
    try {
      const contract = getLiquidityPoolFactoryContract();
      const pools = await contract.getAllLiquidityPools();
      return pools;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch all tokens in the order book
export const fetchAllTokens = createAsyncThunk(
  "admin/fetchAllTokens",
  async (_, { rejectWithValue }) => {
    try {
      const contract = getOrderBookContract();
      const tokens = await contract.getAllTokens();
      return tokens;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Admin slice
const adminSlice = createSlice({
  name: "admin",
  initialState: {
    liquidityPools: [],
    tokens: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Create Liquidity Pool
      .addCase(createLiquidityPool.pending, (state) => {
        state.loading = true;
      })
      .addCase(createLiquidityPool.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(createLiquidityPool.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      // Add Token to Order Book
      .addCase(addTokenToOrderBook.pending, (state) => {
        state.loading = true;
      })
      .addCase(addTokenToOrderBook.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(addTokenToOrderBook.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      // Fetch All Liquidity Pools
      .addCase(fetchAllLiquidityPools.fulfilled, (state, action) => {
        state.liquidityPools = action.payload;
      })
      // Fetch All Tokens
      .addCase(fetchAllTokens.fulfilled, (state, action) => {
        state.tokens = action.payload;
      });
  },
});

export default adminSlice.reducer;