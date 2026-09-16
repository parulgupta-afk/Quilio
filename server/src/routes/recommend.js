const express = require('express');
const router = express.Router();
const {
  getSimilarPosts,
  getPersonalizedFeed,
} = require('../controllers/recommendController');
const { protect } = require('../middleware/auth');

router.get('/similar/:postId', getSimilarPosts);
router.get('/feed', protect, getPersonalizedFeed);

module.exports = router;
