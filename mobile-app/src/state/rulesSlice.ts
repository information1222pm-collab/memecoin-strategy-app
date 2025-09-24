import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';

// This defines the structure of all our trading rules
export interface TradingRules {
  isAutoTradingEnabled: boolean;
  minMomentumScore: number;
  minLiquidityUSD: number;
  sizePercentOfBankroll: number;
  hardStopLossPercent: number;
  dailyLossCapPercent: number;
}

const initialState: TradingRules = {
  isAutoTradingEnabled: false,
  minMomentumScore: 70,
  minLiquidityUSD: 25000,
  sizePercentOfBankroll: 0.5,
  hardStopLossPercent: 25, // Stored as a positive number
  dailyLossCapPercent: 2,
};

const rulesSlice = createSlice({
  name: 'rules',
  initialState,
  reducers: {
    // This allows us to update any rule with a single action
    updateRule: <K extends keyof TradingRules>(
      state: TradingRules,
      action: PayloadAction<{ key: K; value: TradingRules[K] }>
    ) => {
      const { key, value } = action.payload;
      state[key] = value;
    },
  },
});

export const { updateRule } = rulesSlice.actions;

// This allows our screens to easily access the rules state
export const selectRules = (state: RootState) => state.rules;

export default rulesSlice.reducer;
