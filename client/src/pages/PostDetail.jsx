import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import useAuthStore from '../store/authStore';
import Layout from '../components/Layout';
import ChatWithPost from '../components/ChatWithPost';
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
    const load = async () => {
      try {
        const { data } = await api.get(`/posts/${slug}`);
        setPost(data);
        const c = await api.get(`/social/comments/${data._id}`);
        setComments(c.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Post not found');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  const handleLike = async () => {
    if (!isAuthenticated) return alert('Please login');
    try {
      if (liked) {
        await api.delete(`/social/like/${post._id}`);
        setPost((p) => ({ ...p, likesCount: (p.likesCount || 1) - 1 }));
        setLiked(false);
      } else {
        await api.post(`/social/like/${post._id}`);
        setPost((p) => ({ ...p, likesCount: (p.likesCount || 0) + 1 }));
        setLiked(true);
      }
    } catch (e) { console.error(e); }
  };

  const handleBookmark = async () => {
    if (!isAuthenticated) return alert('Please login');
    try {
      if (bookmarked) {
        await api.delete(`/social/bookmark/${post._id}`);
        setBookmarked(false);
      } else {
        await api.post(`/social/bookmark/${post._id}`);
        setBookmarked(true);
      }
    } catch (e) { console.error(e); }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!isAuthenticated || !newComment.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await api.post(`/social/comment/${post._id}`, { content: newComment });
      setComments((prev) => [...prev, data]);
      setPost((p) => ({ ...p, commentsCount: (p.commentsCount || 0) + 1 }));
      setNewComment('');
    } catch (e) { console.error(e); }
    finally { setSubmitting(false); }
  };

  if (loading) {
    return (
      <Layout>
        <div className="page muted" style={{ textAlign: 'center', paddingTop: 80 }}>Loading…</div>
      </Layout>
    );
  }

  if (error || !post) {
    return (
      <Layout>
        <div className="page" style={{ textAlign: 'center', paddingTop: 80 }}>
          <p style={{ color: '#fca5a5', marginBottom: 16 }}>{error || 'Not found'}</p>
          <Link to="/" style={{ color: '#C9C9FF' }}>← Back home</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="page">
        <div style={{ marginBottom: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {post.tags?.map((t) => <span key={t} className="chip">{t}</span>)}
        </div>

        <h1 className="serif" style={{ fontSize: 36, fontWeight: 500, lineHeight: 1.2, marginBottom: 18, color: '#F1F1F4' }}>
          {post.title}
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28, color: '#8B93A7', fontSize: 14 }}>
          <div className="avatar">{post.author?.name?.charAt(0) || 'U'}</div>
          <span><b style={{ color: '#F1F1F4' }}>{post.author?.name}</b></span>
          <span>·</span>
          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
          <span>·</span>
          <span>{post.viewsCount || 0} views</span>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '14px 0', borderTop: '1px solid rgba(255,255,255,0.08)', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: 32, flexWrap: 'wrap' }}>
          <button onClick={handleLike} className="btn btn-ghost" style={{ padding: '8px 14px', fontSize: 13 }}>
            ❤️ {post.likesCount || 0}
          </button>
          <button onClick={handleBookmark} className="btn btn-ghost" style={{ padding: '8px 14px', fontSize: 13 }}>
            🔖 {bookmarked ? 'Saved' : 'Save'}
          </button>
          <span className="faint" style={{ fontSize: 13 }}>💬 {post.commentsCount || 0}</span>
          <Link to={`/learn/${post._id}`} className="btn btn-primary" style={{ marginLeft: 'auto', padding: '8px 16px', fontSize: 13 }}>
            🧠 Learn This
          </Link>
        </div>

        <div className="serif" style={{ fontSize: 18, lineHeight: 1.75, color: '#DADCE4', whiteSpace: 'pre-wrap', marginBottom: 48 }}>
          {post.content}
        </div>

        <section style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 32 }}>
          <h2 className="serif" style={{ fontSize: 20, marginBottom: 20, color: '#F1F1F4' }}>
            Comments ({comments.length})
          </h2>

          {isAuthenticated && (
            <form onSubmit={handleComment} style={{ marginBottom: 28 }}>
              <textarea
                className="input"
                rows={3}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment…"
                style={{ marginBottom: 10 }}
              />
              <button type="submit" className="btn btn-primary" disabled={submitting || !newComment.trim()} style={{ padding: '8px 16px', fontSize: 13 }}>
                {submitting ? 'Posting…' : 'Post Comment'}
              </button>
            </form>
          )}

          {comments.length === 0 ? (
            <p className="faint" style={{ fontSize: 14 }}>No comments yet.</p>
          ) : (
            comments.map((c) => (
              <div key={c._id} style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
                <div className="avatar">{c.author?.name?.charAt(0) || 'U'}</div>
                <div>
                  <div style={{ fontSize: 13, marginBottom: 4 }}>
                    <b style={{ color: '#F1F1F4' }}>{c.author?.name}</b>
                    <span className="faint" style={{ marginLeft: 8 }}>{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p style={{ fontSize: 14, color: '#8B93A7', lineHeight: 1.5 }}>{c.content}</p>
                </div>
              </div>
            ))
          )}
        </section>

        {post && <SimilarPosts postId={post._id} />}
        {post && <ChatWithPost postId={post._id} />}
      </div>
    </Layout>
  );
}
