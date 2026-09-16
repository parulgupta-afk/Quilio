import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function SimilarPosts({ postId }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!postId) return;

    const fetchSimilar = async () => {
      try {
        const { data } = await api.get(`/recommend/similar/${postId}?limit=4`);
        setPosts(data.posts || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSimilar();
  }, [postId]);

  if (loading || posts.length === 0) return null;

  return (
    <section className="mt-16 border-t pt-10">
      <h2 className="text-xl font-bold mb-6">Similar Posts</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {posts.map((post) => (
          <Link
            key={post._id}
            to={`/post/${post.slug}`}
            className="block p-5 bg-white border border-gray-200 rounded-xl hover:shadow-md transition"
          >
            <h3 className="font-semibold text-gray-900 hover:text-indigo-600 line-clamp-2">
              {post.title}
            </h3>
            <p className="text-sm text-gray-500 mt-2">
              {post.author?.name} · {post.likesCount || 0} likes
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
