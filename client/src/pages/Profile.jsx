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
    const load = async () => {
      setLoading(true);
      setPostsError(false);
      try {
        const { data } = await api.get(`/users/${id}`);
        if (!alive) return;
        setProfile(data);
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
    };
    load();
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
        <ProfileSkeleton />
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-20 text-center">
          <h2 className="text-lg font-semibold text-red-300">User not found</h2>
          <p className="mt-1 text-sm text-zinc-500">This profile may have been removed.</p>
          <Link
            to="/home"
            className="mt-5 rounded-full border border-white/12 px-4 py-2 text-sm font-semibold text-zinc-200 hover:bg-white/5"
          >
            ← Back home
          </Link>
        </div>
      </Layout>
    );
  }

  const isSelf = me?._id === id;

  return (
    <Layout>
      <div className="mx-auto max-w-3xl px-4 pb-20 pt-2">
        <ProfileHeader
          profile={profile}
          isSelf={isSelf}
          isAuthenticated={isAuthenticated}
          following={following}
          onFollow={toggleFollow}
          onEdit={() => setEditOpen(true)}
          onAvatar={() => setPickerOpen(true)}
          onLogout={() => {
            logout();
            navigate('/login');
          }}
          postCount={posts.length}
          circles={circles}
        />

        <ProfileTabs active={tab} onChange={setTab} postCount={posts.length} />

        <div className="mt-6">
          {tab === 'posts' && (
            <>
              {postsError && (
                <p className="mb-4 text-sm text-amber-200/80">
                  Couldn’t load posts. Try refreshing the page.
                </p>
              )}
              {posts.length === 0 ? (
                <ProfileEmptyState isSelf={isSelf} />
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {posts.map((p) => (
                    <ProfilePostCard key={p._id} post={p} />
                  ))}
                </div>
              )}
            </>
          )}

          {tab === 'about' && (
            <div className="rounded-xl border border-white/[0.06] bg-[#12131a]/80 p-5">
              <h3 className="text-sm font-semibold text-zinc-100">About</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                {profile.bio ||
                  (isSelf
                    ? 'No bio yet. Use Edit profile to introduce yourself.'
                    : 'No bio shared yet.')}
              </p>
              <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-zinc-600">Posts</dt>
                  <dd className="mt-0.5 font-medium text-zinc-200">{posts.length}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-zinc-600">Followers</dt>
                  <dd className="mt-0.5 font-medium text-zinc-200">
                    {profile.followersCount || 0}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-zinc-600">Following</dt>
                  <dd className="mt-0.5 font-medium text-zinc-200">
                    {profile.followingCount || 0}
                  </dd>
                </div>
                {profile.createdAt && (
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-zinc-600">Joined</dt>
                    <dd className="mt-0.5 font-medium text-zinc-200">
                      {new Date(profile.createdAt).toLocaleDateString()}
                    </dd>
                  </div>
                )}
              </dl>
              {(profile.links || []).length > 0 && (
                <div className="mt-5">
                  <h4 className="text-xs uppercase tracking-wide text-zinc-600">Links</h4>
                  <ul className="mt-2 space-y-1">
                    {profile.links.map((link) => (
                      <li key={link}>
                        <a
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-violet-300 hover:underline"
                        >
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
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
