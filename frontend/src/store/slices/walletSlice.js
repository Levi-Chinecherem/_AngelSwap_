import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  address: null,
  isConnecting: false,
  error: null,
};

const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
    setWalletAddress: (state, action) => {
      state.address = action.payload;
    },
    setIsConnecting: (state, action) => {
      state.isConnecting = action.payload;
    },
    setWalletError: (state, action) => {
      state.error = action.payload;
    },
    resetWallet: (state) => {
      state.address = null;
      state.isConnecting = false;
      state.error = null;
    },
  },
});

export const { setWalletAddress, setIsConnecting, setWalletError, resetWallet } =
  walletSlice.actions;

export default walletSlice.reducer;