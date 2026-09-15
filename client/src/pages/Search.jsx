import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ posts: [], users: [] });
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (query.trim().length < 2) return;

    setLoading(true);
    setSearched(true);
    try {
      const { data } = await api.get(`/search?q=${encodeURIComponent(query)}`);
      setResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">Search</h1>

      <form onSubmit={handleSearch} className="mb-10">
        <div className="flex gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search posts, tags, or users..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-60 transition"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {searched && (
        <div className="space-y-10">
          {/* Users */}
          {results.users?.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-4">Users</h2>
              <div className="space-y-3">
                {results.users.map((user) => (
                  <Link
                    key={user._id}
                    to={`/profile/${user._id}`}
                    className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:shadow-sm transition"
                  >
                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                      {user.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-500">
                        {user.followersCount} followers
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Posts */}
          <section>
            <h2 className="text-lg font-semibold mb-4">
              Posts {results.posts?.length > 0 && `(${results.posts.length})`}
            </h2>

            {results.posts?.length === 0 ? (
              <p className="text-gray-500">No posts found.</p>
            ) : (
              <div className="space-y-4">
                {results.posts.map((post) => (
                  <Link
                    key={post._id}
                    to={`/post/${post.slug}`}
                    className="block p-5 bg-white border border-gray-200 rounded-xl hover:shadow-md transition"
                  >
                    <h3 className="font-semibold text-lg text-gray-900 hover:text-indigo-600">
                      {post.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      by {post.author?.name} ·{' '}
                      {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
