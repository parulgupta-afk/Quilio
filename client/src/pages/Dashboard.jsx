import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import useAuthStore from '../store/authStore';
import WorkspaceShell from '../components/workspace/WorkspaceShell';

export default function Dashboard() {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

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
    <WorkspaceShell
      title="Dashboard"
      subtitle="Manage your writing and workspace"
      actions={
        <>
          <Link to="/home" className="ag-btn-ghost">
            Feed
          </Link>
          <Link to="/write" className="ag-btn-primary">
            + New post
          </Link>
        </>
      }
    >
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
                <span>{p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : '—'}</span>
              </div>
            </div>
            {p.status === 'published' ? (
              <Link to={`/post/${p.slug || p._id}`} className="ag-card-action">
                Open
              </Link>
            ) : (
              <span className="ag-muted">Draft</span>
            )}
          </div>
        ))}
      </div>
    </WorkspaceShell>
  );
}
