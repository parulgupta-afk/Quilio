import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import useAuthStore from '../store/authStore';
import WorkspaceShell from '../components/workspace/WorkspaceShell';

export default function HomeFeed() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
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
        setPosts(res.data.posts || res.data || []);
      } catch {
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [isAuthenticated, feedType]);

  const list = Array.isArray(posts) ? posts : [];

  return (
    <WorkspaceShell
      title="Home"
      subtitle="Read, ask AI, and learn from the feed"
      actions={
        <>
          <Link to="/search" className="ag-btn-ghost">
            Search
          </Link>
          <Link to="/write" className="ag-btn-primary">
            + New post
          </Link>
        </>
      }
    >
      {/* Feed tabs */}
      <div className="ag-meta-row home-feed-tabs">
        <button
          type="button"
          className={`ag-chip ${feedType === 'for-you' ? 'strong' : ''}`}
          onClick={() => setFeedType('for-you')}
        >
          For You
        </button>
        <button
          type="button"
          className={`ag-chip ${feedType === 'latest' ? 'strong' : ''}`}
          onClick={() => setFeedType('latest')}
        >
          Latest
        </button>
        <span className="ag-chip">READ → ASK AI → LEARN</span>
      </div>

      {loading && <p className="ag-muted">Loading feed…</p>}

      {!loading && list.length === 0 && (
        <div className="ag-empty">
          <p>No posts in the feed yet.</p>
          <Link to="/write" className="ag-btn-primary">
            Write the first post
          </Link>
          <p className="ag-muted" style={{ marginTop: 12 }}>
            Or open <Link to="/dashboard" className="ag-card-action">Dashboard</Link> to manage your workspace.
          </p>
        </div>
      )}

      <div className="ag-list home-feed-list">
        {list.map((post) => {
          const href = post.slug ? `/post/${post.slug}` : `/post/${post._id}`;
          const excerpt = (post.excerpt || post.content || '')
            .replace(/#{1,6}\s*/g, '')
            .replace(/\n+/g, ' ')
            .trim()
            .slice(0, 160);

          return (
            <article
              key={post._id}
              className="ag-card home-feed-card"
              onClick={() => navigate(href)}
              role="link"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter') navigate(href);
              }}
            >
              <div className="ag-card-icon home-feed-avatar">
                {(post.author?.name || 'U').charAt(0)}
              </div>
              <div className="ag-card-body">
                <div className="home-feed-author">
                  <strong>{post.author?.name || 'Author'}</strong>
                  <span className="ag-muted">
                    · {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : ''}
                  </span>
                </div>
                <p className="ag-card-title">{post.title}</p>
                {excerpt && (
                  <p className="home-feed-excerpt">
                    {excerpt}
                    {excerpt.length >= 160 ? '…' : ''}
                  </p>
                )}
                <div className="ag-card-meta">
                  <span>❤ {post.likesCount || 0}</span>
                  <span>·</span>
                  <span>💬 {post.commentsCount || 0}</span>
                  {post.tags?.slice(0, 3).map((t) => (
                    <span key={t}>#{t}</span>
                  ))}
                </div>
              </div>
              <Link
                to={href}
                className="ag-card-action"
                onClick={(e) => e.stopPropagation()}
              >
                Open
              </Link>
            </article>
          );
        })}
      </div>
    </WorkspaceShell>
  );
}
