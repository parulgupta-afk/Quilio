import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Layout from '../components/Layout';

export default function Progress() {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const { data } = await api.get('/learn/progress/me');
        setAttempts(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, []);

  if (loading) {
    return (
      <Layout><div className="max-w-3xl mx-auto px-4 py-16 text-center text-gray-500">
        Loading your progress...
      </div>
    );
  }

  const avgScore =
    attempts.length > 0
      ? Math.round(
          attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length
        )
      : 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">Learning Progress</h1>
      <p className="text-gray-600 mb-8">Track how well you’re learning from posts</p>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-10">
        <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
          <p className="text-3xl font-bold text-indigo-600">{attempts.length}</p>
          <p className="text-sm text-gray-500 mt-1">Quizzes taken</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
          <p className="text-3xl font-bold text-indigo-600">{avgScore}%</p>
          <p className="text-sm text-gray-500 mt-1">Average score</p>
        </div>
      </div>

      {attempts.length === 0 ? (
        <div className="text-center py-16 bg-white border border-gray-200 rounded-xl">
          <p className="text-gray-600 mb-4">
            You haven’t taken any quizzes yet.
          </p>
          <Link to="/" className="text-indigo-600 font-medium hover:underline">
            Explore posts and click “Learn This” →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {attempts.map((attempt) => (
            <div
              key={attempt._id}
              className="bg-white border border-gray-200 rounded-xl p-5 flex items-center justify-between"
            >
              <div>
                <Link
                  to={attempt.post ? `/post/${attempt.post.slug}` : '#'}
                  className="font-semibold text-gray-900 hover:text-indigo-600"
                >
                  {attempt.post?.title || 'Unknown post'}
                </Link>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(attempt.createdAt).toLocaleDateString()} ·{' '}
                  {attempt.score}/{attempt.totalQuestions} correct
                </p>
              </div>
              <div
                className={`text-lg font-bold ${
                  attempt.percentage >= 70
                    ? 'text-green-600'
                    : attempt.percentage >= 40
                    ? 'text-yellow-600'
                    : 'text-red-600'
                }`}
              >
                {attempt.percentage}%
              </div>
            </div>
          ))}
        </div>
      )}
    </div></Layout>
    </Layout>
  );
}
