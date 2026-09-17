import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import useAuthStore from '../store/authStore';
import Layout from '../components/Layout';

export default function HomeFeed() {
  const { isAuthenticated } = useAuthStore();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedType, setFeedType] = useState('latest');

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const res =
          isAuthenticated && feedType === 'for-you'
            ? await api.get('/recommend/feed')
            : await api.get('/posts');
        setPosts(res.data.posts || []);
      } catch (err) {
        console.error(err);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [isAuthenticated, feedType]);

  return (
    <Layout>
      <div className="page">
        <div className="topbar">
          <h2>{feedType === 'for-you' ? 'For you' : 'Latest'}</h2>
          {isAuthenticated ? (
            <Link to="/write" className="btn btn-primary" style={{ padding: '9px 16px', fontSize: 13.5 }}>
              Write
            </Link>
          ) : (
            <Link to="/register" className="btn btn-primary" style={{ padding: '9px 16px', fontSize: 13.5 }}>
              Get started
            </Link>
          )}
        </div>

        {isAuthenticated && (
          <div className="tabs">
            <button className={feedType === 'latest' ? 'on' : ''} onClick={() => setFeedType('latest')}>
              Latest
            </button>
            <button className={feedType === 'for-you' ? 'on' : ''} onClick={() => setFeedType('for-you')}>
              For you
            </button>
          </div>
        )}

        {loading && (
          <p className="text-center muted" style={{ padding: '64px 0' }}>
            Loading posts…
          </p>
        )}

        {!loading && posts.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: 48 }}>
            <p className="muted" style={{ marginBottom: 16 }}>No posts yet.</p>
            {isAuthenticated && (
              <Link to="/write" className="btn btn-primary">Write the first post</Link>
            )}
          </div>
        )}

        {!loading &&
          posts.map((post, i) => (
            <article key={post._id} className={`card ${i === 0 ? 'ambient-glow' : ''}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div className="avatar">{post.author?.name?.charAt(0) || 'U'}</div>
                <span className="muted" style={{ fontSize: 13.5 }}>
                  <b style={{ color: '#F1F1F4', fontWeight: 500 }}>{post.author?.name || 'Unknown'}</b>
                  {' · '}
                  {new Date(post.createdAt).toLocaleDateString()}
                </span>
                {i === 0 && <span className="ai-pill" style={{ marginLeft: 'auto' }}>✦ Featured</span>}
              </div>

              <Link to={`/post/${post.slug}`}>
                <h3>{post.title}</h3>
              </Link>

              <p className="ex">
                {post.excerpt || (post.content || '').substring(0, 160)}
              </p>

              {post.tags?.length > 0 && (
                <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                  {post.tags.slice(0, 4).map((tag) => (
                    <span key={tag} className="chip">{tag}</span>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 18, color: '#5A6076', fontSize: 13 }}>
                  <span>❤ {post.likesCount || 0}</span>
                  <span>💬 {post.commentsCount || 0}</span>
                </div>
                <Link
                  to={`/post/${post.slug}`}
                  className="ai-pill"
                  style={{ color: '#C9C9FF', background: 'rgba(99,102,241,0.15)' }}
                >
                  Ask AI →
                </Link>
              </div>
            </article>
          ))}
      </div>
    </Layout>
  );
}
