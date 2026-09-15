const express = require('express');
const router = express.Router();
const {
  chatWithBlog,
  generatePostEmbeddings,
} = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.post('/chat/:postId', protect, chatWithBlog);
router.post('/embed/:postId', protect, generatePostEmbeddings);

module.exports = router;
