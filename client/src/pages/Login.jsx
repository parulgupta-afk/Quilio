import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

function Emblem({ size = 56 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <linearGradient id="qLogin" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#A855F7" />
        </linearGradient>
      </defs>
      <circle cx="48" cy="46" r="32" fill="#0E1017" stroke="url(#qLogin)" strokeWidth="7.5" />
      <path d="M48 26V58" stroke="#F1F1F4" strokeLinecap="round" strokeWidth="5" />
      <path d="M36 40C36 40 42 38 48 42C54 38 60 40 60 40" stroke="#8B93A7" strokeLinecap="round" strokeWidth="3.5" />
      <path d="M58 58L78 80" stroke="url(#qLogin)" strokeLinecap="round" strokeWidth="8" />
      <path d="M72 24L74 18L76 24L82 26L76 28L74 34L72 28L66 26L72 24Z" fill="#C084FC" />
    </svg>
  );
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const { login, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError?.();
    const result = await login(email.trim(), password);
    if (result?.success) navigate('/home');
  };

  return (
    <div className="ns-auth-wrap">
      <div className="ns-auth-glow ns-auth-glow-a" aria-hidden />
      <div className="ns-auth-glow ns-auth-glow-b" aria-hidden />

      <div className="ns-auth-box">
        <div className="ns-auth-brand">
          <div className="ns-auth-emblem">
            <Emblem size={56} />
          </div>
          <h1 className="ns-auth-title">
            Quilio
            <span className="ns-auth-badge">Scholar</span>
          </h1>
          <p className="ns-auth-subtitle">Synthesis &amp; Deep Learning Gateway</p>
        </div>

        <div className="ns-auth-card">
          <div className="ns-tab-bar" role="tablist">
            <span className="ns-tab-btn active" role="tab" aria-selected="true">
              Sign In
            </span>
            <Link to="/register" className="ns-tab-btn" role="tab">
              Create Account
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="ns-auth-form" noValidate>
            {error && (
              <div className="ns-auth-error" role="alert">
                {error}
              </div>
            )}

            <label className="ns-field">
              <span className="ns-field-label">Email</span>
              <input
                className="ns-input"
                type="email"
                autoComplete="email"
                placeholder="you@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>

            <label className="ns-field">
              <span className="ns-field-label-row">
                <span className="ns-field-label">Password</span>
                <span className="ns-field-hint">Min. 6 characters</span>
              </span>
              <div className="ns-input-wrap">
                <input
                  className="ns-input"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="ns-input-action"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? 'Hide' : 'Show'}
                </button>
              </div>
            </label>

            <label className="ns-check-row">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <span>Remember this device</span>
            </label>

            <button type="submit" className="ns-auth-submit" disabled={isLoading}>
              {isLoading ? 'Signing in…' : 'Sign In to Quilio →'}
            </button>
          </form>

          <p className="ns-auth-switch">
            New here?{' '}
            <Link to="/register">Create a free account</Link>
          </p>
        </div>

        <div className="ns-auth-trust">
          <span>Grounded RAG</span>
          <span>·</span>
          <span>Encrypted sessions</span>
          <span>·</span>
          <span>TLS</span>
        </div>
        <p className="ns-auth-foot">Quilio Sovereign Knowledge Engine</p>
      </div>
    </div>
  );
}
