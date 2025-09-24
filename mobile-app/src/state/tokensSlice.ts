import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import apiClient from '../api/apiClient';

// Data for the list view
export interface TokenData { 
  id: string; 
  name: string; 
  score: number; 
  safetyStatus: 'Pass' | 'Fail'; 
}

// Data for the detail view
export interface TokenDetailData { 
  name: string; 
  score: number; 
  priceUSD: number; 
  priceChange24h: number; 
  liquidityUSD: number; 
  marketCap: number; 
  holders: number; 
  botShare: number; 
  reasons: string[]; 
}

// Data for the chart
export interface ChartData { 
  labels: string[]; 
  datasets: { data: number[] }[]; 
}

// The complete state for our feature
interface TokensState {
  tokens: TokenData[];
  listStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  currentToken: TokenDetailData | null;
  detailStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  currentChart: ChartData | null;
  chartStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: TokensState = { 
  tokens: [], 
  listStatus: 'idle', 
  currentToken: null, 
  detailStatus: 'idle', 
  currentChart: null, 
  chartStatus: 'idle' 
};

// --- All three data-fetching functions are correctly defined and exported here ---
export const fetchTokens = createAsyncThunk('tokens/fetchTokens', async () => {
  const response = await apiClient.get('/radar-tokens');
  return response.data;
});

export const fetchTokenDetails = createAsyncThunk('tokens/fetchTokenDetails', async (tokenId: string) => {
  const response = await apiClient.get(`/token-details/${tokenId}`);
  return response.data;
});

export const fetchTokenChart = createAsyncThunk('tokens/fetchTokenChart', async (tokenId: string) => {
  const response = await apiClient.get(`/token-chart/${tokenId}`);
  return response.data;
});
// ---

const tokensSlice = createSlice({
  name: 'tokens',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Cases for the main token list
      .addCase(fetchTokens.pending, (s) => { s.listStatus = 'loading'; })
      .addCase(fetchTokens.fulfilled, (s, a) => { s.listStatus = 'succeeded'; s.tokens = a.payload; })
      .addCase(fetchTokens.rejected, (s) => { s.listStatus = 'failed'; })
      // Cases for the token details
      .addCase(fetchTokenDetails.pending, (s) => { s.detailStatus = 'loading'; })
      .addCase(fetchTokenDetails.fulfilled, (s, a) => { s.detailStatus = 'succeeded'; s.currentToken = a.payload; })
      .addCase(fetchTokenDetails.rejected, (s) => { s.detailStatus = 'failed'; })
      // Cases for the token chart
      .addCase(fetchTokenChart.pending, (s) => { s.chartStatus = 'loading'; })
      .addCase(fetchTokenChart.fulfilled, (s, a) => { s.chartStatus = 'succeeded'; s.currentChart = a.payload; })
      .addCase(fetchTokenChart.rejected, (s) => { s.chartStatus = 'failed'; });
  },
});

export default tokensSlice.reducer;
