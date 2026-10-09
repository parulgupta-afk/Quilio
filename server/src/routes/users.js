const express = require('express');
const router = express.Router();
const { getUserProfile, updateProfile } = require('../controllers/userController');
const { protect, optionalAuth } = require('../middleware/auth');

router.get('/:id', optionalAuth, getUserProfile);
router.put('/me', protect, updateProfile);

module.exports = router;
