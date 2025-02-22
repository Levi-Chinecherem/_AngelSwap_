import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ethers } from 'ethers';
import LiquidityPoolABI from '../../contracts/abis/LiquidityPool.json';
import { LIQUIDITY_POOL_ADDRESS } from '../../contracts/addresses';

// Helper function to get the contract instance
const getLiquidityPoolContract = () => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  return new ethers.Contract(LIQUIDITY_POOL_ADDRESS, LiquidityPoolABI, signer);
};

// Fetch User Transactions
export const fetchUserTransactions = createAsyncThunk(
  'liquidityPool/fetchUserTransactions',
  async (userAddress, { rejectWithValue }) => {
    try {
      const contract = getLiquidityPoolContract();
      
      // Create filters for each event type
      const swapSubmittedFilter = contract.filters.SwapSubmitted(null, userAddress);
      const swapRevealedFilter = contract.filters.SwapRevealed(null, userAddress);
      const provideLiquidityFilter = contract.filters.ProvideLiquidity(userAddress);
      const removeLiquidityFilter = contract.filters.RemoveLiquidity(userAddress);
      const rewardsDistributedFilter = contract.filters.RewardsDistributed(userAddress);

      // Get events from last 1000 blocks
      const fromBlock = await contract.provider.getBlockNumber() - 1000;
      const toBlock = 'latest';

      // Query all events
      const [
        swapSubmitted,
        swapRevealed,
        provideLiquidity,
        removeLiquidity,
        rewardsDistributed
      ] = await Promise.all([
        contract.queryFilter(swapSubmittedFilter, fromBlock, toBlock),
        contract.queryFilter(swapRevealedFilter, fromBlock, toBlock),
        contract.queryFilter(provideLiquidityFilter, fromBlock, toBlock),
        contract.queryFilter(removeLiquidityFilter, fromBlock, toBlock),
        contract.queryFilter(rewardsDistributedFilter, fromBlock, toBlock)
      ]);

      // Process events into standardized format
      const processedEvents = [
        ...swapSubmitted.map(event => ({
          type: 'swap',
          status: 'pending',
          txHash: event.args.txHash,
          amount: event.args.amountIn.toString(),
          timestamp: event.args.timestamp.toString(),
          isPrivate: event.args.isPrivate,
          transaction: event.transactionHash
        })),
        ...swapRevealed.map(event => ({
          type: 'swap',
          status: 'confirmed',
          txHash: event.args.txHash,
          amountIn: event.args.amountIn.toString(),
          amountOut: event.args.amountOut.toString(),
          transaction: event.transactionHash,
          timestamp: event.blockNumber
        })),
        ...provideLiquidity.map(event => ({
          type: 'addLiquidity',
          status: 'confirmed',
          amount1: event.args.amount1.toString(),
          amount2: event.args.amount2.toString(),
          transaction: event.transactionHash,
          timestamp: event.blockNumber
        })),
        ...removeLiquidity.map(event => ({
          type: 'removeLiquidity',
          status: 'confirmed',
          amount1: event.args.amount1.toString(),
          amount2: event.args.amount2.toString(),
          transaction: event.transactionHash,
          timestamp: event.blockNumber
        })),
        ...rewardsDistributed.map(event => ({
          type: 'claimRewards',
          status: 'confirmed',
          amount: event.args.rewardAmount.toString(),
          transaction: event.transactionHash,
          timestamp: event.blockNumber
        }))
      ];

      // Sort by timestamp descending (most recent first)
      return processedEvents.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


export const swapTokens = createAsyncThunk(
  'liquidityPool/swapTokens',
  async ({ fromToken, amountIn, minAmountOut }, { rejectWithValue }) => {
    try {
      const contract = getLiquidityPoolContract();
      const tx = await contract.swap(fromToken, amountIn, minAmountOut);
      await tx.wait();
      return { fromToken, amountIn, minAmountOut, transaction: tx.hash };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const provideLiquidity = createAsyncThunk(
  'liquidityPool/provideLiquidity',
  async ({ amount1, amount2 }, { rejectWithValue }) => {
    try {
      const contract = getLiquidityPoolContract();
      const tx = await contract.provideLiquidity(amount1, amount2);
      await tx.wait();
      return { amount1, amount2, transaction: tx.hash };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeLiquidity = createAsyncThunk(
  'liquidityPool/removeLiquidity',
  async ({ amount1, amount2 }, { rejectWithValue }) => {
    try {
      const contract = getLiquidityPoolContract();
      const tx = await contract.removeLiquidity(amount1, amount2);
      await tx.wait();
      return { amount1, amount2, transaction: tx.hash };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchPendingRewards = createAsyncThunk(
  'liquidityPool/fetchPendingRewards',
  async (userAddress, { rejectWithValue }) => {
    try {
      const contract = getLiquidityPoolContract();
      const rewards = await contract.calculatePendingRewards(userAddress);
      return rewards.toString();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAllTokens = createAsyncThunk(
  'liquidityPool/fetchAllTokens',
  async (_, { rejectWithValue }) => {
    try {
      const contract = getLiquidityPoolContract();
      const tokens = await contract.getAllTokens();
      return tokens;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchTokenBalances = createAsyncThunk(
  'liquidityPool/fetchTokenBalances',
  async (userAddress, { rejectWithValue }) => {
    try {
      const contract = getLiquidityPoolContract();
      const token1Balance = await contract.token1.balanceOf(userAddress);
      const token2Balance = await contract.token2.balanceOf(userAddress);
      return { token1Balance, token2Balance };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchPoolDetails = createAsyncThunk(
  'liquidityPool/fetchPoolDetails',
  async (userAddress, { rejectWithValue }) => {
    try {
      const contract = getLiquidityPoolContract();
      const totalLiquidity1 = await contract.totalLiquidity1();
      const totalLiquidity2 = await contract.totalLiquidity2();
      const userLiquidity1 = await contract.userLiquidity1(userAddress);
      const userLiquidity2 = await contract.userLiquidity2(userAddress);

      const token1PerToken2 = (totalLiquidity1 / totalLiquidity2).toFixed(6);
      const token2PerToken1 = (totalLiquidity2 / totalLiquidity1).toFixed(6);
      const poolShare = ((userLiquidity1 + userLiquidity2) / (totalLiquidity1 + totalLiquidity2) * 100).toFixed(2);

      return { token1PerToken2, token2PerToken1, poolShare };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const depositRewards = createAsyncThunk(
  'liquidityPool/depositRewards',
  async (amount, { rejectWithValue }) => {
    try {
      const contract = getLiquidityPoolContract();
      const tx = await contract.depositRewards(amount);
      await tx.wait();
      return amount;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const distributeRewards = createAsyncThunk(
  'liquidityPool/distributeRewards',
  async (_, { rejectWithValue }) => {
    try {
      const contract = getLiquidityPoolContract();
      const tx = await contract.distributeRewards();
      await tx.wait();
      return { transaction: tx.hash };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const initialize = createAsyncThunk(
  'liquidityPool/initialize',
  async ({ token1, token2 }, { rejectWithValue }) => {
    try {
      const contract = getLiquidityPoolContract();
      const tx = await contract.initialize(token1, token2);
      await tx.wait();
      return { token1, token2 };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getAmountOut = createAsyncThunk(
  'liquidityPool/getAmountOut',
  async ({ amountIn, reserveIn, reserveOut }, { rejectWithValue }) => {
    try {
      const contract = getLiquidityPoolContract();
      const amountOut = await contract.getAmountOut(amountIn, reserveIn, reserveOut);
      return amountOut.toString();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Slice definition
const liquidityPoolSlice = createSlice({
  name: 'liquidityPool',
  initialState: {
    tokens: [],
    pendingRewards: '0',
    transactions: {
      items: [],
      status: {},
      lastUpdate: null,
    },
    loading: false,
    error: null,
    token1: null,
    token2: null,
    totalLiquidity1: 0,
    totalLiquidity2: 0,
    userLiquidity1: 0,
    userLiquidity2: 0,
    lastRewardTime: 0,
    rewardRate: 1,
    delayTime: 5,
    feeRate: 20,
    token1Balance: '0',
    token2Balance: '0',
    poolDetails: {
      token1PerToken2: '0',
      token2PerToken1: '0',
      poolShare: '0%',
    },
  },
  reducers: {
    updateTransactionStatus(state, action) {
      const { txHash, status } = action.payload;
      if (state.transactions.status[txHash]) {
        state.transactions.status[txHash] = status;
      }
    },
    clearTransactionHistory(state) {
      state.transactions.items = [];
      state.transactions.status = {};
      state.transactions.lastUpdate = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Tokens
      .addCase(fetchAllTokens.fulfilled, (state, action) => {
        state.tokens = action.payload;
      })
      // Fetch Pending Rewards
      .addCase(fetchPendingRewards.fulfilled, (state, action) => {
        state.pendingRewards = action.payload;
      })
      // Fetch Token Balances
      .addCase(fetchTokenBalances.fulfilled, (state, action) => {
        state.token1Balance = action.payload.token1Balance;
        state.token2Balance = action.payload.token2Balance;
      })
      // Fetch Pool Details
      .addCase(fetchPoolDetails.fulfilled, (state, action) => {
        state.poolDetails = action.payload;
      })
      // Fetch User Transactions
      .addCase(fetchUserTransactions.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserTransactions.fulfilled, (state, action) => {
        state.transactions.items = action.payload;
        state.transactions.lastUpdate = Date.now();
        state.loading = false;
        
        // Update status tracking
        const newStatus = {};
        action.payload.forEach(tx => {
          newStatus[tx.transaction] = tx.status;
        });
        state.transactions.status = newStatus;
      })
      .addCase(fetchUserTransactions.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      // Handle other actions
      .addCase(depositRewards.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(distributeRewards.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(initialize.fulfilled, (state, action) => {
        state.token1 = action.payload.token1;
        state.token2 = action.payload.token2;
        state.loading = false;
      })
      .addCase(initialize.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      // Add cases for swapTokens
      .addCase(swapTokens.pending, (state) => {
        state.loading = true;
      })
      .addCase(swapTokens.fulfilled, (state, action) => {
        state.loading = false;
        // Add the transaction to status tracking
        if (action.payload.transaction) {
          state.transactions.status[action.payload.transaction] = 'confirmed';
        }
      })
      .addCase(swapTokens.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
        // Mark failed transaction if available
        if (action.meta.arg.transaction) {
          state.transactions.status[action.meta.arg.transaction] = 'failed';
        }
      })
      // Add cases for provideLiquidity
      .addCase(provideLiquidity.pending, (state) => {
        state.loading = true;
      })
      .addCase(provideLiquidity.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.transaction) {
          state.transactions.status[action.payload.transaction] = 'confirmed';
        }
      })
      .addCase(provideLiquidity.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
        if (action.meta.arg.transaction) {
          state.transactions.status[action.meta.arg.transaction] = 'failed';
        }
      })
      // Add cases for removeLiquidity
      .addCase(removeLiquidity.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeLiquidity.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.transaction) {
          state.transactions.status[action.payload.transaction] = 'confirmed';
        }
      })
      .addCase(removeLiquidity.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
        if (action.meta.arg.transaction) {
          state.transactions.status[action.meta.arg.transaction] = 'failed';
        }
      });
  },
});

export const { updateTransactionStatus, clearTransactionHistory } = liquidityPoolSlice.actions;

export default liquidityPoolSlice.reducer;