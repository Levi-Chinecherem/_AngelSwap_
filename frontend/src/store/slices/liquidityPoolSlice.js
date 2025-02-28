import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { ethers } from "ethers"; // Ensure ethers v6 is installed
import LiquidityPoolABI from "../../contracts/LiquidityPool.sol/LiquidityPool.json";
import OrderBookArtifact from "../../contracts/OrderBook.sol/OrderBook.json";
import LiquidityPoolFactoryArtifact from "../../contracts/LiquidityPoolFactory.sol/LiquidityPoolFactory.json";
import { LIQUIDITY_POOL_ADDRESS, ORDER_BOOK_ADDRESS, LIQUIDITY_POOL_FACTORY_ADDRESS } from "../../contracts/addresses";

// Minimal ERC20 ABI for token interactions
const ERC20_ABI = [
  "function symbol() view returns (string)",
  "function name() view returns (string)",
  "function balanceOf(address) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
];

// Helper function to get LiquidityPool contract instance with full ABI
const getLiquidityPoolContract = async () => {
  try {
    if (!window.ethereum) {
      throw new Error("No Ethereum provider found. Please ensure MetaMask is installed and connected.");
    }
    console.log("Initializing provider...");
    const provider = new ethers.BrowserProvider(window.ethereum);
    console.log("Provider initialized:", provider);
    const signer = await provider.getSigner();
    console.log("Signer obtained:", signer);
    const contract = new ethers.Contract(LIQUIDITY_POOL_ADDRESS, LiquidityPoolABI.abi, signer);
    console.log("Contract instance created:", contract);
    // Removed !contract.provider check as it’s unreliable in ethers v6
    return contract;
  } catch (error) {
    console.error("Error creating LiquidityPool contract instance:", error);
    throw error; // Re-throw to be caught by the caller
  }
};

// Fetch All Tokens
export const fetchAllTokens = createAsyncThunk(
  "liquidityPool/fetchAllTokens",
  async (_, { rejectWithValue }) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const orderBookContract = new ethers.Contract(
        ORDER_BOOK_ADDRESS,
        OrderBookArtifact.abi,
        signer
      );
      const orderBookTokens = await orderBookContract.getAllTokens();

      const factoryContract = new ethers.Contract(
        LIQUIDITY_POOL_FACTORY_ADDRESS,
        LiquidityPoolFactoryArtifact.abi,
        signer
      );

      const pools = await factoryContract.getAllLiquidityPools();

      const uniqueTokens = new Set([...orderBookTokens]);

      for (const poolAddress of pools) {
        try {
          const poolContract = new ethers.Contract(
            poolAddress,
            ["function token1() view returns (address)", "function token2() view returns (address)"],
            signer
          );
          const [token1, token2] = await Promise.all([
            poolContract.token1(),
            poolContract.token2(),
          ]);
          uniqueTokens.add(token1);
          uniqueTokens.add(token2);
        } catch (error) {
          console.error(`Error fetching tokens from pool ${poolAddress}:`, error);
        }
      }

      const tokenArray = Array.from(uniqueTokens);
      const tokenDetails = await Promise.all(
        tokenArray.map(async (address) => {
          try {
            const tokenContract = new ethers.Contract(address, ERC20_ABI, provider);
            const [symbol, name] = await Promise.all([
              tokenContract.symbol(),
              tokenContract.name(),
            ]);
            return { address, symbol, name };
          } catch (error) {
            console.error(`Error fetching token details for ${address}:`, error);
            return { address, symbol: "UNKNOWN", name: "Unknown Token" };
          }
        })
      );

      return tokenDetails;
    } catch (error) {
      console.error("fetchAllTokens error:", error);
      return rejectWithValue(error.message || "Failed to fetch tokens");
    }
  }
);

