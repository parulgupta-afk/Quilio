const EmbeddingChunk = require('../models/EmbeddingChunk');
const Post = require('../models/Post');
const { generateEmbedding, chunkText } = require('./aiService');

const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || 'text-embedding-004';
const EMBEDDING_DIMS = Number(process.env.EMBEDDING_DIMS || 768);
const MAX_ATTEMPTS = 3;
const CONCURRENCY = 3;
const DEFAULT_MIN_SCORE = Number(process.env.RAG_MIN_SCORE || 0.35);
const USE_ATLAS_VECTOR = process.env.USE_ATLAS_VECTOR_SEARCH === 'true';
const ATLAS_INDEX = process.env.ATLAS_VECTOR_INDEX || 'embedding_vector_index';

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
          if (!Array.isArray(embedding) || embedding.length !== EMBEDDING_DIMS) {
            throw new Error(
              `Embedding dimension mismatch: got ${embedding?.length}, expected ${EMBEDDING_DIMS}`
            );
          }
          return {
            post: postId,
            chunkText: chunk.chunkText,
            chunkIndex: chunk.chunkIndex,
            embedding,
            embeddingModel: EMBEDDING_MODEL,
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
    console.error(`Failed embeddings for ${postId}:`, error.message);
    try {
      post.embeddingStatus = 'failed';
      post.embeddingLastError = error.message;
      await post.save();
    } catch (_) {}
    return { ok: false, reason: 'exception', error: error.message };
  }
}

/** In-app cosine over one post's chunks (default / local). */
async function retrieveInApp(postId, queryEmbedding, topK, minScore, filterWeak) {
  const chunks = await EmbeddingChunk.find({ post: postId }).lean();
  if (!chunks.length) return [];
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

/**
 * Atlas Vector Search path (optional).
 * Requires index on embedding_chunks.embedding — see docs/ATLAS_VECTOR_SEARCH.md
 */
async function retrieveAtlas(postId, queryEmbedding, topK, minScore, filterWeak) {
  const pipeline = [
    {
      $vectorSearch: {
        index: ATLAS_INDEX,
        path: 'embedding',
        queryVector: queryEmbedding,
        numCandidates: Math.max(topK * 20, 50),
        limit: topK,
        filter: { post: postId },
      },
    },
    {
      $project: {
        chunkText: 1,
        chunkIndex: 1,
        post: 1,
        embeddingModel: 1,
        score: { $meta: 'vectorSearchScore' },
      },
    },
  ];

  try {
    const results = await EmbeddingChunk.aggregate(pipeline);
    if (!filterWeak) return results;
    return results.filter((c) => (c.score ?? 0) >= minScore);
  } catch (err) {
    console.warn('Atlas $vectorSearch failed, falling back to in-app cosine:', err.message);
    return retrieveInApp(postId, queryEmbedding, topK, minScore, filterWeak);
  }
}

async function retrieveRelevantChunks(postId, queryEmbedding, topK = 4, options = {}) {
  const minScore = options.minScore ?? DEFAULT_MIN_SCORE;
  const filterWeak = options.filterWeak !== false;
  if (USE_ATLAS_VECTOR) {
    return retrieveAtlas(postId, queryEmbedding, topK, minScore, filterWeak);
  }
  return retrieveInApp(postId, queryEmbedding, topK, minScore, filterWeak);
}

/**
 * Document-level similar posts: average score of top chunk matches vs candidate posts.
 * Bounded candidate set — does not load the entire corpus embeddings into memory.
 */
async function findSimilarPosts(postId, limit = 5) {
  const sourceChunks = await EmbeddingChunk.find({ post: postId }).limit(8).lean();
  if (!sourceChunks.length) return [];

  const { cosineSimilarity } = require('./aiService');
  // Use first chunk embedding as document proxy (cheap); better: mean pool
  const dims = sourceChunks[0].embedding.length;
  const centroid = new Array(dims).fill(0);
  for (const c of sourceChunks) {
    for (let i = 0; i < dims; i++) centroid[i] += c.embedding[i];
  }
  for (let i = 0; i < dims; i++) centroid[i] /= sourceChunks.length;

  // Candidate: recent published posts excluding self (bounded)
  const candidates = await Post.find({
    _id: { $ne: postId },
    status: 'published',
  })
    .sort({ createdAt: -1 })
    .limit(40)
    .select('_id title slug excerpt coverImageUrl author')
    .lean();

  const scored = [];
  for (const post of candidates) {
    const chunks = await EmbeddingChunk.find({ post: post._id }).limit(6).lean();
    if (!chunks.length) continue;
    let best = 0;
    for (const ch of chunks) {
      const s = cosineSimilarity(centroid, ch.embedding);
      if (s > best) best = s;
    }
    if (best >= DEFAULT_MIN_SCORE * 0.85) {
      scored.push({ post, score: best });
    }
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}

module.exports = {
  processPostEmbeddings,
  retrieveRelevantChunks,
  findSimilarPosts,
  DEFAULT_MIN_SCORE,
  EMBEDDING_MODEL,
  EMBEDDING_DIMS,
  USE_ATLAS_VECTOR,
};
