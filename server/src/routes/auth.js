const express = require('express');
const router = express.Router();
const { register, login, googleLogin, getMe, demoLogin } = require('../controllers/authController');
const { validateBody } = require('../middleware/validate');
const { protect } = require('../middleware/auth');

router.post('/register', validateBody({ name: 'string', email: 'email', password: { type: 'string', min: 6 } }), register);
router.post('/login', validateBody({ email: 'email', password: 'string' }), login);
router.post('/google', googleLogin);
router.post('/demo-login', demoLogin);
router.get('/me', protect, getMe);

module.exports = router;
