const Post = require('../models/Post');
const EmbeddingChunk = require('../models/EmbeddingChunk');
const { generateEmbedding, chatWithPost, writeWithAI } = require('../services/aiService');
const {
  processPostEmbeddings,
  retrieveRelevantChunks,
} = require('../services/embeddingPipeline');

const { checkAIRateLimit } = require('../services/aiRateLimit');
const { DEFAULT_MIN_SCORE } = require('../services/embeddingPipeline');
const { buildGroundedSources, filterModelSources } = require('../services/citationGuard');
const logger = require('../utils/logger');

// @desc    Chat with a specific post (RAG)
// @route   POST /api/ai/chat/:postId
const chatWithBlog = async (req, res) => {
  try {
    const { question, history = [] } = req.body;
    const postId = req.params.postId;

    if (!question || !question.trim()) {
      return res.status(400).json({ message: 'Question is required' });
    }

    if (!(await checkAIRateLimit(req.user._id))) {
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
    const relevantChunks = await retrieveRelevantChunks(postId, queryEmbedding, 4, {
      minScore: DEFAULT_MIN_SCORE,
      filterWeak: true,
    });

    if (relevantChunks.length === 0) {
      logger.info('rag_refusal', { postId, reason: 'weak_or_empty_retrieval' });
      return res.status(200).json({
        answer:
          'This article does not cover that clearly enough for a grounded answer. Try rephrasing, or ask about a topic that appears in the post.',
        sources: [],
        grounded: false,
        reason: 'weak_or_empty_retrieval',
        minScore: DEFAULT_MIN_SCORE,
      });
    }

    const result = await chatWithPost(question, relevantChunks, history);
    const sources = filterModelSources(result.sources, relevantChunks);
    logger.info('rag_ok', { postId, chunks: relevantChunks.length });
    res.status(200).json({
      answer: result.answer,
      sources,
      grounded: true,
      minScore: DEFAULT_MIN_SCORE,
    });
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

    if (!(await checkAIRateLimit(req.user._id))) {
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
