import { SimulatedToken } from './TokenSimulator';
export class ScoringService {
  public calculateScore(token: SimulatedToken): { score: number } {
    let score = 0;
    score += Math.min(token.tradesPerMinute / 150, 1) * 35;
    score += Math.max(token.buyerSellerRatio - 1, 0) * 30;
    score += Math.max(1 - (token.top10HolderPercent / 100), 0) * 35;
    return { score: Math.round(score) };
  }
}
