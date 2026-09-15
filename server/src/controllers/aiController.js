const Post = require('../models/Post');
const EmbeddingChunk = require('../models/EmbeddingChunk');
const { generateEmbedding, chatWithPost } = require('../services/aiService');
const {
  processPostEmbeddings,
  retrieveRelevantChunks,
} = require('../services/embeddingPipeline');

// Simple in-memory rate limiting for AI (per user)
const aiUsage = new Map(); // userId → { count, resetAt }

function checkAIRateLimit(userId) {
  const limit = 20; // 20 AI calls per day
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  let usage = aiUsage.get(userId.toString());

  if (!usage || now > usage.resetAt) {
    usage = { count: 0, resetAt: now + dayMs };
    aiUsage.set(userId.toString(), usage);
  }

  if (usage.count >= limit) {
    return false;
  }

  usage.count += 1;
  return true;
}

// @desc    Chat with a specific post (RAG)
// @route   POST /api/ai/chat/:postId
// @access  Private
const chatWithBlog = async (req, res) => {
  try {
    const { question, history = [] } = req.body;
    const postId = req.params.postId;

    if (!question || !question.trim()) {
      return res.status(400).json({ message: 'Question is required' });
    }

    // Rate limit
    if (!checkAIRateLimit(req.user._id)) {
      return res.status(429).json({
        message: 'Daily AI limit reached (20 requests). Try again tomorrow.',
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if embeddings exist
    const chunkCount = await EmbeddingChunk.countDocuments({ post: postId });
    if (chunkCount === 0) {
      // Generate embeddings on the fly if missing
      await processPostEmbeddings(postId, post.content);
    }

    // 1. Embed the question
    const queryEmbedding = await generateEmbedding(question);

    // 2. Retrieve top relevant chunks
    const relevantChunks = await retrieveRelevantChunks(
      postId,
      queryEmbedding,
      4
    );

    if (relevantChunks.length === 0) {
      return res.status(200).json({
        answer:
          'This article does not have enough processed content to answer questions yet.',
        sources: [],
      });
    }

    // 3. Generate answer with Gemini
    const result = await chatWithPost(question, relevantChunks, history);

    res.status(200).json(result);
  } catch (error) {
    console.error('Chat with blog error:', error.message);
    res.status(500).json({ message: 'Failed to generate answer. Please try again.' });
  }
};

// @desc    Manually trigger embedding generation for a post
// @route   POST /api/ai/embed/:postId
// @access  Private (author only)
const generatePostEmbeddings = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Run in background style (don't block response too long)
    processPostEmbeddings(post._id, post.content);

    res.status(200).json({
      message: 'Embedding generation started. Chat will be available shortly.',
    });
  } catch (error) {
    console.error('Generate embeddings error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  chatWithBlog,
  generatePostEmbeddings,
};
