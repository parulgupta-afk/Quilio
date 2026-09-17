import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Layout from '../components/Layout';

export default function Progress() {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api.get('/learn/progress/me').then((r) => setAttempts(r.data || [])).catch(console.error).finally(() => setLoading(false));
  }, []);
  const avg = attempts.length ? Math.round(attempts.reduce((s, a) => s + a.percentage, 0) / attempts.length) : 0;

  return (
    <Layout>
      <div className="page">
        <h2 style={{ marginBottom: 8 }}>Learning Progress</h2>
        <p className="muted" style={{ marginBottom: 28 }}>Track quizzes you've taken</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 32 }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#A855F7' }}>{attempts.length}</div>
            <div className="faint" style={{ fontSize: 13 }}>Quizzes</div>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#A855F7' }}>{avg}%</div>
            <div className="faint" style={{ fontSize: 13 }}>Average</div>
          </div>
        </div>
        {loading && <p className="muted">Loading…</p>}
        {!loading && attempts.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: 40 }}>
            <p className="muted">No quizzes yet. Open a post and click Learn This.</p>
          </div>
        )}
        {attempts.map((a) => (
          <div key={a._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Link to={a.post ? `/post/${a.post.slug}` : '#'} style={{ color: '#F1F1F4', fontWeight: 500 }}>
                {a.post?.title || 'Post'}
              </Link>
              <p className="faint" style={{ fontSize: 13, margin: '4px 0 0' }}>
                {new Date(a.createdAt).toLocaleDateString()} · {a.score}/{a.totalQuestions}
              </p>
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: a.percentage >= 70 ? '#4ADE80' : '#F2A93B' }}>
              {a.percentage}%
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}