// Swap Tokens
export const swapTokens = createAsyncThunk(
  "liquidityPool/swapTokens",
  async ({ fromToken, amountIn, minAmountOut }, { rejectWithValue }) => {
    try {
      const contract = await getLiquidityPoolContract();
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const tokenContract = new ethers.Contract(fromToken, ERC20_ABI, signer);

      const approvalTx = await tokenContract.approve(LIQUIDITY_POOL_ADDRESS, amountIn);
      await approvalTx.wait();

      const tx = await contract.swap(fromToken, amountIn, minAmountOut);
      const receipt = await tx.wait();
      return { fromToken, amountIn, minAmountOut, transaction: tx.hash };
    } catch (error) {
      console.error("swapTokens error:", error);
      return rejectWithValue(error.message || "Failed to swap tokens");
    }
  }
);

// Fetch User Transactions
export const fetchUserTransactions = createAsyncThunk(
  "liquidityPool/fetchUserTransactions",
  async (userAddress, { rejectWithValue }) => {
    try {
      const contract = await getLiquidityPoolContract();
      console.log("Fetching transactions for user:", userAddress);

      const swapSubmittedFilter = contract.filters.SwapSubmitted(null, userAddress);
      const swapRevealedFilter = contract.filters.SwapRevealed(null, userAddress);
      const provideLiquidityFilter = contract.filters.ProvideLiquidity(userAddress);
      const removeLiquidityFilter = contract.filters.RemoveLiquidity(userAddress);
      const rewardsDistributedFilter = contract.filters.RewardsDistributed(userAddress);

      // Use signer.provider as a fallback if contract.provider is undefined
      const provider = contract.provider || contract.runner.provider;
      if (!provider) {
        throw new Error("No provider available for contract");
      }
      const currentBlock = await provider.getBlockNumber();
      console.log("Current block number:", currentBlock);
      const fromBlock = Math.max(currentBlock - 1000, 0);
      const toBlock = "latest";

      const [
        swapSubmittedEvents,
        swapRevealedEvents,
        provideLiquidityEvents,
        removeLiquidityEvents,
        rewardsDistributedEvents,
      ] = await Promise.all([
        contract.queryFilter(swapSubmittedFilter, fromBlock, toBlock),
        contract.queryFilter(swapRevealedFilter, fromBlock, toBlock),
        contract.queryFilter(provideLiquidityFilter, fromBlock, toBlock),
        contract.queryFilter(removeLiquidityFilter, fromBlock, toBlock),
        contract.queryFilter(rewardsDistributedFilter, fromBlock, toBlock),
      ]);

      const processedEvents = [
        ...swapSubmittedEvents.map((event) => ({
          type: "swap",
          status: "pending",
          txHash: event.args.txHash,
          amountIn: event.args.amountIn.toString(),
          timestamp: event.args.timestamp.toString(),
          isPrivate: event.args.isPrivate,
          transaction: event.transactionHash,
        })),
        ...swapRevealedEvents.map((event) => ({
          type: "swap",
          status: "confirmed",
          txHash: event.args.txHash,
          amountIn: event.args.amountIn.toString(),
          amountOut: event.args.amountOut.toString(),
          transaction: event.transactionHash,
          timestamp: event.blockNumber.toString(),
        })),
        ...provideLiquidityEvents.map((event) => ({
          type: "addLiquidity",
          status: "confirmed",
          amount1: event.args.amount1.toString(),
          amount2: event.args.amount2.toString(),
          transaction: event.transactionHash,
          timestamp: event.blockNumber.toString(),
        })),
        ...removeLiquidityEvents.map((event) => ({
          type: "removeLiquidity",
          status: "confirmed",
          amount1: event.args.amount1.toString(),
          amount2: event.args.amount2.toString(),
          transaction: event.transactionHash,
          timestamp: event.blockNumber.toString(),
        })),
        ...rewardsDistributedEvents.map((event) => ({
          type: "claimRewards",
          status: "confirmed",
          amount: event.args.rewardAmount.toString(),
          transaction: event.transactionHash,
          timestamp: event.blockNumber.toString(),
        })),
      ];

      console.log("Processed events:", processedEvents);
      return processedEvents.sort((a, b) => Number(b.timestamp) - Number(a.timestamp));
    } catch (error) {
      console.error("fetchUserTransactions error:", error);
      return rejectWithValue(error.message || "Failed to fetch user transactions");
    }
  }
);

