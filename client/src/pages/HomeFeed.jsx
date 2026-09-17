import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import useAuthStore from '../store/authStore';
import Layout from '../components/Layout';

function EmptyDiscover({ isAuthenticated }) {
  return (
    <div style={{ marginTop: 8 }}>
      {/* Hero */}
      <div
        className="card ambient-glow"
        style={{
          padding: '36px 28px',
          marginBottom: 20,
          background:
            'linear-gradient(145deg, rgba(99,102,241,0.14), rgba(168,85,247,0.08), #15171F)',
        }}
      >
        <div className="ai-pill" style={{ marginBottom: 14 }}>
          Quilio · AI social learning
        </div>
        <h1
          className="serif"
          style={{
            fontSize: 32,
            fontWeight: 500,
            lineHeight: 1.2,
            color: '#F1F1F4',
            margin: '0 0 12px',
          }}
        >
          Every article becomes something you can ask, learn, and remember.
        </h1>
        <p className="muted" style={{ fontSize: 15.5, lineHeight: 1.6, marginBottom: 22, maxWidth: 520 }}>
          Write technical posts. Readers chat with them, study flashcards, take quizzes, and track progress —
          all grounded in the article itself.
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {isAuthenticated ? (
            <>
              <Link to="/write" className="btn btn-primary">
                ✨ Write your first post
              </Link>
              <Link to="/write" className="btn btn-ghost">
                Write with AI
              </Link>
            </>
          ) : (
            <>
              <Link to="/register" className="btn btn-primary">
                Get started free
              </Link>
              <Link to="/login" className="btn btn-ghost">
                I have an account
              </Link>
            </>
          )}
        </div>
      </div>

      {/* How it works */}
      <h2 className="serif" style={{ fontSize: 18, color: '#F1F1F4', marginBottom: 14 }}>
        How Quilio works
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
        {[
          { icon: '✍️', title: 'Publish', text: 'Write posts or draft with AI from your rough ideas.' },
          { icon: '💬', title: 'Ask AI', text: 'Readers chat with the article — answers cite the post.' },
          { icon: '🧠', title: 'Learn This', text: 'Auto concepts, flashcards, and a quiz from the content.' },
          { icon: '📈', title: 'Progress', text: 'Track quizzes and keep learning across topics.' },
        ].map((f) => (
          <div key={f.title} className="card" style={{ marginBottom: 0 }}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>{f.icon}</div>
            <div style={{ fontWeight: 600, color: '#F1F1F4', marginBottom: 6 }}>{f.title}</div>
            <p className="muted" style={{ fontSize: 13.5, lineHeight: 1.5, margin: 0 }}>
              {f.text}
            </p>
          </div>
        ))}
      </div>

      {/* Sample preview cards (static demos so feed never feels dead) */}
      <h2 className="serif" style={{ fontSize: 18, color: '#F1F1F4', marginBottom: 8 }}>
        What posts look like here
      </h2>
      <p className="faint" style={{ fontSize: 13, marginBottom: 14 }}>
        Example previews — publish real ones to fill the live feed.
      </p>

      {[
        {
          author: 'You',
          title: 'Understanding Binary Search Trees',
          excerpt:
            'Why balanced trees matter, how rotations work, and when a BST beats a hash map in practice.',
          tags: ['data-structures', 'algorithms'],
        },
        {
          author: 'You',
          title: 'React Hooks without the magic',
          excerpt:
            'useState and useEffect explained as plain state updates and scheduled effects — no metaphors required.',
          tags: ['react', 'frontend'],
        },
        {
          author: 'You',
          title: 'RAG in plain English',
          excerpt:
            'Chunk → embed → retrieve → generate. How citation-grounded chat with a blog actually works.',
          tags: ['ai', 'rag'],
        },
      ].map((demo) => (
        <article key={demo.title} className="card" style={{ opacity: 0.92 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div className="avatar">{demo.author.charAt(0)}</div>
            <span className="muted" style={{ fontSize: 13.5 }}>
              <b style={{ color: '#F1F1F4', fontWeight: 500 }}>{demo.author}</b>
              {' · '}Example preview
            </span>
            <span className="ai-pill" style={{ marginLeft: 'auto' }}>
              🧠 Learn This ready
            </span>
          </div>
          <h3 style={{ marginBottom: 8 }}>{demo.title}</h3>
          <p className="ex">{demo.excerpt}</p>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            {demo.tags.map((t) => (
              <span key={t} className="chip">
                {t}
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="faint" style={{ fontSize: 13 }}>
              Ask AI · Quiz · Flashcards
            </span>
            {isAuthenticated ? (
              <Link to="/write" className="ai-pill" style={{ color: '#C9C9FF', background: 'rgba(99,102,241,0.15)' }}>
                Write something like this →
              </Link>
            ) : (
              <Link to="/register" className="ai-pill" style={{ color: '#C9C9FF', background: 'rgba(99,102,241,0.15)' }}>
                Join to publish →
              </Link>
            )}
          </div>
        </article>
      ))}

      <div className="card" style={{ textAlign: 'center', padding: 28, marginTop: 8 }}>
        <p style={{ color: '#F1F1F4', marginBottom: 8, fontWeight: 500 }}>
          The feed fills when people publish.
        </p>
        <p className="muted" style={{ fontSize: 14, marginBottom: 16 }}>
          Be the first — one solid post unlocks Chat with AI, Learn This, and progress tracking.
        </p>
        <Link to={isAuthenticated ? '/write' : '/register'} className="btn btn-primary">
          {isAuthenticated ? 'Publish the first post' : 'Create an account'}
        </Link>
      </div>
    </div>
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
        const res =
          isAuthenticated && feedType === 'for-you'
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
      <div className="page">
        <div className="topbar">
          <h2>{feedType === 'for-you' ? 'For you' : 'Latest'}</h2>
          {isAuthenticated ? (
            <Link to="/write" className="btn btn-primary" style={{ padding: '9px 16px', fontSize: 13.5 }}>
              Write
            </Link>
          ) : (
            <Link to="/register" className="btn btn-primary" style={{ padding: '9px 16px', fontSize: 13.5 }}>
              Get started
            </Link>
          )}
        </div>

        {isAuthenticated && posts.length > 0 && (
          <div className="tabs">
            <button className={feedType === 'latest' ? 'on' : ''} onClick={() => setFeedType('latest')}>
              Latest
            </button>
            <button className={feedType === 'for-you' ? 'on' : ''} onClick={() => setFeedType('for-you')}>
              For you
            </button>
          </div>
        )}

        {loading && (
          <p className="muted" style={{ textAlign: 'center', padding: '64px 0' }}>
            Loading posts…
          </p>
        )}

        {!loading && posts.length === 0 && <EmptyDiscover isAuthenticated={isAuthenticated} />}

        {!loading &&
          posts.map((post, i) => {
            const href = post.slug ? `/post/${post.slug}` : `/post/${post._id}`;
            const excerpt = (post.excerpt || post.content || '')
              .replace(/#{1,6}\s*/g, '')
              .replace(/\n+/g, ' ')
              .trim()
              .substring(0, 160);
            return (
              <article
                key={post._id}
                className={`card ${i === 0 ? 'ambient-glow' : ''}`}
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(href)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div className="avatar">{post.author?.name?.charAt(0) || 'U'}</div>
                  <span className="muted" style={{ fontSize: 13.5 }}>
                    <b
                      style={{ color: '#F1F1F4', fontWeight: 500 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (post.author?._id) navigate(`/profile/${post.author._id}`);
                      }}
                    >
                      {post.author?.name || 'Unknown'}
                    </b>
                    {' · '}
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                  {i === 0 && (
                    <span className="ai-pill" style={{ marginLeft: 'auto' }}>
                      ✦ Featured
                    </span>
                  )}
                </div>
                <h3 style={{ marginBottom: 8 }}>{post.title}</h3>
                <p className="ex">{excerpt}{excerpt.length >= 160 ? '…' : ''}</p>
                {post.tags?.length > 0 && (
                  <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                    {post.tags.slice(0, 4).map((tag) => (
                      <span key={tag} className="chip">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: 18, color: '#5A6076', fontSize: 13 }}>
                    <span>❤ {post.likesCount || 0}</span>
                    <span>💬 {post.commentsCount || 0}</span>
                  </div>
                  <span className="ai-pill" style={{ color: '#C9C9FF', background: 'rgba(99,102,241,0.15)' }}>
                    Read · Ask AI →
                  </span>
                </div>
              </article>
            );
          })}
      </div>
    </Layout>
  );
}
