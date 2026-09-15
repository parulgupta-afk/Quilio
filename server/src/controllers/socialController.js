const Follow = require('../models/Follow');
const Like = require('../models/Like');
const Bookmark = require('../models/Bookmark');
const Comment = require('../models/Comment');
const User = require('../models/User');
const Post = require('../models/Post');

// ==================== FOLLOW ====================

// @desc    Follow a user
// @route   POST /api/social/follow/:userId
const followUser = async (req, res) => {
  try {
    const targetUserId = req.params.userId;

    if (targetUserId === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const existing = await Follow.findOne({
      follower: req.user._id,
      following: targetUserId,
    });

    if (existing) {
      return res.status(400).json({ message: 'Already following this user' });
    }

    await Follow.create({
      follower: req.user._id,
      following: targetUserId,
    });

    // Update counts
    await User.findByIdAndUpdate(req.user._id, { $inc: { followingCount: 1 } });
    await User.findByIdAndUpdate(targetUserId, { $inc: { followersCount: 1 } });

    res.status(200).json({ message: 'Followed successfully' });
  } catch (error) {
    console.error('Follow error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Unfollow a user
// @route   DELETE /api/social/follow/:userId
const unfollowUser = async (req, res) => {
  try {
    const targetUserId = req.params.userId;

    const follow = await Follow.findOneAndDelete({
      follower: req.user._id,
      following: targetUserId,
    });

    if (!follow) {
      return res.status(400).json({ message: 'You are not following this user' });
    }

    await User.findByIdAndUpdate(req.user._id, { $inc: { followingCount: -1 } });
    await User.findByIdAndUpdate(targetUserId, { $inc: { followersCount: -1 } });

    res.status(200).json({ message: 'Unfollowed successfully' });
  } catch (error) {
    console.error('Unfollow error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// ==================== LIKE ====================

// @desc    Like a post
// @route   POST /api/social/like/:postId
const likePost = async (req, res) => {
  try {
    const postId = req.params.postId;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const existing = await Like.findOne({ user: req.user._id, post: postId });
    if (existing) {
      return res.status(400).json({ message: 'Already liked' });
    }

    await Like.create({ user: req.user._id, post: postId });
    await Post.findByIdAndUpdate(postId, { $inc: { likesCount: 1 } });

    res.status(200).json({ message: 'Post liked' });
  } catch (error) {
    console.error('Like error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Unlike a post
// @route   DELETE /api/social/like/:postId
const unlikePost = async (req, res) => {
  try {
    const postId = req.params.postId;

    const like = await Like.findOneAndDelete({
      user: req.user._id,
      post: postId,
    });

    if (!like) {
      return res.status(400).json({ message: 'You have not liked this post' });
    }

    await Post.findByIdAndUpdate(postId, { $inc: { likesCount: -1 } });

    res.status(200).json({ message: 'Post unliked' });
  } catch (error) {
    console.error('Unlike error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// ==================== BOOKMARK ====================

// @desc    Bookmark a post
// @route   POST /api/social/bookmark/:postId
const bookmarkPost = async (req, res) => {
  try {
    const postId = req.params.postId;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const existing = await Bookmark.findOne({
      user: req.user._id,
      post: postId,
    });
    if (existing) {
      return res.status(400).json({ message: 'Already bookmarked' });
    }

    await Bookmark.create({ user: req.user._id, post: postId });

    res.status(200).json({ message: 'Post bookmarked' });
  } catch (error) {
    console.error('Bookmark error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Remove bookmark
// @route   DELETE /api/social/bookmark/:postId
const removeBookmark = async (req, res) => {
  try {
    const postId = req.params.postId;

    const bookmark = await Bookmark.findOneAndDelete({
      user: req.user._id,
      post: postId,
    });

    if (!bookmark) {
      return res.status(400).json({ message: 'Bookmark not found' });
    }

    res.status(200).json({ message: 'Bookmark removed' });
  } catch (error) {
    console.error('Remove bookmark error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// ==================== COMMENT ====================

// @desc    Add a comment
// @route   POST /api/social/comment/:postId
const addComment = async (req, res) => {
  try {
    const { content, parentCommentId } = req.body;
    const postId = req.params.postId;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Comment cannot be empty' });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = await Comment.create({
      post: postId,
      author: req.user._id,
      content: content.trim(),
      parentComment: parentCommentId || null,
    });

    await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });

    const populated = await Comment.findById(comment._id).populate(
      'author',
      'name avatarUrl'
    );

    res.status(201).json(populated);
  } catch (error) {
    console.error('Add comment error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get comments for a post
// @route   GET /api/social/comments/:postId
const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate('author', 'name avatarUrl')
      .sort({ createdAt: 1 });

    res.status(200).json(comments);
  } catch (error) {
    console.error('Get comments error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a comment
// @route   DELETE /api/social/comment/:commentId
const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await comment.deleteOne();
    await Post.findByIdAndUpdate(comment.post, { $inc: { commentsCount: -1 } });

    res.status(200).json({ message: 'Comment deleted' });
  } catch (error) {
    console.error('Delete comment error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  followUser,
  unfollowUser,
  likePost,
  unlikePost,
  bookmarkPost,
  removeBookmark,
  addComment,
  getComments,
  deleteComment,
};
