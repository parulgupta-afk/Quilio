import UserAvatar from '../UserAvatar';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import useAuthStore from '../../store/authStore';

const NAV = [
  { group: 'General', items: [
    { label: 'Home', to: '/home' },
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'Write', to: '/write' },
  ]},
  { group: 'Learning', items: [
    { label: 'Progress', to: '/progress' },
    { label: 'Search', to: '/search' },
  ]},
  { group: 'Account', items: [
    { label: 'Notifications', to: '/notifications' },
  ]},
];

/**
 * Shared Agndex-style shell for Home + Dashboard so both pages match.
 */
export default function WorkspaceShell({ title, subtitle, actions, children }) {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const path = location.pathname;

  const profileTo = user?._id ? `/profile/${user._id}` : '/home';

  return (
    <div className="ag-root">
      <aside className={`ag-sidebar ${menuOpen ? 'open' : ''}`}>
        <div className="ag-brand">
          <div className="ag-mark">Q</div>
          <div>
            <div className="ag-brand-name">Quilio</div>
            <div className="ag-brand-sub">Scholar workspace</div>
          </div>
        </div>

        <nav className="ag-nav">
          {NAV.map((section) => (
            <div key={section.group}>
              <div className="ag-nav-group">{section.group}</div>
              {section.items.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`ag-nav-link ${path === item.to || (item.to !== '/home' && path.startsWith(item.to)) ? 'active' : ''}`}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
          <div className="ag-nav-group">Account</div>
          <Link
            to={profileTo}
            className={`ag-nav-link ${path.startsWith('/profile') ? 'active' : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            Profile
          </Link>
        </nav>

        <div className="ag-side-foot">
          <div className="ag-user">
            <UserAvatar src={user?.avatarUrl} name={user?.name} size={34} className="ag-avatar-img" />
            <div>
              <div className="ag-user-name">{user?.name || 'Scholar'}</div>
              <div className="ag-user-email">{user?.email || ''}</div>
            </div>
          </div>
          <button
            type="button"
            className="ag-logout"
            onClick={() => {
              logout();
              navigate('/login');
            }}
          >
            Log out
          </button>
        </div>
      </aside>

      {menuOpen && (
        <button type="button" className="ag-backdrop" aria-label="Close menu" onClick={() => setMenuOpen(false)} />
      )}

      <div className="ag-main">
        <header className="ag-topbar">
          <button type="button" className="ag-menu-btn" onClick={() => setMenuOpen(true)} aria-label="Open menu">
            ☰
          </button>
          <div className="ag-topbar-title">
            <h1>{title}</h1>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <div className="ag-topbar-actions">
            {actions}
          </div>
        </header>

        <div className="ag-body">{children}</div>
      </div>
    </div>
  );
}
