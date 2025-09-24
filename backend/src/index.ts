import express from 'express';
import cors from 'cors';
import { SafetyTriageService } from './services/2_safetyTriage.service';
import { ScoringService } from './services/3_scoring.service';
import { DataFetcher, AppToken } from './services/DataFetcher';
import { OnChainService } from './services/OnChainService';

interface AnalyzedToken extends AppToken { 
    id: string; 
    safetyStatus: 'Pass' | 'Fail'; 
    reasons: string[]; 
    score: number; 
} // <-- The missing colon was here

const analyzedTokens = new Map<string, AnalyzedToken>();
const safetyService = new SafetyTriageService();
const scoringService = new ScoringService();
const processNewToken = (token: AppToken) => {
    const safetyResult = safetyService.runChecks(token);
    const scoreResult = scoringService.calculateScore(token);
    analyzedTokens.set(token.address, { ...token, id: token.address, safetyStatus: safetyResult.passed ? 'Pass' : 'Fail', reasons: safetyResult.reasons, score: scoreResult.score });
    if (analyzedTokens.size > 200) analyzedTokens.delete(analyzedTokens.keys().next().value);
};
new DataFetcher(processNewToken).start();
const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3001;
app.use(cors());
app.get('/', (req, res) => res.status(200).send('Backend is running and healthy!'));
app.get('/api/radar-tokens', (req, res) => res.json(Array.from(analyzedTokens.values()).sort((a, b) => b.score - a.score)));
app.get('/api/token-details/:id', (req, res) => {
    const token = analyzedTokens.get(req.params.id);
    if (token) res.json(token); else res.status(404).json({ message: "Token not found" });
});
app.get('/api/token-chart/:id', (req, res) => res.json({ labels: ["-30m", "Now"], datasets: [{ data: Array.from({ length: 30 }, () => Math.random() * 100) }] }));
app.post('/api/get-quote', (req, res) => res.json({ swapTransaction: 'base64_mock_transaction' }));
app.listen(PORT, () => console.log(`✅ Backend server running on http://localhost:${PORT}`));
