import axios from 'axios';
import { OnChainService } from './OnChainService'; // <-- Import the new service

export interface LiveTokenData { pair: { baseToken: { address: string; name: string; symbol: string; }; liquidity: { usd: number; }; }; }
export interface AppToken { address: string; name: string; symbol: string; liquidityUSD: number; hasMintAuthority: boolean; isOwnershipRenounced: boolean; top10HolderPercent: number; tradesPerMinute: number; buyerSellerRatio: number; }

export class DataFetcher {
    private callback: (token: AppToken) => void;
    private seenTokens: Set<string> = new Set();
    private onChainService: OnChainService; // <-- Create an instance of the service

    constructor(callback: (token: AppToken) => void) {
        this.callback = callback;
        this.onChainService = new OnChainService(); // <-- Initialize it
    }

    public start() {
        console.log('[DataFetcher] Starting to poll DEX Screener for new pairs...');
        setInterval(this.fetchNewPairs, 15000);
        this.fetchNewPairs();
    }

    private fetchNewPairs = async () => {
        try {
            const response = await axios.get('https://api.dexscreener.com/api/v1/pairs/new');
            const data: { pairs: LiveTokenData['pair'][] } = response.data;
            if (!data.pairs) return;

            for (const pair of data.pairs.reverse()) {
                const tokenAddress = pair.baseToken.address;
                if (!this.seenTokens.has(tokenAddress)) {
                    this.seenTokens.add(tokenAddress);

                    // --- ENRICHMENT STEP ---
                    // For each new token, get its real on-chain details.
                    const onChainDetails = await this.onChainService.getOnChainDetails(tokenAddress);
                    
                    const appToken: AppToken = {
                        address: tokenAddress,
                        name: pair.baseToken.name,
                        symbol: pair.baseToken.symbol,
                        liquidityUSD: pair.liquidity.usd,
                        // --- Use REAL on-chain data now ---
                        hasMintAuthority: onChainDetails.hasMintAuthority,
                        isOwnershipRenounced: onChainDetails.isOwnershipRenounced,
                        top10HolderPercent: onChainDetails.top10HolderPercent,
                        // --- Continue simulating market activity for now ---
                        tradesPerMinute: Math.floor(Math.random() * 50),
                        buyerSellerRatio: 0.8 + Math.random() * 0.8,
                    };
                    this.callback(appToken);
                }
            }
        } catch (error) {
            if (error instanceof Error) console.error('[DataFetcher] Error:', error.message);
            else console.error('[DataFetcher] Unknown error:', error);
        }
    }
}
