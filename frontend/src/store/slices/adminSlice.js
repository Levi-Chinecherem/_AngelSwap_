// adminSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { BrowserProvider, Contract } from "ethers";
import LiquidityPoolFactoryArtifact from "../../contracts/LiquidityPoolFactory.sol/LiquidityPoolFactory.json";
import OrderBookArtifact from "../../contracts/OrderBook.sol/OrderBook.json";
import { LIQUIDITY_POOL_FACTORY_ADDRESS, ORDER_BOOK_ADDRESS } from "../../contracts/addresses";

// Get ABIs from artifacts
const LiquidityPoolFactoryABI = LiquidityPoolFactoryArtifact.abi;
const OrderBookABI = OrderBookArtifact.abi;

// Helper function to get signer and provider
const getSignerAndProvider = async () => {
  if (!window.ethereum) throw new Error("No crypto wallet found. Please install MetaMask.");
  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return { signer, provider };
};

// Create liquidity pool
export const createLiquidityPool = createAsyncThunk(
  "admin/createLiquidityPool",
  async ({ token1, token2 }, { rejectWithValue }) => {
    try {
      const { signer } = await getSignerAndProvider();
      
      const contract = new Contract(
        LIQUIDITY_POOL_FACTORY_ADDRESS,
        LiquidityPoolFactoryABI,
        signer
      );

      // Check if pool exists
      const existingPool = await contract.getPool(token1, token2);
      if (existingPool !== "0x0000000000000000000000000000000000000000") {
        throw new Error("Pool already exists for these tokens");
      }

      // Create pool
      const tx = await contract.createLiquidityPool(token1, token2);
      console.log("Transaction sent:", tx.hash);

      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);

      // Get pool address from event
      const event = receipt.logs
        .map(log => {
          try {
            return contract.interface.parseLog(log);
          } catch (e) {
            return null;
          }
        })
        .find(event => event && event.name === 'LiquidityPoolCreated');

      if (!event) {
        throw new Error("Pool creation transaction succeeded but event not found");
      }

      const newPoolAddress = event.args.liquidityPool;
      
      return {
        hash: tx.hash,
        poolAddress: newPoolAddress
      };
    } catch (error) {
      if (error.message.includes("Pool exists")) {
        return rejectWithValue("A pool for these tokens already exists");
      }
      if (error.message.includes("Identical tokens")) {
        return rejectWithValue("Cannot create pool with identical tokens");
      }
      return rejectWithValue(error.message);
    }
  }
);

// Get factory contract
const getLiquidityPoolFactoryContract = async () => {
  const { signer } = await getSignerAndProvider();
  return new Contract(LIQUIDITY_POOL_FACTORY_ADDRESS, LiquidityPoolFactoryABI, signer);
};

// Get orderbook contract
const getOrderBookContract = async () => {
  const { signer } = await getSignerAndProvider();
  return new Contract(ORDER_BOOK_ADDRESS, OrderBookABI, signer);
};

// Add token to order book
export const addTokenToOrderBook = createAsyncThunk(
  "admin/addTokenToOrderBook",
  async (tokenAddress, { rejectWithValue }) => {
    try {
      const contract = await getOrderBookContract();
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
      const contract = await getLiquidityPoolFactoryContract();
      const pools = await contract.getAllLiquidityPools();
      return pools;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch all tokens
export const fetchAllTokens = createAsyncThunk(
  "admin/fetchAllTokens",
  async (_, { rejectWithValue }) => {
    try {
      const contract = await getOrderBookContract();
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
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createLiquidityPool.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createLiquidityPool.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(createLiquidityPool.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to create liquidity pool";
      })
      .addCase(addTokenToOrderBook.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addTokenToOrderBook.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(addTokenToOrderBook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to add token";
      })
      .addCase(fetchAllLiquidityPools.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllLiquidityPools.fulfilled, (state, action) => {
        state.loading = false;
        state.liquidityPools = action.payload;
        state.error = null;
      })
      .addCase(fetchAllLiquidityPools.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch liquidity pools";
      })
      .addCase(fetchAllTokens.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllTokens.fulfilled, (state, action) => {
        state.loading = false;
        state.tokens = action.payload;
        state.error = null;
      })
      .addCase(fetchAllTokens.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch tokens";
      });
  },
});

export const { clearError } = adminSlice.actions;
export default adminSlice.reducer;