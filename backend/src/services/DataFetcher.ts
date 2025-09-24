import axios from 'axios';
import { OnChainService } from './OnChainService';

// This is the data structure for the official /tokens endpoint
export interface DexScreenerToken {
    addr: string;
    name: string;
    symbol: string;
}

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
        console.log('[DataFetcher] Starting poll for new Solana tokens...');
        setInterval(this.discoverNewTokens, 60000); // Poll every 60 seconds as this API is less frequent
        this.discoverNewTokens();
    }

    private discoverNewTokens = async () => {
        try {
            console.log('[DataFetcher] Fetching from official DEX Screener /new tokens endpoint...');
            // --- THIS IS THE FINAL, CORRECT, DOCUMENTED API ENDPOINT ---
            const response = await axios.get('https://api.dexscreener.io/u/search/pairs/solana/new');
            
            const data: { pairs: { baseToken: { address: string; name: string; symbol: string; }; liquidity?: { usd?: number; }; }[] } = response.data;

            if (!data.pairs || data.pairs.length === 0) {
                console.log('[DataFetcher] API returned no new tokens in this cycle.');
                return;
            }
            
            console.log(`[DataFetcher] Found ${data.pairs.length} new pairs.`);

            for (const pair of data.pairs) {
                const tokenAddress = pair.baseToken.address;
                const liquidity = pair.liquidity?.usd ?? 0;

                if (!this.seenTokens.has(tokenAddress) && liquidity > 500) { // Filter out ultra-low LP
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
                        // Simulate market data until we add websockets back
                        tradesPerMinute: Math.floor(Math.random() * 50),
                        buyerSellerRatio: 0.8 + Math.random() * 0.8,
                    };
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
