import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import useAuthStore from '../store/authStore';

export default function Dashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let ok = true;
    api
      .get('/posts/me/all')
      .then((r) => {
        if (!ok) return;
        const data = r.data;
        setPosts(Array.isArray(data) ? data : data?.posts || []);
      })
      .catch(() => ok && setPosts([]))
      .finally(() => ok && setLoading(false));
    return () => {
      ok = false;
    };
  }, []);

  const stats = useMemo(() => {
    const published = posts.filter((p) => p.status === 'published').length;
    const drafts = posts.filter((p) => p.status === 'draft').length;
    const views = posts.reduce((n, p) => n + (p.viewsCount || 0), 0);
    const likes = posts.reduce((n, p) => n + (p.likesCount || 0), 0);
    return { published, drafts, views, likes };
  }, [posts]);

  return (
    <div className="ag-root">
      <aside className={`ag-sidebar ${menuOpen ? 'open' : ''}`}>
        <div className="ag-brand">
          <div className="ag-mark">Q</div>
          <div>
            <div className="ag-brand-name">Quilio</div>
            <div className="ag-brand-sub">Dashboard</div>
          </div>
        </div>

        <nav className="ag-nav">
          <div className="ag-nav-group">General</div>
          <Link to="/dashboard" className="ag-nav-link active" onClick={() => setMenuOpen(false)}>
            Dashboard
          </Link>
          <Link to="/home" className="ag-nav-link" onClick={() => setMenuOpen(false)}>
            Home feed
          </Link>
          <Link to="/write" className="ag-nav-link" onClick={() => setMenuOpen(false)}>
            Write
          </Link>
          <div className="ag-nav-group">Learning</div>
          <Link to="/progress" className="ag-nav-link" onClick={() => setMenuOpen(false)}>
            Progress
          </Link>
          <Link to="/search" className="ag-nav-link" onClick={() => setMenuOpen(false)}>
            Search
          </Link>
          <div className="ag-nav-group">Account</div>
          <Link
            to={user?._id ? `/profile/${user._id}` : '/home'}
            className="ag-nav-link"
            onClick={() => setMenuOpen(false)}
          >
            Profile
          </Link>
          <Link to="/notifications" className="ag-nav-link" onClick={() => setMenuOpen(false)}>
            Notifications
          </Link>
        </nav>

        <div className="ag-side-foot">
          <div className="ag-user">
            <div className="ag-avatar">{user?.name?.[0] || 'U'}</div>
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

      {menuOpen && <button type="button" className="ag-backdrop" onClick={() => setMenuOpen(false)} aria-label="Close" />}

      <div className="ag-main">
        <header className="ag-topbar">
          <button type="button" className="ag-menu-btn" onClick={() => setMenuOpen(true)}>
            ☰
          </button>
          <div className="ag-topbar-title">
            <h1>Dashboard</h1>
            <p>Manage your posts and workspace</p>
          </div>
          <Link to="/write" className="ag-btn-primary">
            + New post
          </Link>
        </header>

        <div className="ag-body">
          <div className="ag-meta-row">
            <div className="ag-chip strong">{user?.name || 'Workspace'}</div>
            <div className="ag-chip">Scholar plan</div>
            <div className="ag-chip">
              {stats.published}/{stats.published + stats.drafts} published
            </div>
          </div>

          <div className="ag-stats">
            <div className="ag-stat">
              <span>Published</span>
              <strong>{loading ? '—' : stats.published}</strong>
            </div>
            <div className="ag-stat">
              <span>Drafts</span>
              <strong>{loading ? '—' : stats.drafts}</strong>
            </div>
            <div className="ag-stat">
              <span>Views</span>
              <strong>{loading ? '—' : stats.views}</strong>
            </div>
            <div className="ag-stat">
              <span>Likes</span>
              <strong>{loading ? '—' : stats.likes}</strong>
            </div>
          </div>

          <div className="ag-section-head">
            <div className="ag-section-title">
              <h2>Your posts</h2>
              <span className="ag-badge">{posts.length} total</span>
            </div>
            <Link to="/write" className="ag-btn-ghost">
              Create post
            </Link>
          </div>

          <div className="ag-list">
            {loading && <p className="ag-muted">Loading…</p>}
            {!loading && posts.length === 0 && (
              <div className="ag-empty">
                <p>No posts yet.</p>
                <Link to="/write" className="ag-btn-primary">
                  Write your first post
                </Link>
              </div>
            )}
            {posts.map((p) => (
              <div key={p._id} className="ag-card">
                <div className="ag-card-icon">📄</div>
                <div className="ag-card-body">
                  <p className="ag-card-title">{p.title}</p>
                  <div className="ag-card-meta">
                    <span>{p.status}</span>
                    <span>·</span>
                    <span>{p.viewsCount || 0} views</span>
                    <span>·</span>
                    <span>
                      {p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : '—'}
                    </span>
                  </div>
                </div>
                {p.status === 'published' && p.slug ? (
                  <Link to={`/post/${p.slug}`} className="ag-card-action">
                    Open
                  </Link>
                ) : (
                  <span className="ag-muted">Draft</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
