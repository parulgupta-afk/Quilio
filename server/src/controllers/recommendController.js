const Post = require('../models/Post');
const EmbeddingChunk = require('../models/EmbeddingChunk');
const Follow = require('../models/Follow');
const { generateEmbedding, cosineSimilarity } = require('../services/aiService');

/**
 * Average the embeddings of all chunks of a post to get a post-level vector
 */
async function getPostEmbedding(postId) {
  const chunks = await EmbeddingChunk.find({ post: postId });
  if (chunks.length === 0) return null;

  const dim = chunks[0].embedding.length;
  const avg = new Array(dim).fill(0);

  for (const chunk of chunks) {
    for (let i = 0; i < dim; i++) {
      avg[i] += chunk.embedding[i];
    }
  }

  for (let i = 0; i < dim; i++) {
    avg[i] /= chunks.length;
  }

  return avg;
}

// @desc    Get similar posts based on embeddings
// @route   GET /api/recommend/similar/:postId
// @access  Public
const getSimilarPosts = async (req, res) => {
  try {
    const postId = req.params.postId;
    const limit = parseInt(req.query.limit) || 5;

    const sourceEmbedding = await getPostEmbedding(postId);
    if (!sourceEmbedding) {
      // Fallback: return recent posts with same tags
      const sourcePost = await Post.findById(postId);
      if (!sourcePost) {
        return res.status(404).json({ message: 'Post not found' });
      }

      const fallback = await Post.find({
        status: 'published',
        _id: { $ne: postId },
        tags: { $in: sourcePost.tags || [] },
      })
        .populate('author', 'name avatarUrl')
        .sort({ createdAt: -1 })
        .limit(limit);

      return res.status(200).json({ posts: fallback, method: 'tags' });
    }

    // Get all other published posts that have embeddings
    const allChunks = await EmbeddingChunk.aggregate([
      { $match: { post: { $ne: new (require('mongoose').Types.ObjectId)(postId) } } },
      {
        $group: {
          _id: '$post',
          embeddings: { $push: '$embedding' },
        },
      },
    ]);

    const scored = [];

    for (const item of allChunks) {
      const dim = item.embeddings[0].length;
      const avg = new Array(dim).fill(0);
      for (const emb of item.embeddings) {
        for (let i = 0; i < dim; i++) avg[i] += emb[i];
      }
      for (let i = 0; i < dim; i++) avg[i] /= item.embeddings.length;

      const score = cosineSimilarity(sourceEmbedding, avg);
      scored.push({ postId: item._id, score });
    }

    scored.sort((a, b) => b.score - a.score);
    const topIds = scored.slice(0, limit).map((s) => s.postId);

    const posts = await Post.find({
      _id: { $in: topIds },
      status: 'published',
    }).populate('author', 'name avatarUrl');

    // Keep the similarity order
    const ordered = topIds
      .map((id) => posts.find((p) => p._id.toString() === id.toString()))
      .filter(Boolean);

    res.status(200).json({ posts: ordered, method: 'embeddings' });
  } catch (error) {
    console.error('Similar posts error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Personalized feed V2
// @route   GET /api/recommend/feed
// @access  Private
const getPersonalizedFeed = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const userId = req.user._id;

    // 1. Users I follow
    const following = await Follow.find({ follower: userId }).select('following');
    const followingIds = following.map((f) => f.following);

    // 2. Get recent published posts
    const candidates = await Post.find({ status: 'published' })
      .populate('author', 'name avatarUrl')
      .sort({ createdAt: -1 })
      .limit(80); // candidate pool

    if (candidates.length === 0) {
      return res.status(200).json({ posts: [], page, pages: 0, total: 0 });
    }

    // 3. Score each post
    const now = Date.now();
    const scored = candidates.map((post) => {
      let score = 0;

      // Recency (0–1)
      const ageHours = (now - new Date(post.createdAt).getTime()) / (1000 * 60 * 60);
      const recencyScore = Math.max(0, 1 - ageHours / 168); // decay over 1 week
      score += recencyScore * 0.25;

      // Follow match
      const isFollowing = followingIds.some(
        (id) => id.toString() === post.author._id.toString()
      );
      if (isFollowing) score += 0.35;

      // Engagement
      const engagement =
        (post.likesCount || 0) * 2 +
        (post.commentsCount || 0) * 3 +
        (post.viewsCount || 0) * 0.1;
      const engagementScore = Math.min(1, engagement / 50);
      score += engagementScore * 0.2;

      // Tag match could be added later with user interest tags
      score += 0.1; // base score

      return { post, score };
    });

    scored.sort((a, b) => b.score - a.score);

    const total = scored.length;
    const pageItems = scored.slice(skip, skip + limit).map((s) => s.post);

    res.status(200).json({
      posts: pageItems,
      page,
      pages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    console.error('Personalized feed error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getSimilarPosts,
  getPersonalizedFeed,
};
