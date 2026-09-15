const EmbeddingChunk = require('../models/EmbeddingChunk');
const { generateEmbedding, chunkText } = require('./aiService');

/**
 * Process a post: chunk it → generate embeddings → store in DB
 * Called after a post is published
 */
async function processPostEmbeddings(postId, content) {
  try {
    // Delete old chunks if re-processing
    await EmbeddingChunk.deleteMany({ post: postId });

    const chunks = chunkText(content);

    if (chunks.length === 0) {
      console.log(`No chunks generated for post ${postId}`);
      return;
    }

    console.log(`Generating embeddings for ${chunks.length} chunks of post ${postId}...`);

    const chunkDocuments = [];

    for (const chunk of chunks) {
      const embedding = await generateEmbedding(chunk.chunkText);

      chunkDocuments.push({
        post: postId,
        chunkText: chunk.chunkText,
        chunkIndex: chunk.chunkIndex,
        embedding,
      });
    }

    await EmbeddingChunk.insertMany(chunkDocuments);
    console.log(`✅ Stored ${chunkDocuments.length} embedding chunks for post ${postId}`);
  } catch (error) {
    console.error(`Failed to process embeddings for post ${postId}:`, error.message);
    // Don't throw — we don't want publishing to fail if embedding fails
  }
}

/**
 * Retrieve the most relevant chunks for a query (simple cosine similarity)
 */
async function retrieveRelevantChunks(postId, queryEmbedding, topK = 4) {
  const chunks = await EmbeddingChunk.find({ post: postId });

  if (chunks.length === 0) return [];

  const { cosineSimilarity } = require('./aiService');

  const scored = chunks.map((chunk) => ({
    ...chunk.toObject(),
    score: cosineSimilarity(queryEmbedding, chunk.embedding),
  }));

  // Sort by similarity descending and take top K
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}

module.exports = {
  processPostEmbeddings,
  retrieveRelevantChunks,
};
