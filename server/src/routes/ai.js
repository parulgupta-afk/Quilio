const express = require('express');
const router = express.Router();
const {
  chatWithBlog,
  generatePostEmbeddings,
  writeAssist,
} = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.post('/chat/:postId', protect, chatWithBlog);
router.post('/embed/:postId', protect, generatePostEmbeddings);
router.post('/write', protect, writeAssist);

module.exports = router;
