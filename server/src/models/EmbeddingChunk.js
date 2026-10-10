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
    embedding: {
      type: [Number],
      required: true,
    },
    embeddingModel: {
      type: String,
      default: 'text-embedding-004',
    },
  },
  { timestamps: true }
);

embeddingChunkSchema.index({ post: 1, chunkIndex: 1 });

module.exports = mongoose.model('EmbeddingChunk', embeddingChunkSchema);
