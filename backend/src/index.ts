import express from 'express';
import cors from 'cors';
import { SafetyTriageService } from './services/2_safetyTriage.service';
import { ScoringService } from './services/3_scoring.service';
import { DataFetcher, AppToken } from './services/DataFetcher'; // <-- Use the new DataFetcher

interface AnalyzedToken extends AppToken { id: string; safetyStatus: 'Pass' | 'Fail'; reasons: string[]; score: number; }
const analyzedTokens = new Map<string, AnalyzedToken>();
const safetyService = new SafetyTriageService();
const scoringService = new ScoringService();

const processNewToken = (token: AppToken) => {
    console.log(`[Ingestion] New LIVE token detected: ${token.symbol} ($${Math.round(token.liquidityUSD)} LP)`);
    
    const safetyResult = safetyService.runChecks(token);
    const scoreResult = scoringService.calculateScore(token);
    analyzedTokens.set(token.address, { ...token, id: token.address, safetyStatus: safetyResult.passed ? 'Pass' : 'Fail', reasons: safetyResult.reasons, score: scoreResult.score });
    if (analyzedTokens.size > 200) analyzedTokens.delete(analyzedTokens.keys().next().value);
};

// Initialize and start the live data fetcher instead of the simulator
const fetcher = new DataFetcher(processNewToken);
fetcher.start();

const app = express();
const PORT = process.env.PORT || 3001;
app.use(cors());
app.get('/', (req, res) => res.status(200).send('Backend is running and healthy!'));
app.get('/api/radar-tokens', (req, res) => {
    const tokens = Array.from(analyzedTokens.values()).sort((a, b) => b.score - a.score);
    res.status(200).json(tokens);
});
app.get('/api/token-details/:id', (req, res) => {
    const token = analyzedTokens.get(req.params.id);
    if (token) res.status(200).json(token);
    else res.status(404).json({ message: "Token not found" });
});
app.get('/api/token-chart/:id', (req, res) => {
    const dataPoints = Array.from({ length: 30 }, () => Math.random() * 100 + 50);
    res.status(200).json({ labels: ["-30m", "-15m", "Now"], datasets: [{ data: dataPoints }] });
});
app.listen(PORT, () => console.log(`✅ Backend server running on http://localhost:${PORT}`));
