import { useEffect, useState } from 'react';
import api from '../services/api';

/**
 * Owner-only revision list with restore.
 */
export default function PostRevisions({ postId }) {
  const [revisions, setRevisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get(`/posts/${postId}/revisions`);
      setRevisions(data.revisions || []);
    } catch (e) {
      setError(e.response?.data?.message || 'Could not load revisions');
      setRevisions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (postId) load();
  }, [postId]);

  const restore = async (revisionId) => {
    if (!window.confirm('Restore this revision? Your current text will be saved as a new revision first.')) return;
    setBusyId(revisionId);
    try {
      await api.post(`/posts/${postId}/revisions/${revisionId}/restore`);
      await load();
      window.location.reload();
    } catch (e) {
      alert(e.response?.data?.message || 'Restore failed');
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <p style={{ color: '#908fa0', fontSize: 13 }}>Loading history…</p>;
  if (error) return <p style={{ color: '#f87171', fontSize: 13 }}>{error}</p>;
  if (!revisions.length) {
    return <p style={{ color: '#908fa0', fontSize: 13 }}>No revisions yet. Edit the post to create history.</p>;
  }

  return (
    <div style={{ marginTop: 24, padding: 16, borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 15, color: '#e2e2e9' }}>Version history</h3>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {revisions.map((r) => (
          <li key={r._id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 13, color: '#c7c4d7' }}>
                r{r.revisionNumber} · {r.title?.slice(0, 48)}
              </div>
              <div style={{ fontSize: 11, color: '#71717a' }}>
                {r.editor?.name || 'Editor'} · {new Date(r.createdAt).toLocaleString()}
                {r.note ? ` · ${r.note}` : ''}
              </div>
            </div>
            <button
              type="button"
              disabled={busyId === r._id}
              onClick={() => restore(r._id)}
              style={{
                padding: '6px 12px',
                borderRadius: 8,
                border: '1px solid rgba(165,180,252,0.35)',
                background: 'rgba(99,102,241,0.15)',
                color: '#c7d2fe',
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              {busyId === r._id ? '…' : 'Restore'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
