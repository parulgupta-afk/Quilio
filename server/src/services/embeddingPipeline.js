const EmbeddingChunk = require('../models/EmbeddingChunk');
const Post = require('../models/Post');
const { generateEmbedding, chunkText } = require('./aiService');

const EMBEDDING_MODEL = 'text-embedding-004';
const MAX_ATTEMPTS = 3;
const CONCURRENCY = 3;
/** Minimum cosine similarity to treat a chunk as usable evidence (calibrate via eval:rag). */
const DEFAULT_MIN_SCORE = Number(process.env.RAG_MIN_SCORE || 0.35);

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function mapPool(items, limit, fn) {
  const results = new Array(items.length);
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await fn(items[idx], idx);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()));
  return results;
}

/**
 * Process a post: chunk → embed (bounded concurrency + retries) → store.
 * Updates Post.embeddingStatus for observability.
 */
async function processPostEmbeddings(postId, content) {
  const post = await Post.findById(postId);
  if (!post) return { ok: false, reason: 'post_not_found' };

  post.embeddingStatus = 'processing';
  post.embeddingAttempts = (post.embeddingAttempts || 0) + 1;
  post.embeddingLastError = '';
  await post.save();

  try {
    await EmbeddingChunk.deleteMany({ post: postId });
    const chunks = chunkText(content);
    if (chunks.length === 0) {
      post.embeddingStatus = 'completed';
      post.embeddingModel = EMBEDDING_MODEL;
      post.embeddingCompletedAt = new Date();
      await post.save();
      return { ok: true, chunks: 0 };
    }

    let lastErr = null;
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        const docs = await mapPool(chunks, CONCURRENCY, async (chunk) => {
          const embedding = await generateEmbedding(chunk.chunkText);
          return {
            post: postId,
            chunkText: chunk.chunkText,
            chunkIndex: chunk.chunkIndex,
            embedding,
          };
        });
        await EmbeddingChunk.insertMany(docs);
        post.embeddingStatus = 'completed';
        post.embeddingModel = EMBEDDING_MODEL;
        post.embeddingCompletedAt = new Date();
        post.embeddingLastError = '';
        await post.save();
        return { ok: true, chunks: docs.length };
      } catch (err) {
        lastErr = err;
        const backoff = Math.min(8000, 400 * 2 ** (attempt - 1)) + Math.floor(Math.random() * 200);
        console.error(`Embedding attempt ${attempt} failed for ${postId}:`, err.message);
        if (attempt < MAX_ATTEMPTS) await sleep(backoff);
      }
    }

    post.embeddingStatus = 'failed';
    post.embeddingLastError = (lastErr && lastErr.message) || 'unknown';
    await post.save();
    return { ok: false, reason: 'failed', error: post.embeddingLastError };
  } catch (error) {
    console.error(`Failed to process embeddings for post ${postId}:`, error.message);
    try {
      post.embeddingStatus = 'failed';
      post.embeddingLastError = error.message;
      await post.save();
    } catch (_) {}
    return { ok: false, reason: 'exception', error: error.message };
  }
}

/**
 * Retrieve top-K chunks for a post by cosine similarity.
 * Returns only chunks above minScore when filterWeak is true.
 */
async function retrieveRelevantChunks(postId, queryEmbedding, topK = 4, options = {}) {
  const minScore = options.minScore ?? DEFAULT_MIN_SCORE;
  const filterWeak = options.filterWeak !== false;

  const chunks = await EmbeddingChunk.find({ post: postId }).lean();
  if (chunks.length === 0) return [];

  const { cosineSimilarity } = require('./aiService');
  const scored = chunks.map((chunk) => ({
    ...chunk,
    score: cosineSimilarity(queryEmbedding, chunk.embedding),
  }));

  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, topK);
  if (!filterWeak) return top;
  return top.filter((c) => typeof c.score === 'number' && c.score >= minScore);
}

module.exports = {
  processPostEmbeddings,
  retrieveRelevantChunks,
  DEFAULT_MIN_SCORE,
  EMBEDDING_MODEL,
};
