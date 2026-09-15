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
    // Store embedding as array of numbers (Gemini text-embedding-004 is 768 dimensions)
    embedding: {
      type: [Number],
      required: true,
    },
  },
  { timestamps: true }
);

// Index for faster lookups by post
embeddingChunkSchema.index({ post: 1, chunkIndex: 1 });

module.exports = mongoose.model('EmbeddingChunk', embeddingChunkSchema);
