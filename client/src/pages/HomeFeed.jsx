import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import useAuthStore from '../store/authStore';
import Layout from '../components/Layout';

/* ── Empty Feed placeholder ── */
function EmptyDiscover({ isAuthenticated }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 8 }}>
      {/* Hero card */}
      <div style={{
        position: 'relative', borderRadius: 16, padding: 1,
        background: 'linear-gradient(135deg, rgba(128,131,255,0.3), rgba(110,0,190,0.2), transparent)',
        boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
      }}>
        <div style={{
          borderRadius: 15, padding: '1.5rem',
          background: '#1a1b21', position: 'relative', overflow: 'hidden',
        }}>
          {/* Ambient glow */}
          <div style={{
            position: 'absolute', top: -48, right: -48, width: 200, height: 200,
            background: 'radial-gradient(circle, rgba(192,193,255,0.15), transparent 70%)',
            filter: 'blur(24px)', borderRadius: '50%', pointerEvents: 'none',
          }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div className="ns-ai-pill" style={{ marginBottom: 14, borderColor: 'rgba(221,183,255,0.4)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>auto_awesome</span>
              Quilio · AI Social Learning
            </div>
            <h2 style={{ fontFamily: "'Newsreader', serif", fontSize: 'clamp(20px,5vw,26px)', fontWeight: 500, lineHeight: 1.25, color: '#e2e2e9', margin: '0 0 10px' }}>
              Every article becomes something you can ask, learn, and remember.
            </h2>
            <p style={{ fontSize: 14, color: '#908fa0', lineHeight: 1.6, marginBottom: 20, maxWidth: 480 }}>
              Write technical posts. Readers chat with them, study flashcards, take quizzes, and track progress — all grounded in the article itself.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {isAuthenticated ? (
                <>
                  <Link to="/write" className="ns-btn ns-btn-primary">
                    <span className="material-symbols-outlined" style={{ fontSize: 17 }}>edit_note</span>
                    Write your first post
                  </Link>
                  <Link to="/write" className="ns-btn ns-btn-ghost">
                    <span className="material-symbols-outlined" style={{ fontSize: 17 }}>auto_awesome</span>
                    Write with AI
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/register" className="ns-btn ns-btn-primary">
                    <span className="material-symbols-outlined" style={{ fontSize: 17 }}>person_add</span>
                    Get started free
                  </Link>
                  <Link to="/login" className="ns-btn ns-btn-ghost">
                    I have an account
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div style={{ padding: '4px 0 8px' }}>
        <h3 style={{ fontFamily: "'Newsreader', serif", fontSize: 16, color: '#c7c4d7', marginBottom: 12 }}>How Quilio works</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { icon: 'edit_note', title: 'Publish', text: 'Write posts or draft with AI from your rough ideas.' },
            { icon: 'forum', title: 'Ask AI', text: 'Readers chat with the article — answers cite the post.' },
            { icon: 'menu_book', title: 'Learn This', text: 'Auto concepts, flashcards, and a quiz from the content.' },
            { icon: 'insights', title: 'Progress', text: 'Track quizzes and keep learning across topics.' },
          ].map(f => (
            <div key={f.title} style={{ background: '#1a1b21', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '14px 12px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 22, color: '#c0c1ff', marginBottom: 8, display: 'block' }}>{f.icon}</span>
              <div style={{ fontWeight: 600, fontSize: 13, color: '#e2e2e9', marginBottom: 4 }}>{f.title}</div>
              <p style={{ fontSize: 12, color: '#908fa0', lineHeight: 1.5, margin: 0 }}>{f.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Sample previews */}
      <div>
        <h3 style={{ fontFamily: "'Newsreader', serif", fontSize: 16, color: '#c7c4d7', marginBottom: 6 }}>What posts look like here</h3>
        <p style={{ fontSize: 12, color: '#464554', marginBottom: 12 }}>Example previews — publish real ones to fill the live feed.</p>
        {[
          { author: 'You', title: 'Understanding Binary Search Trees', excerpt: 'Why balanced trees matter, how rotations work, and when a BST beats a hash map in practice.', tags: ['data-structures', 'algorithms'] },
          { author: 'You', title: 'React Hooks without the magic', excerpt: 'useState and useEffect explained as plain state updates and scheduled effects — no metaphors.', tags: ['react', 'frontend'] },
        ].map((demo) => (
          <article key={demo.title} style={{ background: '#1a1b21', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '14px 14px', marginBottom: 10, opacity: 0.85 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div className="ns-avatar" style={{ width: 28, height: 28, fontSize: 12 }}>{demo.author.charAt(0)}</div>
              <span style={{ fontSize: 13, color: '#908fa0' }}><b style={{ color: '#e2e2e9', fontWeight: 500 }}>{demo.author}</b> · Example</span>
              <span className="ns-ai-pill" style={{ marginLeft: 'auto', fontSize: 11 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 13 }}>menu_book</span>
                Learn This
              </span>
            </div>
            <h3 style={{ fontFamily: "'Newsreader', serif", fontWeight: 500, fontSize: 16, color: '#e2e2e9', marginBottom: 6 }}>{demo.title}</h3>
            <p style={{ fontSize: 13, color: '#908fa0', lineHeight: 1.55, marginBottom: 12 }}>{demo.excerpt}</p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {demo.tags.map(t => <span key={t} className="ns-chip">{t}</span>)}
            </div>
          </article>
        ))}
      </div>

      {/* CTA bottom */}
      <div style={{ background: '#1a1b21', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '1.5rem', textAlign: 'center' }}>
        <p style={{ color: '#e2e2e9', marginBottom: 6, fontWeight: 500, fontSize: 15 }}>The feed fills when people publish.</p>
        <p style={{ color: '#908fa0', fontSize: 13, marginBottom: 16 }}>Be the first — one solid post unlocks AI Chat, Learn This, and progress tracking.</p>
        <Link to={isAuthenticated ? '/write' : '/register'} className="ns-btn ns-btn-primary">
          {isAuthenticated ? 'Publish the first post' : 'Create an account'}
        </Link>
      </div>
    </div>
  );
}

/* ── Post Card ── */
function PostCard({ post, index, onClick, navigate }) {
  const href = post.slug ? `/post/${post.slug}` : `/post/${post._id}`;
  const excerpt = (post.excerpt || post.content || '')
    .replace(/#{1,6}\s*/g, '').replace(/\n+/g, ' ').trim().substring(0, 155);
  const isFeatured = index === 0;

  return (
    <article
      onClick={() => navigate(href)}
      style={{
        ...(isFeatured ? {
          position: 'relative', borderRadius: 16, padding: 1,
          background: 'linear-gradient(135deg, rgba(128,131,255,0.25), rgba(110,0,190,0.15), transparent)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          marginBottom: 14, cursor: 'pointer',
        } : {
          background: '#1a1b21', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14,
          marginBottom: 14, cursor: 'pointer', transition: 'background 0.2s, border-color 0.2s',
        }),
      }}
    >
      <div style={isFeatured ? {
        borderRadius: 15, padding: '1.25rem', background: '#1a1b21', position: 'relative', overflow: 'hidden',
      } : { padding: '1.25rem' }}>
        {isFeatured && (
          <div style={{
            position: 'absolute', top: -48, right: -48, width: 160, height: 160,
            background: 'radial-gradient(circle, rgba(192,193,255,0.12), transparent 70%)',
            filter: 'blur(24px)', borderRadius: '50%', pointerEvents: 'none',
          }} />
        )}
        {/* Author row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, position: 'relative', zIndex: 1 }}>
          <div className="ns-avatar-ring">
            <div className="ns-avatar" style={{ width: 30, height: 30, fontSize: 12 }}>
              {post.author?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <span
              style={{ fontWeight: 500, fontSize: 13, color: '#e2e2e9', cursor: 'pointer' }}
              onClick={(e) => { e.stopPropagation(); if (post.author?._id) navigate(`/profile/${post.author._id}`); }}
            >
              {post.author?.name || 'Unknown'}
            </span>
            <span style={{ fontSize: 12, color: '#908fa0' }}> · {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </div>
          {isFeatured && (
            <span className="ns-ai-pill">
              <span className="material-symbols-outlined" style={{ fontSize: 13 }}>auto_awesome</span>
              Featured
            </span>
          )}
        </div>

        {/* Title */}
        <h3 style={{
          fontFamily: "'Newsreader', serif", fontWeight: 500,
          fontSize: isFeatured ? 'clamp(17px,4vw,22px)' : 17,
          color: '#e2e2e9', marginBottom: 8, lineHeight: 1.3, position: 'relative', zIndex: 1,
        }}>
          {post.title}
        </h3>
        {excerpt && (
          <p style={{ fontSize: 14, color: '#908fa0', lineHeight: 1.6, marginBottom: 12, position: 'relative', zIndex: 1 }}>
            {excerpt}{excerpt.length >= 155 ? '…' : ''}
          </p>
        )}

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
            {post.tags.slice(0, 4).map(tag => (
              <span key={tag} className="ns-chip">{tag}</span>
            ))}
          </div>
        )}

        {/* Footer row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', gap: 14 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#908fa0' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>favorite</span>
              {post.likesCount || 0}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#908fa0' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>forum</span>
              {post.commentsCount || 0}
            </span>
          </div>
          {isFeatured ? (
            <button
              className="ns-ask-ai-btn ns-ask-ai-btn-featured"
              onClick={(e) => { e.stopPropagation(); navigate(href); }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 15 }}>auto_awesome</span>
              Read · Ask AI
            </button>
          ) : (
            <button
              className="ns-ask-ai-btn ns-ask-ai-btn-plain"
              onClick={(e) => { e.stopPropagation(); navigate(href); }}
            >
              Read · Ask AI
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>arrow_forward</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export default function HomeFeed() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedType, setFeedType] = useState('latest');

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const res = isAuthenticated && feedType === 'for-you'
          ? await api.get('/recommend/feed')
          : await api.get('/posts');
        setPosts(res.data.posts || []);
      } catch (err) {
        console.error(err);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [isAuthenticated, feedType]);

  return (
    <Layout>
      <div className="ns-page">
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <h2 style={{ fontFamily: "'Newsreader', serif", fontWeight: 500, fontSize: 22, color: '#e2e2e9', margin: 0 }}>
            {feedType === 'for-you' ? 'For you' : 'Latest'}
          </h2>
          {isAuthenticated ? (
            <Link to="/write" className="ns-btn ns-btn-primary" style={{ padding: '8px 16px', fontSize: 13 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>edit_note</span>
              Write
            </Link>
          ) : (
            <Link to="/register" className="ns-btn ns-btn-primary" style={{ padding: '8px 16px', fontSize: 13 }}>
              Get started
            </Link>
          )}
        </div>

        {/* Feed tab switcher */}
        {isAuthenticated && posts.length > 0 && (
          <div style={{ position: 'relative', marginBottom: 20 }}>
            <div className="ns-feed-tabs" style={{ position: 'relative', maxWidth: 200 }}>
              <div
                className="ns-feed-tab-indicator"
                style={{ transform: feedType === 'for-you' ? 'translateX(100%)' : 'translateX(0)' }}
              />
              <button className={`ns-feed-tab${feedType === 'latest' ? ' active' : ''}`} onClick={() => setFeedType('latest')}>Latest</button>
              <button className={`ns-feed-tab${feedType === 'for-you' ? ' active' : ''}`} onClick={() => setFeedType('for-you')}>For you</button>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="ns-loading">
            <span className="material-symbols-outlined" style={{ fontSize: 22, color: '#c0c1ff', marginRight: 8, animation: 'spin 1.2s linear infinite' }}>progress_activity</span>
            Loading posts…
          </div>
        )}

        {/* Empty state */}
        {!loading && posts.length === 0 && <EmptyDiscover isAuthenticated={isAuthenticated} />}

        {/* Posts */}
        {!loading && posts.map((post, i) => (
          <PostCard key={post._id} post={post} index={i} navigate={navigate} />
        ))}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        article:hover { border-color: rgba(255,255,255,0.12) !important; }
      `}</style>
    </Layout>
  );
}
