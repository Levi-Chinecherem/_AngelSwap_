import { configureStore } from "@reduxjs/toolkit";
import walletReducer from "./slices/walletSlice";
import liquidityPoolReducer from "./slices/liquidityPoolSlice";
import orderBookReducer from "./slices/orderBookSlice";
import adminReducer from "./slices/adminSlice";

export const store = configureStore({
  reducer: {
    wallet: walletReducer,
    liquidityPool: liquidityPoolReducer,
    orderBook: orderBookReducer,
    admin: adminReducer,
  },
});