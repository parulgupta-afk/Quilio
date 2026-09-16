import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import Layout from '../components/Layout';
import useAuthStore from '../store/authStore';

export default function Profile() {
  const { id } = useParams();
  const { user: currentUser, isAuthenticated } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const isOwnProfile = currentUser?._id === id;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get(`/users/${id}`);
        setProfile(data);
        const postsRes = await api.get('/posts');
        const userPosts = (postsRes.data.posts || []).filter(
          (p) => p.author?._id === id
        );
        setPosts(userPosts);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  const handleFollow = async () => {
    if (!isAuthenticated) return alert('Please login first');
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await api.delete(`/social/follow/${id}`);
        setIsFollowing(false);
        setProfile((p) => ({ ...p, followersCount: Math.max(0, p.followersCount - 1) }));
      } else {
        await api.post(`/social/follow/${id}`);
        setIsFollowing(true);
        setProfile((p) => ({ ...p, followersCount: p.followersCount + 1 }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '64px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading profile…
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '64px 24px', textAlign: 'center' }}>
          <p style={{ color: '#fca5a5' }}>User not found</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px 100px' }}>

        {/* Profile header card */}
        <div
          className="card ambient-glow"
          style={{ padding: '32px', marginBottom: 40 }}
        >
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
            {/* Avatar */}
            <div
              style={{
                width: 88, height: 88, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg,var(--accent-1),var(--accent-2))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 32, fontWeight: 700, color: '#fff', overflow: 'hidden',
              }}
            >
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt={profile.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                profile.name?.charAt(0)
              )}
            </div>

            {/* Info */}
            <div style={{ flex: 1 }}>
              <h1 className="serif" style={{ fontWeight: 500, fontSize: 28, margin: '0 0 6px', color: 'var(--text)' }}>
                {profile.name}
              </h1>
              {profile.bio && (
                <p style={{ color: 'var(--text-muted)', margin: '0 0 14px', fontSize: 14.5, maxWidth: 500 }}>
                  {profile.bio}
                </p>
              )}
              <div style={{ display: 'flex', gap: 24, fontSize: 13.5, color: 'var(--text-faint)' }}>
                <span>
                  <strong style={{ color: 'var(--text)' }}>{profile.followersCount}</strong>{' '}Followers
                </span>
                <span>
                  <strong style={{ color: 'var(--text)' }}>{profile.followingCount}</strong>{' '}Following
                </span>
                <span>
                  Joined {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>

            {/* Follow button */}
            {!isOwnProfile && isAuthenticated && (
              <button
                onClick={handleFollow}
                disabled={followLoading}
                className={`btn ${isFollowing ? 'btn-ghost' : 'btn-primary'}`}
                style={{ padding: '9px 20px', fontSize: 13.5 }}
              >
                {followLoading ? '…' : isFollowing ? 'Following' : 'Follow'}
              </button>
            )}
          </div>
        </div>

        {/* Posts */}
        <h2 className="serif" style={{ fontWeight: 500, fontSize: 22, margin: '0 0 20px' }}>Posts</h2>

        {posts.length === 0 ? (
          <p style={{ color: 'var(--text-faint)', fontSize: 14 }}>No published posts yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {posts.map((post) => (
              <Link
                key={post._id}
                to={`/post/${post.slug}`}
                className="card"
                style={{ display: 'block', padding: '18px 22px' }}
              >
                <h3 style={{ fontWeight: 500, fontSize: 17, color: 'var(--text)', margin: '0 0 6px' }}>
                  {post.title}
                </h3>
                <p style={{ fontSize: 13, color: 'var(--text-faint)', margin: 0 }}>
                  {new Date(post.createdAt).toLocaleDateString()} · {post.likesCount} likes · {post.commentsCount} comments
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
