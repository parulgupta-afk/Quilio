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
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  return (
    <Layout>
      <div className="page">
        <h2 style={{ marginBottom: 24 }}>Search</h2>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, marginBottom: 32 }}>
          <input className="input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search posts or users…" />
          <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? '…' : 'Search'}</button>
        </form>
        {searched && (
          <>
            {results.users?.length > 0 && (
              <section style={{ marginBottom: 32 }}>
                <h3 className="serif" style={{ fontSize: 18, marginBottom: 12, color: '#F1F1F4' }}>Users</h3>
                {results.users.map((u) => (
                  <Link key={u._id} to={`/profile/${u._id}`} className="card" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div className="avatar">{u.name?.charAt(0)}</div>
                    <div>
                      <div style={{ color: '#F1F1F4', fontWeight: 500 }}>{u.name}</div>
                      <div className="faint" style={{ fontSize: 13 }}>{u.followersCount || 0} followers</div>
                    </div>
                  </Link>
                ))}
              </section>
            )}
            <section>
              <h3 className="serif" style={{ fontSize: 18, marginBottom: 12, color: '#F1F1F4' }}>Posts</h3>
              {results.posts?.length === 0 ? (
                <p className="muted">No posts found.</p>
              ) : results.posts.map((p) => (
                <Link key={p._id} to={`/post/${p.slug}`} className="card" style={{ display: 'block' }}>
                  <h3 style={{ fontSize: 17 }}>{p.title}</h3>
                  <p className="faint" style={{ fontSize: 13, margin: 0 }}>by {p.author?.name}</p>
                </Link>
              ))}
            </section>
          </>
        )}
      </div>
    </Layout>
  );
}
