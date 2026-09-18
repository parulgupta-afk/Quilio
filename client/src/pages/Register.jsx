import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

/* ── Quilio Emblem ── */
const QuilioEmblem = () => (
  <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="qGradReg" gradientUnits="userSpaceOnUse" x1="10" x2="90" y1="10" y2="90">
        <stop offset="0%" stopColor="#6366F1" /><stop offset="100%" stopColor="#A855F7" />
      </linearGradient>
      <linearGradient id="sparkleReg" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stopColor="#FFFFFF" /><stop offset="100%" stopColor="#C084FC" />
      </linearGradient>
    </defs>
    <circle cx="48" cy="46" r="32" fill="#0E1017" stroke="url(#qGradReg)" strokeWidth="7.5" />
    <path d="M48 26V58" stroke="#F1F1F4" strokeLinecap="round" strokeWidth="5" />
    <path d="M36 40C36 40 42 38 48 42C54 38 60 40 60 40" stroke="#8B93A7" strokeLinecap="round" strokeWidth="3.5" />
    <path d="M58 58L78 80" stroke="url(#qGradReg)" strokeLinecap="round" strokeWidth="8" />
    <path d="M72 24L74 18L76 24L82 26L76 28L74 34L72 28L66 26L72 24Z" fill="url(#sparkleReg)" />
  </svg>
);

