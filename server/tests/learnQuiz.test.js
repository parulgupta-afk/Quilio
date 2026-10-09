const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { submitQuiz } = require('../src/controllers/learnController');
const Quiz = require('../src/models/Quiz');
const QuizAttempt = require('../src/models/QuizAttempt');

function mockRes() {
  const res = {};
  res.statusCode = 200;
  res.body = null;
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data) => {
    res.body = data;
    return res;
  };
  return res;
}

describe('Learn This Quiz & Test Field Controller', () => {
  it('rejects submission when answers field is missing or not an array', async () => {
    const req = {
      params: { postId: 'post123' },
      body: {},
      user: { _id: 'user123' },
    };
    const res = mockRes();

    await submitQuiz(req, res);

    assert.equal(res.statusCode, 400);
    assert.equal(res.body.message, 'Answers are required');
  });

  it('correctly calculates test score, percentage, and detailed answers', async () => {
    const postId = 'post123';
    const userId = 'user123';
    const req = {
      params: { postId },
      body: {
        answers: [
          { questionIndex: 0, selectedAnswer: 'Option A' },
          { questionIndex: 1, selectedAnswer: 'Wrong Answer' },
        ],
      },
      user: { _id: userId },
    };
    const res = mockRes();

    const mockQuiz = {
      _id: 'quiz123',
      post: postId,
      questions: [
        {
          question: 'What is React?',
          options: ['Option A', 'Option B'],
          correctAnswer: 'Option A',
          explanation: 'React is a library',
        },
        {
          question: 'What is Node?',
          options: ['Option C', 'Right Answer'],
          correctAnswer: 'Right Answer',
          explanation: 'Node is a runtime',
        },
      ],
    };

    const origQuizFindOne = Quiz.findOne;
    const origQuizAttemptCreate = QuizAttempt.create;

    Quiz.findOne = async () => mockQuiz;
    QuizAttempt.create = async (doc) => ({
      _id: 'attempt999',
      ...doc,
    });

    try {
      await submitQuiz(req, res);

      assert.equal(res.statusCode, 200);
      assert.equal(res.body.totalQuestions, 2);
      assert.equal(res.body.score, 1);
      assert.equal(res.body.percentage, 50);
      assert.equal(res.body.detailedAnswers.length, 2);
      assert.equal(res.body.detailedAnswers[0].isCorrect, true);
      assert.equal(res.body.detailedAnswers[1].isCorrect, false);
      assert.equal(res.body.detailedAnswers[1].correctAnswer, 'Right Answer');
    } finally {
      Quiz.findOne = origQuizFindOne;
      QuizAttempt.create = origQuizAttemptCreate;
    }
  });
});
