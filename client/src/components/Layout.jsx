import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const Logo = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 88 88" fill="none">
    <path d="M44 6C23 6 6 23 6 44s17 38 38 38c9 0 17.3-3.2 23.8-8.6" stroke="#8B7CF6" strokeWidth="7" strokeLinecap="round"/>
    <circle cx="44" cy="44" r="12" fill="#8B7CF6"/>
  </svg>
);

export default function Layout({ children }) {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg)' }}>
      {/* Rail nav */}
      <nav
        className="hidden sm:flex flex-col items-center py-6 gap-7 sticky top-0 h-screen"
        style={{ width: 76, borderRight: '1px solid var(--border)' }}
      >
        <Link to="/" className="mb-2">
          <Logo size={30} />
        </Link>

        <Link
          to="/"
          className="w-10 h-10 rounded-[10px] flex items-center justify-center"
          style={{
            background: isActive('/') ? 'rgba(99,102,241,0.14)' : 'transparent',
            color: isActive('/') ? '#C9C9FF' : 'var(--text-muted)',
          }}
          title="Home"
        >
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M4 11.5 12 5l8 6.5"/><path d="M6 10v9h12v-9"/>
          </svg>
        </Link>

        <Link
          to="/search"
          className="w-10 h-10 rounded-[10px] flex items-center justify-center"
          style={{
            background: isActive('/search') ? 'rgba(99,102,241,0.14)' : 'transparent',
            color: isActive('/search') ? '#C9C9FF' : 'var(--text-muted)',
          }}
          title="Search"
        >
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>
          </svg>
        </Link>

        {isAuthenticated && (
          <>
            <Link
              to="/write"
              className="w-10 h-10 rounded-[10px] flex items-center justify-center"
              style={{
                background: isActive('/write') ? 'rgba(99,102,241,0.14)' : 'transparent',
                color: isActive('/write') ? '#C9C9FF' : 'var(--text-muted)',
              }}
              title="Write"
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M5 4h11l3 3v13H5z"/><path d="M9 9h7M9 13h7M9 17h4"/>
              </svg>
            </Link>

            <Link
              to="/notifications"
              className="w-10 h-10 rounded-[10px] flex items-center justify-center"
              style={{
                background: isActive('/notifications') ? 'rgba(99,102,241,0.14)' : 'transparent',
                color: isActive('/notifications') ? '#C9C9FF' : 'var(--text-muted)',
              }}
              title="Notifications"
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 21s-7-4.6-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.4-9.5 9-9.5 9Z"/>
              </svg>
            </Link>

            <Link
              to={`/profile/${user?._id}`}
              className="mt-auto w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold"
              style={{ background: 'linear-gradient(135deg,var(--accent-1),var(--accent-2))' }}
              title={user?.name}
            >
              {user?.name?.charAt(0) || 'U'}
            </Link>
          </>
        )}
      </nav>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header
          className="sm:hidden flex items-center justify-between px-4 py-3 sticky top-0 z-20"
          style={{ background: 'rgba(11,13,18,0.9)', backdropFilter: 'blur(8px)', borderBottom: '1px solid var(--border)' }}
        >
          <Link to="/" className="flex items-center gap-2 serif text-[17px]">
            <Logo size={20} /> Quilio
          </Link>
          <div className="flex items-center gap-3 text-sm" style={{ color: 'var(--text-muted)' }}>
            {isAuthenticated ? (
              <button onClick={() => { logout(); navigate('/'); }}>Logout</button>
            ) : (
              <Link to="/login">Login</Link>
            )}
          </div>
        </header>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
