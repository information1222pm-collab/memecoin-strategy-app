import express from 'express';
import cors from 'cors';
import { SafetyTriageService } from './services/2_safetyTriage.service';
import { ScoringService } from './services/3_scoring.service';
import { TokenSimulator, SimulatedToken } from './services/TokenSimulator';
interface AnalyzedToken extends SimulatedToken { id: string; safetyStatus: 'Pass' | 'Fail'; reasons: string[]; score: number; }
const analyzedTokens = new Map<string, AnalyzedToken>();
const safetyService = new SafetyTriageService();
const scoringService = new ScoringService();
const processNewToken = (token: SimulatedToken) => {
    const safetyResult = safetyService.runChecks(token);
    const scoreResult = scoringService.calculateScore(token);
    analyzedTokens.set(token.address, { ...token, id: token.address, safetyStatus: safetyResult.passed ? 'Pass' : 'Fail', reasons: safetyResult.reasons, score: scoreResult.score });
    if (analyzedTokens.size > 100) analyzedTokens.delete(analyzedTokens.keys().next().value);
};
new TokenSimulator(processNewToken).start();
const app = express();
const PORT = process.env.PORT || 3001;
app.use(cors());
app.get('/', (req, res) => res.status(200).send('Backend is running and healthy!'));
app.get('/api/radar-tokens', (req, res) => {
    const tokens = Array.from(analyzedTokens.values()).sort((a, b) => b.score - a.score);
    res.status(200).json(tokens);
});
app.listen(PORT, () => console.log(`✅ Backend server running on http://localhost:${PORT}`));
