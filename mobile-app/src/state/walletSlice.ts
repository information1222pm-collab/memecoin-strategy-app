import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';

// This defines the structure of our wallet's state
export interface WalletState {
  isConnected: boolean;
  walletAddress: string | null;
  chainId: string | null;
}

const initialState: WalletState = {
  isConnected: false,
  walletAddress: null,
  chainId: null,
};

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setWalletState: (
      state: WalletState,
      action: PayloadAction<Partial<WalletState>>
    ) => {
      // Merge the new state with the existing state
      return { ...state, ...action.payload };
    },
    resetWalletState: () => initialState,
  },
});

export const { setWalletState, resetWalletState } = walletSlice.actions;

export const selectWallet = (state: RootState) => state.wallet;

export default walletSlice.reducer;
