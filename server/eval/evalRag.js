/**
 * Offline RAG retrieval evaluation (no live Gemini calls).
 * Uses bag-of-words cosine as a stand-in embedding for CI determinism.
 * Real production embeddings: text-embedding-004 via embeddingPipeline.
 *
 * Usage: node eval/evalRag.js
 */
const fs = require('fs');
const path = require('path');

const dataset = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'dataset.json'), 'utf8')
);

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
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (!na || !nb) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

function buildVocab(chunks) {
  const set = new Set();
  for (const c of chunks) tokenize(c.chunkText).forEach((t) => set.add(t));
  return [...set];
}

function retrieve(question, chunks, vocab, topK, minScore) {
  const qv = vectorize(question, vocab);
  const scored = chunks.map((c) => ({
    ...c,
    score: cosine(qv, vectorize(c.chunkText, vocab)),
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK).filter((c) => c.score >= minScore);
}

function recallAtK(predicted, relevant, k) {
  if (!relevant.length) return null; // not defined
  const pred = new Set(predicted.slice(0, k).map((p) => p.chunkIndex));
  let hit = 0;
  for (const r of relevant) if (pred.has(r)) hit++;
  return hit / relevant.length;
}

function mrr(predicted, relevant) {
  if (!relevant.length) return null;
  const rel = new Set(relevant);
  for (let i = 0; i < predicted.length; i++) {
    if (rel.has(predicted[i].chunkIndex)) return 1 / (i + 1);
  }
  return 0;
}

function run(minScore = 0.05, topK = 3) {
  const vocab = buildVocab(dataset.corpusChunks);
  const rows = [];
  let recallSum = 0;
  let recallN = 0;
  let mrrSum = 0;
  let mrrN = 0;
  let oosCorrect = 0;
  let oosN = 0;

  for (const ex of dataset.examples) {
    const pred = retrieve(ex.question, dataset.corpusChunks, vocab, topK, minScore);
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
    if (!ex.answerable) {
      oosN++;
      if (pred.length === 0) oosCorrect++;
    }
    rows.push({
      id: ex.id,
      category: ex.category,
      predicted: pred.map((p) => ({ chunkIndex: p.chunkIndex, score: Number(p.score.toFixed(4)) })),
      recallAtK: r,
      mrr: m,
    });
  }

  return {
    datasetVersion: dataset.version,
    config: { topK, minScore, embedding: 'bow-proxy-for-ci' },
    metrics: {
      recallAtK: recallN ? recallSum / recallN : null,
      mrr: mrrN ? mrrSum / mrrN : null,
      outOfScopeRefusalRate: oosN ? oosCorrect / oosN : null,
    },
    rows,
    evaluatedAt: new Date().toISOString(),
  };
}

const result = run();
const outDir = path.join(__dirname, 'results');
fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, 'latest.json');
fs.writeFileSync(outPath, JSON.stringify(result, null, 2));
console.log('RAG eval (offline bow proxy)');
console.log(JSON.stringify(result.metrics, null, 2));
console.log('Wrote', outPath);
