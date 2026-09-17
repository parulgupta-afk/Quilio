import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Layout from '../components/Layout';

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/notifications').then((r) => {
      setItems(r.data.notifications || []);
      setUnread(r.data.unreadCount || 0);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const markAll = async () => {
    await api.put('/notifications/read-all');
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnread(0);
  };

  return (
    <Layout>
      <div className="page">
        <div className="topbar">
          <h2>Notifications {unread > 0 && <span style={{ color: '#A855F7', fontSize: 16 }}>({unread})</span>}</h2>
          {unread > 0 && (
            <button onClick={markAll} className="btn btn-ghost" style={{ padding: '8px 12px', fontSize: 13 }}>Mark all read</button>
          )}
        </div>
        {loading && <p className="muted">Loading…</p>}
        {!loading && items.length === 0 && <p className="muted">No notifications yet.</p>}
        {items.map((n) => (
          <div key={n._id} className="card" style={{ opacity: n.read ? 0.7 : 1, borderColor: n.read ? undefined : 'rgba(99,102,241,0.3)' }}>
            <p style={{ color: '#F1F1F4', fontSize: 14, marginBottom: 4 }}>{n.message}</p>
            {n.post && <Link to={`/post/${n.post.slug}`} style={{ color: '#C9C9FF', fontSize: 13 }}>{n.post.title}</Link>}
            <p className="faint" style={{ fontSize: 12, marginTop: 6 }}>{new Date(n.createdAt).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </Layout>
  );
}
