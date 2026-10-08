import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const GoogleIcon = (props) => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" {...props}>
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l3.68-2.84z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

const GOOGLE_CLIENT_ID = (import.meta.env.VITE_GOOGLE_CLIENT_ID || '').trim();

// Module-level: avoid initialize() on every React StrictMode remount
let gsiInitializedFor = '';
let gsiCredentialHandler = null;

const containerVariantsMotion = containerVariants;
const itemVariantsMotion = itemVariants;

export default function Auth11({
  mode = 'login',
  onSubmit,
  onGoogleCredential,
  onDemoLogin,
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
  const googleBtnRef = useRef(null);
  const [googleReady, setGoogleReady] = useState(false);
  const onGoogleRef = useRef(onGoogleCredential);

  useEffect(() => {
    onGoogleRef.current = onGoogleCredential;
    gsiCredentialHandler = (cred) => onGoogleRef.current?.(cred);
  }, [onGoogleCredential]);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      setGoogleReady(false);
      return;
    }

    let cancelled = false;
    let tries = 0;

    const renderBtn = () => {
      if (cancelled || !googleBtnRef.current || !window.google?.accounts?.id) return;
      googleBtnRef.current.innerHTML = '';
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        theme: 'outline',
        size: 'large',
        shape: 'pill',
        text: isRegister ? 'signup_with' : 'signin_with',
        width: 360,
      });
      setGoogleReady(true);
    };

    const initGoogle = () => {
      if (cancelled) return;
      const g = window.google?.accounts?.id;
      if (!g) {
        if (tries++ < 50) setTimeout(initGoogle, 120);
        return;
      }

      try {
        if (gsiInitializedFor !== GOOGLE_CLIENT_ID) {
          g.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: (response) => {
              if (response?.credential) {
                gsiCredentialHandler?.(response.credential);
              }
            },
            auto_select: false,
            cancel_on_tap_outside: true,
          });
          gsiInitializedFor = GOOGLE_CLIENT_ID;
        }
        renderBtn();
      } catch (err) {
        console.error('Google init error', err);
        setGoogleReady(false);
      }
    };

    initGoogle();
    return () => {
      cancelled = true;
    };
  }, [isRegister]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.({ name, email, password, confirmPassword });
  };

  const handleGoogleClickFallback = () => {
    if (!GOOGLE_CLIENT_ID) {
      setSocialNote(
        'Add VITE_GOOGLE_CLIENT_ID to client/.env. For now use Demo login or email.'
      );
      return;
    }
    setSocialNote(
      'Google blocked this site origin. In Google Cloud Console → your Web client → Authorized JavaScript origins add exactly: http://localhost:5173 (and http://127.0.0.1:5173). Save, wait 2 minutes, hard refresh.'
    );
  };

  return (
    <div className="w-auth11">
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
            Knowledge untangled. Chat, quiz, and write with AI grounded in your posts.
          </p>
        </div>
      </div>

      <div className="w-auth11-form-side">
        <motion.div
          className="w-auth11-form-box"
          variants={containerVariantsMotion}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariantsMotion} className="w-auth11-logo-row">
            <div className="w-auth11-q">Q</div>
            <span>Quilio</span>
          </motion.div>

          <motion.div variants={itemVariantsMotion}>
            <h1 className="w-auth11-h1">
              {isRegister ? 'Create an account' : 'Welcome back'}
            </h1>
            <p className="w-auth11-sub">
              {isRegister
                ? 'Start your scholar workspace in under a minute.'
                : 'Sign in to continue to your workspace.'}
            </p>
          </motion.div>

          <motion.div variants={itemVariantsMotion} className="w-auth11-socials">
            <div ref={googleBtnRef} className="w-auth11-google-official" />

            {!googleReady && (
              <button type="button" className="w-auth11-social" onClick={handleGoogleClickFallback}>
                <GoogleIcon style={{ width: 16, height: 16 }} />
                Continue with Google
              </button>
            )}

            {onDemoLogin && !isRegister && (
              <button
                type="button"
                className="w-auth11-social w-auth11-demo"
                onClick={() => onDemoLogin()}
                disabled={isLoading}
              >
                1-click Demo login (aria@quilio.app)
              </button>
            )}

            {socialNote && <p className="w-auth11-note">{socialNote}</p>}
          </motion.div>

          <motion.div variants={itemVariantsMotion} className="w-auth11-or">
            <span />
            <em>Or</em>
            <span />
          </motion.div>

          <form onSubmit={handleSubmit} className="w-auth11-form">
            {errorMessage && (
              <div className="w-auth11-error" role="alert">
                {errorMessage}
              </div>
            )}

            {isRegister && (
              <div className="w-auth11-field">
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
              </div>
            )}

            <div className="w-auth11-field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="you@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="w-auth11-field">
              <label htmlFor="password">Password</label>
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
            </div>

            {isRegister && (
              <div className="w-auth11-field">
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
              </div>
            )}

            <button type="submit" className="w-auth11-submit" disabled={isLoading}>
              {isLoading ? 'Please wait…' : isRegister ? 'Create account' : 'Sign in'}
            </button>
          </form>

          <p className="w-auth11-switch">
            {isRegister ? (
              <>
                Already have an account? <Link to="/login">Sign in</Link>
              </>
            ) : (
              <>
                Don&apos;t have an account? <Link to="/register">Sign up</Link>
              </>
            )}
          </p>

          {!isRegister && (
            <p className="w-auth11-hint">
              Demo: <code>aria@quilio.app</code> / <code>demo1234</code>
              <br />
              Run <code>npm run seed</code> in server if demo login fails.
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
