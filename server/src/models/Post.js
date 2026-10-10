const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
      maxlength: [200, 'Title cannot be more than 200 characters'],
    },
    content: {
      type: String,
      required: [true, 'Please provide content'],
    },
    excerpt: {
      type: String,
      default: '',
    },
    coverImageUrl: {
      type: String,
      default: '',
    },
    tags: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
    },
    slug: {
      type: String,
      unique: true,
      sparse: true,
    },
    likesCount: {
      type: Number,
      default: 0,
    },
    commentsCount: {
      type: Number,
      default: 0,
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
    embeddingStatus: {
      type: String,
      enum: ['none', 'pending', 'processing', 'completed', 'failed'],
      default: 'none',
    },
    embeddingAttempts: { type: Number, default: 0 },
    embeddingLastError: { type: String, default: '' },
    embeddingModel: { type: String, default: '' },
    embeddingCompletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

// Generate slug from title before saving
postSchema.pre('save', function (next) {
  if (this.isModified('title') || !this.slug) {
    this.slug =
      this.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim() +
      '-' +
      Date.now().toString(36);
  }

  // Auto-generate excerpt if not provided
  if (!this.excerpt && this.content) {
    this.excerpt = this.content.replace(/<[^>]*>/g, '').substring(0, 160) + '...';
  }

  next();
});

// Text search support for title/excerpt/tags
postSchema.index({ title: 'text', excerpt: 'text', tags: 'text' });

module.exports = mongoose.model('Post', postSchema);
