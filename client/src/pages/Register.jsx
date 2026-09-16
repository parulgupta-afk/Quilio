import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    const result = await register(name, email, password);
    if (result.success) navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <svg className="mx-auto mb-4" width="48" height="48" viewBox="0 0 88 88" fill="none">
            <path d="M44 6C23 6 6 23 6 44s17 38 38 38c9 0 17.3-3.2 23.8-8.6" stroke="#8B7CF6" strokeWidth="6" strokeLinecap="round"/>
            <circle cx="44" cy="44" r="11" fill="#8B7CF6"/>
          </svg>
          <h1 className="serif text-3xl font-medium m-0 mb-2">Create account</h1>
          <p style={{ color: 'var(--text-muted)' }}>Join Quilio and start learning</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-5">
          {error && (
            <div className="text-sm p-3 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)', color: '#fca5a5' }}>
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm mb-1.5" style={{ color: 'var(--text-muted)' }}>Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="input" placeholder="Your name" />
          </div>
          <div>
            <label className="block text-sm mb-1.5" style={{ color: 'var(--text-muted)' }}>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="input" placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm mb-1.5" style={{ color: 'var(--text-muted)' }}>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="input" placeholder="At least 6 characters" />
          </div>
          <button type="submit" disabled={isLoading} className="btn btn-primary w-full">
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#C9C9FF' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
