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
  forkPost,
  getPostRevisions,
  getPostForks,
  restoreRevision,
} = require('../controllers/postController');
const { protect, optionalAuth } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');

router.get('/', optionalAuth, getPosts);
router.post('/', protect, validateBody({ title: 'string', content: 'string' }), createPost);
router.get('/me/all', protect, getMyPosts);
router.get('/author/:userId', getPostsByAuthor);

router.post('/:id/fork', protect, forkPost);
router.get('/:id/revisions', protect, getPostRevisions);
router.post('/:id/revisions/:revisionId/restore', protect, restoreRevision);
router.get('/:id/forks', optionalAuth, getPostForks);

router.get('/:slug', optionalAuth, getPostBySlug);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);

module.exports = router;
