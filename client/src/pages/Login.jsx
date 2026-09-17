import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    const result = await login(email, password);
    if (result.success) navigate('/');
  };

  return (
    <div className="auth-wrap">
      <div className="auth-box">
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <svg width="48" height="48" viewBox="0 0 88 88" fill="none">
            <path d="M44 6C23 6 6 23 6 44s17 38 38 38c9 0 17.3-3.2 23.8-8.6" stroke="#8B7CF6" strokeWidth="6" strokeLinecap="round" />
            <circle cx="44" cy="44" r="11" fill="#8B7CF6" />
          </svg>
        </div>
        <h1>Welcome back</h1>
        <p className="sub">Sign in to your Quilio account</p>

        <form onSubmit={handleSubmit} className="card">
          {error && <div className="error">{error}</div>}
          <div className="field">
            <label>Email</label>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" />
          </div>
          <div className="field">
            <label>Password</label>
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="••••••••" />
          </div>
          <button type="submit" className="btn btn-primary w-full" style={{ width: '100%' }} disabled={isLoading}>
            {isLoading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="muted" style={{ textAlign: 'center', marginTop: 24, fontSize: 14 }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#C9C9FF' }}>Create one</Link>
        </p>
      </div>
    </div>
  );
}
