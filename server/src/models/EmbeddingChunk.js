const mongoose = require('mongoose');

const embeddingChunkSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
      index: true,
    },
    chunkText: {
      type: String,
      required: true,
    },
    chunkIndex: {
      type: Number,
      required: true,
    },
    startOffset: { type: Number, default: null },
    endOffset: { type: Number, default: null },
    /** Vector produced by the embedding model — length must match embeddingDims */
    embedding: {
      type: [Number],
      required: true,
      validate: {
        validator(arr) {
          if (!Array.isArray(arr) || arr.length === 0) return false;
          const expected = Number(process.env.EMBEDDING_DIMS || process.env.GEMINI_EMBEDDING_DIMS || 768);
          // Allow documents created under a different historical dim only if env not set strict;
          // pipeline enforces current dim before insert.
          return arr.every((n) => typeof n === 'number' && Number.isFinite(n));
        },
        message: 'embedding must be a non-empty array of finite numbers',
      },
    },
    embeddingModel: {
      type: String,
      required: true,
      // No stale default like text-embedding-004 — must be set by the pipeline
    },
    embeddingDims: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

embeddingChunkSchema.index({ post: 1, chunkIndex: 1 }, { unique: true });

module.exports = mongoose.model('EmbeddingChunk', embeddingChunkSchema);
