import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';

/* ── Quilio Logo SVG emblem ── */
const QuilioEmblem = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="qGradL" gradientUnits="userSpaceOnUse" x1="10" x2="90" y1="10" y2="90">
        <stop offset="0%" stopColor="#6366F1" />
        <stop offset="100%" stopColor="#A855F7" />
      </linearGradient>
      <linearGradient id="sparkleL" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="100%" stopColor="#C084FC" />
      </linearGradient>
    </defs>
    <circle cx="48" cy="46" r="32" fill="#0E1017" stroke="url(#qGradL)" strokeWidth="7.5" />
    <path d="M48 26V58" stroke="#F1F1F4" strokeLinecap="round" strokeWidth="5" />
    <path d="M36 40C36 40 42 38 48 42C54 38 60 40 60 40" stroke="#8B93A7" strokeLinecap="round" strokeWidth="3.5" />
    <path d="M58 58L78 80" stroke="url(#qGradL)" strokeLinecap="round" strokeWidth="8" />
    <path d="M72 24L74 18L76 24L82 26L76 28L74 34L72 28L66 26L72 24Z" fill="url(#sparkleL)" />
  </svg>
);

export default function Layout({ children }) {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  const isActive = (p) => path === p || path.startsWith(p + '/');

  /* Section name for topbar */
  const sectionName = () => {
    if (path === '/home') return 'Home';
    if (path.startsWith('/learn')) return 'Learn';
    if (path === '/write') return 'Write';
    if (path === '/progress') return 'Progress';
    if (path.startsWith('/profile')) return 'Profile';
    if (path.startsWith('/post')) return 'Essay Reader';
    if (path === '/search') return 'Search';
    if (path === '/notifications') return 'Notifications';
    return '';
  };

  return (
    <div className="ns-shell">
      {/* ── Top Header ── */}
      <header className="ns-topbar">
        <div className="ns-topbar-brand">
          <Link to="/home" style={{ display: 'flex', alignItems: 'center' }}>
            <QuilioEmblem size={30} />
          </Link>
          <span className="ns-topbar-brand-name">Quilio</span>
          {sectionName() && (
            <>
              <span className="ns-topbar-divider" />
              <span className="ns-topbar-section">{sectionName()}</span>
            </>
          )}
        </div>

        <div className="ns-topbar-actions">
          {/* Search */}
          <button
            className="ns-icon-btn"
            title="Search"
            onClick={() => navigate('/search')}
          >
            <span className="material-symbols-outlined">search</span>
          </button>

          {/* Avatar / auth */}
          {isAuthenticated ? (
            <div
              className="ns-avatar-ring"
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(`/profile/${user?._id}`)}
              title={user?.name}
            >
              <div
                className="ns-avatar"
                style={{ width: 32, height: 32, fontSize: 13 }}
              >
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            </div>
          ) : (
            <Link
              to="/login"
              className="ns-btn ns-btn-ghost"
              style={{ padding: '6px 14px', fontSize: 13, borderRadius: 999 }}
            >
              Sign In
            </Link>
          )}
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="ns-main">
        {children}
      </main>

      {/* ── Bottom Tab Navigation ── */}
      <nav className="ns-bottom-nav">
        {/* Home */}
        <Link
          to="/home"
          className={`ns-nav-item${isActive('/home') ? ' active' : ''}`}
          aria-current={isActive('/home') ? 'page' : undefined}
        >
          <span className="material-symbols-outlined">auto_stories</span>
          <span className="ns-nav-label">Home</span>
        </Link>

        {/* Search / Explore */}
        <Link
          to="/search"
          className={`ns-nav-item${isActive('/search') ? ' active' : ''}`}
          aria-current={isActive('/search') ? 'page' : undefined}
        >
          <span className="material-symbols-outlined">explore</span>
          <span className="ns-nav-label">Search</span>
        </Link>

        {/* Write FAB */}
        {isAuthenticated && (
          <div className="ns-nav-write">
            <Link to="/write" className="ns-nav-write-fab" title="Write">
              <span className="material-symbols-outlined">edit_note</span>
            </Link>
            <span className="ns-nav-write-label">Write</span>
          </div>
        )}

        {/* Notifications / Progress */}
        {isAuthenticated && (
          <Link
            to="/progress"
            className={`ns-nav-item${isActive('/progress') ? ' active' : ''}`}
            aria-current={isActive('/progress') ? 'page' : undefined}
          >
            <span className="material-symbols-outlined">insights</span>
            <span className="ns-nav-label">Progress</span>
          </Link>
        )}

        {/* Profile */}
        {isAuthenticated ? (
          <Link
            to={`/profile/${user?._id}`}
            className={`ns-nav-item${isActive('/profile') ? ' active' : ''}`}
            aria-current={isActive('/profile') ? 'page' : undefined}
          >
            <span className="material-symbols-outlined">account_circle</span>
            <span className="ns-nav-label">Profile</span>
          </Link>
        ) : (
          <Link
            to="/login"
            className="ns-nav-item"
          >
            <span className="material-symbols-outlined">login</span>
            <span className="ns-nav-label">Sign In</span>
          </Link>
        )}
      </nav>
    </div>
  );
}
