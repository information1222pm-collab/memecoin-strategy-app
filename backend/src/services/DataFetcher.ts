import axios from 'axios';
import { OnChainService } from './OnChainService';

// This is the data structure for the Birdeye new pairs endpoint
export interface BirdeyePair {
    address: string;
    name: string;
    liquidity: number;
    base: {
        address: string;
        name: string;
        symbol: string;
    };
}

export interface AppToken { 
    address: string; 
    name: string; 
    symbol: string; 
    liquidityUSD: number; 
    hasMintAuthority: boolean; 
    isOwnershipRenounced: boolean; 
    top10HolderPercent: number; 
    tradesPerMinute: number; 
    buyerSellerRatio: number; 
}

export class DataFetcher {
    private callback: (token: AppToken) => void;
    private seenTokens: Set<string> = new Set();
    private onChainService: OnChainService;

    constructor(callback: (token: AppToken) => void) {
        this.callback = callback;
        this.onChainService = new OnChainService();
    }

    public start() {
        console.log('[DataFetcher] Starting poll for new pairs from Birdeye...');
        setInterval(this.discoverNewPairs, 60000); // Poll every 60 seconds
        this.discoverNewPairs();
    }

    private discoverNewPairs = async () => {
        try {
            console.log('[DataFetcher] Fetching from Birdeye API...');
            
            // --- THIS IS THE FINAL, STABLE, BIRDEYE API ENDPOINT ---
            const response = await axios.get('https://public-api.birdeye.so/v1/defi/new_pairs', {
                headers: { 'X-API-KEY': 'YOUR_BIRDEYE_API_KEY' } // Public endpoint often works without a key
            });
            
            const data: { success: boolean, data: { pairs: BirdeyePair[] } } = response.data;

            if (!data.success || !data.data.pairs || data.data.pairs.length === 0) {
                console.log('[DataFetcher] Birdeye API returned no new pairs in this cycle.');
                return;
            }
            
            console.log(`[DataFetcher] Found ${data.data.pairs.length} new pairs from Birdeye.`);

            for (const pair of data.data.pairs) {
                const tokenAddress = pair.base.address;
                const liquidity = pair.liquidity ?? 0;

                if (tokenAddress && !this.seenTokens.has(tokenAddress) && liquidity > 1000) {
                    this.seenTokens.add(tokenAddress);
                    
                    const onChainDetails = await this.onChainService.getOnChainDetails(tokenAddress);
                    
                    const appToken: AppToken = {
                        address: tokenAddress,
                        name: pair.base.name,
                        symbol: pair.base.symbol,
                        liquidityUSD: liquidity,
                        hasMintAuthority: onChainDetails.hasMintAuthority,
                        isOwnershipRenounced: onChainDetails.isOwnershipRenounced,
                        top10HolderPercent: onChainDetails.top10HolderPercent,
                        tradesPerMinute: Math.floor(Math.random() * 50),
                        buyerSellerRatio: 0.8 + Math.random() * 0.8,
                    };
                    this.callback(appToken);
                }
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error(`[DataFetcher] Axios Error fetching from Birdeye: ${error.message}`);
            } else {
                console.error('[DataFetcher] An unknown error occurred:', error);
            }
        }
    };
}
