import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ethers } from 'ethers';
import OrderBookABI from '../../contracts/abis/OrderBook.json';
import { ORDER_BOOK_ADDRESS } from '../../contracts/addresses';

// Helper function to get the contract instance
const getOrderBookContract = () => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  return new ethers.Contract(ORDER_BOOK_ADDRESS, OrderBookABI, signer);
};

// Place Order
export const placeOrder = createAsyncThunk(
  'orderBook/placeOrder',
  async ({ token, amount, price, isBuyOrder }, { rejectWithValue }) => {
    try {
      const contract = getOrderBookContract();
      const tx = await contract.placeOrder(token, amount, price, isBuyOrder);
      await tx.wait();
      return { token, amount, price, isBuyOrder, transaction: tx.hash };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Execute Order
export const executeOrder = createAsyncThunk(
  'orderBook/executeOrder',
  async ({ orderId, marketLiquidity1, marketLiquidity2 }, { rejectWithValue }) => {
    try {
      const contract = getOrderBookContract();
      const tx = await contract.executeOrder(orderId, marketLiquidity1, marketLiquidity2);
      await tx.wait();
      return { orderId, transaction: tx.hash };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Cancel Order
export const cancelOrder = createAsyncThunk(
  'orderBook/cancelOrder',
  async (orderId, { rejectWithValue }) => {
    try {
      const contract = getOrderBookContract();
      const tx = await contract.cancelOrder(orderId);
      await tx.wait();
      return { orderId, transaction: tx.hash };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Get Amount Out
export const getAmountOut = createAsyncThunk(
  'orderBook/getAmountOut',
  async ({ amountIn, reserveIn, reserveOut }, { rejectWithValue }) => {
    try {
      const contract = getOrderBookContract();
      const amountOut = await contract.getAmountOut(amountIn, reserveIn, reserveOut);
      return amountOut.toString();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addToken = createAsyncThunk(
    'orderBook/addToken',
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


// Get All Tokens
export const getAllTokens = createAsyncThunk(
  'orderBook/getAllTokens',
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

// Get User Transaction Hashes
export const getUserTransactionHashes = createAsyncThunk(
  'orderBook/getUserTransactionHashes',
  async (_, { rejectWithValue }) => {
    try {
      const contract = getOrderBookContract();
      const hashes = await contract.getUserTransactionHashes();
      return hashes;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch Orders Events
export const fetchOrders = createAsyncThunk(
  'orderBook/fetchOrders',
  async (userAddress, { rejectWithValue }) => {
    try {
      const contract = getOrderBookContract();
      
      // Create filters for events
      const orderPlacedFilter = contract.filters.OrderPlaced(null, userAddress);
      const orderExecutedFilter = contract.filters.OrderExecuted();
      const orderCancelledFilter = contract.filters.OrderCancelled(null, userAddress);

      // Get recent blocks
      const fromBlock = await contract.provider.getBlockNumber() - 1000;
      const toBlock = 'latest';

      // Get all events
      const [placed, executed, cancelled] = await Promise.all([
        contract.queryFilter(orderPlacedFilter, fromBlock, toBlock),
        contract.queryFilter(orderExecutedFilter, fromBlock, toBlock),
        contract.queryFilter(orderCancelledFilter, fromBlock, toBlock)
      ]);

      // Process events
      const orders = placed.map(event => ({
        orderId: event.args.orderId.toString(),
        user: event.args.user,
        token: event.args.token,
        amount: event.args.amount.toString(),
        price: event.args.price.toString(),
        isBuyOrder: event.args.isBuyOrder,
        isPrivate: event.args.isPrivate,
        status: 'active',
        timestamp: event.blockNumber
      }));

      // Update status for executed and cancelled orders
      executed.forEach(event => {
        const order = orders.find(o => o.orderId === event.args.orderId.toString());
        if (order) order.status = 'executed';
      });

      cancelled.forEach(event => {
        const order = orders.find(o => o.orderId === event.args.orderId.toString());
        if (order) order.status = 'cancelled';
      });

      return orders;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const orderBookSlice = createSlice({
  name: 'orderBook',
  initialState: {
    orders: [],
    tokens: [],
    transactions: [],
    orderCount: 0,
    loading: false,
    error: null,
    delayTime: 5,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder

      // Place Order
      .addCase(placeOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(placeOrder.fulfilled, (state) => {
        state.loading = false;
        state.orderCount += 1;
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })

      // Execute Order
      .addCase(executeOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(executeOrder.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(executeOrder.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })

      // Cancel Order
      .addCase(cancelOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(cancelOrder.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })

    //   Add Token
      .addCase(addToken.pending, (state) => {
        state.loading = true;
      })
      .addCase(addToken.fulfilled, (state, action) => {
        state.tokens = [...state.tokens, action.payload.tokenAddress];
        state.loading = false;
      })
      .addCase(addToken.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })

      // Get All Tokens
      .addCase(getAllTokens.fulfilled, (state, action) => {
        state.tokens = action.payload;
      })

      // Get User Transaction Hashes
      .addCase(getUserTransactionHashes.fulfilled, (state, action) => {
        state.transactions = action.payload;
      })

      // Fetch Orders
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.orders = action.payload;
        state.loading = false;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      });
  },
});

export default orderBookSlice.reducer;