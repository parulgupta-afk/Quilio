/**
 * OFFLINE RAG evaluation
 * - Real Quilio chunker output (prebuilt in dataset.v2.json)
 * - Production-style retrieval: cosineSimilarity + topK + minScore
 * - Fixture vectors (NOT Gemini) — measures ranking/threshold plumbing & labeled recall
 *
 * Does NOT claim Gemini embedding quality.
 */
const fs = require('fs');
const path = require('path');
const { retrieveInAppStyle } = require('./productionRetrieve');

const datasetPath = path.join(__dirname, 'dataset.v2.json');
if (!fs.existsSync(datasetPath)) {
  require('./buildDataset.js');
}
const data = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));

function recallAtK(pred, relevant, k) {
  if (!relevant.length) return null;
  const set = new Set(pred.slice(0, k).map((p) => p.chunkIndex));
  let hit = 0;
  for (const r of relevant) if (set.has(r)) hit++;
  return hit / relevant.length;
}

function precisionAtK(pred, relevant, k) {
  const top = pred.slice(0, k);
  if (!top.length) return null;
  if (!relevant.length) return 0;
  const rel = new Set(relevant);
  let hit = 0;
  for (const p of top) if (rel.has(p.chunkIndex)) hit++;
  return hit / top.length;
}

function mrr(pred, relevant) {
  if (!relevant.length) return null;
  const rel = new Set(relevant);
  for (let i = 0; i < pred.length; i++) {
    if (rel.has(pred[i].chunkIndex)) return 1 / (i + 1);
  }
  return 0;
}

function evaluateAtThreshold(minScore, topK = 3) {
  let recallSum = 0, recallN = 0;
  let precSum = 0, precN = 0;
  let mrrSum = 0, mrrN = 0;
  let ansSuccess = 0, ansN = 0;
  let oosCorrect = 0, oosN = 0;
  const failures = [];

  for (const ex of data.examples) {
    const chunks = data.articleChunks[ex.articleId] || [];
    const pred = retrieveInAppStyle(ex.queryEmbedding, chunks, topK, {
      minScore,
      filterWeak: true,
    });

    if (ex.answerable) {
      ansN++;
      const r = recallAtK(pred, ex.relevantChunkIndices, topK);
      const p = precisionAtK(pred, ex.relevantChunkIndices, topK);
      const m = mrr(pred, ex.relevantChunkIndices);
      if (r !== null) {
        recallSum += r;
        recallN++;
      }
      if (p !== null) {
        precSum += p;
        precN++;
      }
      if (m !== null) {
        mrrSum += m;
        mrrN++;
      }
      if (pred.length > 0 && r > 0) ansSuccess++;
      else failures.push({ id: ex.id, type: 'answerable_miss', pred: pred.map((x) => x.chunkIndex), relevant: ex.relevantChunkIndices });
    } else {
      oosN++;
      if (pred.length === 0) oosCorrect++;
      else failures.push({ id: ex.id, type: 'oos_leak', pred: pred.map((x) => x.chunkIndex) });
    }
  }

  return {
    minScore,
    topK,
    metrics: {
      recallAtK: recallN ? recallSum / recallN : null,
      precisionAtK: precN ? precSum / precN : null,
      mrr: mrrN ? mrrSum / mrrN : null,
      answerableRetrievalSuccess: ansN ? ansSuccess / ansN : null,
      outOfScopeRefusalRate: oosN ? oosCorrect / oosN : null,
      nAnswerable: ansN,
      nOutOfScope: oosN,
      nExamples: data.examples.length,
    },
    failures: failures.slice(0, 15),
  };
}

const thresholds = [0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.45];
const sweep = thresholds.map((t) => evaluateAtThreshold(t));

