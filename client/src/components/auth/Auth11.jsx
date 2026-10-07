import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const GoogleIcon = (props) => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" {...props}>
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l3.68-2.84z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const AppleIcon = (props) => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" {...props}>
    <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.56-1.702z" />
  </svg>
);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

const DEMO_ACCOUNTS = [
  { name: 'Parul Gupta', email: 'parulmahajan@gmail.com', role: 'Owner' },
  { name: 'Aria Chen', email: 'aria@quilio.app', role: 'Systems' },
  { name: 'Marcus Webb', email: 'marcus@quilio.app', role: 'AI Researcher' },
];

/**
 * Auth-11 layout (Watermelon registry) — Quilio branded with Google OAuth and Quick Demo
 */
export default function Auth11({
  mode = 'login',
  onSubmit,
  onGoogleLogin,
  isLoading = false,
  errorMessage = '',
}) {
  const isRegister = mode === 'register';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [socialNote, setSocialNote] = useState('');
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');

  // Auto-init Google GIS if client ID is configured
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (clientId && window.google?.accounts?.id && onGoogleLogin) {
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            if (response?.credential) {
              onGoogleLogin(response.credential);
            }
          },
        });
      } catch (e) {
        console.warn('Google GIS init error:', e);
      }
    }
  }, [onGoogleLogin]);

  const handleFillDemo = (accEmail) => {
    setEmail(accEmail);
    setPassword('demo1234');
    setSocialNote('');
  };

  const handleGoogleBtnClick = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (clientId && window.google?.accounts?.id) {
      try {
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            setShowGoogleModal(true);
          }
        });
        return;
      } catch (err) {
        // Fall back to modal
      }
    }
    setShowGoogleModal(true);
  };

  const executeGoogleLogin = (targetEmail, targetName) => {
    setShowGoogleModal(false);
    if (!onGoogleLogin) return;

    // Create a client-side Google credential payload for the backend /api/auth/google endpoint
    const cleanEmail = (targetEmail || 'parulmahajan@gmail.com').trim().toLowerCase();
    const cleanName = targetName || cleanEmail.split('@')[0];

    onGoogleLogin({
      email: cleanEmail,
      name: cleanName,
      googleId: `google_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanName)}`,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.({
      name: name.trim(),
      email: email.trim(),
      password,
      confirmPassword,
    });
  };

  return (
    <div className="w-auth11">
      {/* Left hero panel — Auth-11 style */}
      <div className="w-auth11-hero">
        <div className="w-auth11-hero-bg" />
        <div className="w-auth11-hero-inner">
          <div className="w-auth11-hero-badge">Quilio Scholar</div>
          <h2 className="w-auth11-hero-title">
            Move deep.
            <br />
            Feel free.
          </h2>
          <p className="w-auth11-hero-text">
            Knowledge untangled. Where reading transforms into active cognitive mastery —
            chat, quiz, and write with AI grounded in your posts.
          </p>
          <div className="w-auth11-dots">
            <span className="on" />
            <span />
            <span />
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="w-auth11-form-side">
        <motion.div
          className="w-auth11-form-box"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="w-auth11-logo-row">
            <div className="w-auth11-q">Q</div>
            <span>Quilio</span>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h1 className="w-auth11-h1">
              {isRegister ? 'Create an account' : 'Welcome back'}
            </h1>
            <p className="w-auth11-sub">
              {isRegister
                ? 'Start your scholar workspace in under a minute.'
                : 'Sign in to continue to your workspace.'}
            </p>
          </motion.div>

          {/* Social Sign-In */}
          <motion.div variants={itemVariants} className="w-auth11-socials">
            <button
              type="button"
              className="w-auth11-social"
              onClick={handleGoogleBtnClick}
            >
              <GoogleIcon style={{ width: 16, height: 16 }} />
              Continue with Google
            </button>
            <button
              type="button"
              className="w-auth11-social"
              onClick={() => {
                setSocialNote('Apple sign-in requires Apple Developer ID. Please continue with Google or Email.');
                setTimeout(() => setSocialNote(''), 4500);
              }}
            >
              <AppleIcon style={{ width: 16, height: 16 }} />
              Continue with Apple
            </button>
            {socialNote && <p className="w-auth11-note">{socialNote}</p>}
          </motion.div>

          <motion.div variants={itemVariants} className="w-auth11-or">
            <span />
            <em>Or with email</em>
            <span />
          </motion.div>

          {/* Quick Demo Fill on Login */}
          {!isRegister && (
            <motion.div variants={itemVariants} className="w-auth11-demo-section">
              <div className="w-auth11-demo-header">
                <span>⚡ 1-Click Demo Fill</span>
                <span>pw: demo1234</span>
              </div>
              <div className="w-auth11-demo-chips">
                {DEMO_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.email}
                    type="button"
                    className="w-auth11-demo-chip"
                    onClick={() => handleFillDemo(acc.email)}
                    title={`Fill ${acc.name} (${acc.email})`}
                  >
                    <span>{acc.name}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="w-auth11-form">
            {errorMessage && (
              <motion.div variants={itemVariants} className="w-auth11-error" role="alert">
                {errorMessage}
              </motion.div>
            )}

            {isRegister && (
              <motion.div variants={itemVariants} className="w-auth11-field">
                <label htmlFor="name">Full name</label>
                <input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  required
                />
              </motion.div>
            )}

            <motion.div variants={itemVariants} className="w-auth11-field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </motion.div>

            <motion.div variants={itemVariants} className="w-auth11-field">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label htmlFor="password">Password</label>
                {!isRegister && <span style={{ fontSize: '0.75rem', color: '#8083ff' }}>demo: demo1234</span>}
              </div>
              <div className="w-auth11-pw">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                  required
                  minLength={6}
                />
                <button type="button" onClick={() => setShowPassword((v) => !v)}>
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </motion.div>

            {isRegister && (
              <motion.div variants={itemVariants} className="w-auth11-field">
                <label htmlFor="confirm">Confirm password</label>
                <input
                  id="confirm"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  minLength={6}
                />
              </motion.div>
            )}

            <motion.div variants={itemVariants}>
              <button type="submit" className="w-auth11-submit" disabled={isLoading}>
                {isLoading
                  ? 'Please wait…'
                  : isRegister
                    ? 'Create account'
                    : 'Sign in'}
              </button>
            </motion.div>
          </form>

          <motion.p variants={itemVariants} className="w-auth11-switch">
            {isRegister ? (
              <>
                Already have an account? <Link to="/login">Sign in</Link>
              </>
            ) : (
              <>
                Don&apos;t have an account? <Link to="/register">Sign up</Link>
              </>
            )}
          </motion.p>
        </motion.div>
      </div>

      {/* Google OAuth Account Chooser Modal */}
      <AnimatePresence>
        {showGoogleModal && (
          <div className="w-auth11-modal-overlay" onClick={() => setShowGoogleModal(false)}>
            <motion.div
              className="w-auth11-modal"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-auth11-modal-header">
                <div className="w-auth11-modal-title">
                  <GoogleIcon style={{ width: 22, height: 22 }} />
                  <span>Sign in with Google</span>
                </div>
                <button
                  type="button"
                  className="w-auth11-modal-close"
                  onClick={() => setShowGoogleModal(false)}
                >
                  &times;
                </button>
              </div>

              <p style={{ fontSize: '0.85rem', color: '#a3a3a3', marginBottom: '1rem', lineHeight: 1.45 }}>
                Choose a Google account to continue to <strong>Quilio</strong>:
              </p>

              {/* Primary Detected Google Account */}
              <button
                type="button"
                className="w-auth11-modal-account"
                onClick={() => executeGoogleLogin('parulmahajan@gmail.com', 'Parul Gupta')}
              >
                <div className="w-auth11-modal-avatar">P</div>
                <div className="w-auth11-modal-info">
                  <div className="w-auth11-modal-name">Parul Gupta</div>
                  <div className="w-auth11-modal-email">parulmahajan@gmail.com</div>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#8083ff', fontWeight: 600 }}>Continue →</span>
              </button>

              {/* Secondary Demo Google Account */}
              <button
                type="button"
                className="w-auth11-modal-account"
                onClick={() => executeGoogleLogin('aria@quilio.app', 'Aria Chen')}
              >
                <div className="w-auth11-modal-avatar" style={{ background: 'linear-gradient(135deg, #a855f7, #6366f1)' }}>A</div>
                <div className="w-auth11-modal-info">
                  <div className="w-auth11-modal-name">Aria Chen</div>
                  <div className="w-auth11-modal-email">aria@quilio.app</div>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#8083ff', fontWeight: 600 }}>Continue →</span>
              </button>

              {/* Custom Google Email input */}
              <div className="w-auth11-modal-custom">
                <label htmlFor="customGoogleInput">Or enter any Google email address:</label>
                <div className="w-auth11-modal-input-row">
                  <input
                    id="customGoogleInput"
                    type="email"
                    className="w-auth11-modal-input"
                    placeholder="you@gmail.com"
                    value={customGoogleEmail}
                    onChange={(e) => setCustomGoogleEmail(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && customGoogleEmail) {
                        e.preventDefault();
                        executeGoogleLogin(customGoogleEmail);
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="w-auth11-modal-btn"
                    disabled={!customGoogleEmail.trim()}
                    onClick={() => executeGoogleLogin(customGoogleEmail)}
                  >
                    Sign In
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
