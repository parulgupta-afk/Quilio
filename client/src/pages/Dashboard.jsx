import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import useAuthStore from '../store/authStore';

const NAV = [
  { label: 'Overview', to: '/dashboard', key: 'overview' },
  { label: 'Home feed', to: '/home', key: 'home' },
  { label: 'Write', to: '/write', key: 'write' },
  { label: 'Progress', to: '/progress', key: 'progress' },
  { label: 'Search', to: '/search', key: 'search' },
];

function StatCard({ label, value, hint }) {
  return (
    <div className="qd-stat">
      <div className="qd-stat-label">{label}</div>
      <div className="qd-stat-value">{value}</div>
      {hint && <div className="qd-stat-hint">{hint}</div>}
    </div>
  );
}

export default function Dashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const [postsRes, progressRes] = await Promise.allSettled([
          api.get('/posts/me/all'),
          api.get('/learn/progress'),
        ]);
        if (!alive) return;
        if (postsRes.status === 'fulfilled') {
          const data = postsRes.value.data;
          setPosts(Array.isArray(data) ? data : data?.posts || []);
        }
        if (progressRes.status === 'fulfilled') {
          const data = progressRes.value.data;
          setProgress(Array.isArray(data) ? data : data?.attempts || data?.items || []);
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const stats = useMemo(() => {
    const published = posts.filter((p) => p.status === 'published').length;
    const drafts = posts.filter((p) => p.status === 'draft').length;
    const views = posts.reduce((n, p) => n + (p.viewsCount || 0), 0);
    const likes = posts.reduce((n, p) => n + (p.likesCount || 0), 0);
    return { published, drafts, views, likes, quizzes: progress.length };
  }, [posts, progress]);

  const recent = posts.slice(0, 8);

  return (
    <div className="qd-root">
      {/* Mobile top */}
      <header className="qd-mobile-bar">
        <button type="button" className="qd-icon-btn" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
          ☰
        </button>
        <span className="qd-mobile-title">Dashboard</span>
        <Link to="/write" className="qd-icon-btn" title="Write">
          ✎
        </Link>
      </header>

      <div className="qd-shell">
        {/* Sidebar */}
        <aside className={`qd-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="qd-sidebar-head">
            <div className="qd-logo-mark">Q</div>
            <div>
              <div className="qd-logo-text">Quilio</div>
              <div className="qd-logo-sub">Scholar workspace</div>
            </div>
            <button
              type="button"
              className="qd-icon-btn qd-sidebar-close"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>

          <nav className="qd-nav">
            <div className="qd-nav-label">General</div>
            {NAV.map((item) => (
              <Link
                key={item.key}
                to={item.to}
                className={`qd-nav-item ${item.key === 'overview' ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="qd-nav-label">Account</div>
            <Link
              to={user?._id ? `/profile/${user._id}` : '/home'}
              className="qd-nav-item"
              onClick={() => setSidebarOpen(false)}
            >
              Profile
            </Link>
            <Link to="/notifications" className="qd-nav-item" onClick={() => setSidebarOpen(false)}>
              Notifications
            </Link>
          </nav>

          <div className="qd-sidebar-foot">
            <div className="qd-user">
              <div className="qd-avatar">{user?.name?.charAt(0) || 'U'}</div>
              <div className="qd-user-meta">
                <div className="qd-user-name">{user?.name || 'Scholar'}</div>
                <div className="qd-user-email">{user?.email || ''}</div>
              </div>
            </div>
            <button
              type="button"
              className="qd-logout"
              onClick={() => {
                logout();
                navigate('/login');
              }}
            >
              Log out
            </button>
          </div>
        </aside>

        {sidebarOpen && (
          <button type="button" className="qd-backdrop" aria-label="Close" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Main */}
        <main className="qd-main">
          <div className="qd-topbar">
            <div>
              <h1>Dashboard</h1>
              <p>Manage your writing, learning, and activity</p>
            </div>
            <div className="qd-topbar-actions">
              <Link to="/home" className="qd-btn qd-btn-ghost">
                Feed
              </Link>
              <Link to="/write" className="qd-btn qd-btn-primary">
                + New post
              </Link>
            </div>
          </div>

          <div className="qd-content">
            {/* Meta chips */}
            <div className="qd-chips">
              <span className="qd-chip strong">{user?.name || 'Scholar'}</span>
              <span className="qd-chip">Workspace</span>
              <span className="qd-chip">
                {stats.published} published · {stats.drafts} drafts
              </span>
            </div>

            {/* Stats */}
            <div className="qd-stats">
              <StatCard label="Published" value={loading ? '—' : stats.published} hint="Live on the feed" />
              <StatCard label="Drafts" value={loading ? '—' : stats.drafts} hint="Not published yet" />
              <StatCard label="Views" value={loading ? '—' : stats.views} hint="Across your posts" />
              <StatCard label="Quiz attempts" value={loading ? '—' : stats.quizzes} hint="Learn This progress" />
            </div>

            {/* Quick actions */}
            <section className="qd-section">
              <div className="qd-section-head">
                <h2>Quick actions</h2>
              </div>
              <div className="qd-actions">
                <Link to="/write" className="qd-action">
                  <span className="qd-action-title">Write with AI</span>
                  <span className="qd-action-desc">Draft, expand, and publish a synthesis</span>
                </Link>
                <Link to="/search" className="qd-action">
                  <span className="qd-action-title">Explore & learn</span>
                  <span className="qd-action-desc">Find posts and open Learn This</span>
                </Link>
                <Link to="/progress" className="qd-action">
                  <span className="qd-action-title">View progress</span>
                  <span className="qd-action-desc">Quiz history and retention</span>
                </Link>
              </div>
            </section>

            {/* Posts table */}
            <section className="qd-section">
              <div className="qd-section-head">
                <h2>Your posts</h2>
                <Link to="/write" className="qd-link">
                  Create new
                </Link>
              </div>

              <div className="qd-table-wrap">
                {loading && <p className="qd-muted">Loading…</p>}
                {!loading && recent.length === 0 && (
                  <div className="qd-empty">
                    <p>No posts yet.</p>
                    <Link to="/write" className="qd-btn qd-btn-primary">
                      Write your first post
                    </Link>
                  </div>
                )}
                {!loading && recent.length > 0 && (
                  <table className="qd-table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Status</th>
                        <th>Views</th>
                        <th>Updated</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {recent.map((p) => (
                        <tr key={p._id}>
                          <td className="qd-title-cell">{p.title}</td>
                          <td>
                            <span className={`qd-badge ${p.status === 'published' ? 'ok' : 'draft'}`}>
                              {p.status || 'draft'}
                            </span>
                          </td>
                          <td>{p.viewsCount || 0}</td>
                          <td className="qd-muted">
                            {p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : '—'}
                          </td>
                          <td>
                            {p.status === 'published' && p.slug ? (
                              <Link to={`/post/${p.slug}`} className="qd-link">
                                View
                              </Link>
                            ) : (
                              <span className="qd-muted">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
