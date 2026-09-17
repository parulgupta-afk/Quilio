import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function SimilarPosts({ postId }) {
  const [posts, setPosts] = useState([]);
  useEffect(() => {
    if (!postId) return;
    api.get(`/recommend/similar/${postId}?limit=4`)
      .then((r) => setPosts(r.data.posts || []))
      .catch(() => {});
  }, [postId]);
  if (!posts.length) return null;
  return (
    <section style={{ marginTop: 48, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 32 }}>
      <h2 className="serif" style={{ fontSize: 20, marginBottom: 20, color: '#F1F1F4' }}>Similar Posts</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {posts.map((p) => (
          <Link key={p._id} to={`/post/${p.slug}`} className="card" style={{ marginBottom: 0 }}>
            <h3 style={{ fontSize: 16 }}>{p.title}</h3>
            <p className="muted" style={{ fontSize: 13, margin: 0 }}>{p.author?.name}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
