const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  type: {
    type: String,
    enum: ['mcq', 'true_false'],
    default: 'mcq',
  },
  options: [String],
  correctAnswer: { type: String, required: true },
  explanation: { type: String, default: '' },
});

const flashcardSchema = new mongoose.Schema({
  front: { type: String, required: true },
  back: { type: String, required: true },
});

const quizSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
      unique: true,
    },
    keyConcepts: { type: [String], default: [] },
    summary: { type: String, default: '' },
    beginnerExplanation: { type: String, default: '' },
    intermediateExplanation: { type: String, default: '' },
    terminology: {
      type: [
        {
          term: String,
          definition: String,
        },
      ],
      default: [],
    },
    prerequisites: { type: [String], default: [] },
    questions: [questionSchema],
    flashcards: [flashcardSchema],
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Quiz', quizSchema);
