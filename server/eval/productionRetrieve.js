/**
 * Mirrors server/src/services/embeddingPipeline.js retrieveInApp scoring:
 * cosine similarity, sort desc, topK, optional minScore filter.
 */
function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (!normA || !normB) return 0;
  return dot / Math.sqrt(normA * normB);
}

function retrieveInAppStyle(queryEmbedding, chunksWithEmbeddings, topK = 4, options = {}) {
  const minScore = options.minScore ?? 0.35;
  const filterWeak = options.filterWeak !== false;
  const scored = (chunksWithEmbeddings || [])
    .filter((c) => Array.isArray(c.embedding) && c.embedding.length === queryEmbedding.length)
    .map((c) => ({ ...c, score: cosineSimilarity(queryEmbedding, c.embedding) }));
  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, topK);
  if (!filterWeak) return top;
  return top.filter((c) => typeof c.score === 'number' && c.score >= minScore);
}

module.exports = { cosineSimilarity, retrieveInAppStyle };