// Provide Liquidity
export const provideLiquidity = createAsyncThunk(
  "liquidityPool/provideLiquidity",
  async ({ amount1, amount2 }, { rejectWithValue, getState, dispatch }) => {
    try {
      const contract = await getLiquidityPoolContract();
      const { poolDetails } = getState().liquidityPool;
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const token1Contract = new ethers.Contract(poolDetails.token1, ERC20_ABI, signer);
      const token2Contract = new ethers.Contract(poolDetails.token2, ERC20_ABI, signer);
      await token1Contract.approve(LIQUIDITY_POOL_ADDRESS, amount1).then((tx) => tx.wait());
      await token2Contract.approve(LIQUIDITY_POOL_ADDRESS, amount2).then((tx) => tx.wait());

      const tx = await contract.provideLiquidity(amount1, amount2);
      const receipt = await tx.wait();

      const userAddress = await signer.getAddress();
      dispatch(fetchTokenBalances(userAddress));
      dispatch(fetchPoolDetails(userAddress));

      return { amount1, amount2, transaction: tx.hash };
    } catch (error) {
      console.error("provideLiquidity error:", error);
      return rejectWithValue(error.message || "Failed to provide liquidity");
    }
  }
);

// Remove Liquidity
export const removeLiquidity = createAsyncThunk(
  "liquidityPool/removeLiquidity",
  async ({ amount1, amount2 }, { rejectWithValue, getState, dispatch }) => {
    try {
      const contract = await getLiquidityPoolContract();
      const tx = await contract.removeLiquidity(amount1, amount2);
      const receipt = await tx.wait();

      const { poolDetails } = getState().liquidityPool;
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      dispatch(fetchTokenBalances(userAddress));
      dispatch(fetchPoolDetails(userAddress));

      return { amount1, amount2, transaction: tx.hash };
    } catch (error) {
      console.error("removeLiquidity error:", error);
      return rejectWithValue(error.message || "Failed to remove liquidity");
    }
  }
);

// Fetch Pending Rewards
export const fetchPendingRewards = createAsyncThunk(
  "liquidityPool/fetchPendingRewards",
  async (userAddress, { rejectWithValue, getState }) => {
    try {
      const contract = await getLiquidityPoolContract();
      const { poolDetails } = getState().liquidityPool;
      if (!poolDetails.token1 || !poolDetails.token2) {
        return "0"; // Return 0 if pool isn’t initialized
      }
      const rewards = await contract.calculatePendingRewards(userAddress);
      return rewards.toString();
    } catch (error) {
      console.error("fetchPendingRewards error:", error);
      if (error.message.includes("Liquidity pool not initialized")) {
        return "0"; // Graceful fallback
      }
      return rejectWithValue(error.message || "Failed to fetch pending rewards");
    }
  }
);

// Fetch Pool Details
export const fetchPoolDetails = createAsyncThunk(
  "liquidityPool/fetchPoolDetails",
  async (userAddress, { rejectWithValue }) => {
    try {
      const contract = await getLiquidityPoolContract();
      const [totalLiquidity1, totalLiquidity2, userLiquidity1, userLiquidity2, token1, token2] =
        await Promise.all([
          contract.totalLiquidity1(),
          contract.totalLiquidity2(),
          contract.userLiquidity1(userAddress),
          contract.userLiquidity2(userAddress),
          contract.token1(),
          contract.token2(),
        ]);

      const totalLiquiditySum = totalLiquidity1 + totalLiquidity2;
      const userLiquiditySum = userLiquidity1 + userLiquidity2;
      const poolShare = totalLiquiditySum === BigInt(0)
        ? "0"
        : (Number(userLiquiditySum * BigInt(10000) / totalLiquiditySum) / 100).toFixed(2);

      const token1PerToken2 = totalLiquidity1 === BigInt(0)
        ? "0"
        : ethers.formatEther((totalLiquidity2 * ethers.parseEther("1")) / totalLiquidity1);
      const token2PerToken1 = totalLiquidity2 === BigInt(0)
        ? "0"
        : ethers.formatEther((totalLiquidity1 * ethers.parseEther("1")) / totalLiquidity2);

      return {
        token1PerToken2,
        token2PerToken1,
        poolShare: `${poolShare}%`,
        token1,
        token2,
        totalLiquidity1: totalLiquidity1.toString(),
        totalLiquidity2: totalLiquidity2.toString(),
        userLiquidity1: userLiquidity1.toString(),
        userLiquidity2: userLiquidity2.toString(),
      };
    } catch (error) {
      console.error("fetchPoolDetails error:", error);
      return rejectWithValue(error.message || "Failed to fetch pool details");
    }
  }
);

