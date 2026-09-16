import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import useAuthStore from '../store/authStore';
import ChatWithPost from '../components/ChatWithPost';
import Layout from '../components/Layout';
import SimilarPosts from '../components/SimilarPosts';

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
      <Layout>
        <div className="max-w-3xl mx-auto px-6 py-20 text-center" style={{ color: 'var(--text-muted)' }}>
          Loading post…
        </div>
      </Layout>
    );
  }

  if (error || !post) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <p className="mb-4" style={{ color: '#fca5a5' }}>{error || 'Post not found'}</p>
          <Link to="/" style={{ color: '#C9C9FF' }}>← Back to home</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Article + Chat side-by-side on wide screens */}
      <div style={{ display: 'flex', maxWidth: 1180, margin: '0 auto' }}>

        {/* ── Reader column ── */}
        <article style={{ flex: 1, maxWidth: 680, padding: '48px 32px 100px' }}>

          {/* Kicker / meta */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, color: 'var(--text-faint)', fontSize: 13 }}>
            {post.tags?.slice(0, 1).map((t) => <span key={t}>{t}</span>)}
            {post.tags?.length > 0 && <span>·</span>}
            <span>{post.viewsCount || 0} views</span>
          </div>

          {/* Title */}
          <h1
            className="serif"
            style={{ fontWeight: 500, fontSize: 38, lineHeight: 1.18, margin: '0 0 18px' }}
          >
            {post.title}
          </h1>

          {/* Byline */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 34, color: 'var(--text-muted)', fontSize: 14 }}>
            <div
              style={{
                width: 34, height: 34, borderRadius: '50%',
                background: 'linear-gradient(135deg,var(--accent-1),var(--accent-2))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 600, fontSize: 13, color: '#fff', flexShrink: 0,
              }}
            >
              {post.author?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <b style={{ color: 'var(--text)', fontWeight: 500 }}>{post.author?.name}</b>
              <br />
              <time style={{ fontSize: 12.5 }}>
                {new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </time>
            </div>
          </div>

          {/* Tags */}
          {post.tags?.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {post.tags.map((tag) => (
                <span key={tag} className="chip">{tag}</span>
              ))}
            </div>
          )}

          {/* Action bar */}
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
              padding: '14px 0', marginBottom: 34,
            }}
          >
            <button
              onClick={handleLike}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border)',
                background: liked ? 'rgba(239,68,68,0.12)' : 'var(--bg-card)',
                color: liked ? '#fca5a5' : 'var(--text-muted)',
                cursor: 'pointer', fontSize: 13.5, fontWeight: 500,
              }}
            >
              ❤ {post.likesCount || 0}
            </button>

            <button
              onClick={handleBookmark}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border)',
                background: bookmarked ? 'rgba(99,102,241,0.12)' : 'var(--bg-card)',
                color: bookmarked ? '#C9C9FF' : 'var(--text-muted)',
                cursor: 'pointer', fontSize: 13.5, fontWeight: 500,
              }}
            >
              🔖 {bookmarked ? 'Saved' : 'Save'}
            </button>

            <span style={{ fontSize: 13.5, color: 'var(--text-faint)' }}>
              💬 {post.commentsCount || 0}
            </span>

            <Link
              to={`/learn/${post._id}`}
              className="btn btn-primary"
              style={{ marginLeft: 'auto', padding: '9px 16px', fontSize: 13.5 }}
            >
              🧠 Learn This
            </Link>
          </div>

          {/* Prose */}
          <div
            className="serif"
            style={{
              fontSize: 18.5, lineHeight: 1.75, color: '#DADCE4',
              marginBottom: 48, whiteSpace: 'pre-wrap',
            }}
          >
            {post.content}
          </div>

          {/* Similar posts */}
          {post && <SimilarPosts postId={post._id} />}

          {/* Comments */}
          <section style={{ borderTop: '1px solid var(--border)', paddingTop: 36 }}>
            <h2 className="serif" style={{ fontSize: 22, fontWeight: 500, marginBottom: 24 }}>
              Comments ({comments.length})
            </h2>

            {isAuthenticated && (
              <form onSubmit={handleAddComment} style={{ marginBottom: 28 }}>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                  placeholder="Write a comment…"
                  style={{
                    width: '100%', background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-strong)', borderRadius: 10,
                    padding: '12px 14px', color: 'var(--text)', fontSize: 14.5,
                    outline: 'none', resize: 'vertical', marginBottom: 10,
                    fontFamily: 'inherit',
                  }}
                />
                <button
                  type="submit"
                  disabled={submitting || !newComment.trim()}
                  className="btn btn-primary"
                  style={{ padding: '9px 18px', fontSize: 13.5 }}
                >
                  {submitting ? 'Posting…' : 'Post Comment'}
                </button>
              </form>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {comments.length === 0 ? (
                <p style={{ color: 'var(--text-faint)', fontSize: 14 }}>
                  No comments yet. Be the first!
                </p>
              ) : (
                comments.map((comment) => (
                  <div key={comment._id} style={{ display: 'flex', gap: 12 }}>
                    <div
                      style={{
                        width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                        background: 'linear-gradient(135deg,var(--accent-1),var(--accent-2))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 600, fontSize: 12, color: '#fff',
                      }}
                    >
                      {comment.author?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontWeight: 500, fontSize: 13.5, color: 'var(--text)' }}>
                          {comment.author?.name}
                        </span>
                        <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0, lineHeight: 1.55 }}>
                        {comment.content}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </article>

        {/* ── Chat panel ── */}
        {post && <ChatWithPost postId={post._id} />}
      </div>
    </Layout>
  );
}
