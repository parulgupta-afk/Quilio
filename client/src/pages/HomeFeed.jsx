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
        let data;
        if (isAuthenticated && feedType === 'for-you') {
          const res = await api.get('/recommend/feed');
          data = res.data;
        } else {
          const res = await api.get('/posts');
          data = res.data;
        }
        setPosts(data.posts || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [isAuthenticated, feedType]);

  return (
    <Layout>
      <div className="max-w-[700px] mx-auto px-6 py-9 pb-20">
        <div className="flex justify-between items-center mb-7">
          <h2 className="serif text-2xl font-medium m-0">
            {feedType === 'for-you' ? 'For you' : 'Latest'}
          </h2>
          {isAuthenticated && (
            <Link to="/write" className="btn btn-primary" style={{ padding: '9px 16px', fontSize: 13.5 }}>
              Write
            </Link>
          )}
        </div>

        {isAuthenticated && (
          <div className="flex gap-5 text-sm mb-6" style={{ color: 'var(--text-faint)', borderBottom: '1px solid var(--border)' }}>
            {['latest', 'for-you'].map((t) => (
              <button
                key={t}
                onClick={() => setFeedType(t)}
                className="pb-3 capitalize bg-transparent border-0 cursor-pointer text-sm"
                style={{
                  color: feedType === t ? 'var(--text)' : 'var(--text-faint)',
                  borderBottom: feedType === t ? '2px solid var(--accent-1)' : '2px solid transparent',
                }}
              >
                {t === 'for-you' ? 'For you' : 'Latest'}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <p className="text-center py-16" style={{ color: 'var(--text-muted)' }}>Loading posts...</p>
        ) : posts.length === 0 ? (
          <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
            <p className="mb-4">No posts yet.</p>
            {isAuthenticated && <Link to="/write" className="btn btn-primary">Write the first post</Link>}
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post, i) => (
              <article key={post._id} className={`card ${i === 0 ? 'ambient-glow' : ''}`}>
                <div className="flex items-center gap-2.5 mb-3">
                  <div
                    className="w-[26px] h-[26px] rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg,var(--accent-1),var(--accent-2))' }}
                  >
                    {post.author?.name?.charAt(0) || 'U'}
                  </div>
                  <span className="text-[13.5px]" style={{ color: 'var(--text-muted)' }}>
                    <b style={{ color: 'var(--text)', fontWeight: 500 }}>{post.author?.name}</b>
                    {' · '}{new Date(post.createdAt).toLocaleDateString()}
                  </span>
                  {i === 0 && <span className="ai-pill ml-auto">✦ Featured</span>}
                </div>
                <Link to={`/post/${post.slug}`}>
                  <h3 className="serif text-[21px] font-medium leading-snug m-0 mb-2 hover:opacity-80 transition">
                    {post.title}
                  </h3>
                </Link>
                <p className="text-[14.5px] leading-relaxed m-0 mb-4 line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                  {post.excerpt || post.content?.substring(0, 160)}
                </p>
                {post.tags?.length > 0 && (
                  <div className="flex gap-2 mb-4 flex-wrap">
                    {post.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="chip">{tag}</span>
                    ))}
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <div className="flex gap-4 text-[13px]" style={{ color: 'var(--text-faint)' }}>
                    <span>❤ {post.likesCount || 0}</span>
                    <span>💬 {post.commentsCount || 0}</span>
                  </div>
                  <Link to={`/post/${post.slug}`} className="ai-pill" style={{ color: '#C9C9FF', background: 'rgba(99,102,241,0.15)' }}>
                    Ask AI →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
