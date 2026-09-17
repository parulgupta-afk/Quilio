import { useState, useRef, useEffect } from 'react';
import api from '../services/api';
import useAuthStore from '../store/authStore';

const SUGGESTIONS = [
  'Explain this in simple terms',
  'What are the key takeaways?',
  'Give me a concrete example',
  'What should I know before reading this?',
  'Quiz me on the main ideas',
];

export default function ChatWithPost({ postId }) {
  const { isAuthenticated } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const ask = async (question) => {
    if (!question.trim() || loading) return;
    if (!isAuthenticated) {
      alert('Please login to chat with this post');
      return;
    }

    setInput('');
    setMessages((m) => [...m, { role: 'user', content: question }]);
    setLoading(true);
    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const { data } = await api.post(`/ai/chat/${postId}`, { question, history });
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          content: data.answer,
          sources: data.sources || [],
          grounded: true,
        },
      ]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          content: err.response?.data?.message || 'Failed to answer',
          grounded: false,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const send = (e) => {
    e.preventDefault();
    ask(input);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="btn btn-primary"
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 50,
          borderRadius: 999,
          padding: '12px 20px',
          boxShadow: '0 8px 32px rgba(99,102,241,0.35)',
        }}
      >
        🧠 Ask AI about this post
      </button>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 50,
        width: '100%',
        maxWidth: 400,
        height: 560,
        background: '#15171F',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 16,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 16px',
          background: 'linear-gradient(135deg,#6366F1,#A855F7)',
          color: '#fff',
        }}
      >
        <div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>🧠 Chat with this post</div>
          <div style={{ fontSize: 11, opacity: 0.85 }}>Answers grounded only in this article</div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          style={{ background: 'none', border: 'none', color: '#fff', fontSize: 20 }}
        >
          ×
        </button>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        {messages.length === 0 && (
          <div>
            <p style={{ textAlign: 'center', color: '#5A6076', fontSize: 13, marginBottom: 16 }}>
              Ask anything about this article. Answers use RAG + citations.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => ask(s)}
                  className="chip"
                  style={{ cursor: 'pointer', color: '#C9C9FF', borderColor: 'rgba(99,102,241,0.35)' }}
                >
                  💡 {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '88%',
            }}
          >
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 12,
                fontSize: 14,
                lineHeight: 1.55,
                background: msg.role === 'user' ? 'rgba(99,102,241,0.35)' : '#12141C',
                border: msg.role === 'assistant' ? '1px solid rgba(255,255,255,0.08)' : 'none',
                color: '#F1F1F4',
              }}
            >
              {msg.role === 'assistant' && msg.grounded && (
                <div className="ai-pill" style={{ marginBottom: 8, fontSize: 10 }}>
                  📄 Based on this article
                </div>
              )}
              {msg.content}
              {msg.sources?.length > 0 && (
                <div
                  style={{
                    marginTop: 8,
                    paddingTop: 8,
                    borderTop: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  {msg.sources.map((s) => (
                    <div key={s.index} style={{ fontSize: 11, color: '#8B93A7' }}>
                      [{s.index}] {s.text}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && <div style={{ color: '#5A6076', fontSize: 13 }}>Thinking…</div>}
        <div ref={endRef} />
      </div>

      {messages.length > 0 && (
        <div style={{ padding: '0 12px 8px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {SUGGESTIONS.slice(0, 3).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => ask(s)}
              className="chip"
              style={{ cursor: 'pointer', fontSize: 11 }}
              disabled={loading}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={send}
        style={{
          padding: 12,
          borderTop: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          gap: 8,
        }}
      >
        <input
          className="input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a follow-up…"
          disabled={loading}
          style={{ flex: 1 }}
        />
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading || !input.trim()}
          style={{ padding: '10px 14px' }}
        >
          Send
        </button>
      </form>
    </div>
  );
}
