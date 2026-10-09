import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import Layout from '../components/Layout';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const qParam = searchParams.get('q') || '';
  const [query, setQuery] = useState(qParam);
  const [results, setResults] = useState({ posts: [], users: [] });
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const performSearch = useCallback(async (q) => {
    if (!q || !q.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const { data } = await api.get(`/search?q=${encodeURIComponent(q.trim())}`);
      setResults(data);
    } catch (e) {
      console.error('Search error:', e);
      setResults({ posts: [], users: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (qParam && qParam.trim()) {
      setQuery(qParam);
      performSearch(qParam);
    }
  }, [qParam, performSearch]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query || !query.trim()) return;
    setSearchParams({ q: query.trim() });
    performSearch(query.trim());
  };

  return (
    <Layout>
      <div className="page">
        <h2 style={{ marginBottom: 24 }}>Search</h2>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, marginBottom: 32 }}>
          <input
            className="input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search posts or users…"
          />
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? '…' : 'Search'}
          </button>
        </form>
        {searched && (
          <>
            {results.users?.length > 0 && (
              <section style={{ marginBottom: 32 }}>
                <h3 className="serif" style={{ fontSize: 18, marginBottom: 12, color: '#F1F1F4' }}>
                  Users
                </h3>
                {results.users.map((u) => (
                  <Link
                    key={u._id}
                    to={`/profile/${u._id}`}
                    className="card"
                    style={{ display: 'flex', gap: 12, alignItems: 'center' }}
                  >
                    <div className="avatar">{u.name?.charAt(0)}</div>
                    <div>
                      <div style={{ color: '#F1F1F4', fontWeight: 500 }}>{u.name}</div>
                      <div className="faint" style={{ fontSize: 13 }}>
                        {u.followersCount || 0} followers
                      </div>
                    </div>
                  </Link>
                ))}
              </section>
            )}
            <section>
              <h3 className="serif" style={{ fontSize: 18, marginBottom: 12, color: '#F1F1F4' }}>
                Posts
              </h3>
              {results.posts?.length === 0 ? (
                <p className="muted">No posts found.</p>
              ) : (
                results.posts.map((p) => (
                  <Link
                    key={p._id}
                    to={`/post/${p.slug || p._id}`}
                    className="card"
                    style={{ display: 'block' }}
                  >
                    <h3 style={{ fontSize: 17 }}>{p.title}</h3>
                    <p className="faint" style={{ fontSize: 13, margin: 0 }}>
                      by {p.author?.name || 'Author'}
                    </p>
                  </Link>
                ))
              )}
            </section>
          </>
        )}
      </div>
    </Layout>
  );
}
