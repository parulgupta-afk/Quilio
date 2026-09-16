import { useState, useRef, useEffect } from 'react';
import api from '../services/api';
import useAuthStore from '../store/authStore';

const SUGGESTIONS = [
  'Summarize in 3 lines',
  'Explain like I\'m new',
  'What are the key trade-offs?',
];

export default function ChatWithPost({ postId }) {
  const { isAuthenticated } = useAuthStore();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (question) => {
    if (!question.trim() || loading) return;

    if (!isAuthenticated) {
      alert('Please login to chat with this post');
      return;
    }

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: question }]);
    setLoading(true);

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const { data } = await api.post(`/ai/chat/${postId}`, { question, history });
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.answer, sources: data.sources || [] },
      ]);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to get answer. Try again.';
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `⚠️ ${message}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input.trim());
  };

  return (
    <div
      className="ambient-glow"
      style={{
        width: 360,
        flexShrink: 0,
        borderLeft: '1px solid var(--border)',
        padding: '24px 20px',
        position: 'sticky',
        top: 0,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C9C9FF" strokeWidth="1.8">
          <path d="M12 3a9 9 0 0 0-9 9 8.9 8.9 0 0 0 1.2 4.5L3 21l4.7-1.2A9 9 0 1 0 12 3Z" />
        </svg>
        <span style={{ fontSize: 13.5, fontWeight: 600, color: '#C9C9FF' }}>Ask about this article</span>
      </div>
      <p style={{ fontSize: 12.5, color: 'var(--text-faint)', marginBottom: 18, margin: '0 0 18px' }}>
        Answers are grounded only in this article's content.
      </p>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14, paddingRight: 4 }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-faint)', fontSize: 13.5 }}>
            <p style={{ margin: '0 0 6px' }}>Ask anything about this article.</p>
            <p style={{ margin: 0, fontSize: 12 }}>Answers cite specific sections.</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            {msg.role === 'user' ? (
              <div
                style={{
                  alignSelf: 'flex-end',
                  background: 'rgba(255,255,255,0.06)',
                  padding: '10px 14px',
                  borderRadius: '12px 12px 2px 12px',
                  fontSize: 14, maxWidth: '88%', color: 'var(--text)',
                }}
              >
                {msg.content}
              </div>
            ) : (
              <div
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  padding: '13px 15px',
                  borderRadius: '12px 12px 12px 2px',
                  fontSize: 14, lineHeight: 1.6, color: 'var(--text-muted)',
                  maxWidth: '96%',
                }}
              >
                <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{msg.content}</p>
                {msg.sources?.length > 0 && (
                  <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                    {msg.sources.map((s) => (
                      <span
                        key={s.index}
                        style={{
                          display: 'inline-block', fontSize: 11, fontWeight: 600,
                          color: '#C9C9FF', background: 'rgba(99,102,241,0.14)',
                          padding: '2px 8px', borderRadius: 100, marginRight: 6, marginTop: 4,
                          cursor: 'pointer',
                        }}
                      >
                        [{s.index}] {s.text?.substring(0, 40)}…
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div
            style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              padding: '13px 15px', borderRadius: '12px 12px 12px 2px',
              fontSize: 14, color: 'var(--text-faint)',
            }}
          >
            Thinking…
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion chips */}
      {messages.length === 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12, marginTop: 12 }}>
          {SUGGESTIONS.map((s) => (
            <span
              key={s}
              onClick={() => sendMessage(s)}
              style={{
                fontSize: 12, color: 'var(--text-muted)',
                border: '1px solid var(--border)', padding: '5px 10px',
                borderRadius: 100, cursor: 'pointer',
              }}
            >
              {s}
            </span>
          ))}
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        style={{
          marginTop: 14, display: 'flex', gap: 8,
          border: '1px solid var(--border-strong)', borderRadius: 12,
          padding: '6px 6px 6px 14px', alignItems: 'center',
          background: 'var(--bg-elevated)',
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a follow-up…"
          disabled={loading}
          style={{
            flex: 1, background: 'none', border: 'none', outline: 'none',
            color: 'var(--text)', fontSize: 14,
          }}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          style={{
            width: 32, height: 32, borderRadius: 8, border: 'none',
            background: 'linear-gradient(135deg,var(--accent-1),var(--accent-2))',
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0, opacity: (loading || !input.trim()) ? 0.45 : 1,
          }}
        >
          ↑
        </button>
      </form>
    </div>
  );
}
