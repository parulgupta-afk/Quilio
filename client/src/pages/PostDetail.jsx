import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import useAuthStore from '../store/authStore';
import ChatWithPost from '../components/ChatWithPost';

export default function PostDetail() {
  const { slug } = useParams();
  const { isAuthenticated } = useAuthStore();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data } = await api.get(`/posts/${slug}`);
        setPost(data);

        const commentsRes = await api.get(`/social/comments/${data._id}`);
        setComments(commentsRes.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Post not found');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  const handleLike = async () => {
    if (!isAuthenticated) return alert('Please login to like posts');
    try {
      if (liked) {
        await api.delete(`/social/like/${post._id}`);
        setPost((p) => ({ ...p, likesCount: p.likesCount - 1 }));
        setLiked(false);
      } else {
        await api.post(`/social/like/${post._id}`);
        setPost((p) => ({ ...p, likesCount: p.likesCount + 1 }));
        setLiked(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBookmark = async () => {
    if (!isAuthenticated) return alert('Please login to bookmark posts');
    try {
      if (bookmarked) {
        await api.delete(`/social/bookmark/${post._id}`);
        setBookmarked(false);
      } else {
        await api.post(`/social/bookmark/${post._id}`);
        setBookmarked(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return alert('Please login to comment');
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const { data } = await api.post(`/social/comment/${post._id}`, {
        content: newComment,
      });
      setComments((prev) => [...prev, data]);
      setPost((p) => ({ ...p, commentsCount: p.commentsCount + 1 }));
      setNewComment('');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center text-gray-500">
        Loading post...
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-red-600 mb-4">{error || 'Post not found'}</p>
        <Link to="/" className="text-indigo-600 hover:underline">
          ← Back to home
        </Link>
      </div>
    );
  }

  return (
    <article className="max-w-3xl mx-auto px-4 py-10">
      <header className="mb-10">
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags?.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
          {post.title}
        </h1>

        <div className="flex items-center gap-3 text-sm text-gray-600 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-medium">
              {post.author?.name?.charAt(0) || 'U'}
            </div>
            <span className="font-medium text-gray-800">{post.author?.name}</span>
          </div>
          <span>·</span>
          <time>
            {new Date(post.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
          <span>·</span>
          <span>{post.viewsCount} views</span>
        </div>

        <div className="flex items-center gap-4 border-y py-4">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
              liked
                ? 'bg-red-50 text-red-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            ❤️ {post.likesCount}
          </button>

          <button
            onClick={handleBookmark}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
              bookmarked
                ? 'bg-indigo-50 text-indigo-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🔖 {bookmarked ? 'Saved' : 'Save'}
          </button>

          <span className="text-sm text-gray-500">
            💬 {post.commentsCount} comments
          </span>

          <Link
            to={`/learn/${post._id}`}
            className="ml-auto flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
          >
            🧠 Learn This
          </Link>
        </div>
      </header>

      <div className="prose prose-lg max-w-none whitespace-pre-wrap text-gray-800 leading-relaxed mb-12">
        {post.content}
      </div>

      <section className="border-t pt-10">
        <h2 className="text-xl font-bold mb-6">Comments ({comments.length})</h2>

        {isAuthenticated && (
          <form onSubmit={handleAddComment} className="mb-8">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none mb-3"
              placeholder="Write a comment..."
            />
            <button
              type="submit"
              disabled={submitting || !newComment.trim()}
              className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 transition"
            >
              {submitting ? 'Posting...' : 'Post Comment'}
            </button>
          </form>
        )}

        <div className="space-y-5">
          {comments.length === 0 ? (
            <p className="text-gray-500 text-sm">No comments yet. Be the first!</p>
          ) : (
            comments.map((comment) => (
              <div key={comment._id} className="flex gap-3">
                <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-medium flex-shrink-0">
                  {comment.author?.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">
                      {comment.author?.name}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm">{comment.content}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
      {post && <ChatWithPost postId={post._id} />}
    </article>
  );
}
