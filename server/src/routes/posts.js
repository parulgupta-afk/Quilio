const express = require('express');
const router = express.Router();
const {
  createPost,
  getPosts,
  getPostBySlug,
  getMyPosts,
  updatePost,
  deletePost,
} = require('../controllers/postController');
const { protect } = require('../middleware/auth');

// Public
router.get('/', getPosts);

// Private specific routes first
router.post('/', protect, createPost);
router.get('/me/all', protect, getMyPosts);

// Parametric routes last
router.get('/:slug', getPostBySlug);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);

module.exports = router;
