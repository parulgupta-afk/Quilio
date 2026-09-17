import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Layout from '../components/Layout';

const MODES = [
  { id: 'brainstorm', label: 'Brainstorm', hint: 'Shape ideas into a direction' },
  { id: 'outline', label: 'Outline', hint: 'Structure the article' },
  { id: 'expand', label: 'Expand', hint: 'Turn notes into paragraphs' },
  { id: 'complete', label: 'Complete', hint: 'Continue the draft' },
  { id: 'review', label: 'Review', hint: 'Critique & suggestions' },
  { id: 'rewrite', label: 'Rewrite', hint: 'Clearer full draft' },
];

export default function CreatePost() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState('draft');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Write with AI
  const [aiOpen, setAiOpen] = useState(true);
  const [mode, setMode] = useState('brainstorm');
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const chatEnd = useRef(null);

  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const { data } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setCoverImageUrl(data.url);
    } catch {
      setError('Image upload failed (Cloudinary may not be configured)');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const tagArray = tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      const { data } = await api.post('/posts', {
        title,
        content,
        tags: tagArray,
        status,
        coverImageUrl,
      });
      navigate(`/post/${data.slug}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const sendToAI = async (e) => {
    e?.preventDefault();
    if (!aiInput.trim() || aiLoading) return;

    const message = aiInput.trim();
    setAiInput('');
    setMessages((m) => [...m, { role: 'user', content: message, mode }]);
    setAiLoading(true);

    try {
      const history = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));
      const { data } = await api.post('/ai/write', {
        mode,
        title,
        draft: content,
        message,
        history,
      });
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: data.reply, mode: data.mode },
      ]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          content: err.response?.data?.message || 'AI request failed. Check GEMINI_API_KEY and try again.',
        },
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  const applyToDraft = (text) => {
    setContent((prev) => (prev ? prev + '\n\n' + text : text));
  };

  const replaceDraft = (text) => {
    setContent(text);
  };

  return (
    <Layout>
      <div
        style={{
          display: 'flex',
          maxWidth: 1200,
          margin: '0 auto',
          padding: '24px 16px 80px',
          gap: 20,
          alignItems: 'flex-start',
        }}
      >
        {/* Editor */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 20,
            }}
          >
            <h1
              className="serif"
              style={{ fontSize: 26, fontWeight: 500, color: '#F1F1F4', margin: 0 }}
            >
              Write a new post
            </h1>
            <button
              type="button"
              className={aiOpen ? 'btn btn-ghost' : 'btn btn-primary'}
              style={{ padding: '9px 14px', fontSize: 13 }}
              onClick={() => setAiOpen((o) => !o)}
            >
              {aiOpen ? 'Hide AI' : '✨ Write with AI'}
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="card"
            style={{ display: 'flex', flexDirection: 'column', gap: 18 }}
          >
            {error && (
              <div
                style={{
                  background: 'rgba(239,68,68,0.12)',
                  color: '#fca5a5',
                  padding: 12,
                  borderRadius: 10,
                  fontSize: 14,
                }}
              >
                {error}
              </div>
            )}

            <div>
              <label className="muted" style={{ display: 'block', fontSize: 13, marginBottom: 6 }}>
                Title
              </label>
              <input
                className="input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Give your post a clear title"
                style={{ fontSize: 17 }}
              />
            </div>

            <div>
              <label className="muted" style={{ display: 'block', fontSize: 13, marginBottom: 6 }}>
                Cover image (optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ color: '#8B93A7', fontSize: 13 }}
              />
              {uploading && (
                <p className="faint" style={{ fontSize: 13, marginTop: 6 }}>
                  Uploading…
                </p>
              )}
              {coverImageUrl && (
                <img
                  src={coverImageUrl}
                  alt="Cover"
                  style={{
                    marginTop: 12,
                    maxHeight: 160,
                    borderRadius: 10,
                    objectFit: 'cover',
                  }}
                />
              )}
            </div>

            <div>
              <label className="muted" style={{ display: 'block', fontSize: 13, marginBottom: 6 }}>
                Content
              </label>
              <textarea
                className="input"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={16}
                placeholder="Write your post — or brainstorm with AI on the right, then apply text here…"
              />
            </div>

            <div>
              <label className="muted" style={{ display: 'block', fontSize: 13, marginBottom: 6 }}>
                Tags (comma separated)
              </label>
              <input
                className="input"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="javascript, algorithms, learning"
              />
            </div>

            <div style={{ display: 'flex', gap: 24, color: '#F1F1F4', fontSize: 14 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="status"
                  checked={status === 'draft'}
                  onChange={() => setStatus('draft')}
                />
                Draft
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="status"
                  checked={status === 'published'}
                  onChange={() => setStatus('published')}
                />
                Publish
              </label>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || uploading}
              style={{ alignSelf: 'flex-start' }}
            >
              {loading ? 'Saving…' : status === 'published' ? 'Publish Post' : 'Save Draft'}
            </button>
          </form>
        </div>

        {/* AI panel */}
        {aiOpen && (
          <aside
            className="card"
            style={{
              width: 380,
              flexShrink: 0,
              position: 'sticky',
              top: 24,
              height: 'calc(100vh - 80px)',
              display: 'flex',
              flexDirection: 'column',
              padding: 0,
              overflow: 'hidden',
              marginBottom: 0,
            }}
          >
            <div
              style={{
                padding: '14px 16px',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.15))',
              }}
            >
              <div style={{ fontWeight: 600, color: '#F1F1F4', fontSize: 14 }}>
                ✨ Write with AI
              </div>
              <div className="faint" style={{ fontSize: 12, marginTop: 4 }}>
                Share ideas · complete · review · rewrite
              </div>
            </div>

            {/* Modes */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 6,
                padding: '12px 12px 8px',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              {MODES.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMode(m.id)}
                  className="chip"
                  title={m.hint}
                  style={{
                    cursor: 'pointer',
                    borderColor: mode === m.id ? '#6366F1' : undefined,
                    color: mode === m.id ? '#C9C9FF' : undefined,
                    background: mode === m.id ? 'rgba(99,102,241,0.15)' : undefined,
                  }}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Messages */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: 12,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              {messages.length === 0 && (
                <div className="muted" style={{ fontSize: 13, lineHeight: 1.55, padding: 8 }}>
                  <p style={{ marginBottom: 10 }}>
                    Mode: <b style={{ color: '#C9C9FF' }}>{mode}</b>
                  </p>
                  <p style={{ marginBottom: 8 }}>Try saying:</p>
                  <ul style={{ paddingLeft: 18, margin: 0 }}>
                    <li style={{ marginBottom: 6 }}>
                      “I want to write about React hooks for beginners”
                    </li>
                    <li style={{ marginBottom: 6 }}>“Expand these bullet points into a section”</li>
                    <li style={{ marginBottom: 6 }}>“Review my draft for clarity”</li>
                    <li>“Rewrite the intro to be more engaging”</li>
                  </ul>
                </div>
              )}

              {messages.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '95%',
                  }}
                >
                  <div
                    style={{
                      padding: '10px 12px',
                      borderRadius: 12,
                      fontSize: 13.5,
                      lineHeight: 1.55,
                      background:
                        msg.role === 'user' ? 'rgba(99,102,241,0.3)' : '#12141C',
                      border:
                        msg.role === 'assistant'
                          ? '1px solid rgba(255,255,255,0.08)'
                          : 'none',
                      color: '#F1F1F4',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {msg.role === 'assistant' && msg.mode && (
                      <div className="ai-pill" style={{ marginBottom: 8, fontSize: 10 }}>
                        {msg.mode}
                      </div>
                    )}
                    {msg.content}
                    {msg.role === 'assistant' && (
                      <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          className="chip"
                          style={{ cursor: 'pointer', color: '#C9C9FF' }}
                          onClick={() => applyToDraft(msg.content)}
                        >
                          + Append to draft
                        </button>
                        <button
                          type="button"
                          className="chip"
                          style={{ cursor: 'pointer' }}
                          onClick={() => replaceDraft(msg.content)}
                        >
                          Replace draft
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {aiLoading && (
                <div className="faint" style={{ fontSize: 13 }}>
                  Thinking…
                </div>
              )}
              <div ref={chatEnd} />
            </div>

            <form
              onSubmit={sendToAI}
              style={{
                padding: 12,
                borderTop: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                gap: 8,
              }}
            >
              <input
                className="input"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                placeholder={
                  mode === 'review'
                    ? 'Ask for a review…'
                    : mode === 'brainstorm'
                      ? 'Share your idea…'
                      : 'Message the writing AI…'
                }
                disabled={aiLoading}
                style={{ flex: 1, fontSize: 13 }}
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={aiLoading || !aiInput.trim()}
                style={{ padding: '10px 12px' }}
              >
                Send
              </button>
            </form>
          </aside>
        )}
      </div>
    </Layout>
  );
}
