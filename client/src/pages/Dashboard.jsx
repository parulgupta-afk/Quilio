import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function Dashboard() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyPosts = async () => {
      try {
        const { data } = await api.get('/posts/me/all');
        setPosts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyPosts();
  }, []);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center text-gray-500">
        Loading your posts...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Your Dashboard</h1>
        <Link
          to="/write"
          className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
        >
          + New Post
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-600 mb-4">You haven’t written any posts yet.</p>
          <Link to="/write" className="text-indigo-600 font-medium hover:underline">
            Write your first post →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post._id}
              className="bg-white border border-gray-200 rounded-xl p-5 flex items-center justify-between hover:shadow-sm transition"
            >
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="font-semibold text-lg text-gray-900">
                    {post.title}
                  </h2>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      post.status === 'published'
                        ? 'bg-green-50 text-green-700'
                        : 'bg-yellow-50 text-yellow-700'
                    }`}
                  >
                    {post.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  Updated {new Date(post.updatedAt).toLocaleDateString()} ·{' '}
                  {post.viewsCount} views
                </p>
              </div>

              <div className="flex gap-3">
                {post.status === 'published' && (
                  <Link
                    to={`/post/${post.slug}`}
                    className="text-sm text-indigo-600 hover:underline"
                  >
                    View
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
