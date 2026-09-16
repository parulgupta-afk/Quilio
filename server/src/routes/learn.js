const express = require('express');
const router = express.Router();
const {
  getLearnContent,
  submitQuiz,
  getMyProgress,
} = require('../controllers/learnController');
const { protect } = require('../middleware/auth');

router.get('/progress/me', protect, getMyProgress);
router.get('/:postId', protect, getLearnContent);
router.post('/:postId/submit', protect, submitQuiz);

module.exports = router;
