const mongoose = require('mongoose');

const postRevisionSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
      index: true,
    },
    editor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: { type: String, required: true },
    content: { type: String, required: true },
    revisionNumber: { type: Number, required: true },
    note: { type: String, default: '' },
  },
  { timestamps: true }
);

postRevisionSchema.index({ post: 1, revisionNumber: -1 });

module.exports = mongoose.model('PostRevision', postRevisionSchema);
