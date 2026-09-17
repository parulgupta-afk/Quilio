import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Layout from '../components/Layout';

export default function Dashboard() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api.get('/posts/me/all').then((r) => setPosts(r.data || [])).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <div className="page-wide">
        <div className="topbar">
          <h2>Your Dashboard</h2>
          <Link to="/write" className="btn btn-primary" style={{ padding: '9px 16px', fontSize: 13.5 }}>+ New Post</Link>
        </div>
        {loading && <p className="muted">Loading…</p>}
        {!loading && posts.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: 48 }}>
            <p className="muted" style={{ marginBottom: 12 }}>No posts yet.</p>
            <Link to="/write" className="btn btn-primary">Write your first post</Link>
          </div>
        )}
        {posts.map((p) => (
          <div key={p._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: 17, marginBottom: 4 }}>{p.title}</h3>
              <p className="faint" style={{ fontSize: 13, margin: 0 }}>
                {p.status} · {new Date(p.updatedAt).toLocaleDateString()} · {p.viewsCount || 0} views
              </p>
            </div>
            {p.status === 'published' && (
              <Link to={`/post/${p.slug}`} style={{ color: '#C9C9FF', fontSize: 13 }}>View</Link>
            )}
          </div>
        ))}
      </div>
    </Layout>
  );
}