// Deposit Rewards
export const depositRewards = createAsyncThunk(
  "liquidityPool/depositRewards",
  async (amount, { rejectWithValue }) => {
    try {
      const contract = await getLiquidityPoolContract();
      const tx = await contract.depositRewards(amount);
      await tx.wait();
      return amount;
    } catch (error) {
      console.error("depositRewards error:", error);
      return rejectWithValue(error.message || "Failed to deposit rewards");
    }
  }
);

// Distribute Rewards
export const distributeRewards = createAsyncThunk(
  "liquidityPool/distributeRewards",
  async (_, { rejectWithValue }) => {
    try {
      const contract = await getLiquidityPoolContract();
      const tx = await contract.distributeRewards();
      const receipt = await tx.wait();
      return { transaction: tx.hash };
    } catch (error) {
      console.error("distributeRewards error:", error);
      return rejectWithValue(error.message || "Failed to distribute rewards");
    }
  }
);

// Initialize Pool
export const initialize = createAsyncThunk(
  "liquidityPool/initialize",
  async ({ token1, token2 }, { rejectWithValue }) => {
    try {
      const contract = await getLiquidityPoolContract();
      const tx = await contract.initialize(token1, token2);
      await tx.wait();
      return { token1, token2 };
    } catch (error) {
      console.error("initialize error:", error);
      return rejectWithValue(error.message || "Failed to initialize pool");
    }
  }
);

// Get Amount Out
export const getAmountOut = createAsyncThunk(
  "liquidityPool/getAmountOut",
  async ({ amountIn, reserveIn, reserveOut }, { rejectWithValue }) => {
    try {
      if (!amountIn || !reserveIn || !reserveOut) {
        throw new Error("Invalid input values for amountIn, reserveIn, or reserveOut");
      }

      const contract = await getLiquidityPoolContract();
      const amountOut = await contract.getAmountOut(amountIn, reserveIn, reserveOut);
      return amountOut.toString();
    } catch (error) {
      console.error("getAmountOut error:", error);
      try {
        const amountInWithFee = BigInt(amountIn) * BigInt(997);
        const numerator = amountInWithFee * BigInt(reserveOut);
        const denominator = BigInt(reserveIn) * BigInt(1000) + amountInWithFee;
        return (numerator / denominator).toString();
      } catch (calcError) {
        console.error("getAmountOut calculation error:", calcError);
        return rejectWithValue(calcError.message || "Failed to calculate amount out");
      }
    }
  }
);

// Fetch Token Balances
export const fetchTokenBalances = createAsyncThunk(
  "liquidityPool/fetchTokenBalances",
  async (userAddress, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const { tokens } = state.liquidityPool;

      if (!tokens || tokens.length === 0) {
        return {
          token1Balance: "0",
          token2Balance: "0",
          tokenBalances: {},
        };
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const balances = await Promise.all(
        tokens.map(async (token) => {
          try {
            const tokenContract = new ethers.Contract(token.address, ERC20_ABI, signer);
            const balance = await tokenContract.balanceOf(userAddress);
            return { address: token.address, balance: balance.toString() };
          } catch (error) {
            console.error(`Error fetching balance for token ${token.address}:`, error);
            return { address: token.address, balance: "0" };
          }
        })
      );

      const balanceMap = balances.reduce((acc, { address, balance }) => {
        acc[address] = balance;
        return acc;
      }, {});

      return {
        token1Balance: balanceMap[tokens[0]?.address] || "0",
        token2Balance: balanceMap[tokens[1]?.address] || "0",
        tokenBalances: balanceMap,
      };
    } catch (error) {
      console.error("fetchTokenBalances error:", error);
      return rejectWithValue(error.message || "Failed to fetch token balances");
    }
  }
);

