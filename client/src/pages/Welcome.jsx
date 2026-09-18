import { Link, Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function Welcome() {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0B0D12',
        color: '#F1F1F4',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top bar */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 32px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 600, fontSize: 18 }}>
          <span
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              background: 'linear-gradient(135deg,#6366F1,#A855F7)',
              display: 'grid',
              placeItems: 'center',
              fontSize: 14,
            }}
          >
            Q
          </span>
          Quilio
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link
            to="/login"
            style={{
              color: '#C9C9FF',
              fontSize: 14,
              padding: '10px 16px',
              textDecoration: 'none',
            }}
          >
            Log in
          </Link>
          <Link
            to="/register"
            style={{
              background: 'linear-gradient(135deg,#6366F1,#A855F7)',
              color: '#fff',
              fontSize: 14,
              fontWeight: 600,
              padding: '10px 18px',
              borderRadius: 10,
              textDecoration: 'none',
            }}
          >
            Sign up
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 24px 80px',
          textAlign: 'center',
          maxWidth: 720,
          margin: '0 auto',
        }}
      >
        <div
          style={{
            display: 'inline-block',
            padding: '6px 12px',
            borderRadius: 999,
            background: 'rgba(99,102,241,0.15)',
            border: '1px solid rgba(99,102,241,0.35)',
            color: '#C9C9FF',
            fontSize: 12,
            fontWeight: 600,
            marginBottom: 24,
          }}
        >
          AI-powered social learning
        </div>

        <h1
          style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: 'clamp(32px, 5vw, 48px)',
            fontWeight: 500,
            lineHeight: 1.2,
            margin: '0 0 16px',
            color: '#F1F1F4',
          }}
        >
          Learn from every post.
          <br />
          <span style={{ color: '#C9C9FF' }}>Not just read it.</span>
        </h1>

        <p
          style={{
            fontSize: 17,
            lineHeight: 1.65,
            color: '#8B93A7',
            margin: '0 0 32px',
            maxWidth: 520,
          }}
        >
          Quilio is a social blogging platform where every article becomes something you can ask,
          quiz yourself on, and grow from — with AI grounded in the post itself.
        </p>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link
            to="/register"
            style={{
              background: 'linear-gradient(135deg,#6366F1,#A855F7)',
              color: '#fff',
              fontWeight: 600,
              fontSize: 15,
              padding: '14px 28px',
              borderRadius: 12,
              textDecoration: 'none',
              boxShadow: '0 8px 32px rgba(99,102,241,0.35)',
            }}
          >
            Create free account
          </Link>
          <Link
            to="/login"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#F1F1F4',
              fontWeight: 500,
              fontSize: 15,
              padding: '14px 28px',
              borderRadius: 12,
              textDecoration: 'none',
            }}
          >
            Log in
          </Link>
        </div>

        {/* Feature row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 14,
            marginTop: 56,
            width: '100%',
            textAlign: 'left',
          }}
        >
          {[
            { icon: '✍️', t: 'Write & publish', d: 'Long-form posts with AI writing help' },
            { icon: '💬', t: 'Chat with a post', d: 'Ask questions grounded in the article' },
            { icon: '🧠', t: 'Learn This', d: 'Concepts, flashcards, and quizzes' },
            { icon: '📈', t: 'Track progress', d: 'See what you’ve mastered' },
          ].map((f) => (
            <div
              key={f.t}
              style={{
                background: '#15171F',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 14,
                padding: '18px 16px',
              }}
            >
              <div style={{ fontSize: 22, marginBottom: 8 }}>{f.icon}</div>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{f.t}</div>
              <div style={{ fontSize: 12.5, color: '#8B93A7', lineHeight: 1.45 }}>{f.d}</div>
            </div>
          ))}
        </div>

        <p style={{ marginTop: 40, fontSize: 13, color: '#5A6076' }}>
          Sign up to explore the feed, publish, and use AI learning tools.
        </p>
      </main>
    </div>
  );
}
