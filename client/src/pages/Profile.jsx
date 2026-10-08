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
        <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-xl text-red-400">
            ⚠
          </div>
          <h2 className="text-xl font-bold text-zinc-100">User not found</h2>
          <p className="mt-2 text-sm text-zinc-400">This profile may have been removed or does not exist.</p>
          <Link
            to="/home"
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-xs font-semibold text-zinc-200 transition hover:bg-white/10"
          >
            ← Back to Home
          </Link>
        </div>
      </Layout>
    );
  }

  const isSelf = me?._id === id;

  return (
    <Layout>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pb-24 pt-4">
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

        <div className="mt-8">
          {tab === 'posts' && (
            <>
              {postsError && (
                <div className="mb-6 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-xs text-amber-200">
                  Couldn’t load posts at this moment. Try refreshing the page.
                </div>
              )}
              {posts.length === 0 ? (
                <ProfileEmptyState isSelf={isSelf} />
              ) : (
                <div className="grid gap-5 sm:grid-cols-2">
                  {posts.map((p) => (
                    <ProfilePostCard key={p._id} post={p} />
                  ))}
                </div>
              )}
            </>
          )}

          {tab === 'about' && (
            <div className="rounded-2xl border border-white/[0.08] bg-[#12131c]/90 p-6 sm:p-8 backdrop-blur-md shadow-xl shadow-black/20">
              <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                <span className="material-symbols-outlined text-violet-400 text-[20px]">person</span>
                <span>About Scholar</span>
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-zinc-300">
                {profile.bio ||
                  (isSelf
                    ? 'No bio yet. Use "Edit profile" to introduce yourself to readers on Quilio.'
                    : 'No biography shared yet.')}
              </p>

              <div className="mt-8 border-t border-white/[0.08] pt-6">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Profile Details
                </h4>
                <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5">
                    <dt className="text-xs font-medium text-zinc-400">Published Posts</dt>
                    <dd className="mt-1 text-lg font-bold text-zinc-100">{posts.length}</dd>
                  </div>
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5">
                    <dt className="text-xs font-medium text-zinc-400">Followers</dt>
                    <dd className="mt-1 text-lg font-bold text-zinc-100">
                      {profile.followersCount || 0}
                    </dd>
                  </div>
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5">
                    <dt className="text-xs font-medium text-zinc-400">Following</dt>
                    <dd className="mt-1 text-lg font-bold text-zinc-100">
                      {profile.followingCount || 0}
                    </dd>
                  </div>
                  {profile.createdAt && (
                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5">
                      <dt className="text-xs font-medium text-zinc-400">Joined Date</dt>
                      <dd className="mt-1 text-base font-semibold text-zinc-200">
                        {new Date(profile.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>

              {(profile.links || []).length > 0 && (
                <div className="mt-6 border-t border-white/[0.08] pt-6">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    External Links
                  </h4>
                  <ul className="mt-3 space-y-2">
                    {profile.links.map((link) => (
                      <li key={link}>
                        <a
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-violet-300 hover:text-violet-200 hover:underline"
                        >
                          <span>↗</span>
                          <span>{link}</span>
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
