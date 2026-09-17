import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const Logo = ({ size = 30 }) => (
  <svg width={size} height={size} viewBox="0 0 88 88" fill="none">
    <path d="M44 6C23 6 6 23 6 44s17 38 38 38c9 0 17.3-3.2 23.8-8.6" stroke="#8B7CF6" strokeWidth="7" strokeLinecap="round" />
    <circle cx="44" cy="44" r="12" fill="#8B7CF6" />
  </svg>
);

export default function Layout({ children }) {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const active = (path) => (location.pathname === path ? 'active' : '');

  return (
    <div className="shell">
      <nav className="railnav">
        <Link to="/" style={{ marginBottom: 8 }}>
          <Logo />
        </Link>

        <Link to="/" className={active('/')} title="Home">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M4 11.5 12 5l8 6.5" />
            <path d="M6 10v9h12v-9" />
          </svg>
        </Link>

        <Link to="/search" className={active('/search')} title="Search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
        </Link>

        {isAuthenticated && (
          <>
            <Link to="/write" className={active('/write')} title="Write">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M5 4h11l3 3v13H5z" />
                <path d="M9 9h7M9 13h7M9 17h4" />
              </svg>
            </Link>

            <Link to="/notifications" className={active('/notifications')} title="Notifications">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </Link>

            <Link
              to={`/profile/${user?._id}`}
              title={user?.name}
              style={{ marginTop: 'auto' }}
            >
              <div className="avatar">{user?.name?.charAt(0) || 'U'}</div>
            </Link>

            <button
              onClick={() => { logout(); navigate('/'); }}
              title="Logout"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5A6076', padding: 0 }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="22" height="22">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </>
        )}

        {!isAuthenticated && (
          <Link to="/login" style={{ marginTop: 'auto', fontSize: 12, color: '#C9C9FF' }}>
            Login
          </Link>
        )}
      </nav>

      <div className="main-area">
        <header className="mobile-header">
          <Link to="/" className="brand">
            <Logo size={20} /> Quilio
          </Link>
          <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#8B93A7' }}>
            {isAuthenticated ? (
              <button
                onClick={() => { logout(); navigate('/'); }}
                style={{ background: 'none', border: 'none', color: '#8B93A7' }}
              >
                Logout
              </button>
            ) : (
              <Link to="/login">Login</Link>
            )}
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
