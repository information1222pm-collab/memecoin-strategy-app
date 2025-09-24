import express from 'express';
import cors from 'cors';
import { SafetyTriageService } from './services/2_safetyTriage.service';
import { ScoringService } from './services/3_scoring.service';
import { TokenSimulator, SimulatedToken } from './services/TokenSimulator';

interface AnalyzedToken extends SimulatedToken {
  id: string;
  safetyStatus: 'Pass' | 'Fail' | 'Pending';
  reasons: string[];
  score: number;
}
const analyzedTokens = new Map<string, AnalyzedToken>();
const safetyService = new SafetyTriageService();
const scoringService = new ScoringService();

const processNewToken = (token: SimulatedToken) => {
    console.log(`[Ingestion] New token detected: ${token.symbol} ($${Math.round(token.liquidityUSD)} LP)`);
    
    const safetyResult = safetyService.runChecks(token);
    const scoreResult = scoringService.calculateScore(token);

    const newAnalyzedToken: AnalyzedToken = {
        ...token,
        id: token.address,
        safetyStatus: safetyResult.passed ? 'Pass' : 'Fail',
        reasons: safetyResult.reasons,
        score: scoreResult.score,
    };

    analyzedTokens.set(token.address, newAnalyzedToken);
    if (analyzedTokens.size > 100) {
        const oldestKey = analyzedTokens.keys().next().value;
        analyzedTokens.delete(oldestKey);
    }
};

const simulator = new TokenSimulator(processNewToken);
simulator.start();

const app = express();
const PORT = process.env.PORT || 3001;
app.use(cors());

// =======================================================
// === THIS IS THE NEW HEALTH CHECK ROUTE WE ARE ADDING ===
app.get('/', (req, res) => {
    res.status(200).send('Backend is running and healthy!');
});
// =======================================================

app.get('/api/radar-tokens', (req, res) => {
    const tokens = Array.from(analyzedTokens.values()).sort((a, b) => b.score - a.score);
    res.status(200).json(tokens);
});

app.listen(PORT, () => {
    console.log(`✅ Backend server running on http://localhost:${PORT}`);
});
