import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

function GoogleIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" {...props}>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l3.68-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function QuilioMark({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" aria-hidden>
      <defs>
        <linearGradient id="authShellGrad" x1="10" y1="10" x2="90" y2="90">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#A855F7" />
        </linearGradient>
      </defs>
      <circle cx="48" cy="46" r="32" fill="#0E1017" stroke="url(#authShellGrad)" strokeWidth="7.5" />
      <path d="M48 26V58" stroke="#F1F1F4" strokeLinecap="round" strokeWidth="5" />
      <path d="M36 40C36 40 42 38 48 42C54 38 60 40 60 40" stroke="#8B93A7" strokeLinecap="round" strokeWidth="3.5" />
      <path d="M58 58L78 80" stroke="url(#authShellGrad)" strokeLinecap="round" strokeWidth="8" />
      <path d="M72 24L74 18L76 24L82 26L76 28L74 34L72 28L66 26L72 24Z" fill="#C084FC" />
    </svg>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 320, damping: 28 },
  },
};

/**
 * Professional Auth-11 style shell (Watermelon layout language)
 * Branded for Quilio — wired via onSubmit + mode.
 */
export default function AuthShell({
  mode = 'login',
  onSubmit,
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

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.({
      name,
      email,
      password,
      confirmPassword,
    });
  };

  return (
    <div className="auth11-root">
      <div className="auth11-grid">
        {/* ── Form panel ── */}
        <motion.div
          className="auth11-form-panel"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="auth11-brand-row">
            <QuilioMark size={40} />
            <div>
              <div className="auth11-brand-name">Quilio</div>
              <div className="auth11-brand-tag">Synthesis &amp; Deep Learning</div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="auth11-headline">
            <h1>{isRegister ? 'Create your workspace' : 'Welcome back'}</h1>
            <p>
              {isRegister
                ? 'Join scholars who turn reading into active mastery.'
                : 'Sign in to continue learning, writing, and asking AI.'}
            </p>
          </motion.div>

          {/* Social */}
          <motion.div variants={itemVariants} className="auth11-social">
            <button
              type="button"
              className="auth11-social-btn"
              onClick={() => setSocialNote('Google sign-in is not enabled yet. Use email for now.')}
            >
              <GoogleIcon className="auth11-social-icon" />
              Continue with Google
            </button>
            {socialNote && <p className="auth11-social-note">{socialNote}</p>}
          </motion.div>

          <motion.div variants={itemVariants} className="auth11-divider">
            <span />
            <em>Or continue with email</em>
            <span />
          </motion.div>

          <form className="auth11-form" onSubmit={handleSubmit} noValidate>
            {errorMessage && (
              <motion.div variants={itemVariants} className="auth11-error" role="alert">
                {errorMessage}
              </motion.div>
            )}

            {isRegister && (
              <motion.div variants={itemVariants} className="auth11-field">
                <label htmlFor="auth-name">Full name</label>
                <input
                  id="auth-name"
                  type="text"
                  autoComplete="name"
                  placeholder="Ada Lovelace"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </motion.div>
            )}

            <motion.div variants={itemVariants} className="auth11-field">
              <label htmlFor="auth-email">Email</label>
              <input
                id="auth-email"
                type="email"
                autoComplete="email"
                placeholder="you@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </motion.div>

            <motion.div variants={itemVariants} className="auth11-field">
              <div className="auth11-label-row">
                <label htmlFor="auth-password">Password</label>
                {!isRegister && (
                  <span className="auth11-muted-link">Min. 6 characters</span>
                )}
              </div>
              <div className="auth11-input-wrap">
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                  placeholder={isRegister ? 'At least 6 characters' : 'Enter your password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="auth11-show"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </motion.div>

            {isRegister && (
              <motion.div variants={itemVariants} className="auth11-field">
                <label htmlFor="auth-confirm">Confirm password</label>
                <input
                  id="auth-confirm"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </motion.div>
            )}

            <motion.div variants={itemVariants}>
              <button type="submit" className="auth11-submit" disabled={isLoading}>
                {isLoading
                  ? isRegister
                    ? 'Creating account…'
                    : 'Signing in…'
                  : isRegister
                    ? 'Create account'
                    : 'Sign in'}
              </button>
            </motion.div>
          </form>

          <motion.p variants={itemVariants} className="auth11-switch">
            {isRegister ? (
              <>
                Already have an account?{' '}
                <Link to="/login">Sign in</Link>
              </>
            ) : (
              <>
                New to Quilio?{' '}
                <Link to="/register">Create an account</Link>
              </>
            )}
          </motion.p>

          <motion.p variants={itemVariants} className="auth11-legal">
            By continuing you agree to Quilio’s terms of use. Sessions are JWT-secured.
          </motion.p>
        </motion.div>

        {/* ── Hero panel ── */}
        <div className="auth11-hero" aria-hidden>
          <div className="auth11-hero-glow" />
          <div className="auth11-hero-content">
            <div className="auth11-hero-pill">Scholar Workspace</div>
            <h2>
              Knowledge untangled.
              <br />
              <span>Reading becomes mastery.</span>
            </h2>
            <ul>
              <li>Chat with any article (RAG + citations)</li>
              <li>Learn This — concepts, flashcards, quizzes</li>
              <li>Write with AI as your thinking partner</li>
            </ul>
            <div className="auth11-hero-footer">
              Quilio · System Release 3.8
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
