/**
 * Live Gemini smoke test — incurs API usage.
 * Usage: cd server && npm run smoke:ai
 */
require('dotenv').config();
const {
  generateEmbedding,
  getModelConfig,
} = require('../src/services/aiService');

async function main() {
  if (!process.env.GEMINI_API_KEY) {
    console.error('FAIL: GEMINI_API_KEY not set');
    process.exit(1);
  }
  const cfg = getModelConfig();
  console.log('Config:', cfg);

  console.log('Embedding with', cfg.embeddingModel, '…');
  const emb = await generateEmbedding('Quilio smoke test: binary search trees store ordered keys.');
  if (!Array.isArray(emb) || emb.length < 8) {
    console.error('FAIL: invalid embedding');
    process.exit(1);
  }
  console.log('Embedding OK length=', emb.length);

  const { GoogleGenerativeAI } = require('@google/generative-ai');
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: cfg.chatModel });
  console.log('Generating with', cfg.chatModel, '…');
  const result = await model.generateContent('Reply with exactly: OK');
  const text = result.response.text();
  console.log('Generation sample:', String(text).slice(0, 120));
  if (!text || !String(text).trim()) {
    console.error('FAIL: empty generation');
    process.exit(1);
  }
  console.log('SMOKE PASS');
}

main().catch((e) => {
  console.error('SMOKE FAIL:', e.message);
  process.exit(1);
});
