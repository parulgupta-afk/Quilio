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
  const { login, logout, user, isAuthenticated, isLoading, error, clearError } = useAuthStore();
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

        {isAuthenticated && (
          <div style={{
            background: 'rgba(99, 102, 241, 0.12)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: '12px',
            padding: '14px 16px',
            marginBottom: '16px',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap'
          }}>
            <div style={{ fontSize: '13px', color: '#e2e2e9' }}>
              Currently signed in as <strong style={{ color: '#c0c1ff' }}>{user?.name || user?.email}</strong>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => navigate('/home')}
                style={{
                  background: '#6366F1',
                  color: '#fff',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Go to Feed →
              </button>
              <button
                type="button"
                onClick={() => logout()}
                style={{
                  background: 'rgba(255, 180, 171, 0.15)',
                  color: '#ffb4ab',
                  border: '1px solid rgba(255, 180, 171, 0.3)',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                Sign Out
              </button>
            </div>
          </div>
        )}

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
