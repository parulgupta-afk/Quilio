import { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import useAuthStore from '../store/authStore';
import Layout from '../components/Layout';
import AvatarPicker from '../components/AvatarPicker';
import UserAvatar from '../components/UserAvatar';
import EditProfileModal from '../components/EditProfileModal';
import AvatarCircles from '../components/AvatarCircles';

export default function Profile() {
  const { id } = useParams();
  const { user: me, isAuthenticated, logout, updateUser } = useAuthStore();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/users/${id}`);
        setProfile(data);
        const postsRes = await api.get(`/posts/author/${id}`);
        setPosts(postsRes.data.posts || postsRes.data || []);
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

  const applyUserUpdate = (updated) => {
    setProfile((p) => ({
      ...p,
      name: updated.name ?? p?.name,
      bio: updated.bio ?? p?.bio,
      avatarUrl: updated.avatarUrl ?? p?.avatarUrl,
    }));
    if (me?._id === updated._id || me?._id === id) {
      updateUser?.({
        avatarUrl: updated.avatarUrl,
        name: updated.name,
        bio: updated.bio,
      });
    }
  };

  const authorCircles = useMemo(() => {
    // Show unique co-authors / self from posts for social proof strip
    const map = new Map();
    for (const p of posts) {
      const a = p.author;
      if (!a?._id) continue;
      if (!map.has(a._id)) {
        map.set(a._id, {
          imageUrl: a.avatarUrl,
          name: a.name,
          profileUrl: `/profile/${a._id}`,
        });
      }
    }
    // Always include profile user
    if (profile) {
      map.set(profile._id || id, {
        imageUrl: profile.avatarUrl,
        name: profile.name,
        profileUrl: `/profile/${id}`,
      });
    }
    return [...map.values()].slice(0, 5);
  }, [posts, profile, id]);

  if (loading) {
    return (
      <Layout>
        <div className="qp-page">
          <p className="qp-muted">Loading profile…</p>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="qp-page">
          <div className="qp-empty">
            <h2>User not found</h2>
            <Link to="/home" className="qp-btn ghost">
              ← Back home
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const isSelf = me?._id === id;
  const joined = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString(undefined, {
        month: 'short',
        year: 'numeric',
      })
    : null;

  return (
    <Layout>
      <div className="qp-page">
        <section className="qp-hero">
          <div className="qp-cover" aria-hidden />
          <div className="qp-identity">
            <div className="qp-avatar-block">
              <div className="qp-avatar-ring">
                <UserAvatar
                  src={profile.avatarUrl}
                  name={profile.name}
                  size={96}
                  onClick={isSelf ? () => setPickerOpen(true) : undefined}
                  title={isSelf ? 'Change avatar' : profile.name}
                />
              </div>
              {isSelf && (
                <button type="button" className="qp-avatar-edit" onClick={() => setPickerOpen(true)}>
                  Change photo
                </button>
              )}
            </div>

            <div className="qp-info">
              <h1 className="qp-name">{profile.name}</h1>
              {profile.bio ? (
                <p className="qp-bio">{profile.bio}</p>
              ) : isSelf ? (
                <p className="qp-bio qp-bio-empty">
                  Add a short bio so others know what you write about.
                </p>
              ) : null}

              <div className="qp-stats">
                <div>
                  <strong>{profile.followersCount || 0}</strong>
                  <span>Followers</span>
                </div>
                <div>
                  <strong>{profile.followingCount || 0}</strong>
                  <span>Following</span>
                </div>
                <div>
                  <strong>{posts.length}</strong>
                  <span>Posts</span>
                </div>
                {joined && (
                  <div>
                    <strong>{joined}</strong>
                    <span>Joined</span>
                  </div>
                )}
              </div>

              {authorCircles.length > 0 && (
                <div className="qp-circles-row">
                  <AvatarCircles
                    avatarUrls={authorCircles}
                    numPeople={Math.max(0, (profile.followersCount || 0) - authorCircles.length)}
                    size={32}
                  />
                  <span className="qp-circles-label">
                    {(profile.followersCount || 0) > 0
                      ? 'Followers & network'
                      : 'Scholar on Quilio'}
                  </span>
                </div>
              )}
            </div>

            <div className="qp-actions">
              {isAuthenticated && !isSelf && (
                <button
                  type="button"
                  className={`qp-btn ${following ? 'ghost' : 'primary'}`}
                  onClick={toggleFollow}
                >
                  {following ? 'Following' : 'Follow'}
                </button>
              )}
              {isSelf && (
                <>
                  <button type="button" className="qp-btn primary" onClick={() => setEditOpen(true)}>
                    Edit profile
                  </button>
                  <Link to="/dashboard" className="qp-btn ghost">
                    Dashboard
                  </Link>
                  <Link to="/write" className="qp-btn ghost">
                    Write
                  </Link>
                  <button
                    type="button"
                    className="qp-btn danger"
                    onClick={() => {
                      logout();
                      navigate('/login');
                    }}
                  >
                    Log out
                  </button>
                </>
              )}
            </div>
          </div>
        </section>

        <section className="qp-posts">
          <div className="qp-posts-head">
            <h2>Published posts</h2>
            <span className="qp-muted">{posts.length} total</span>
          </div>

          {posts.length === 0 ? (
            <div className="qp-empty-card">
              <p>No published posts yet.</p>
              {isSelf && (
                <Link to="/write" className="qp-btn primary">
                  Write your first post
                </Link>
              )}
            </div>
          ) : (
            <div className="qp-post-grid">
              {posts.map((p) => {
                const href = p.slug ? `/post/${p.slug}` : `/post/${p._id}`;
                const excerpt = (p.excerpt || p.content || '')
                  .replace(/#{1,6}\s*/g, '')
                  .replace(/<[^>]+>/g, ' ')
                  .replace(/\n+/g, ' ')
                  .trim()
                  .slice(0, 130);
                return (
                  <Link key={p._id} to={href} className="qp-post-card">
                    {p.coverImageUrl ? (
                      <div className="qp-post-cover">
                        <img src={p.coverImageUrl} alt="" loading="lazy" />
                      </div>
                    ) : (
                      <div className="qp-post-cover qp-post-cover-fallback">
                        <span>{(p.title || 'Q').charAt(0)}</span>
                      </div>
                    )}
                    <div className="qp-post-body">
                      <h3>{p.title}</h3>
                      {excerpt && (
                        <p>
                          {excerpt}
                          {excerpt.length >= 130 ? '…' : ''}
                        </p>
                      )}
                      <div className="qp-post-meta">
                        <span>
                          {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : ''}
                        </span>
                        <span>♥ {p.likesCount || 0}</span>
                        <span>💬 {p.commentsCount || 0}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {isSelf && (
        <>
          <EditProfileModal
            open={editOpen}
            onClose={() => setEditOpen(false)}
            initial={{
              name: profile.name,
              email: profile.email || me?.email,
              bio: profile.bio || '',
              avatarUrl: profile.avatarUrl || '',
            }}
            onSaved={applyUserUpdate}
            onChangeAvatar={() => {
              setEditOpen(false);
              setPickerOpen(true);
            }}
          />
          <AvatarPicker
            open={pickerOpen}
            onClose={() => setPickerOpen(false)}
            currentAvatar={profile.avatarUrl || ''}
            userName={profile.name}
            onSaved={(updated) => {
              applyUserUpdate(updated);
              // Re-open edit modal optionally — keep closed after avatar save
            }}
          />
        </>
      )}
    </Layout>
  );
}
