const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  type: {
    type: String,
    enum: ['mcq', 'true_false'],
    default: 'mcq',
  },
  options: [String], // for MCQ
  correctAnswer: { type: String, required: true },
  explanation: { type: String, default: '' },
});

const quizSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
      unique: true,
    },
    keyConcepts: {
      type: [String],
      default: [],
    },
    summary: {
      type: String,
      default: '',
    },
    questions: [questionSchema],
    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Quiz', quizSchema);
