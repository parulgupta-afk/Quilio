import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
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

        // Fetch published posts by this user (simple approach)
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
        setProfile((p) => ({
          ...p,
          followersCount: Math.max(0, p.followersCount - 1),
        }));
      } else {
        await api.post(`/social/follow/${id}`);
        setIsFollowing(true);
        setProfile((p) => ({
          ...p,
          followersCount: p.followersCount + 1,
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-gray-500">
        Loading profile...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-red-600">User not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Profile Header */}
      <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center text-3xl font-bold text-indigo-700">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              profile.name?.charAt(0)
            )}
          </div>

          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">{profile.name}</h1>
            {profile.bio && (
              <p className="text-gray-600 mt-2 max-w-xl">{profile.bio}</p>
            )}

            <div className="flex gap-6 mt-4 text-sm text-gray-600">
              <span>
                <strong className="text-gray-900">{profile.followersCount}</strong>{' '}
                Followers
              </span>
              <span>
                <strong className="text-gray-900">{profile.followingCount}</strong>{' '}
                Following
              </span>
              <span>
                Joined{' '}
                {new Date(profile.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>

          {!isOwnProfile && isAuthenticated && (
            <button
              onClick={handleFollow}
              disabled={followLoading}
              className={`px-6 py-2.5 rounded-lg font-medium transition ${
                isFollowing
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {followLoading
                ? '...'
                : isFollowing
                ? 'Following'
                : 'Follow'}
            </button>
          )}
        </div>
      </div>

      {/* Posts */}
      <h2 className="text-xl font-bold mb-6">Posts</h2>

      {posts.length === 0 ? (
        <p className="text-gray-500">No published posts yet.</p>
      ) : (
        <div className="space-y-5">
          {posts.map((post) => (
            <Link
              key={post._id}
              to={`/post/${post.slug}`}
              className="block bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition"
            >
              <h3 className="text-lg font-semibold text-gray-900 hover:text-indigo-600">
                {post.title}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {new Date(post.createdAt).toLocaleDateString()} ·{' '}
                {post.likesCount} likes · {post.commentsCount} comments
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
