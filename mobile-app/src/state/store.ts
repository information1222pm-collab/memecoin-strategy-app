import { configureStore } from '@reduxjs/toolkit';
import tokensReducer from './tokensSlice';
import rulesReducer from './rulesSlice'; // <-- IMPORT THE NEW REDUCER

export const store = configureStore({
  reducer: {
    tokens: tokensReducer,
    rules: rulesReducer, // <-- ADD THE NEW REDUCER TO THE STORE
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