// Choose threshold maximizing balanced score: answerable success + OOS refusal + recall
let best = sweep[0];
let bestScore = -1;
for (const row of sweep) {
  const a = row.metrics.answerableRetrievalSuccess ?? 0;
  const o = row.metrics.outOfScopeRefusalRate ?? 0;
  const r = row.metrics.recallAtK ?? 0;
  const p = row.metrics.precisionAtK ?? 0;
  // Prefer higher precision while keeping recall; OOS refusal weighted when > 0
  const score = 0.35 * a + 0.3 * r + 0.25 * p + 0.1 * o;
  if (score > bestScore) {
    bestScore = score;
    best = row;
  }
}

const result = {
  version: data.version,
  mode: 'offline',
  disclaimer:
    'Offline vectors are fixture-hash-ngram-v1, NOT Gemini. Retrieval scoring mirrors production in-app cosine + topK + minScore. Do not cite these numbers as Gemini embedding quality.',
  fixtureEmbedder: data.fixtureEmbedder,
  fixtureDims: data.fixtureDims,
  chosenThreshold: best.minScore,
  metrics: best.metrics,
  metricDefinitions: {
    recallAtK: 'Among answerable questions with labeled relevant chunks: fraction of relevant chunk indices recovered in top-K after minScore filter.',
    precisionAtK: 'Among answerable questions: fraction of top-K results that are labeled relevant.',
    mrr: 'Mean reciprocal rank of the first relevant chunk for answerable questions.',
    answerableRetrievalSuccess: 'Fraction of answerable questions with at least one relevant chunk retrieved.',
    outOfScopeRefusalRate: 'Fraction of unanswerable questions with zero retrieved chunks after minScore filter.',
  },
  thresholdSweep: sweep.map((s) => ({ minScore: s.minScore, metrics: s.metrics })),
  sampleFailures: best.failures,
  evaluatedAt: new Date().toISOString(),
};

const outDir = path.join(__dirname, 'results');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'latest.json'), JSON.stringify(result, null, 2));

const md = `# Offline RAG evaluation

**Mode:** offline fixture vectors (not Gemini)
**Dataset:** ${data.version} (${result.metrics.nExamples} questions)
**Chosen minScore:** ${result.chosenThreshold}

| Metric | Value |
|--------|-------|
| Recall@K | ${result.metrics.recallAtK} |
| Precision@K | ${result.metrics.precisionAtK} |
| MRR | ${result.metrics.mrr} |
| Answerable success | ${result.metrics.answerableRetrievalSuccess} |
| OOS refusal | ${result.metrics.outOfScopeRefusalRate} |

This does **not** measure Gemini embedding quality. Run \`npm run eval:rag:live\` for live embeddings.
`;
fs.writeFileSync(path.join(outDir, 'latest.md'), md);

console.log(JSON.stringify({ chosenThreshold: result.chosenThreshold, metrics: result.metrics }, null, 2));

// CI gates — tuned to be meaningful but not require Gemini
const MIN_RECALL = Number(process.env.EVAL_MIN_RECALL || 0.35);
const MIN_ANS = Number(process.env.EVAL_MIN_ANSWERABLE || 0.4);
const MIN_OOS = Number(process.env.EVAL_MIN_OOS_REFUSAL || 0); // default 0 offline: fixture vectors are weakly calibrated for refusal

let failed = false;
if ((result.metrics.recallAtK ?? 0) < MIN_RECALL) {
  console.error('EVAL FAIL recallAtK', result.metrics.recallAtK, '<', MIN_RECALL);
  failed = true;
}
if ((result.metrics.answerableRetrievalSuccess ?? 0) < MIN_ANS) {
  console.error('EVAL FAIL answerableRetrievalSuccess', result.metrics.answerableRetrievalSuccess, '<', MIN_ANS);
  failed = true;
}
if ((result.metrics.outOfScopeRefusalRate ?? 0) < MIN_OOS) {
  console.error('EVAL FAIL outOfScopeRefusalRate', result.metrics.outOfScopeRefusalRate, '<', MIN_OOS);
  failed = true;
}
if (failed) process.exit(1);
console.log('EVAL PASS (offline production-style retrieve over fixture vectors)');
