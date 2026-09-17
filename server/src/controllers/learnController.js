const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const Post = require('../models/Post');
const { generateLearnContent } = require('../services/aiService');

const learnUsage = new Map();

function checkLearnRateLimit(userId) {
  const limit = 10;
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  let usage = learnUsage.get(userId.toString());
  if (!usage || now > usage.resetAt) {
    usage = { count: 0, resetAt: now + dayMs };
    learnUsage.set(userId.toString(), usage);
  }
  if (usage.count >= limit) return false;
  usage.count += 1;
  return true;
}

function formatLearnResponse(quiz, cached) {
  const safeQuestions = (quiz.questions || []).map((q) => ({
    question: q.question,
    type: q.type,
    options: q.options,
  }));

  return {
    summary: quiz.summary || '',
    beginnerExplanation: quiz.beginnerExplanation || '',
    intermediateExplanation: quiz.intermediateExplanation || '',
    keyConcepts: quiz.keyConcepts || [],
    terminology: quiz.terminology || [],
    prerequisites: quiz.prerequisites || [],
    flashcards: quiz.flashcards || [],
    questions: safeQuestions,
    quizId: quiz._id,
    cached: !!cached,
  };
}

// @desc    Get or generate Learn This content
// @route   GET /api/learn/:postId
const getLearnContent = async (req, res) => {
  try {
    const postId = req.params.postId;
    let quiz = await Quiz.findOne({ post: postId });

    if (quiz) {
      return res.status(200).json(formatLearnResponse(quiz, true));
    }

    if (!checkLearnRateLimit(req.user._id)) {
      return res.status(429).json({
        message: 'Daily Learn This limit reached. Try again tomorrow.',
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const learnData = await generateLearnContent(post.title, post.content);

    quiz = await Quiz.create({
      post: postId,
      summary: learnData.summary || '',
      beginnerExplanation: learnData.beginnerExplanation || '',
      intermediateExplanation: learnData.intermediateExplanation || '',
      keyConcepts: learnData.keyConcepts || [],
      terminology: learnData.terminology || [],
      prerequisites: learnData.prerequisites || [],
      questions: learnData.questions || [],
      flashcards: learnData.flashcards || [],
    });

    res.status(200).json(formatLearnResponse(quiz, false));
  } catch (error) {
    console.error('Get learn content error:', error.message);
    res.status(500).json({ message: 'Failed to generate learning content' });
  }
};

// @desc    Submit quiz answers
// @route   POST /api/learn/:postId/submit
const submitQuiz = async (req, res) => {
  try {
    const { answers } = req.body;
    const postId = req.params.postId;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ message: 'Answers are required' });
    }

    const quiz = await Quiz.findOne({ post: postId });
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found. Generate it first.' });
    }

    let correctCount = 0;
    const detailedAnswers = answers.map((ans) => {
      const question = quiz.questions[ans.questionIndex];
      const isCorrect =
        question &&
        question.correctAnswer.trim().toLowerCase() ===
          (ans.selectedAnswer || '').trim().toLowerCase();
      if (isCorrect) correctCount += 1;
      return {
        questionIndex: ans.questionIndex,
        selectedAnswer: ans.selectedAnswer,
        isCorrect: !!isCorrect,
        correctAnswer: question?.correctAnswer,
        explanation: question?.explanation || '',
      };
    });

    const totalQuestions = quiz.questions.length;
    const percentage = totalQuestions
      ? Math.round((correctCount / totalQuestions) * 100)
      : 0;

    const attempt = await QuizAttempt.create({
      user: req.user._id,
      quiz: quiz._id,
      post: postId,
      answers: detailedAnswers.map((a) => ({
        questionIndex: a.questionIndex,
        selectedAnswer: a.selectedAnswer,
        isCorrect: a.isCorrect,
      })),
      score: correctCount,
      totalQuestions,
      percentage,
    });

    res.status(200).json({
      attemptId: attempt._id,
      score: correctCount,
      totalQuestions,
      percentage,
      detailedAnswers,
    });
  } catch (error) {
    console.error('Submit quiz error:', error.message);
    res.status(500).json({ message: 'Failed to submit quiz' });
  }
};

// @desc    Get my learning progress
// @route   GET /api/learn/progress/me
const getMyProgress = async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ user: req.user._id })
      .populate('post', 'title slug')
      .sort({ createdAt: -1 })
      .limit(20);
    res.status(200).json(attempts);
  } catch (error) {
    console.error('Get progress error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getLearnContent,
  submitQuiz,
  getMyProgress,
};
