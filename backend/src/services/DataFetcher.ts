import axios from 'axios';
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
        console.log('[DataFetcher] Starting resilient, tri-source polling...');
        setInterval(this.discoverNewPairs, 60000);
        this.discoverNewPairs();
    }

    private fetchFromBirdeye = async (): Promise<AppToken[]> => {
        try {
            const response = await axios.get('https://public-api.birdeye.so/v1/defi/new_pairs');
            const data = response.data;
            if (!data.success || !data.data.pairs) return [];
            console.log(`[Birdeye] Success: Fetched ${data.data.pairs.length} pairs.`);
            return data.data.pairs.map((p: any) => ({
                address: p.base.address, name: p.base.name, symbol: p.base.symbol, liquidityUSD: p.liquidity ?? 0
            }));
        } catch (error) {
            console.error('[Birdeye] API failed. Continuing with other sources.');
            return [];
        }
    }

    private fetchFromDexScreener = async (): Promise<AppToken[]> => {
        try {
            const response = await axios.get('https://api.dexscreener.com/latest/dex/pairs/solana/new');
            const data = response.data;
            if (!data.pairs) return [];
            console.log(`[DEX Screener] Success: Fetched ${data.pairs.length} pairs.`);
            return data.pairs.map((p: any) => ({
                address: p.baseToken.address, name: p.baseToken.name, symbol: p.baseToken.symbol, liquidityUSD: p.liquidity?.usd ?? 0
            }));
        } catch (error) {
            console.error('[DEX Screener] API failed. Continuing with other sources.');
            return [];
        }
    }

    private fetchFromGeckoTerminal = async (): Promise<AppToken[]> => {
        try {
            const response = await axios.get('https://api.geckoterminal.com/api/v2/networks/solana/new_pools', {
                headers: {
                    'Accept': 'application/json;version=20230302',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });
            const data = response.data;
            if (!data.data) return [];
            console.log(`[GeckoTerminal] Success: Fetched ${data.data.length} pools.`);
            return data.data.map((pool: any) => {
                const baseToken = pool.relationships.base_token.data;
                const attributes = pool.attributes;
                return {
                    address: baseToken.id.split('_')[1], 
                    name: attributes.name, 
                    symbol: attributes.name.split('/')[0].trim(), 
                    liquidityUSD: parseFloat(attributes.reserve_in_usd) ?? 0
                };
            });
        } catch (error) {
            console.error('[GeckoTerminal] API failed. Continuing with other sources.');
            return [];
        }
    }

    private discoverNewPairs = async () => {
        console.log('[DataFetcher] Polling all data sources...');
        const results = await Promise.allSettled([this.fetchFromBirdeye(), this.fetchFromDexScreener(), this.fetchFromGeckoTerminal()]);
        const allNewTokens: AppToken[] = [];
        if (results[0].status === 'fulfilled') allNewTokens.push(...results[0].value);
        if (results[1].status === 'fulfilled') allNewTokens.push(...results[1].value);
        if (results[2].status === 'fulfilled') allNewTokens.push(...results[2].value);
        if (allNewTokens.length === 0) {
            console.log('[DataFetcher] No new pairs found from any source in this cycle.');
            return;
        }
        console.log(`[DataFetcher] Found a total of ${allNewTokens.length} potential tokens from all sources.`);
        for (const token of allNewTokens) {
            if (token.address && !this.seenTokens.has(token.address) && token.liquidityUSD > 1000) {
                this.seenTokens.add(token.address);
                const onChainDetails = await this.onChainService.getOnChainDetails(token.address);
                this.callback({ ...token, ...onChainDetails, tradesPerMinute: Math.floor(Math.random() * 50), buyerSellerRatio: 0.8 + Math.random() * 0.8 });
            }
        }
    };
}
