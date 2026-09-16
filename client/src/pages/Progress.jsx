import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Layout from '../components/Layout';

export default function Progress() {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const { data } = await api.get('/learn/progress/me');
        setAttempts(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div style={{ maxWidth: 700, margin: '0 auto', padding: '64px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading your progress…
        </div>
      </Layout>
    );
  }

  const avgScore =
    attempts.length > 0
      ? Math.round(attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length)
      : 0;

  const scoreColor = (pct) => {
    if (pct >= 70) return '#4ADE80';
    if (pct >= 40) return 'var(--amber)';
    return '#fca5a5';
  };

  return (
    <Layout>
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '48px 24px 100px' }}>
        {/* Header */}
        <h1 className="serif" style={{ fontWeight: 500, fontSize: 30, margin: '0 0 6px' }}>
          Learning Progress
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14.5, marginBottom: 36 }}>
          Track how well you're learning from posts
        </p>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 40 }}>
          <div className="card" style={{ textAlign: 'center', padding: '24px' }}>
            <p
              style={{
                fontSize: 42, fontWeight: 700, margin: '0 0 6px',
                background: 'linear-gradient(135deg,var(--accent-1),var(--accent-2))',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}
            >
              {attempts.length}
            </p>
            <p style={{ fontSize: 13.5, color: 'var(--text-faint)', margin: 0 }}>Quizzes taken</p>
          </div>
          <div className="card" style={{ textAlign: 'center', padding: '24px' }}>
            <p
              style={{
                fontSize: 42, fontWeight: 700, margin: '0 0 6px',
                background: 'linear-gradient(135deg,var(--accent-1),var(--accent-2))',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}
            >
              {avgScore}%
            </p>
            <p style={{ fontSize: 13.5, color: 'var(--text-faint)', margin: 0 }}>Average score</p>
          </div>
        </div>

        {attempts.length === 0 ? (
          <div
            className="card"
            style={{ textAlign: 'center', padding: '64px 24px' }}
          >
            <p style={{ color: 'var(--text-muted)', marginBottom: 16, fontSize: 14.5 }}>
              You haven't taken any quizzes yet.
            </p>
            <Link to="/" style={{ color: '#C9C9FF', fontWeight: 500 }}>
              Explore posts and click "Learn This" →
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {attempts.map((attempt) => (
              <div
                key={attempt._id}
                className="card"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 22px' }}
              >
                <div>
                  <Link
                    to={attempt.post ? `/post/${attempt.post.slug}` : '#'}
                    style={{ fontWeight: 500, color: 'var(--text)', fontSize: 15 }}
                  >
                    {attempt.post?.title || 'Unknown post'}
                  </Link>
                  <p style={{ fontSize: 13, color: 'var(--text-faint)', margin: '4px 0 0' }}>
                    {new Date(attempt.createdAt).toLocaleDateString()} · {attempt.score}/{attempt.totalQuestions} correct
                  </p>
                </div>
                <div
                  style={{
                    fontSize: 22, fontWeight: 700,
                    color: scoreColor(attempt.percentage),
                  }}
                >
                  {attempt.percentage}%
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
