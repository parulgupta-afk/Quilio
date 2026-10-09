const express = require('express');
const router = express.Router();
const {
  createPost,
  getPosts,
  getPostBySlug,
  getMyPosts,
  getPostsByAuthor,
  updatePost,
  deletePost,
} = require('../controllers/postController');
const { protect, optionalAuth } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');

// Public
router.get('/', optionalAuth, getPosts);

// Specific routes BEFORE :slug
router.post('/', protect, validateBody({ title: 'string', content: 'string' }), createPost);
router.get('/me/all', protect, getMyPosts);
router.get('/author/:userId', getPostsByAuthor);

// Parametric last
router.get('/:slug', optionalAuth, getPostBySlug);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);

module.exports = router;
