/**
 * LIVE evaluation: real embeddings via configured Gemini model.
 * Requires GEMINI_API_KEY. Incurs cost. Not run in default CI.
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { generateEmbedding, cosineSimilarity, chunkText } = require('../src/services/aiService');
const { getModelConfig } = require('../src/services/modelConfig');

const fixturesPath = path.join(__dirname, 'fixtures.v2.json');
if (!fs.existsSync(fixturesPath)) require('./buildFixtures.js');
const data = JSON.parse(fs.readFileSync(fixturesPath, 'utf8'));

async function embedAll(chunks) {
  const out = [];
  for (const c of chunks) {
    const embedding = await generateEmbedding(c.chunkText);
    out.push({ ...c, embedding });
  }
  return out;
}

async function main() {
  if (!process.env.GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY required for live eval');
    process.exit(1);
  }
  const cfg = getModelConfig();
  console.log('Live eval models:', cfg);

  const minScore = Number(process.env.RAG_MIN_SCORE || 0.35);
  const topK = 3;
  let recallSum = 0, recallN = 0, oosCorrect = 0, oosN = 0;

  for (const art of data.articles) {
    const rawChunks = data.articleChunks[art.id] || chunkText(art.content);
    console.log('Embedding article', art.id, 'chunks', rawChunks.length);
    const chunks = await embedAll(rawChunks);
    const questions = data.examples.filter((e) => e.articleId === art.id);
    for (const ex of questions) {
      const qe = await generateEmbedding(ex.question);
      const scored = chunks
        .map((c) => ({ ...c, score: cosineSimilarity(qe, c.embedding) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, topK)
        .filter((c) => c.score >= minScore);

      if (!ex.answerable) {
        oosN++;
        if (scored.length === 0) oosCorrect++;
      } else if (ex.relevantChunkIndices?.length) {
        const set = new Set(scored.map((s) => s.chunkIndex));
        let hit = 0;
        for (const r of ex.relevantChunkIndices) if (set.has(r)) hit++;
        recallSum += hit / ex.relevantChunkIndices.length;
        recallN++;
      }
    }
  }

  const metrics = {
    recallAtK: recallN ? recallSum / recallN : null,
    outOfScopeRefusalRate: oosN ? oosCorrect / oosN : null,
    minScore,
    model: cfg.embeddingModel,
  };
  const outDir = path.join(__dirname, 'results');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(
    path.join(outDir, 'live-latest.json'),
    JSON.stringify({ metrics, evaluatedAt: new Date().toISOString() }, null, 2)
  );
  console.log(JSON.stringify(metrics, null, 2));
  console.log('LIVE EVAL complete');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
