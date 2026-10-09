const Post = require('../models/Post');
const User = require('../models/User');

// @desc    Search posts and users
// @route   GET /api/search?q=keyword
const search = async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) {
      return res.status(400).json({ message: 'Search query is required', code: 'VALIDATION_ERROR' });
    }
    if (q.length > 120) {
      return res.status(400).json({ message: 'Query too long', code: 'VALIDATION_ERROR' });
    }

    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);
    let posts = [];

    // Prefer MongoDB text index when available
    try {
      posts = await Post.find(
        { status: 'published', $text: { $search: q } },
        { score: { $meta: 'textScore' } }
      )
        .sort({ score: { $meta: 'textScore' } })
        .limit(limit)
        .populate('author', 'name avatarUrl');
    } catch {
      posts = [];
    }

    if (posts.length === 0) {
      const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      posts = await Post.find({
        status: 'published',
        $or: [{ title: regex }, { tags: regex }, { excerpt: regex }, { content: regex }],
      })
        .populate('author', 'name avatarUrl')
        .sort({ createdAt: -1 })
        .limit(limit);
    }

    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const users = await User.find({
      $or: [{ name: regex }, { bio: regex }],
    })
      .select('name avatarUrl bio followersCount')
      .limit(10);

    res.status(200).json({ posts, users, query: q });
  } catch (error) {
    console.error('Search error:', error.message);
    res.status(500).json({ message: 'Search failed', code: 'SERVER_ERROR' });
  }
};

module.exports = { search };
