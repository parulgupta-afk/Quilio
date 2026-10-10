const mongoose = require('mongoose');
const EmbeddingChunk = require('../models/EmbeddingChunk');
const Post = require('../models/Post');
const { generateEmbedding, chunkText } = require('./aiService');
const logger = require('../utils/logger');

const EMBEDDING_MODEL = process.env.GEMINI_EMBEDDING_MODEL || process.env.EMBEDDING_MODEL || 'gemini-embedding-001';
const EMBEDDING_DIMS = Number(process.env.EMBEDDING_DIMS || 768);
const DEFAULT_MIN_SCORE = Number(process.env.RAG_MIN_SCORE || 0.35);
const USE_ATLAS_VECTOR = process.env.USE_ATLAS_VECTOR_SEARCH === 'true';
const ATLAS_INDEX = process.env.ATLAS_VECTOR_INDEX || 'embedding_vector_index';
const MAX_ATTEMPTS = 3;
const CONCURRENCY = 3;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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
    if (!chunks.length) {
      post.embeddingStatus = 'completed';
      post.embeddingModel = EMBEDDING_MODEL;
      post.embeddingCompletedAt = new Date();
      await post.save();
      return { ok: true, chunks: 0 };
    }
    let lastErr;
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        const docs = await mapPool(chunks, CONCURRENCY, async (chunk) => {
          const embedding = await generateEmbedding(chunk.chunkText);
          if (!Array.isArray(embedding) || embedding.length !== EMBEDDING_DIMS) {
            throw new Error(`dim mismatch ${embedding?.length} vs ${EMBEDDING_DIMS}`);
          }
          return {
            post: postId,
            chunkText: chunk.chunkText,
            chunkIndex: chunk.chunkIndex,
            startOffset: chunk.startOffset ?? null,
            endOffset: chunk.endOffset ?? null,
            embedding,
            embeddingModel: EMBEDDING_MODEL,
            embeddingDims: EMBEDDING_DIMS,
          };
        });
        await EmbeddingChunk.insertMany(docs);
        post.embeddingStatus = 'completed';
        post.embeddingModel = EMBEDDING_MODEL;
        post.embeddingCompletedAt = new Date();
        await post.save();
        logger.info('embeddings_completed', { postId: String(postId), chunks: docs.length });
        return { ok: true, chunks: docs.length };
      } catch (err) {
        lastErr = err;
        logger.warn('embeddings_retry', { postId: String(postId), attempt, error: err.message });
        if (attempt < MAX_ATTEMPTS) await sleep(400 * 2 ** (attempt - 1));
      }
    }
    post.embeddingStatus = 'failed';
    post.embeddingLastError = lastErr?.message || 'unknown';
    await post.save();
    return { ok: false, reason: 'failed' };
  } catch (error) {
    post.embeddingStatus = 'failed';
    post.embeddingLastError = error.message;
    await post.save().catch(() => {});
    logger.error('embeddings_failed', { postId: String(postId), error: error.message });
    return { ok: false, reason: 'exception' };
  }
}

async function retrieveInApp(postId, queryEmbedding, topK, minScore, filterWeak) {
  const chunks = await EmbeddingChunk.find({ post: postId }).lean();
  if (!chunks.length) return [];
  const { cosineSimilarity } = require('./aiService');
  const scored = chunks
    .filter((c) => Array.isArray(c.embedding) && c.embedding.length === queryEmbedding.length)
    .map((c) => ({ ...c, score: cosineSimilarity(queryEmbedding, c.embedding) }));
  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, topK);
  return filterWeak ? top.filter((c) => c.score >= minScore) : top;
}

async function retrieveAtlas(postId, queryEmbedding, topK, minScore, filterWeak) {
  try {
    const results = await EmbeddingChunk.aggregate([
      {
        $vectorSearch: {
          index: ATLAS_INDEX,
          path: 'embedding',
          queryVector: queryEmbedding,
          numCandidates: Math.max(topK * 20, 50),
          limit: topK,
          filter: { post: new mongoose.Types.ObjectId(String(postId)) },
        },
      },
      { $project: { chunkText: 1, chunkIndex: 1, post: 1, score: { $meta: 'vectorSearchScore' } } },
    ]);
    return filterWeak ? results.filter((c) => (c.score ?? 0) >= minScore) : results;
  } catch (err) {
    logger.warn('atlas_vector_fallback', { error: err.message });
    return retrieveInApp(postId, queryEmbedding, topK, minScore, filterWeak);
  }
}

async function retrieveRelevantChunks(postId, queryEmbedding, topK = 4, options = {}) {
  const minScore = options.minScore ?? DEFAULT_MIN_SCORE;
  const filterWeak = options.filterWeak !== false;
  if (USE_ATLAS_VECTOR) return retrieveAtlas(postId, queryEmbedding, topK, minScore, filterWeak);
  return retrieveInApp(postId, queryEmbedding, topK, minScore, filterWeak);
}

module.exports = { processPostEmbeddings, retrieveRelevantChunks, DEFAULT_MIN_SCORE, EMBEDDING_MODEL };
