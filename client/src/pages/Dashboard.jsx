import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Layout from '../components/Layout';

export default function Dashboard() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyPosts = async () => {
      try {
        const { data } = await api.get('/posts/me/all');
        setPosts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyPosts();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '64px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading your posts…
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px 100px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <h1 className="serif" style={{ fontWeight: 500, fontSize: 30, margin: 0 }}>Your Dashboard</h1>
          <Link to="/write" className="btn btn-primary" style={{ padding: '9px 18px', fontSize: 13.5 }}>
            + New Post
          </Link>
        </div>

        {posts.length === 0 ? (
          <div
            style={{
              textAlign: 'center', padding: '64px 24px',
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 16,
            }}
          >
            <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>You haven't written any posts yet.</p>
            <Link to="/write" style={{ color: '#C9C9FF', fontWeight: 500 }}>Write your first post →</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {posts.map((post) => (
              <div
                key={post._id}
                className="card"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px' }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <h2 style={{ fontWeight: 500, fontSize: 16, color: 'var(--text)', margin: 0 }}>{post.title}</h2>
                    <span
                      style={{
                        fontSize: 11, padding: '2px 8px', borderRadius: 100,
                        background: post.status === 'published' ? 'rgba(74,222,128,0.1)' : 'rgba(242,169,59,0.1)',
                        color: post.status === 'published' ? '#4ADE80' : 'var(--amber)',
                        fontWeight: 600,
                      }}
                    >
                      {post.status}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-faint)', margin: 0 }}>
                    Updated {new Date(post.updatedAt).toLocaleDateString()} · {post.viewsCount} views
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  {post.status === 'published' && (
                    <Link to={`/post/${post.slug}`} style={{ color: '#C9C9FF', fontSize: 13.5 }}>
                      View →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
