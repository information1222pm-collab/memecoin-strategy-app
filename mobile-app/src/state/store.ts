import { configureStore } from '@reduxjs/toolkit';
import tokensReducer from './tokensSlice';
import rulesReducer from './rulesSlice';
import walletReducer from './walletSlice'; // <-- IMPORT THE NEW REDUCER

export const store = configureStore({
  reducer: {
    tokens: tokensReducer,
    rules: rulesReducer,
    wallet: walletReducer, // <-- ADD THE NEW REDUCER TO THE STORE
  },
  // This helps prevent errors with non-serializable data from WalletConnect
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
