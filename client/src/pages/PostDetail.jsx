import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import useAuthStore from '../store/authStore';
import Layout from '../components/Layout';
import ChatWithPost from '../components/ChatWithPost';
import SimilarPosts from '../components/SimilarPosts';

export default function PostDetail() {
  const { slug } = useParams();
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!slug) { setError('Invalid post link'); setLoading(false); return; }
    const load = async () => {
      setLoading(true); setError('');
      try {
        const { data } = await api.get(`/posts/${encodeURIComponent(slug)}`);
        setPost(data);
        try {
          const c = await api.get(`/social/comments/${data._id}`);
          setComments(Array.isArray(c.data) ? c.data : c.data?.comments || []);
        } catch { setComments([]); }
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'Post not found');
        setPost(null);
      } finally { setLoading(false); }
    };
    load();
  }, [slug]);

  const handleLike = async () => {
    if (!isAuthenticated) return alert('Please login');
    try {
      if (liked) {
        await api.delete(`/social/like/${post._id}`);
        setPost(p => ({ ...p, likesCount: Math.max(0, (p.likesCount || 1) - 1) }));
        setLiked(false);
      } else {
        await api.post(`/social/like/${post._id}`);
        setPost(p => ({ ...p, likesCount: (p.likesCount || 0) + 1 }));
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
      setComments(prev => [...prev, data]);
      setPost(p => ({ ...p, commentsCount: (p.commentsCount || 0) + 1 }));
      setNewComment('');
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.message || 'Failed to comment');
    } finally { setSubmitting(false); }
  };

  if (loading) {
    return (
      <Layout>
        <div className="ns-loading">
          <span className="material-symbols-outlined" style={{ fontSize: 22, color: '#c0c1ff', marginRight: 8, animation: 'spin 1.2s linear infinite' }}>progress_activity</span>
          Loading post…
        </div>
      </Layout>
    );
  }

  if (error || !post) {
    return (
      <Layout>
        <div className="ns-page" style={{ textAlign: 'center', paddingTop: '5rem' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 40, color: '#ffb4ab', display: 'block', marginBottom: 12 }}>error</span>
          <p style={{ color: '#ffb4ab', marginBottom: 16, fontSize: 15 }}>{error || 'Post not found'}</p>
          <Link to="/home" className="ns-btn ns-btn-ghost">
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span>
            Back to feed
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* ── Sticky AI Prompt Bar ── */}
      <div className="ns-sticky-ai-bar">
        <Link to={`/learn/${post._id}`} className="ns-sticky-ai-btn">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(128,131,255,0.5), rgba(110,0,190,0.5))',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#c0c1ff' }}>menu_book</span>
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#ddb7ff', marginBottom: 1 }}>
                AI Learning Suite · Tap to open
              </div>
              <div style={{ fontFamily: "'Newsreader', serif", fontSize: 13, fontStyle: 'italic', color: '#c7c4d7' }} className="truncate-line">
                {post.title}
              </div>
            </div>
          </div>
          <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#c0c1ff', flexShrink: 0 }}>arrow_forward</span>
        </Link>
      </div>

      <div className="ns-page">
        {/* Tags */}
        {post.tags?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
            {post.tags.map(t => <span key={t} className="ns-chip">{t}</span>)}
          </div>
        )}

        {/* Title */}
        <h1 style={{
          fontFamily: "'Newsreader', serif", fontSize: 'clamp(24px, 5vw, 34px)',
          fontWeight: 500, lineHeight: 1.2, marginBottom: 16, color: '#e2e2e9',
        }}>
          {post.title}
        </h1>

        {/* Author / meta */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
          <Link to={`/profile/${post.author?._id}`} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div className="ns-avatar-ring">
              <div className="ns-avatar" style={{ width: 34, height: 34, fontSize: 14 }}>
                {post.author?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, color: '#e2e2e9' }}>{post.author?.name}</div>
              <div style={{ fontSize: 12, color: '#908fa0' }}>
                {new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                {' · '}
                <span className="material-symbols-outlined" style={{ fontSize: 12, verticalAlign: 'middle' }}>visibility</span>
                {' '}{post.viewsCount || 0} views
              </div>
            </div>
          </Link>
        </div>

        {/* Action dock */}
        <div style={{
          display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap',
          padding: '12px 0', borderTop: '1px solid rgba(255,255,255,0.07)', borderBottom: '1px solid rgba(255,255,255,0.07)', marginBottom: 32,
        }}>
          <button
            onClick={handleLike}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 12,
              background: liked ? 'rgba(221,183,255,0.12)' : '#1e1f25',
              border: `1px solid ${liked ? 'rgba(221,183,255,0.3)' : 'rgba(255,255,255,0.07)'}`,
              color: liked ? '#ddb7ff' : '#908fa0', fontSize: 13, cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 17, ...(liked ? { fontVariationSettings: "'FILL' 1" } : {}) }}>favorite</span>
            {post.likesCount || 0}
          </button>

          <button
            onClick={handleBookmark}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 12,
              background: bookmarked ? 'rgba(192,193,255,0.1)' : '#1e1f25',
              border: `1px solid ${bookmarked ? 'rgba(192,193,255,0.3)' : 'rgba(255,255,255,0.07)'}`,
              color: bookmarked ? '#c0c1ff' : '#908fa0', fontSize: 13, cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 17, ...(bookmarked ? { fontVariationSettings: "'FILL' 1" } : {}) }}>bookmark</span>
            {bookmarked ? 'Saved' : 'Save'}
          </button>

          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#908fa0' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 17 }}>forum</span>
            {post.commentsCount || 0}
          </span>

          <Link
            to={`/learn/${post._id}`}
            className="ns-btn ns-btn-gradient"
            style={{ marginLeft: 'auto', padding: '8px 18px', fontSize: 13 }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>menu_book</span>
            Learn This
          </Link>
        </div>

        {/* Article body */}
        <article className="ns-article" style={{ marginBottom: 48 }}>
          {post.content}
        </article>

        {/* AI Citation / Grounding pill */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
          borderRadius: 12, background: '#1a1b21', border: '1px solid rgba(255,255,255,0.07)', marginBottom: 32,
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#ddb7ff' }}>auto_awesome</span>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#c7c4d7', marginBottom: 1 }}>AI Learning Tools Available</div>
            <div style={{ fontSize: 12, color: '#908fa0' }}>Chat with AI · Concept Cards · Quiz · Flashcards · Progress</div>
          </div>
          <Link to={`/learn/${post._id}`} style={{ marginLeft: 'auto', fontSize: 12, color: '#c0c1ff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
            Open Suite <span className="material-symbols-outlined" style={{ fontSize: 14 }}>open_in_new</span>
          </Link>
        </div>

        {/* Chat with Post */}
        <ChatWithPost postId={post._id} />

        {/* Similar Posts */}
        <SimilarPosts postId={post._id} />

        {/* Comments */}
        <section style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 28, marginTop: 28 }}>
          <h2 style={{ fontFamily: "'Newsreader', serif", fontSize: 20, marginBottom: 20, color: '#e2e2e9' }}>
            Comments ({comments.length})
          </h2>

          {isAuthenticated && (
            <form onSubmit={handleComment} style={{ marginBottom: 24 }}>
              <div className="ns-comment-box" style={{ marginBottom: 10 }}>
                <textarea
                  className="ns-comment-input"
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts on this essay…"
                />
              </div>
              <button
                type="submit"
                className="ns-btn ns-btn-gradient"
                disabled={submitting || !newComment.trim()}
                style={{ padding: '8px 18px', fontSize: 13 }}
              >
                {submitting ? 'Posting…' : 'Post Comment'}
              </button>
            </form>
          )}

          {comments.length === 0 ? (
            <p style={{ color: '#464554', fontSize: 14 }}>No comments yet. Be the first to share your thoughts.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {comments.map((c) => (
                <div key={c._id} style={{ display: 'flex', gap: 12 }}>
                  <div className="ns-avatar" style={{ width: 32, height: 32, fontSize: 13, flexShrink: 0 }}>
                    {c.author?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div style={{ flex: 1, background: '#1a1b21', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '10px 14px' }}>
                    <div style={{ fontSize: 13, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <b style={{ color: '#e2e2e9', fontWeight: 500 }}>{c.author?.name}</b>
                      <span style={{ fontSize: 11, color: '#464554' }}>
                        {new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <p style={{ fontSize: 14, color: '#908fa0', lineHeight: 1.55, margin: 0 }}>{c.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .truncate-line { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 240px; }
      `}</style>
    </Layout>
  );
}
