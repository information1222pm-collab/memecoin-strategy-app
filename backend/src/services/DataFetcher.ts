import axios from 'axios';
import WebSocket from 'ws';
import { OnChainService } from './OnChainService';

export interface AppToken { address: string; name: string; symbol: string; liquidityUSD: number; hasMintAuthority: boolean; isOwnershipRenounced: boolean; top10HolderPercent: number; tradesPerMinute: number; buyerSellerRatio: number; }

export class DataFetcher {
    private callback: (token: AppToken) => void;
    private seenTokens: Set<string> = new Set();
    private onChainService: OnChainService;
    private activeSubscriptions: Map<string, WebSocket> = new Map();

    constructor(callback: (token: AppToken) => void) {
        this.callback = callback;
        this.onChainService = new OnChainService();
    }

    public start() {
        console.log('[DataFetcher] Starting to poll DEX Screener...');
        setInterval(this.discoverNewPairs, 30000);
        this.discoverNewPairs();
    }

    private discoverNewPairs = async () => {
        try {
            // --- THIS IS THE CORRECTED, MODERN API ENDPOINT ---
            const response = await axios.get('https://api.dexscreener.com/latest/dex/pairs/solana/new');
            // ---

            // The data structure from the new endpoint is slightly different
            const data:


const data: { pairs: { pairAddress: string; baseToken: { address: string; name: string; symbol: string; }; liquidity: { usd: number; } }[] } = response.data;
            if (!data.pairs) return;

            for (const pair of data.pairs.reverse()) {
                const tokenAddress = pair.baseToken.address;
                if (!this.seenTokens.has(tokenAddress)) {
                    this.seenTokens.add(tokenAddress);
                    console.log(`[Discovery] New token found: ${pair.baseToken.symbol}. Subscribing to trade stream...`);
                    this.subscribeToTokenTrades(pair);
                }
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('[Discovery] Axios Error:', error.response?.status, error.message);
            } else if (error instanceof Error) {
                console.error('[Discovery] Generic Error:', error.message);
            }
        }
    }

    private subscribeToTokenTrades(pair: any) {
        // This part of the logic remains the same
        const ws = new WebSocket('wss://public-api.birdeye.so/socket/solana');
        const tokenAddress = pair.baseToken.address;
        
        let tradesInLastMinute = 0, buys = 0, sells = 0;

        ws.on('open', () => {
            ws.send(JSON.stringify({ type: "SUBSCRIBE_TRADES", data: { address: tokenAddress } }));
        });

        ws.on('message', async (data: string) => {
            const message = JSON.parse(data);
            if (message.type === "TRADE_UPDATE") {
                tradesInLastMinute++;
                if(message.data.side === 'buy') buys++; else sells++;
            }
        });

        const interval = setInterval(async () => {
            const onChainDetails = await this.onChainService.getOnChainDetails(tokenAddress);
            const appToken: AppToken = {
                address: tokenAddress, name: pair.baseToken.name, symbol: pair.baseToken.symbol,
                liquidityUSD: pair.liquidity.usd,
                hasMintAuthority: onChainDetails.hasMintAuthority, isOwnershipRenounced: onChainDetails.isOwnershipRenounced,
                top10HolderPercent: onChainDetails.top10HolderPercent,
                tradesPerMinute: tradesInLastMinute * 3,
                buyerSellerRatio: sells > 0 ? buys / sells : buys,
            };
            this.callback(appToken);
            tradesInLastMinute = 0; buys = 0; sells = 0;
        }, 20000);

        ws.on('close', () => {
            clearInterval(interval);
        });
    }
}
