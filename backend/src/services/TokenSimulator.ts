export interface SimulatedToken {
    address: string; name: string; symbol: string; liquidityUSD: number; hasMintAuthority: boolean;
    isOwnershipRenounced: boolean; top10HolderPercent: number; tradesPerMinute: number; buyerSellerRatio: number;
}
const generateRandomString = (l: number) => { let r = ''; for (let i = 0; i < l; i++) r += 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'.charAt(Math.floor(Math.random() * 62)); return r; };
const generateRandomSymbol = () => generateRandomString(3).toUpperCase();
const generateTokenName = (s: string) => `Super ${s} Moon`;
export class TokenSimulator {
    private callback: (token: SimulatedToken) => void;
    constructor(cb: (token: SimulatedToken) => void) { this.callback = cb; }
    public start() {
        console.log('[Simulator] Starting new token simulation...');
        setInterval(() => {
            const symbol = generateRandomSymbol();
            this.callback({
                address: `sim_${generateRandomString(40)}`, name: generateTokenName(symbol), symbol,
                liquidityUSD: Math.random() < 0.1 ? Math.random() * 100000 + 25000 : Math.random() * 20000,
                hasMintAuthority: Math.random() < 0.7, isOwnershipRenounced: Math.random() > 0.6,
                top10HolderPercent: Math.random() * 60 + 20, tradesPerMinute: Math.floor(Math.random() * 200), buyerSellerRatio: 0.8 + Math.random() * 0.8,
            });
        }, 3000);
    }
}
