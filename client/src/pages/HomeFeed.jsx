import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function HomeFeed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data } = await api.get('/posts');
        setPosts(data.posts || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-gray-500">
        Loading posts...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">Latest Posts</h1>

      {posts.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          No published posts yet. Be the first to write one!
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
                {post.excerpt || post.content.substring(0, 160)}
              </p>

              <div className="flex items-center gap-3 text-sm text-gray-500">
                <span className="font-medium text-gray-700">
                  {post.author?.name}
                </span>
                <span>·</span>
                <time>
                  {new Date(post.createdAt).toLocaleDateString()}
                </time>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