function PasswordStrength({ password }) {
  const len = password.length;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNum = /\d/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);
  const score = (len >= 8 ? 1 : 0) + (hasLower ? 1 : 0) + (hasUpper ? 1 : 0) + (hasNum ? 1 : 0) + (hasSpecial ? 1 : 0);
  const label = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'][score] || '';
  const colors = ['#464554', '#ef4444', '#f97316', '#eab308', '#22c55e', '#6366f1'];
  if (!password) return null;
  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} style={{ flex: 1, height: 3, borderRadius: 9999, background: i <= score ? colors[score] : '#1e1f25', transition: 'background 0.3s' }} />
        ))}
      </div>
      <span style={{ fontSize: 11, color: colors[score], fontWeight: 600 }}>{label}</span>
    </div>
  );
}

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const { register, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    const result = await register(name, email, password);
    if (result.success) navigate('/home');
  };

  return (
    <div className="ns-auth-wrap">
      {/* Ambient */}
      <div style={{
        position: 'absolute', top: '-128px', left: '50%', transform: 'translateX(-50%)',
        width: 720, height: 500,
        background: 'radial-gradient(ellipse, rgba(110,0,190,0.2) 0%, rgba(128,131,255,0.15) 45%, transparent 70%)',
        filter: 'blur(120px)', pointerEvents: 'none', borderRadius: '50%',
      }} />
      <div style={{
        position: 'absolute', bottom: 0, right: '25%',
        width: 480, height: 360,
        background: 'radial-gradient(ellipse, rgba(217,119,33,0.1) 0%, rgba(192,193,255,0.1) 45%, transparent 70%)',
        filter: 'blur(140px)', pointerEvents: 'none', borderRadius: '50%',
      }} />
      {/* Rings */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.15, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="100%" height="100%" viewBox="0 0 1000 800" fill="none" style={{ maxWidth: 960 }}>
          <circle cx="500" cy="400" r="320" stroke="#464554" strokeDasharray="3 9" strokeWidth="1" />
          <circle cx="500" cy="400" r="220" stroke="#464554" strokeDasharray="2 6" strokeWidth="0.8" />
          <line x1="180" y1="400" x2="820" y2="400" stroke="#464554" strokeDasharray="1 15" strokeWidth="1" />
          <line x1="500" y1="80" x2="500" y2="720" stroke="#464554" strokeDasharray="1 15" strokeWidth="1" />
        </svg>
      </div>

      <div className="ns-auth-box">
        {/* Brand header */}
        <header style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: 24 }}>
          <div style={{ position: 'relative', marginBottom: 12 }}>
            <div style={{
              position: 'absolute', inset: -8,
              background: 'linear-gradient(135deg, rgba(192,193,255,0.4), rgba(221,183,255,0.3))',
              opacity: 0.4, filter: 'blur(12px)', borderRadius: '50%',
            }} />
            <div style={{
              position: 'relative', width: 64, height: 64, borderRadius: 16,
              background: '#1a1b21', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 10,
              boxShadow: '0 16px 40px rgba(0,0,0,0.8)',
            }}>
              <QuilioEmblem />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <h1 style={{ fontFamily: "'Newsreader', serif", fontSize: '2rem', fontWeight: 500, letterSpacing: '-0.015em', color: '#e2e2e9', margin: 0 }}>
              Quilio
            </h1>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '2px 8px', borderRadius: 4, background: '#1e1f25', color: '#c0c1ff' }}>
              Scholar
            </span>
          </div>
          <p style={{ fontFamily: "'Newsreader', serif", fontSize: 14, fontStyle: 'italic', color: '#c7c4d7', margin: 0 }}>
            Synthesis &amp; Deep Learning Gateway
          </p>
        </header>

        {/* Auth card */}
        <div className="ns-auth-card">
          {/* Tab switcher */}
          <div className="ns-tab-bar" style={{ marginBottom: 24 }}>
            <Link to="/login" className="ns-tab-btn" style={{ gap: 6, color: '#908fa0', textDecoration: 'none' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 17 }}>lock_open</span>
              Sign In
            </Link>
            <button className="ns-tab-btn active" style={{ gap: 6 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 17 }}>person_add</span>
              Create Account
            </button>
          </div>

          {/* Error */}
          {error && <div className="ns-error">{error}</div>}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Name */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#c7c4d7' }}>Full Name</label>
              <div className="ns-input-icon-wrap">
                <span className="material-symbols-outlined ns-input-icon" style={{ fontSize: 18 }}>person</span>
                <input
                  className="ns-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Your name"
                  id="reg-name"
                  autoComplete="name"
                />
              </div>
            </div>

            {/* Email */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#c7c4d7', display: 'flex', justifyContent: 'space-between' }}>
                <span>Work or Academic Email</span>
                <span style={{ fontSize: 11, color: '#908fa0', fontWeight: 400 }}>.edu, .ac.uk, .org</span>
              </label>
              <div className="ns-input-icon-wrap">
                <span className="material-symbols-outlined ns-input-icon" style={{ fontSize: 18 }}>alternate_email</span>
                <input
                  className="ns-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  id="reg-email"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#c7c4d7' }}>Password</label>
              <div className="ns-input-icon-wrap" style={{ position: 'relative' }}>
                <span className="material-symbols-outlined ns-input-icon" style={{ fontSize: 18 }}>vpn_key</span>
                <input
                  className="ns-input"
                  id="reg-pw"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#908fa0', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{showPw ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
              <PasswordStrength password={password} />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                marginTop: 8, width: '100%', height: 48, borderRadius: 12,
                background: 'linear-gradient(135deg, #8083ff, #494bd6, #6f00be)',
                color: '#e2e2e9', fontWeight: 600, fontSize: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                border: 'none', cursor: 'pointer', opacity: isLoading ? 0.7 : 1,
                boxShadow: '0 4px 20px rgba(128,131,255,0.25)', transition: 'all 0.2s',
              }}
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, animation: 'spin 1s linear infinite' }}>progress_activity</span>
                  Creating account…
                </>
              ) : (
                <>
                  <span>Create Quilio Account</span>
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>
                </>
              )}
            </button>
          </form>

          {/* Trust footer */}
          <div className="ns-trust-row" style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 15, color: '#c0c1ff' }}>shield</span>
              Grounded RAG Encrypted
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 15, color: '#ddb7ff' }}>history_edu</span>
              Provenance Verified
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 15, color: '#ffb783' }}>lock</span>
              No Scraping Policy
            </div>
          </div>

          <p style={{ textAlign: 'center', fontSize: 11, color: '#464554', marginTop: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Quilio Sovereign Knowledge Engine
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
