import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { ethers } from "ethers";
import OrderBookABI from "../../contracts/OrderBook.sol/OrderBook.json";
import { ORDER_BOOK_ADDRESS } from "../../contracts/addresses";

const getOrderBookContract = async () => {
  if (!window.ethereum) throw new Error("No Ethereum provider found");
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return new ethers.Contract(ORDER_BOOK_ADDRESS, OrderBookABI.abi, signer);
};

// Place Order
export const placeOrder = createAsyncThunk(
  'orderBook/placeOrder',
  async ({ token, amount, price, isBuyOrder }, { rejectWithValue }) => {
    try {
      const contract = await getOrderBookContract();
      console.log("OrderBook contract initialized at:", ORDER_BOOK_ADDRESS);
      console.log("Calling placeOrder with:", { token, amount: amount.toString(), price: price.toString(), isBuyOrder });

      const tx = await contract.placeOrder(token, amount, price, isBuyOrder);
      const receipt = await tx.wait();
      console.log("Place order transaction:", receipt.hash);
      return { token, amount, price, isBuyOrder, transaction: receipt.hash };
    } catch (error) {
      console.error("placeOrder error:", error);
      return rejectWithValue(error.message || "Failed to place order");
    }
  }
);

// Execute Order
export const executeOrder = createAsyncThunk(
  'orderBook/executeOrder',
  async ({ orderId, marketLiquidity1, marketLiquidity2 }, { rejectWithValue }) => {
    try {
      const contract = await getOrderBookContract();
      console.log("Calling executeOrder with:", { orderId, marketLiquidity1: marketLiquidity1.toString(), marketLiquidity2: marketLiquidity2.toString() });
      const tx = await contract.executeOrder(orderId, marketLiquidity1, marketLiquidity2);
      const receipt = await tx.wait();
      console.log("Execute order transaction:", receipt.hash);
      return { orderId, transaction: receipt.hash };
    } catch (error) {
      console.error("executeOrder error:", error);
      return rejectWithValue(error.message || "Failed to execute order");
    }
  }
);

// Cancel Order
export const cancelOrder = createAsyncThunk(
  'orderBook/cancelOrder',
  async ({ orderId }, { rejectWithValue }) => {
    try {
      const contract = await getOrderBookContract();
      console.log("Calling cancelOrder with:", { orderId });
      const tx = await contract.cancelOrder(orderId);
      const receipt = await tx.wait();
      console.log("Cancel order transaction:", receipt.hash);
      return { orderId, transaction: receipt.hash };
    } catch (error) {
      console.error("cancelOrder error:", error);
      return rejectWithValue(error.message || "Failed to cancel order");
    }
  }
);

// Get Amount Out
export const getAmountOut = createAsyncThunk(
  'orderBook/getAmountOut',
  async ({ amountIn, reserveIn, reserveOut }, { rejectWithValue }) => {
    try {
      const contract = await getOrderBookContract();
      const amountOut = await contract.getAmountOut(amountIn, reserveIn, reserveOut);
      return amountOut.toString();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Add Token
export const addToken = createAsyncThunk(
  'orderBook/addToken',
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

// Get All Tokens
export const getAllTokens = createAsyncThunk(
  'orderBook/getAllTokens',
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

// Get User Transaction Hashes
export const getUserTransactionHashes = createAsyncThunk(
  'orderBook/getUserTransactionHashes',
  async (_, { rejectWithValue }) => {
    try {
      const contract = await getOrderBookContract();
      const hashes = await contract.getUserTransactionHashes();
      return hashes;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch Orders
export const fetchOrders = createAsyncThunk(
  "orderBook/fetchOrders",
  async (userAddress, { rejectWithValue }) => {
    try {
      const contract = await getOrderBookContract();
      const orderCount = await contract.orderCount();
      const orders = [];

      for (let i = 1; i <= orderCount; i++) {
        const order = await contract.orders(i);
        if (order.amount > 0) {
          orders.push({
            orderId: i.toString(),
            user: order.user,
            token: order.token,
            amount: order.amount.toString(),
            price: order.price.toString(),
            isBuyOrder: order.isBuyOrder,
            isPrivate: order.isPrivate,
            status: "active",
            timestamp: Number(order.timestamp),
          });
        }
      }
      console.log("Fetched orders:", orders);
      return orders;
    } catch (error) {
      console.error("fetchOrders error:", error);
      return rejectWithValue(error.message || "Failed to fetch orders");
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
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Place Order
      .addCase(placeOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(placeOrder.fulfilled, (state) => {
        state.loading = false;
        state.orderCount += 1;
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Execute Order
      .addCase(executeOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(executeOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = state.orders.filter((order) => order.orderId !== action.payload.orderId);
      })
      .addCase(executeOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Cancel Order
      .addCase(cancelOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = state.orders.filter((order) => order.orderId !== action.payload.orderId);
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add Token
      .addCase(addToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToken.fulfilled, (state, action) => {
        state.tokens = [...state.tokens, action.payload.tokenAddress];
        state.loading = false;
      })
      .addCase(addToken.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get All Tokens
      .addCase(getAllTokens.fulfilled, (state, action) => {
        state.tokens = action.payload;
      })
      .addCase(getAllTokens.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Get User Transaction Hashes
      .addCase(getUserTransactionHashes.fulfilled, (state, action) => {
        state.transactions = action.payload;
      })
      .addCase(getUserTransactionHashes.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Fetch Orders
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.orders = action.payload;
        state.loading = false;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = orderBookSlice.actions;
export default orderBookSlice.reducer;