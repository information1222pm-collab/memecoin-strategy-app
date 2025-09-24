import axios from 'axios';
export interface LiveTokenData { schemaVersion: string; pair: { chainId: string; dexId: string; url: string; pairAddress: string; baseToken: { address: string; name: string; symbol: string; }; priceUsd: string; liquidity: { usd: number; }; }; }
export interface AppToken { address: string; name: string; symbol: string; liquidityUSD: number; hasMintAuthority: boolean; isOwnershipRenounced: boolean; top10HolderPercent: number; tradesPerMinute: number; buyerSellerRatio: number; }
export class DataFetcher {
    private callback: (token: AppToken) => void;
    private seenTokens: Set<string> = new Set();
    constructor(callback: (token: AppToken) => void) { this.callback = callback; }
    public start() {
        console.log('[DataFetcher] Starting to poll DEX Screener for new pairs...');
        setInterval(this.fetchNewPairs, 15000);
        this.fetchNewPairs();
    }
    private fetchNewPairs = async () => {
        try {
            const response = await axios.get('https://api.dexscreener.com/api/v1/pairs/new');
            const data: { schemaVersion: string, pairs: LiveTokenData['pair'][] } = response.data;
            if (!data.pairs) return;
            for (const pair of data.pairs.reverse()) {
                if (!this.seenTokens.has(pair.baseToken.address)) {
                    this.seenTokens.add(pair.baseToken.address);
                    const appToken: AppToken = {
                        address: pair.baseToken.address, name: pair.baseToken.name, symbol: pair.baseToken.symbol, liquidityUSD: pair.liquidity.usd,
                        hasMintAuthority: Math.random() < 0.7, isOwnershipRenounced: Math.random() > 0.6,
                        top10HolderPercent: Math.random() * 60 + 20, tradesPerMinute: Math.floor(Math.random() * 50), buyerSellerRatio: 0.8 + Math.random() * 0.8,
                    };
                    this.callback(appToken);
                }
            }
        } catch (error) {
            // --- THIS IS THE CORRECTED, SAFE ERROR HANDLING ---
            if (error instanceof Error) {
                console.error('[DataFetcher] Error fetching new pairs:', error.message);
            } else {
                console.error('[DataFetcher] An unknown error occurred:', error);
            }
        }
    }
}
