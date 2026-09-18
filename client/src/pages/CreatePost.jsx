import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Layout from '../components/Layout';

const MODES = [
  { id: 'brainstorm', label: 'Brainstorm', icon: 'lightbulb', hint: 'Shape ideas into a direction' },
  { id: 'outline', label: 'Outline', icon: 'format_list_bulleted', hint: 'Structure the article' },
  { id: 'expand', label: 'Expand', icon: 'open_in_full', hint: 'Turn notes into paragraphs' },
  { id: 'complete', label: 'Complete', icon: 'auto_fix_high', hint: 'Continue the draft' },
  { id: 'review', label: 'Review', icon: 'rate_review', hint: 'Critique & suggestions' },
  { id: 'rewrite', label: 'Rewrite', icon: 'restart_alt', hint: 'Clearer full draft' },
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
      const { data } = await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setCoverImageUrl(data.url);
    } catch { setError('Image upload failed (Cloudinary may not be configured)'); }
    finally { setUploading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const tagArray = tags.split(',').map(t => t.trim()).filter(Boolean);
      const { data } = await api.post('/posts', { title, content, tags: tagArray, status, coverImageUrl });
      navigate(`/post/${data.slug}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create post');
    } finally { setLoading(false); }
  };

  const sendToAI = async (e) => {
    e?.preventDefault();
    if (!aiInput.trim() || aiLoading) return;
    const message = aiInput.trim();
    setAiInput('');
    setMessages(m => [...m, { role: 'user', content: message, mode }]);
    setAiLoading(true);
    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const { data } = await api.post('/ai/write', { mode, title, draft: content, message, history });
      setMessages(m => [...m, { role: 'assistant', content: data.reply, mode: data.mode }]);
    } catch (err) {
      setMessages(m => [...m, { role: 'assistant', content: err.response?.data?.message || 'AI request failed. Check GEMINI_API_KEY.' }]);
    } finally { setAiLoading(false); }
  };

  const applyToDraft = (text) => { setContent(prev => prev ? prev + '\n\n' + text : text); };
  const replaceDraft = (text) => { setContent(text); };

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

  return (
    <Layout>
      <div style={{ display: 'flex', maxWidth: 1280, margin: '0 auto', minHeight: 'calc(100vh - 144px)', flexDirection: 'column' }}>

        {/* ── Draft Status Bar ── */}
        <div className="ns-draft-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#908fa0' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16, color: status === 'published' ? '#22c55e' : '#c0c1ff' }}>
              {status === 'published' ? 'cloud_done' : 'edit_document'}
            </span>
            <span style={{ fontWeight: 500, color: status === 'published' ? '#22c55e' : '#c0c1ff' }}>
              {status === 'published' ? 'Publishing' : 'Draft'}
            </span>
            <span>·</span>
            <span>{wordCount} words</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 12, color: '#908fa0' }}>
              <input
                type="checkbox"
                style={{ accentColor: '#8083ff', width: 14, height: 14 }}
                checked={status === 'published'}
                onChange={e => setStatus(e.target.checked ? 'published' : 'draft')}
              />
              Publish when saved
            </label>
            <button
              type="button"
              className={aiOpen ? 'ns-btn ns-btn-surface' : 'ns-btn ns-btn-gradient'}
              style={{ padding: '6px 12px', fontSize: 12, gap: 6 }}
              onClick={() => setAiOpen(o => !o)}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 15 }}>auto_awesome</span>
              {aiOpen ? 'Hide AI' : 'AI Co-author'}
            </button>
          </div>
        </div>

        {/* ── Main layout ── */}
        <div style={{ flex: 1, display: 'flex', gap: 0, alignItems: 'stretch' }}>

          {/* Editor Panel */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            {/* Toolbar */}
            <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="ns-editor-toolbar">
                {[
                  { icon: 'format_bold', label: 'Bold' },
                  { icon: 'format_italic', label: 'Italic' },
                  { icon: 'title', label: 'Heading' },
                  { icon: 'format_quote', label: 'Quote' },
                  { icon: 'code', label: 'Code' },
                  { icon: 'format_list_bulleted', label: 'List' },
                  { icon: 'link', label: 'Link' },
                ].map(t => (
                  <button key={t.icon} className="ns-editor-tool" title={t.label} type="button">
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{t.icon}</span>
                  </button>
                ))}
                <div className="ns-editor-divider" />
                <button className="ns-editor-tool ns-editor-tool-ai" title="AI Rewrite Selection" type="button" onClick={() => setAiOpen(true)}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>auto_fix_high</span>
                  <span style={{ fontSize: 11, marginLeft: 2 }}>AI</span>
                </button>
              </div>
            </div>

            {/* Editor form */}
            <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px 24px', gap: 18 }}>
              {error && <div className="ns-error">{error}</div>}

              {/* Title */}
              <div>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                  placeholder="Give your post a clear, compelling title…"
                  style={{
                    width: '100%', background: 'transparent', border: 'none', outline: 'none',
                    fontFamily: "'Newsreader', serif", fontSize: 'clamp(22px, 4vw, 30px)', fontWeight: 500,
                    color: '#e2e2e9', padding: 0, lineHeight: 1.25,
                  }}
                />
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

              {/* Tags inline */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#908fa0' }}>sell</span>
                <input
                  value={tags}
                  onChange={e => setTags(e.target.value)}
                  placeholder="Add tags (comma separated): javascript, algorithms…"
                  style={{
                    background: 'transparent', border: 'none', outline: 'none',
                    fontSize: 13, color: '#c7c4d7', flex: 1,
                  }}
                />
              </div>

              {/* Cover image */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13, color: '#908fa0', padding: '6px 12px', borderRadius: 9999, background: '#1a1b21', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>image</span>
                  {uploading ? 'Uploading…' : 'Cover image'}
                  <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                </label>
                {coverImageUrl && (
                  <img src={coverImageUrl} alt="Cover" style={{ height: 40, borderRadius: 8, objectFit: 'cover' }} />
                )}
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

              {/* Content textarea */}
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                required
                placeholder="Write your post — or brainstorm with AI on the right, then apply text here…"
                style={{
                  flex: 1, minHeight: 360, background: 'transparent', border: 'none', outline: 'none', resize: 'none',
                  fontFamily: "'Newsreader', serif", fontSize: 17, lineHeight: 1.8, color: '#DADCE4',
                  padding: 0,
                }}
              />

              {/* Submit row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <button
                  type="submit"
                  className="ns-btn ns-btn-gradient"
                  disabled={loading || uploading}
                  style={{ gap: 8 }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 17 }}>
                    {status === 'published' ? 'publish' : 'save'}
                  </span>
                  {loading ? 'Saving…' : status === 'published' ? 'Publish Post' : 'Save Draft'}
                </button>
                <span style={{ fontSize: 12, color: '#464554' }}>{wordCount} words · {Math.ceil(wordCount / 200)} min read</span>
              </div>
            </form>
          </div>

          {/* ── AI Co-Author Panel ── */}
          {aiOpen && (
            <aside style={{
              width: 380, flexShrink: 0, borderLeft: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', flexDirection: 'column', height: 'calc(100vh - 144px)',
              position: 'sticky', top: 144, background: '#0c0e13',
            }}>
              {/* Panel header */}
              <div style={{
                padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)',
                background: 'linear-gradient(135deg, rgba(128,131,255,0.12), rgba(110,0,190,0.08))',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#ddb7ff' }}>auto_awesome</span>
                  <span style={{ fontWeight: 600, color: '#e2e2e9', fontSize: 14 }}>AI Co-author</span>
                  <button
                    type="button"
                    onClick={() => setAiOpen(false)}
                    style={{ marginLeft: 'auto', color: '#908fa0', fontSize: 18 }}
                    className="ns-icon-btn"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
                  </button>
                </div>
                <p style={{ fontSize: 11, color: '#908fa0', margin: 0 }}>Brainstorm · outline · expand · review · rewrite</p>
              </div>

              {/* Mode selector */}
              <div style={{ padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="ns-mode-scroller">
                  {MODES.map(m => (
                    <button
                      key={m.id}
                      type="button"
                      className={`ns-mode-btn${mode === m.id ? ' active' : ''}`}
                      title={m.hint}
                      onClick={() => setMode(m.id)}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {messages.length === 0 && (
                  <div style={{ padding: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#c0c1ff' }}>info</span>
                      <span style={{ fontSize: 12, color: '#908fa0', fontWeight: 500 }}>Mode: <b style={{ color: '#c0c1ff' }}>{mode}</b></span>
                    </div>
                    <p style={{ fontSize: 12, color: '#908fa0', marginBottom: 8 }}>Try saying:</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {[
                        '"I want to write about React hooks for beginners"',
                        '"Expand these bullet points into a section"',
                        '"Review my draft for clarity"',
                        '"Rewrite the intro to be more engaging"',
                      ].map((s, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => { setAiInput(s.replace(/"/g, '')); }}
                          style={{
                            background: '#1a1b21', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10,
                            padding: '8px 12px', fontSize: 12, color: '#c7c4d7', cursor: 'pointer', textAlign: 'left',
                            transition: 'background 0.15s',
                          }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((msg, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                    <div className={msg.role === 'user' ? 'ns-bubble-user' : 'ns-bubble-ai'}>
                      {msg.role === 'assistant' && msg.mode && (
                        <span className="ns-ai-pill" style={{ marginBottom: 8, fontSize: 10 }}>{msg.mode}</span>
                      )}
                      {msg.content}
                      {msg.role === 'assistant' && (
                        <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            className="ns-chip"
                            style={{ cursor: 'pointer', color: '#c0c1ff', borderColor: 'rgba(192,193,255,0.25)' }}
                            onClick={() => applyToDraft(msg.content)}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: 12 }}>add</span>
                            Append to draft
                          </button>
                          <button
                            type="button"
                            className="ns-chip"
                            style={{ cursor: 'pointer' }}
                            onClick={() => replaceDraft(msg.content)}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: 12 }}>swap_horiz</span>
                            Replace draft
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {aiLoading && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#908fa0' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16, animation: 'spin 1s linear infinite', color: '#c0c1ff' }}>progress_activity</span>
                    Thinking…
                  </div>
                )}
                <div ref={chatEnd} />
              </div>

              {/* Chat input */}
              <form onSubmit={sendToAI} style={{ padding: '10px 12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="ns-chat-input-wrap">
                  <input
                    className="ns-chat-input"
                    value={aiInput}
                    onChange={e => setAiInput(e.target.value)}
                    placeholder={
                      mode === 'review' ? 'Ask for a review…'
                      : mode === 'brainstorm' ? 'Share your idea…'
                      : 'Message the writing AI…'
                    }
                    disabled={aiLoading}
                  />
                  <button
                    type="submit"
                    className="ns-chat-send"
                    disabled={aiLoading || !aiInput.trim()}
                    style={{ opacity: aiLoading || !aiInput.trim() ? 0.4 : 1 }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_upward</span>
                  </button>
                </div>
              </form>
            </aside>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </Layout>
  );
}
