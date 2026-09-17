import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Layout from '../components/Layout';

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
      const tagArray = tags.split(',').map((t) => t.trim()).filter(Boolean);
      const { data } = await api.post('/posts', {
        title, content, tags: tagArray, status, coverImageUrl,
      });
      navigate(`/post/${data.slug}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="page">
        <h1 className="serif" style={{ fontSize: 28, fontWeight: 500, marginBottom: 28, color: '#F1F1F4' }}>
          Write a new post
        </h1>

        <form onSubmit={handleSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {error && (
            <div style={{ background: 'rgba(239,68,68,0.12)', color: '#fca5a5', padding: 12, borderRadius: 10, fontSize: 14 }}>
              {error}
            </div>
          )}

          <div>
            <label className="muted" style={{ display: 'block', fontSize: 13, marginBottom: 6 }}>Title</label>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Give your post a clear title" style={{ fontSize: 17 }} />
          </div>

          <div>
            <label className="muted" style={{ display: 'block', fontSize: 13, marginBottom: 6 }}>Cover image (optional)</label>
            <input type="file" accept="image/*" onChange={handleImageUpload} style={{ color: '#8B93A7', fontSize: 13 }} />
            {uploading && <p className="faint" style={{ fontSize: 13, marginTop: 6 }}>Uploading…</p>}
            {coverImageUrl && <img src={coverImageUrl} alt="Cover" style={{ marginTop: 12, maxHeight: 180, borderRadius: 10, objectFit: 'cover' }} />}
          </div>

          <div>
            <label className="muted" style={{ display: 'block', fontSize: 13, marginBottom: 6 }}>Content</label>
            <textarea className="input" value={content} onChange={(e) => setContent(e.target.value)} required rows={14} placeholder="Write your post…" />
          </div>

          <div>
            <label className="muted" style={{ display: 'block', fontSize: 13, marginBottom: 6 }}>Tags (comma separated)</label>
            <input className="input" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="javascript, algorithms, learning" />
          </div>

          <div style={{ display: 'flex', gap: 24, color: '#F1F1F4', fontSize: 14 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input type="radio" name="status" checked={status === 'draft'} onChange={() => setStatus('draft')} />
              Draft
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input type="radio" name="status" checked={status === 'published'} onChange={() => setStatus('published')} />
              Publish
            </label>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading || uploading} style={{ alignSelf: 'flex-start' }}>
            {loading ? 'Saving…' : status === 'published' ? 'Publish Post' : 'Save Draft'}
          </button>
        </form>
      </div>
    </Layout>
  );
}
