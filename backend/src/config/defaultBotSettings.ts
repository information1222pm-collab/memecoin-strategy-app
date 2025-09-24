export const defaultBotSettings = {
  universe: { chains: ['solana', 'bsc'], maxMarketCapUSD: 1_500_000 },
  safetyGate: { minLiquidityUSD: 25_000, maxTop10HolderPercent: 40, requireRenouncedOwnership: true, requireNoMintAuthority: true },
  entryRules: { minMomentumScore: 70 },
  positionManagement: { sizePercentOfBankroll: 0.5, maxConcurrentPositions: 3, dailyLossCapPercent: 2, hardStopLossPercent: -25, trailingStopPercent: 25 },
};
