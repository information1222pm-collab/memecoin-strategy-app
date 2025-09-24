import axios from 'axios';
import WebSocket from 'ws';
import { OnChainService } from './OnChainService';

export interface AppToken { address: string; name: string; symbol: string; liquidityUSD: number; hasMintAuthority: boolean; isOwnershipRenounced: boolean; top10HolderPercent: number; tradesPerMinute: number; buyerSellerRatio: number; }
const BIRDEYE_API_KEY = 'YOUR_BIRDEYE_API_KEY'; // In a real app, use a real key. For now, public WS is used.

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
        setInterval(this.discoverNewPairs, 30000); // Poll for new tokens every 30 seconds
        this.discoverNewPairs();
    }

    private discoverNewPairs = async () => {
        try {
            const response = await axios.get('https://api.dexscreener.com/api/v1/pairs/new');
            const data: { pairs: { baseToken: { address: string; name: string; symbol: string; }; liquidity: { usd: number; } }[] } = response.data;
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
            if (error instanceof Error) console.error('[Discovery] Error:', error.message);
        }
    }

    private subscribeToTokenTrades(pair: any) {
        const ws = new WebSocket('wss://public-api.birdeye.so/socket/solana');
        const tokenAddress = pair.baseToken.address;
        
        let tradesInLastMinute = 0;
        let buys = 0;
        let sells = 0;

        ws.on('open', () => {
            ws.send(JSON.stringify({
                type: "SUBSCRIBE_TRADES",
                data: { address: tokenAddress }
            }));
            this.activeSubscriptions.set(tokenAddress, ws);
        });

        ws.on('message', async (data: string) => {
            const message = JSON.parse(data);
            if (message.type === "TRADE_UPDATE") {
                tradesInLastMinute++;
                if(message.data.side === 'buy') buys++; else sells++;
            }
        });

        // Every 20 seconds, process and send the latest market data for this token
        const interval = setInterval(async () => {
            const onChainDetails = await this.onChainService.getOnChainDetails(tokenAddress);
            const appToken: AppToken = {
                address: tokenAddress, name: pair.baseToken.name, symbol: pair.baseToken.symbol,
                liquidityUSD: pair.liquidity.usd,
                hasMintAuthority: onChainDetails.hasMintAuthority, isOwnershipRenounced: onChainDetails.isOwnershipRenounced,
                top10HolderPercent: onChainDetails.top10HolderPercent,
                tradesPerMinute: tradesInLastMinute * 3, // Extrapolate to a full minute
                buyerSellerRatio: sells > 0 ? buys / sells : buys,
            };
            this.callback(appToken);
            // Reset counters for the next interval
            tradesInLastMinute = 0;
            buys = 0;
            sells = 0;
        }, 20000);


        ws.on('close', () => {
            console.log(`[WebSocket] Stream closed for ${tokenAddress}`);
            this.activeSubscriptions.delete(tokenAddress);
            clearInterval(interval);
        });

        ws.on('error', (err) => {
            console.error(`[WebSocket] Error for ${tokenAddress}:`, err.message);
        });
    }
}
