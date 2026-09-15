const express = require('express');
const router = express.Router();
const {
  followUser,
  unfollowUser,
  likePost,
  unlikePost,
  bookmarkPost,
  removeBookmark,
  addComment,
  getComments,
  deleteComment,
} = require('../controllers/socialController');
const { protect } = require('../middleware/auth');

// Follow
router.post('/follow/:userId', protect, followUser);
router.delete('/follow/:userId', protect, unfollowUser);

// Like
router.post('/like/:postId', protect, likePost);
router.delete('/like/:postId', protect, unlikePost);

// Bookmark
router.post('/bookmark/:postId', protect, bookmarkPost);
router.delete('/bookmark/:postId', protect, removeBookmark);

// Comment
router.post('/comment/:postId', protect, addComment);
router.get('/comments/:postId', getComments);
router.delete('/comment/:commentId', protect, deleteComment);

module.exports = router;
