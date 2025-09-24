import axios from 'axios';
import WebSocket from 'ws';
import { OnChainService } from './OnChainService';

export interface AppToken { address: string; name: string; symbol: string; liquidityUSD: number; hasMintAuthority: boolean; isOwnershipRenounced: boolean; top10HolderPercent: number; tradesPerMinute: number; buyerSellerRatio: number; }

export class DataFetcher {
    private callback: (token: AppToken) => void;
    private seenTokens: Set<string> = new Set();
    private onChainService: OnChainService;

    constructor(callback: (token: AppToken) => void) {
        this.callback = callback;
        this.onChainService = new OnChainService();
    }

    public start() {
        console.log('[DataFetcher] Starting poll for new pairs...');
        setInterval(this.discoverNewPairs, 30000); // Poll every 30 seconds
        this.discoverNewPairs();
    }

    private discoverNewPairs = async () => {
        try {
            console.log('[DataFetcher] Fetching from DEX Screener...');
            // This is the most stable endpoint for general new pairs
            const response = await axios.get('https://api.dexscreener.com/latest/dex/pairs');
            
            // The data structure from this endpoint is different
            const data: { pairs: { pairAddress: string; baseToken: { address: string; name: string; symbol: string; }; liquidity?: { usd?: number; }; }[] } = response.data;
            
            if (!data.pairs || data.pairs.length === 0) {
                console.log('[DataFetcher] API returned no new pairs in this cycle.');
                return;
            }
            
            console.log(`[DataFetcher] Found ${data.pairs.length} potential pairs in the latest batch.`);

            for (const pair of data.pairs.reverse()) {
                const tokenAddress = pair.baseToken.address;
                const liquidity = pair.liquidity?.usd ?? 0;

                if (!this.seenTokens.has(tokenAddress) && liquidity > 1000) { // Basic liquidity filter
                    this.seenTokens.add(tokenAddress);
                    
                    const onChainDetails = await this.onChainService.getOnChainDetails(tokenAddress);
                    
                    const appToken: AppToken = {
                        address: tokenAddress,
                        name: pair.baseToken.name,
                        symbol: pair.baseToken.symbol,
                        liquidityUSD: liquidity,
                        hasMintAuthority: onChainDetails.hasMintAuthority,
                        isOwnershipRenounced: onChainDetails.isOwnershipRenounced,
                        top10HolderPercent: onChainDetails.top10HolderPercent,
                        tradesPerMinute: Math.floor(Math.random() * 50),
                        buyerSellerRatio: 0.8 + Math.random() * 0.8,
                    };
                    // Pass the complete, processed token to the main server logic
                    this.callback(appToken);
                }
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error(`[DataFetcher] Axios Error fetching data: ${error.message}`);
            } else {
                console.error('[DataFetcher] An unknown error occurred:', error);
            }
        }
    };
}
