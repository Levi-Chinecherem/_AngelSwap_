import { configureStore } from "@reduxjs/toolkit";
import walletReducer from "./slices/walletSlice";
import liquidityPoolReducer from "./slices/liquidityPoolSlice";
import orderBookReducer from "./slices/orderBookSlice";
import adminReducer from "./slices/adminSlice";
import securityReducer from './slices/securitySlice'; 

export const store = configureStore({
  reducer: {
    wallet: walletReducer,
    liquidityPool: liquidityPoolReducer,
    orderBook: orderBookReducer,
    admin: adminReducer,
    security: securityReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // For ethers objects
    }),
});

export default store;