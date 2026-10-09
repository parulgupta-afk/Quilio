const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all fields' });
    }

    const cleanEmail = email.toLowerCase().trim();

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email: cleanEmail });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      passwordHash: password, // will be hashed by pre-save hook
    });

    if (user) {
      const token = generateToken(user._id);

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        token,
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Register error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Find user and explicitly include passwordHash
    const user = await User.findOne({ email: cleanEmail }).select('+passwordHash');

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    if (!user.passwordHash) {
      return res.status(400).json({
        message: 'This account was registered with Google. Please use "Continue with Google" to sign in.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      token,
    });
  } catch (error) {
    console.error('Login error:', error.message);
    if (error.name === 'MongoServerError' || error.name === 'MongooseError' || error.name === 'MongoNetworkError') {
      return res.status(503).json({ message: 'Database unavailable. Check MongoDB connection (MONGODB_URI).' });
    }
    if (error.message && error.message.includes('secret')) {
      return res.status(500).json({ message: 'Server misconfiguration: JWT_SECRET is invalid or missing.' });
    }
    res.status(500).json({ message: 'Server error during login' });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    // req.user is already set by the protect middleware
    res.status(200).json(req.user);
  } catch (error) {
    console.error('GetMe error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Google JWT OAuth login / signup (Google Identity Services ID token)
// @route   POST /api/auth/google
// @access  Public
// Note: GIS uses Client ID only. Client Secret is for server-side code flow (not required here).
const googleLogin = async (req, res) => {
  try {
    const { credential, email: bodyEmail, name: bodyName, googleId: bodyGoogleId, avatarUrl: bodyAvatarUrl } = req.body;

    let email = bodyEmail;
    let name = bodyName;
    let googleId = bodyGoogleId;
    let avatarUrl = bodyAvatarUrl || '';

    const expectedAud = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || '';

    // If a Google JWT credential (ID Token) is passed:
    if (credential) {
      try {
        const https = require('https');
        const tokenInfo = await new Promise((resolve) => {
          const url = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`;
          https.get(url, (gRes) => {
            let body = '';
            gRes.on('data', (d) => (body += d));
            gRes.on('end', () => {
              try {
                const parsed = JSON.parse(body);
                resolve(parsed.error ? null : parsed);
              } catch (e) {
                resolve(null);
              }
            });
          }).on('error', () => resolve(null));
        });

        if (tokenInfo && tokenInfo.email) {
          // Verify token was issued for our OAuth Web Client ID
          if (expectedAud && tokenInfo.aud && tokenInfo.aud !== expectedAud) {
            console.warn('Google token aud mismatch', { got: tokenInfo.aud, expected: expectedAud });
            return res.status(401).json({
              message: 'Google token was not issued for this app. Check GOOGLE_CLIENT_ID matches the Web client ID.',
            });
          }
          email = tokenInfo.email;
          name = tokenInfo.name || tokenInfo.email.split('@')[0];
          googleId = tokenInfo.sub;
          avatarUrl = tokenInfo.picture || avatarUrl;
        } else {
          // Dev fallback only when GOOGLE_CLIENT_ID is not set
          if (!expectedAud) {
            const decoded = jwt.decode(credential);
            if (decoded && (decoded.email || decoded.sub)) {
              email = decoded.email || email;
              name = decoded.name || name || (email ? email.split('@')[0] : 'Google User');
              googleId = decoded.sub || googleId;
              avatarUrl = decoded.picture || avatarUrl;
            }
          }
        }
      } catch (err) {
        console.warn('Google token verification error:', err.message);
      }
    }

    if (!email) {
      return res.status(400).json({
        message: 'Invalid Google authentication credential. Ensure VITE_GOOGLE_CLIENT_ID (client) and GOOGLE_CLIENT_ID (server) match your Web client ID.',
      });
    }

    email = email.toLowerCase().trim();

    // Check if user exists by email or googleId
    let user = await User.findOne({
      $or: [{ email }, ...(googleId ? [{ googleId }] : [])],
    });

    if (user) {
      let updated = false;
      if (googleId && !user.googleId) {
        user.googleId = googleId;
        updated = true;
      }
      if (avatarUrl && !user.avatarUrl) {
        user.avatarUrl = avatarUrl;
        updated = true;
      }
      if (updated) {
        await user.save();
      }
    } else {
      user = await User.create({
        name: name || email.split('@')[0],
        email,
        googleId: googleId || `google_${Date.now()}`,
        avatarUrl,
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      token,
    });
  } catch (error) {
    console.error('Google login error:', error);
    return res.status(500).json({ message: error.message || 'Server error during Google authentication' });
  }
};


// @desc    Ensure demo user exists with known password and log in
// @route   POST /api/auth/demo-login
// @access  Public
const demoLogin = async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        message: 'Demo login is disabled in production.',
        code: 'DEMO_DISABLED',
      });
    }
    const email = 'aria@quilio.app';
    const password = 'demo1234';
    let user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      user = await User.create({
        name: 'Aria Chen',
        email,
        passwordHash: password,
        bio: 'Demo scholar account',
      });
    } else {
      user.passwordHash = password;
      await user.save();
    }
    const token = generateToken(user._id);
    return res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      token,
    });
  } catch (error) {
    console.error('Demo login error:', error.message);
    if (!process.env.MONGODB_URI || error.name === 'MongooseError') {
      return res.status(503).json({ message: 'Database unavailable' });
    }
    res.status(500).json({ message: 'Demo login failed: ' + error.message });
  }
};

module.exports = {
  register,
  login,
  googleLogin,
  getMe,
  demoLogin,
};
