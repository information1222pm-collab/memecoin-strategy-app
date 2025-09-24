import { defaultBotSettings } from '../config/defaultBotSettings';
import { AppToken } from './DataFetcher'; // <-- CORRECTED IMPORT
interface SafetyCheckResult { passed: boolean; reasons: string[]; }
export class SafetyTriageService {
  public runChecks(token: AppToken): SafetyCheckResult { // <-- Use AppToken
    const reasons: string[] = [];
    if (token.liquidityUSD < 1000) reasons.push('Failed sellability test (rug pull).');
    if (token.liquidityUSD < defaultBotSettings.safetyGate.minLiquidityUSD) reasons.push(`Insufficient liquidity ($${Math.round(token.liquidityUSD)}).`);
    if (defaultBotSettings.safetyGate.requireNoMintAuthority && token.hasMintAuthority) reasons.push('Mint authority is still enabled.');
    if (defaultBotSettings.safetyGate.requireRenouncedOwnership && !token.isOwnershipRenounced) reasons.push('Contract ownership has not been renounced.');
    if (token.top10HolderPercent > defaultBotSettings.safetyGate.maxTop10HolderPercent) reasons.push(`High holder concentration (${Math.round(token.top10HolderPercent)}%).`);
    return { passed: reasons.length === 0, reasons };
  }
}
