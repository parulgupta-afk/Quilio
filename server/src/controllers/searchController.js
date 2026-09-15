const Post = require('../models/Post');
const User = require('../models/User');

// @desc    Search posts and users
// @route   GET /api/search?q=keyword
// @access  Public
const search = async (req, res) => {
  try {
    const q = req.query.q?.trim();

    if (!q || q.length < 2) {
      return res.status(400).json({ message: 'Search query too short' });
    }

    const regex = new RegExp(q, 'i');

    const [posts, users] = await Promise.all([
      Post.find({
        status: 'published',
        $or: [{ title: regex }, { tags: regex }, { excerpt: regex }],
      })
        .populate('author', 'name avatarUrl')
        .sort({ createdAt: -1 })
        .limit(20),

      User.find({
        $or: [{ name: regex }, { bio: regex }],
      })
        .select('name avatarUrl bio followersCount')
        .limit(10),
    ]);

    res.status(200).json({ posts, users, query: q });
  } catch (error) {
    console.error('Search error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { search };
