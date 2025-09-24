import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import apiClient from '../api/apiClient';
// Main list item data
export interface TokenData { id: string; name: string; score: number; safetyStatus: 'Pass' | 'Fail'; }
// Detailed token data
export interface TokenDetailData { name: string; score: number; priceUSD: number; priceChange24h: number; liquidityUSD: number; marketCap: number; holders: number; botShare: number; gini: number; avgSlippage: number; reasons: string[]; }
interface TokensState {
  tokens: TokenData[];
  listStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  currentToken: TokenDetailData | null;
  detailStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
}
const initialState: TokensState = { tokens: [], listStatus: 'idle', currentToken: null, detailStatus: 'idle' };
export const fetchTokens = createAsyncThunk('tokens/fetchTokens', async () => { const response = await apiClient.get('/radar-tokens'); return response.data; });
export const fetchTokenDetails = createAsyncThunk('tokens/fetchTokenDetails', async (tokenId: string) => { const response = await apiClient.get(`/token-details/${tokenId}`); return response.data; });
const tokensSlice = createSlice({
  name: 'tokens',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTokens.pending, (s) => { s.listStatus = 'loading'; })
      .addCase(fetchTokens.fulfilled, (s, a) => { s.listStatus = 'succeeded'; s.tokens = a.payload; })
      .addCase(fetchTokens.rejected, (s) => { s.listStatus = 'failed'; })
      .addCase(fetchTokenDetails.pending, (s) => { s.detailStatus = 'loading'; })
      .addCase(fetchTokenDetails.fulfilled, (s, a) => { s.detailStatus = 'succeeded'; s.currentToken = a.payload; })
      .addCase(fetchTokenDetails.rejected, (s) => { s.detailStatus = 'failed'; });
  },
});
export default tokensSlice.reducer;
