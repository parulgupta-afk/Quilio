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
const { protect } = require('../middleware/auth');

// Public
router.get('/', getPosts);

// Specific routes BEFORE :slug
router.post('/', protect, createPost);
router.get('/me/all', protect, getMyPosts);
router.get('/author/:userId', getPostsByAuthor);

// Parametric last
router.get('/:slug', getPostBySlug);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);

module.exports = router;
