/**
 * Offline RAG evaluation using real Quilio chunker fixtures.
 * Uses bag-of-words cosine as a *ranking proxy* for CI only — not production embedding quality.
 * Metrics: Recall@K, MRR, out-of-scope refusal proxy (empty retrieval).
 */
const fs = require('fs');
const path = require('path');

const fixturesPath = path.join(__dirname, 'fixtures.v2.json');
if (!fs.existsSync(fixturesPath)) {
  require('./buildFixtures.js');
}
const data = JSON.parse(fs.readFileSync(fixturesPath, 'utf8'));

function tokenize(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}
function vectorize(text, vocab) {
  const counts = new Map();
  for (const t of tokenize(text)) counts.set(t, (counts.get(t) || 0) + 1);
  return vocab.map((w) => counts.get(w) || 0);
}
function cosine(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (!na || !nb) return 0;
  return dot / Math.sqrt(na * nb);
}

function retrieve(question, chunks, vocab, topK, minScore) {
  const qv = vectorize(question, vocab);
  return chunks
    .map((c) => ({ ...c, score: cosine(qv, vectorize(c.chunkText, vocab)) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .filter((c) => c.score >= minScore);
}

function recallAtK(pred, relevant, k) {
  if (!relevant.length) return null;
  const set = new Set(pred.slice(0, k).map((p) => p.chunkIndex));
  let hit = 0;
  for (const r of relevant) if (set.has(r)) hit++;
  return hit / relevant.length;
}
function mrr(pred, relevant) {
  if (!relevant.length) return null;
  const rel = new Set(relevant);
  for (let i = 0; i < pred.length; i++) if (rel.has(pred[i].chunkIndex)) return 1 / (i + 1);
  return 0;
}

function evaluate(minScore, topK = 3) {
  let recallSum = 0, recallN = 0, mrrSum = 0, mrrN = 0;
  let oosCorrect = 0, oosN = 0, ansSuccess = 0, ansN = 0;

  for (const ex of data.examples) {
    const chunks = data.articleChunks[ex.articleId] || [];
    const vocab = [...new Set(chunks.flatMap((c) => tokenize(c.chunkText)))];
    const pred = retrieve(ex.question, chunks, vocab, topK, minScore);

    if (ex.answerable) {
      ansN++;
      const r = recallAtK(pred, ex.relevantChunkIndices, topK);
      const m = mrr(pred, ex.relevantChunkIndices);
      if (r !== null) {
        recallSum += r;
        recallN++;
      }
      if (m !== null) {
        mrrSum += m;
        mrrN++;
      }
      if (pred.length > 0 && (r === null || r > 0)) ansSuccess++;
    } else {
      oosN++;
      if (pred.length === 0) oosCorrect++;
    }
  }

  return {
    minScore,
    topK,
    metrics: {
      recallAtK: recallN ? recallSum / recallN : null,
      mrr: mrrN ? mrrSum / mrrN : null,
      answerableRetrievalRate: ansN ? ansSuccess / ansN : null,
      outOfScopeRefusalRate: oosN ? oosCorrect / oosN : null,
      nAnswerable: ansN,
      nOutOfScope: oosN,
      nExamples: data.examples.length,
    },
  };
}

function thresholdSweep(scores = [0.02, 0.05, 0.08, 0.12, 0.2, 0.35]) {
  return scores.map((s) => evaluate(s));
}

const sweep = thresholdSweep();
// Choose threshold balancing answerable retrieval and OOS refusal (simple product)
let best = sweep[0];
let bestScore = -1;
for (const row of sweep) {
  const a = row.metrics.answerableRetrievalRate || 0;
  const o = row.metrics.outOfScopeRefusalRate || 0;
  const r = row.metrics.recallAtK || 0;
  const score = a * 0.45 + o * 0.35 + r * 0.2;
  if (score > bestScore) {
    bestScore = score;
    best = row;
  }
}

const result = {
  version: data.version,
  mode: 'offline-bow-proxy',
  disclaimer:
    'This ranking uses bag-of-words cosine on real Quilio chunks. It does NOT measure Gemini embedding quality. Use eval:rag:live for embeddings.',
  chosenThreshold: best.minScore,
  chosenMetrics: best.metrics,
  sweep,
  evaluatedAt: new Date().toISOString(),
};

const outDir = path.join(__dirname, 'results');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'latest.json'), JSON.stringify(result, null, 2));
console.log(JSON.stringify({ chosenThreshold: result.chosenThreshold, metrics: result.chosenMetrics }, null, 2));

const MIN_RECALL = Number(process.env.EVAL_MIN_RECALL || 0.3);
const MIN_ANS = Number(process.env.EVAL_MIN_ANSWERABLE || 0.5);
const recall = result.chosenMetrics.recallAtK;
const ans = result.chosenMetrics.answerableRetrievalRate;
if (recall !== null && recall < MIN_RECALL) {
  console.error('EVAL FAIL recall', recall);
  process.exit(1);
}
if (ans !== null && ans < MIN_ANS) {
  console.error('EVAL FAIL answerable rate', ans);
  process.exit(1);
}
console.log('EVAL PASS (offline fixtures, BOW proxy)');
