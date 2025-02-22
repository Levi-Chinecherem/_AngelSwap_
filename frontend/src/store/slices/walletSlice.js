import { createSlice } from "@reduxjs/toolkit";

const walletSlice = createSlice({
  name: "wallet",
  initialState: {
    address: null,
    provider: null,
    signer: null,
  },
  reducers: {
    setWalletAddress: (state, action) => {
      state.address = action.payload;
    },
    setProvider: (state, action) => {
      state.provider = action.payload;
    },
    setSigner: (state, action) => {
      state.signer = action.payload;
    },
  },
});

export const { setWalletAddress, setProvider, setSigner } = walletSlice.actions;
export default walletSlice.reducer;