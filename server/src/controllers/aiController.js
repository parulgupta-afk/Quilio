const Post = require('../models/Post');
const EmbeddingChunk = require('../models/EmbeddingChunk');
const { generateEmbedding, chatWithPost, writeWithAI } = require('../services/aiService');
const {
  processPostEmbeddings,
  retrieveRelevantChunks,
} = require('../services/embeddingPipeline');

const aiUsage = new Map();

function checkAIRateLimit(userId) {
  const limit = 40; // shared daily budget for chat + write
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  let usage = aiUsage.get(userId.toString());
  if (!usage || now > usage.resetAt) {
    usage = { count: 0, resetAt: now + dayMs };
    aiUsage.set(userId.toString(), usage);
  }
  if (usage.count >= limit) return false;
  usage.count += 1;
  return true;
}

// @desc    Chat with a specific post (RAG)
// @route   POST /api/ai/chat/:postId
const chatWithBlog = async (req, res) => {
  try {
    const { question, history = [] } = req.body;
    const postId = req.params.postId;

    if (!question || !question.trim()) {
      return res.status(400).json({ message: 'Question is required' });
    }

    if (!checkAIRateLimit(req.user._id)) {
      return res.status(429).json({
        message: 'Daily AI limit reached. Try again tomorrow.',
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const chunkCount = await EmbeddingChunk.countDocuments({ post: postId });
    if (chunkCount === 0) {
      await processPostEmbeddings(postId, post.content);
    }

    const queryEmbedding = await generateEmbedding(question);
    const relevantChunks = await retrieveRelevantChunks(postId, queryEmbedding, 4);

    if (relevantChunks.length === 0) {
      return res.status(200).json({
        answer:
          'This article does not have enough processed content to answer questions yet.',
        sources: [],
      });
    }

    const result = await chatWithPost(question, relevantChunks, history);
    res.status(200).json(result);
  } catch (error) {
    console.error('Chat with blog error:', error.message);
    res.status(500).json({ message: 'Failed to generate answer. Please try again.' });
  }
};

// @desc    Manually trigger embedding generation
// @route   POST /api/ai/embed/:postId
const generatePostEmbeddings = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    processPostEmbeddings(post._id, post.content);
    res.status(200).json({
      message: 'Embedding generation started. Chat will be available shortly.',
    });
  } catch (error) {
    console.error('Generate embeddings error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Write with AI — brainstorm, expand, complete, review, rewrite, outline
// @route   POST /api/ai/write
const writeAssist = async (req, res) => {
  try {
    const {
      mode = 'expand',
      title = '',
      draft = '',
      message,
      history = [],
    } = req.body;

    if (!message || !String(message).trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const allowed = ['brainstorm', 'expand', 'complete', 'review', 'rewrite', 'outline'];
    const safeMode = allowed.includes(mode) ? mode : 'expand';

    if (!checkAIRateLimit(req.user._id)) {
      return res.status(429).json({
        message: 'Daily AI limit reached. Try again tomorrow.',
      });
    }

    const reply = await writeWithAI({
      mode: safeMode,
      title,
      draft,
      userMessage: String(message).trim(),
      history,
    });

    res.status(200).json({ reply, mode: safeMode });
  } catch (error) {
    console.error('Write assist error:', error.message);
    res.status(500).json({
      message: 'Failed to get writing help. Please try again.',
    });
  }
};

module.exports = {
  chatWithBlog,
  generatePostEmbeddings,
  writeAssist,
};
