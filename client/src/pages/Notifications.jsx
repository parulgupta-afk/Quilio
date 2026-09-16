import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Layout from '../components/Layout';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '64px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading notifications…
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '48px 24px 100px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <h1 className="serif" style={{ fontWeight: 500, fontSize: 28, margin: 0 }}>
            Notifications{' '}
            {unreadCount > 0 && (
              <span className="ai-pill" style={{ fontSize: 13, verticalAlign: 'middle', marginLeft: 8 }}>
                {unreadCount}
              </span>
            )}
          </h1>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13.5, color: '#C9C9FF' }}
            >
              Mark all as read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-faint)', paddingTop: 64 }}>
            No notifications yet.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {notifications.map((n) => (
              <div
                key={n._id}
                onClick={() => !n.read && markRead(n._id)}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 14,
                  padding: '14px 18px', borderRadius: 12, cursor: 'pointer',
                  background: n.read ? 'var(--bg-card)' : 'rgba(99,102,241,0.08)',
                  border: `1px solid ${n.read ? 'var(--border)' : 'rgba(99,102,241,0.2)'}`,
                  transition: 'all 0.15s',
                }}
              >
                <div
                  style={{
                    width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(135deg,var(--accent-1),var(--accent-2))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 600, fontSize: 14, color: '#fff',
                  }}
                >
                  {n.sender?.name?.charAt(0) || '?'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: '0 0 4px' }}>{n.message}</p>
                  {n.post && (
                    <Link
                      to={`/post/${n.post.slug}`}
                      onClick={(e) => e.stopPropagation()}
                      style={{ fontSize: 13, color: '#C9C9FF', display: 'inline-block', marginBottom: 4 }}
                    >
                      {n.post.title}
                    </Link>
                  )}
                  <p style={{ fontSize: 12, color: 'var(--text-faint)', margin: 0 }}>
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
                {!n.read && (
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-1)', marginTop: 6, flexShrink: 0 }} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
