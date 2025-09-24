import axios from 'axios';

// IMPORTANT: In a real app, you would get this from Helius or another RPC provider.
// For this development phase, we will use a free public RPC endpoint.
const SOLANA_RPC_URL = 'https://api.mainnet-beta.solana.com';

export interface OnChainDetails {
  hasMintAuthority: boolean;
  isOwnershipRenounced: boolean; // For Solana, this is often inferred from mint/freeze authority.
  top10HolderPercent: number;
}

export class OnChainService {
  public async getOnChainDetails(tokenAddress: string): Promise<OnChainDetails> {
    try {
      // This is a simplified simulation of what real on-chain calls would do.
      // A real implementation would make multiple JSON-RPC calls here.
      
      // 1. Check mint authority from the token's mint account.
      const hasMintAuthority = Math.random() < 0.2; // Real tokens are less likely to have it.

      // 2. Get top 10 holders and calculate concentration.
      const top10HolderPercent = Math.random() * 30 + 10; // Real tokens are usually more distributed.

      return {
        hasMintAuthority,
        isOwnershipRenounced: !hasMintAuthority, // Often, if mint is gone, it's considered "renounced".
        top10HolderPercent,
      };
    } catch (error) {
      console.error(`[OnChainService] Failed to get details for ${tokenAddress}:`, error);
      // Return a default "unsafe" state if on-chain call fails
      return { hasMintAuthority: true, isOwnershipRenounced: false, top10HolderPercent: 99 };
    }
  }
}
