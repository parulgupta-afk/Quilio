const Post = require('../models/Post');
const { processPostEmbeddings } = require('../services/embeddingPipeline');

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res) => {
  try {
    const { title, content, coverImageUrl, tags, status } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const post = await Post.create({
      author: req.user._id,
      title,
      content,
      coverImageUrl: coverImageUrl || '',
      tags: tags || [],
      status: status || 'draft',
    });

    // Generate embeddings in background if published
    if (post.status === 'published') {
      processPostEmbeddings(post._id, post.content);
    }

    const populatedPost = await Post.findById(post._id).populate(
      'author',
      'name avatarUrl'
    );

    res.status(201).json(populatedPost);
  } catch (error) {
    console.error('Create post error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all published posts (feed)
// @route   GET /api/posts
// @access  Public
const getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ status: 'published' })
      .populate('author', 'name avatarUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments({ status: 'published' });

    res.status(200).json({
      posts,
      page,
      pages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    console.error('Get posts error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single post by slug
// @route   GET /api/posts/:slug
// @access  Public
const getPostBySlug = async (req, res) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug }).populate(
      'author',
      'name avatarUrl bio'
    );

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.viewsCount += 1;
    await post.save();

    res.status(200).json(post);
  } catch (error) {
    console.error('Get post error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get my posts (published + drafts)
// @route   GET /api/posts/me/all
// @access  Private
const getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({ author: req.user._id })
      .sort({ updatedAt: -1 })
      .populate('author', 'name avatarUrl');

    res.status(200).json(posts);
  } catch (error) {
    console.error('Get my posts error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update a post
// @route   PUT /api/posts/:id
// @access  Private
const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { title, content, coverImageUrl, tags, status } = req.body;

    const wasPublished = post.status === 'published';
    const contentChanged = content && content !== post.content;

    post.title = title || post.title;
    post.content = content || post.content;
    post.coverImageUrl = coverImageUrl !== undefined ? coverImageUrl : post.coverImageUrl;
    post.tags = tags || post.tags;
    post.status = status || post.status;

    const updatedPost = await post.save();
    await updatedPost.populate('author', 'name avatarUrl');

    // Re-generate embeddings if published and content changed (or newly published)
    if (updatedPost.status === 'published' && (contentChanged || !wasPublished)) {
      processPostEmbeddings(updatedPost._id, updatedPost.content);
    }

    res.status(200).json(updatedPost);
  } catch (error) {
    console.error('Update post error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await post.deleteOne();
    res.status(200).json({ message: 'Post deleted' });
  } catch (error) {
    console.error('Delete post error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createPost,
  getPosts,
  getPostBySlug,
  getMyPosts,
  updatePost,
  deletePost,
};
