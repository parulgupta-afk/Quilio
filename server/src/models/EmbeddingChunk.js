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
    // Store embedding as array of numbers (Gemini text-embedding-004 is 768 dimensions)
    embedding: {
      type: [Number],
      required: true,
    },
    embeddingModel: {
      type: String,
      default: 'gemini-embedding-001',
    },
  },
  { timestamps: true }
);

// Index for faster lookups by post
embeddingChunkSchema.index({ post: 1, chunkIndex: 1 });

module.exports = mongoose.model('EmbeddingChunk', embeddingChunkSchema);
