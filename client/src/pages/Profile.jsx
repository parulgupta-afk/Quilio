import { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import useAuthStore from '../store/authStore';
import Layout from '../components/Layout';
import AvatarPicker from '../components/AvatarPicker';
import EditProfileModal from '../components/EditProfileModal';
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileTabs from '../components/profile/ProfileTabs';
import ProfilePostCard from '../components/profile/ProfilePostCard';
import ProfileEmptyState from '../components/profile/ProfileEmptyState';
import ProfileSkeleton from '../components/profile/ProfileSkeleton';

export default function Profile() {
  const { id } = useParams();
  const { user: me, isAuthenticated, logout, updateUser } = useAuthStore();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postsError, setPostsError] = useState(false);
  const [following, setFollowing] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [tab, setTab] = useState('posts');

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setPostsError(false);
      try {
        const { data } = await api.get(`/users/${id}`);
        if (!alive) return;
        setProfile(data);
        if (data.isFollowing !== undefined) {
          setFollowing(!!data.isFollowing);
        }
        try {
          const postsRes = await api.get(`/posts/author/${id}`);
          if (!alive) return;
          setPosts(postsRes.data.posts || postsRes.data || []);
        } catch {
          if (alive) {
            setPosts([]);
            setPostsError(true);
          }
        }
      } catch {
        if (alive) setProfile(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
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
      if (e.response?.data?.message === 'Already following this user') {
        setFollowing(true);
      } else if (e.response?.data?.message === 'Not following this user') {
        setFollowing(false);
      }
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

  const circles = useMemo(() => {
    if (!profile) return [];
    return [
      {
        imageUrl: profile.avatarUrl,
        name: profile.name,
        profileUrl: `/profile/${id}`,
      },
    ];
  }, [profile, id]);

  if (loading) {
    return (
      <Layout>
        <div className="profile-layout">
          <ProfileSkeleton />
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="profile-layout">
          <div className="profile-notfound">
            <h2>User not found</h2>
            <p>This profile may have been removed.</p>
            <Link to="/home">← Back home</Link>
          </div>
        </div>
      </Layout>
    );
  }

  const isSelf = me?._id === id;

  return (
    <Layout>
      <div className="profile-layout">
        <ProfileHeader
          profile={profile}
          isSelf={isSelf}
          isAuthenticated={isAuthenticated}
          following={following}
          onFollow={toggleFollow}
          onEdit={() => setEditOpen(true)}
          onAvatar={() => setPickerOpen(true)}
          onAvatarSaved={applyUserUpdate}
          onLogout={() => {
            logout();
            navigate('/login');
          }}
          postCount={posts.length}
          circles={circles}
        />

        <ProfileTabs active={tab} onChange={setTab} postCount={posts.length} />

        <div className="profile-body">
          {tab === 'posts' && (
            <>
              {postsError && (
                <p className="profile-warn">Couldn’t load posts. Try refreshing.</p>
              )}
              {posts.length === 0 ? (
                <ProfileEmptyState isSelf={isSelf} />
              ) : (
                <div className="profile-posts-grid">
                  {posts.map((p) => (
                    <ProfilePostCard key={p._id} post={p} />
                  ))}
                </div>
              )}
            </>
          )}

          {tab === 'about' && (
            <div className="profile-about">
              <h3>About</h3>
              <p>
                {profile.bio ||
                  (isSelf
                    ? 'No bio yet. Use Edit profile to introduce yourself.'
                    : 'No bio shared yet.')}
              </p>
              <dl>
                <div>
                  <dt>Posts</dt>
                  <dd>{posts.length}</dd>
                </div>
                <div>
                  <dt>Followers</dt>
                  <dd>{profile.followersCount || 0}</dd>
                </div>
                <div>
                  <dt>Following</dt>
                  <dd>{profile.followingCount || 0}</dd>
                </div>
                {profile.createdAt && (
                  <div>
                    <dt>Joined</dt>
                    <dd>{new Date(profile.createdAt).toLocaleDateString()}</dd>
                  </div>
                )}
              </dl>
            </div>
          )}
        </div>
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
            onSaved={applyUserUpdate}
          />
        </>
      )}
    </Layout>
  );
}
