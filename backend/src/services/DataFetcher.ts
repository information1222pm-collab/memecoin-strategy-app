import axios from 'axios';

// This is the structure of the token data we expect from DEX Screener
export interface LiveTokenData {
  schemaVersion: string;
  pair: {
    chainId: string;
    dexId: string;
    url: string;
    pairAddress: string;
    baseToken: {
      address: string;
      name: string;
      symbol: string;
    };
    priceUsd: string;
    liquidity: {
      usd: number;
    };
  };
}

// This is the structure we will use inside our application
export interface AppToken {
    address: string;
    name: string;
    symbol: string;
    liquidityUSD: number;
    // We will need to fetch these details separately in a real scenario
    hasMintAuthority: boolean; 
    isOwnershipRenounced: boolean;
    top10HolderPercent: number;
    tradesPerMinute: number;
    buyerSellerRatio: number;
}


export class DataFetcher {
    private callback: (token: AppToken) => void;
    private seenTokens: Set<string> = new Set(); // To avoid processing the same token twice

    constructor(callback: (token: AppToken) => void) {
        this.callback = callback;
    }

    public start() {
        console.log('[DataFetcher] Starting to poll DEX Screener for new pairs...');
        // Poll the API every 15 seconds
        setInterval(this.fetchNewPairs, 15000);
        this.fetchNewPairs(); // Fetch immediately on start
    }

    private fetchNewPairs = async () => {
        try {
            // This is the official public API endpoint for new pairs on DEX Screener
            const response = await axios.get('https://api.dexscreener.com/api/v1/pairs/new');
            const data: { schemaVersion: string, pairs: LiveTokenData['pair'][] } = response.data;
            
            if (!data.pairs) return;

            // Process tokens in reverse order (oldest of the new ones first)
            for (const pair of data.pairs.reverse()) {
                if (!this.seenTokens.has(pair.baseToken.address)) {
                    this.seenTokens.add(pair.baseToken.address);

                    // Transform the live data into our internal AppToken format
                    const appToken: AppToken = {
                        address: pair.baseToken.address,
                        name: pair.baseToken.name,
                        symbol: pair.baseToken.symbol,
                        liquidityUSD: pair.liquidity.usd,
                        // For now, we will continue to simulate these deeper on-chain details
                        hasMintAuthority: Math.random() < 0.7,
                        isOwnershipRenounced: Math.random() > 0.6,
                        top10HolderPercent: Math.random() * 60 + 20,
                        tradesPerMinute: Math.floor(Math.random() * 50), // New tokens have volatile trade counts
                        buyerSellerRatio: 0.8 + Math.random() * 0.8,
                    };

                    // Send the processed, real token to our main application logic
                    this.callback(appToken);
                }
            }
        } catch (error) {
            console.error('[DataFetcher] Error fetching new pairs from DEX Screener:', error.message);
        }
    }
}
