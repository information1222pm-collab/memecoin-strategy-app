import axios from 'axios';
import { OnChainService } from './OnChainService';

// This is the generic structure our app will use, regardless of the source
export interface AppToken { 
    address: string; name: string; symbol: string; liquidityUSD: number; 
    hasMintAuthority: boolean; isOwnershipRenounced: boolean; top10HolderPercent: number; 
    tradesPerMinute: number; buyerSellerRatio: number; 
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
        console.log('[DataFetcher] Starting resilient, dual-source polling...');
        setInterval(this.discoverNewPairs, 60000); // Poll every 60 seconds
        this.discoverNewPairs();
    }

    private fetchFromBirdeye = async (): Promise<AppToken[]> => {
        try {
            const response = await axios.get('https://public-api.birdeye.so/v1/defi/new_pairs');
            const data = response.data;
            if (!data.success || !data.data.pairs) return [];
            console.log(`[Birdeye] Successfully fetched ${data.data.pairs.length} pairs.`);
            return data.data.pairs.map((p: any) => ({
                address: p.base.address, name: p.base.name, symbol: p.base.symbol, liquidityUSD: p.liquidity ?? 0
            }));
        } catch (error) {
            console.error('[Birdeye] API failed. This is expected if the service is down.');
            return []; // Return empty array on failure
        }
    }

    private fetchFromDexScreener = async (): Promise<AppToken[]> => {
        try {
            const response = await axios.get('https://api.dexscreener.com/latest/dex/pairs/solana/new');
            const data = response.data;
            if (!data.pairs) return [];
            console.log(`[DEX Screener] Successfully fetched ${data.pairs.length} pairs.`);
            return data.pairs.map((p: any) => ({
                address: p.baseToken.address, name: p.baseToken.name, symbol: p.baseToken.symbol, liquidityUSD: p.liquidity?.usd ?? 0
            }));
        } catch (error) {
            console.error('[DEX Screener] API failed. This is expected if the service is down.');
            return []; // Return empty array on failure
        }
    }

    private discoverNewPairs = async () => {
        console.log('[DataFetcher] Polling all data sources...');
        
        // Use Promise.allSettled to ensure that even if one API fails, the other can succeed.
        const results = await Promise.allSettled([
            this.fetchFromBirdeye(),
            this.fetchFromDexScreener()
        ]);

        const allNewTokens: AppToken[] = [];
        if (results[0].status === 'fulfilled') allNewTokens.push(...results[0].value);
        if (results[1].status === 'fulfilled') allNewTokens.push(...results[1].value);

        if (allNewTokens.length === 0) {
            console.log('[DataFetcher] No new pairs found from any source in this cycle.');
            return;
        }

        console.log(`[DataFetcher] Found a total of ${allNewTokens.length} potential new tokens from all sources.`);

        for (const token of allNewTokens) {
            if (token.address && !this.seenTokens.has(token.address) && token.liquidityUSD > 1000) {
                this.seenTokens.add(token.address);
                
                const onChainDetails = await this.onChainService.getOnChainDetails(token.address);
                
                const fullToken: AppToken = {
                    ...token,
                    hasMintAuthority: onChainDetails.hasMintAuthority,
                    isOwnershipRenounced: onChainDetails.isOwnershipRenounced,
                    top10HolderPercent: onChainDetails.top10HolderPercent,
                    tradesPerMinute: Math.floor(Math.random() * 50),
                    buyerSellerRatio: 0.8 + Math.random() * 0.8,
                };
                this.callback(fullToken);
            }
        }
    };
}
