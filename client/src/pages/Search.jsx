import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Layout from '../components/Layout';

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ posts: [], users: [] });
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (query.trim().length < 2) return;
    setLoading(true);
    setSearched(true);
    try {
      const { data } = await api.get(`/search?q=${encodeURIComponent(query)}`);
      setResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '48px 24px 100px' }}>
        <h1 className="serif" style={{ fontWeight: 500, fontSize: 30, margin: '0 0 32px' }}>Search</h1>

        <form onSubmit={handleSearch} style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search posts, tags, or users…"
              className="input"
              style={{ flex: 1 }}
            />
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ padding: '11px 22px', flexShrink: 0 }}
            >
              {loading ? 'Searching…' : 'Search'}
            </button>
          </div>
        </form>

        {searched && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
            {/* Users */}
            {results.users?.length > 0 && (
              <section>
                <h2 className="serif" style={{ fontWeight: 500, fontSize: 18, margin: '0 0 14px', color: 'var(--text-muted)' }}>
                  People
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {results.users.map((user) => (
                    <Link
                      key={user._id}
                      to={`/profile/${user._id}`}
                      className="card"
                      style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px' }}
                    >
                      <div
                        style={{
                          width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                          background: 'linear-gradient(135deg,var(--accent-1),var(--accent-2))',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 700, color: '#fff',
                        }}
                      >
                        {user.name?.charAt(0)}
                      </div>
                      <div>
                        <p style={{ fontWeight: 500, color: 'var(--text)', margin: '0 0 2px' }}>{user.name}</p>
                        <p style={{ fontSize: 12.5, color: 'var(--text-faint)', margin: 0 }}>
                          {user.followersCount} followers
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Posts */}
            <section>
              <h2 className="serif" style={{ fontWeight: 500, fontSize: 18, margin: '0 0 14px', color: 'var(--text-muted)' }}>
                Posts {results.posts?.length > 0 && `(${results.posts.length})`}
              </h2>

              {results.posts?.length === 0 ? (
                <p style={{ color: 'var(--text-faint)', fontSize: 14 }}>No posts found.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {results.posts.map((post) => (
                    <Link
                      key={post._id}
                      to={`/post/${post.slug}`}
                      className="card"
                      style={{ display: 'block', padding: '18px 22px' }}
                    >
                      <h3 style={{ fontWeight: 500, fontSize: 17, color: 'var(--text)', margin: '0 0 6px' }}>
                        {post.title}
                      </h3>
                      <p style={{ fontSize: 13, color: 'var(--text-faint)', margin: 0 }}>
                        by {post.author?.name} · {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </Layout>
  );
}
