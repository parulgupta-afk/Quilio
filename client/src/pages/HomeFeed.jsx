import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import useAuthStore from '../store/authStore';

export default function HomeFeed() {
  const { isAuthenticated } = useAuthStore();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedType, setFeedType] = useState('latest');

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        let data;
        if (isAuthenticated && feedType === 'for-you') {
          const res = await api.get('/recommend/feed');
          data = res.data;
        } else {
          const res = await api.get('/posts');
          data = res.data;
        }
        setPosts(data.posts || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [isAuthenticated, feedType]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">
          {feedType === 'for-you' ? 'For You' : 'Latest Posts'}
        </h1>

        {isAuthenticated && (
          <div className="flex gap-2 text-sm">
            <button
              onClick={() => setFeedType('latest')}
              className={`px-4 py-1.5 rounded-full transition ${
                feedType === 'latest'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Latest
            </button>
            <button
              onClick={() => setFeedType('for-you')}
              className={`px-4 py-1.5 rounded-full transition ${
                feedType === 'for-you'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              For You
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-500">Loading posts...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          No posts yet. Be the first to write one!
        </div>
      ) : (
        <div className="space-y-8">
          {posts.map((post) => (
            <article
              key={post._id}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition"
            >
              <div className="flex flex-wrap gap-2 mb-3">
                {post.tags?.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <Link to={`/post/${post.slug}`}>
                <h2 className="text-2xl font-bold text-gray-900 hover:text-indigo-600 transition mb-2">
                  {post.title}
                </h2>
              </Link>

              <p className="text-gray-600 mb-4 line-clamp-2">
                {post.excerpt || post.content?.substring(0, 160)}
              </p>

              <div className="flex items-center gap-3 text-sm text-gray-500">
                <Link
                  to={`/profile/${post.author?._id}`}
                  className="font-medium text-gray-700 hover:text-indigo-600"
                >
                  {post.author?.name}
                </Link>
                <span>·</span>
                <time>{new Date(post.createdAt).toLocaleDateString()}</time>
                <span>·</span>
                <span>{post.likesCount || 0} likes</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
