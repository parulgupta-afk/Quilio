import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import useAuthStore from '../store/authStore';
import Layout from '../components/Layout';

export default function Profile() {
  const { id } = useParams();
  const { user: me, isAuthenticated } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/users/${id}`);
        setProfile(data);
        const feed = await api.get('/posts');
        setPosts((feed.data.posts || []).filter((p) => p.author?._id === id));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  const toggleFollow = async () => {
    if (!isAuthenticated) return alert('Login first');
    try {
      if (following) {
        await api.delete(`/social/follow/${id}`);
        setFollowing(false);
        setProfile((p) => ({ ...p, followersCount: Math.max(0, (p.followersCount || 1) - 1) }));
      } else {
        await api.post(`/social/follow/${id}`);
        setFollowing(true);
        setProfile((p) => ({ ...p, followersCount: (p.followersCount || 0) + 1 }));
      }
    } catch (e) { console.error(e); }
  };

  if (loading) return <Layout><div className="page muted">Loading…</div></Layout>;
  if (!profile) return <Layout><div className="page" style={{ color: '#fca5a5' }}>User not found</div></Layout>;

  return (
    <Layout>
      <div className="page">
        <div className="card" style={{ display: 'flex', gap: 20, alignItems: 'center', marginBottom: 32 }}>
          <div className="avatar" style={{ width: 72, height: 72, fontSize: 28 }}>{profile.name?.charAt(0)}</div>
          <div style={{ flex: 1 }}>
            <h1 className="serif" style={{ fontSize: 28, marginBottom: 6, color: '#F1F1F4' }}>{profile.name}</h1>
            {profile.bio && <p className="muted" style={{ marginBottom: 8 }}>{profile.bio}</p>}
            <p className="faint" style={{ fontSize: 13 }}>
              {profile.followersCount || 0} followers · {profile.followingCount || 0} following
            </p>
          </div>
          {isAuthenticated && me?._id !== id && (
            <button onClick={toggleFollow} className={following ? 'btn btn-ghost' : 'btn btn-primary'}>
              {following ? 'Following' : 'Follow'}
            </button>
          )}
        </div>
        <h2 className="serif" style={{ fontSize: 20, marginBottom: 16, color: '#F1F1F4' }}>Posts</h2>
        {posts.length === 0 ? <p className="muted">No published posts.</p> : posts.map((p) => (
          <Link key={p._id} to={`/post/${p.slug}`} className="card" style={{ display: 'block' }}>
            <h3 style={{ fontSize: 17 }}>{p.title}</h3>
            <p className="faint" style={{ fontSize: 13, margin: 0 }}>{new Date(p.createdAt).toLocaleDateString()}</p>
          </Link>
        ))}
      </div>
    </Layout>
  );
}
