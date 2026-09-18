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
      setLoading(true);
      try {
        const { data } = await api.get(`/users/${id}`);
        setProfile(data);
        const postsRes = await api.get(`/posts/author/${id}`);
        setPosts(postsRes.data.posts || []);
      } catch (e) {
        console.error(e);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const toggleFollow = async () => {
    if (!isAuthenticated) return alert('Login first');
    try {
      if (following) {
        await api.delete(`/social/follow/${id}`);
        setFollowing(false);
        setProfile((p) => ({
          ...p,
          followersCount: Math.max(0, (p.followersCount || 1) - 1),
        }));
      } else {
        await api.post(`/social/follow/${id}`);
        setFollowing(true);
        setProfile((p) => ({
          ...p,
          followersCount: (p.followersCount || 0) + 1,
        }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="page muted">Loading profile…</div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="page" style={{ color: '#fca5a5' }}>
          User not found
          <br />
          <Link to="/home" style={{ color: '#C9C9FF' }}>
            ← Home
          </Link>
        </div>
      </Layout>
    );
  }

  const isSelf = me?._id === id;

  return (
    <Layout>
      <div className="page">
        <div
          className="card"
          style={{
            display: 'flex',
            gap: 20,
            alignItems: 'center',
            marginBottom: 32,
            flexWrap: 'wrap',
          }}
        >
          <div className="avatar" style={{ width: 72, height: 72, fontSize: 28 }}>
            {profile.name?.charAt(0)}
          </div>
          <div style={{ flex: 1, minWidth: 180 }}>
            <h1 className="serif" style={{ fontSize: 28, marginBottom: 6, color: '#F1F1F4' }}>
              {profile.name}
            </h1>
            {profile.bio && (
              <p className="muted" style={{ marginBottom: 8 }}>
                {profile.bio}
              </p>
            )}
            <p className="faint" style={{ fontSize: 13 }}>
              {profile.followersCount || 0} followers · {profile.followingCount || 0} following ·{' '}
              {posts.length} posts
            </p>
            {profile.createdAt && (
              <p className="faint" style={{ fontSize: 12, marginTop: 4 }}>
                Joined {new Date(profile.createdAt).toLocaleDateString()}
              </p>
            )}
          </div>
          {isAuthenticated && !isSelf && (
            <button
              onClick={toggleFollow}
              className={following ? 'btn btn-ghost' : 'btn btn-primary'}
            >
              {following ? 'Following' : 'Follow'}
            </button>
          )}
          {isSelf && (
            <Link to="/dashboard" className="btn btn-ghost" style={{ padding: '9px 14px' }}>
              Dashboard
            </Link>
          )}
        </div>

        <h2 className="serif" style={{ fontSize: 20, marginBottom: 16, color: '#F1F1F4' }}>
          Posts
        </h2>

        {posts.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 40 }}>
            <p className="muted" style={{ marginBottom: 12 }}>
              No published posts yet.
            </p>
            {isSelf && (
              <Link to="/write" className="btn btn-primary">
                Write a post
              </Link>
            )}
          </div>
        ) : (
          posts.map((p) => {
            const href = p.slug ? `/post/${p.slug}` : `/post/${p._id}`;
            const excerpt = (p.excerpt || p.content || '')
              .replace(/#{1,6}\s*/g, '')
              .replace(/\n+/g, ' ')
              .substring(0, 140);
            return (
              <Link key={p._id} to={href} className="card" style={{ display: 'block' }}>
                <h3 style={{ fontSize: 18, marginBottom: 8 }}>{p.title}</h3>
                <p className="ex" style={{ marginBottom: 10 }}>
                  {excerpt}
                  {excerpt.length >= 140 ? '…' : ''}
                </p>
                <p className="faint" style={{ fontSize: 13, margin: 0 }}>
                  {new Date(p.createdAt).toLocaleDateString()} · ❤ {p.likesCount || 0} · 💬{' '}
                  {p.commentsCount || 0} · {p.viewsCount || 0} views
                </p>
              </Link>
            );
          })
        )}
      </div>
    </Layout>
  );
}