// Slice Definition
const liquidityPoolSlice = createSlice({
  name: "liquidityPool",
  initialState: {
    tokens: [],
    pendingRewards: "0",
    transactions: {
      items: [],
      status: {},
      lastUpdate: null,
    },
    loading: false,
    error: null,
    token1: null,
    token2: null,
    totalLiquidity1: "0",
    totalLiquidity2: "0",
    userLiquidity1: "0",
    userLiquidity2: "0",
    lastRewardTime: 0,
    rewardRate: 1,
    delayTime: 5,
    feeRate: 20,
    token1Balance: "0",
    token2Balance: "0",
    tokenBalances: {},
    poolDetails: {
      token1PerToken2: "0",
      token2PerToken1: "0",
      poolShare: "0%",
      token1: null,
      token2: null,
      totalLiquidity1: "0",
      totalLiquidity2: "0",
      userLiquidity1: "0",
      userLiquidity2: "0",
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
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllTokens.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllTokens.fulfilled, (state, action) => {
        state.tokens = action.payload;
        state.loading = false;
      })
      .addCase(fetchAllTokens.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      .addCase(fetchTokenBalances.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTokenBalances.fulfilled, (state, action) => {
        state.token1Balance = action.payload.token1Balance;
        state.token2Balance = action.payload.token2Balance;
        state.tokenBalances = action.payload.tokenBalances;
        state.loading = false;
      })
      .addCase(fetchTokenBalances.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      .addCase(fetchPoolDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPoolDetails.fulfilled, (state, action) => {
        state.poolDetails = action.payload;
        state.token1 = action.payload.token1;
        state.token2 = action.payload.token2;
        state.totalLiquidity1 = action.payload.totalLiquidity1;
        state.totalLiquidity2 = action.payload.totalLiquidity2;
        state.userLiquidity1 = action.payload.userLiquidity1;
        state.userLiquidity2 = action.payload.userLiquidity2;
        state.loading = false;
      })
      .addCase(fetchPoolDetails.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      .addCase(fetchUserTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserTransactions.fulfilled, (state, action) => {
        state.transactions.items = action.payload;
        state.transactions.lastUpdate = Date.now();
        state.loading = false;
        const newStatus = {};
        action.payload.forEach((tx) => {
          newStatus[tx.transaction] = tx.status;
        });
        state.transactions.status = newStatus;
      })
      .addCase(fetchUserTransactions.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      .addCase(swapTokens.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(swapTokens.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.transaction) {
          state.transactions.status[action.payload.transaction] = "confirmed";
        }
      })
      .addCase(swapTokens.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      .addCase(provideLiquidity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(provideLiquidity.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.transaction) {
          state.transactions.status[action.payload.transaction] = "confirmed";
        }
      })
      .addCase(provideLiquidity.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      .addCase(removeLiquidity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeLiquidity.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.transaction) {
          state.transactions.status[action.payload.transaction] = "confirmed";
        }
      })
      .addCase(removeLiquidity.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      .addCase(fetchPendingRewards.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPendingRewards.fulfilled, (state, action) => {
        state.pendingRewards = action.payload;
        state.loading = false;
      })
      .addCase(fetchPendingRewards.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      .addCase(depositRewards.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(depositRewards.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(depositRewards.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      .addCase(distributeRewards.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(distributeRewards.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.transaction) {
          state.transactions.status[action.payload.transaction] = "confirmed";
        }
      })
      .addCase(distributeRewards.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      .addCase(initialize.pending, (state) => {
        state.loading = true;
        state.error = null;
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
      .addCase(getAmountOut.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAmountOut.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(getAmountOut.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      });
  },
});

export const { updateTransactionStatus, clearTransactionHistory } = liquidityPoolSlice.actions;

export default liquidityPoolSlice.reducer;