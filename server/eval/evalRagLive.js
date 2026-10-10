/**
 * LIVE evaluation using configured Gemini embeddings + production-style retrieve.
 * Requires GEMINI_API_KEY. Not run in default CI.
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { chunkText } = require('../src/services/chunkText');
const { retrieveInAppStyle } = require('./productionRetrieve');
const { generateEmbedding, getModelConfig } = require('../src/services/aiService');

const articles = JSON.parse(fs.readFileSync(path.join(__dirname, 'corpusArticles.json'), 'utf8'));
const datasetPath = path.join(__dirname, 'dataset.v2.json');
if (!fs.existsSync(datasetPath)) require('./buildDataset.js');
const data = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));

async function main() {
  if (!process.env.GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY required');
    process.exit(1);
  }
  const cfg = getModelConfig();
  const minScore = Number(process.env.RAG_MIN_SCORE || 0.35);
  const topK = 3;
  console.log('Live eval', cfg, 'minScore', minScore);

  const articleChunks = {};
  for (const a of articles) {
    const chunks = chunkText(a.content);
    articleChunks[a.id] = [];
    for (const c of chunks) {
      const embedding = await generateEmbedding(c.chunkText);
      articleChunks[a.id].push({ ...c, embedding, articleId: a.id });
    }
  }

  let recallSum = 0, recallN = 0, oosCorrect = 0, oosN = 0, ansOk = 0, ansN = 0;
  for (const ex of data.examples) {
    const qe = await generateEmbedding(ex.question);
    const pred = retrieveInAppStyle(qe, articleChunks[ex.articleId] || [], topK, { minScore, filterWeak: true });
    if (!ex.answerable) {
      oosN++;
      if (!pred.length) oosCorrect++;
    } else {
      ansN++;
      const rel = new Set(ex.relevantChunkIndices || []);
      if (pred.some((p) => rel.has(p.chunkIndex))) ansOk++;
      if (rel.size) {
        let hit = 0;
        for (const r of rel) if (pred.some((p) => p.chunkIndex === r)) hit++;
        recallSum += hit / rel.size;
        recallN++;
      }
    }
  }

  const metrics = {
    recallAtK: recallN ? recallSum / recallN : null,
    answerableRetrievalSuccess: ansN ? ansOk / ansN : null,
    outOfScopeRefusalRate: oosN ? oosCorrect / oosN : null,
    minScore,
    embeddingModel: cfg.embeddingModel,
    embeddingDims: cfg.embeddingDims,
  };
  const out = { mode: 'live-gemini', metrics, evaluatedAt: new Date().toISOString() };
  fs.mkdirSync(path.join(__dirname, 'results'), { recursive: true });
  fs.writeFileSync(path.join(__dirname, 'results/live-latest.json'), JSON.stringify(out, null, 2));
  console.log(JSON.stringify(out, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
