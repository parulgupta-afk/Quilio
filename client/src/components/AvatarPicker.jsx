import { useEffect, useRef, useState } from 'react';
import api from '../services/api';
import { PRESET_AVATARS } from '../constants/avatars';
import UserAvatar from './UserAvatar';

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

/**
 * Local selection until Save. Does not touch auth login flow.
 */
export default function AvatarPicker({
  open,
  onClose,
  currentAvatar = '',
  userName = '',
  onSaved,
}) {
  const [selected, setSelected] = useState(currentAvatar || '');
  const [previewLocal, setPreviewLocal] = useState('');
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setSelected(currentAvatar || '');
      setPreviewLocal('');
      setFile(null);
      setError('');
    }
  }, [open, currentAvatar]);

  useEffect(() => {
    return () => {
      if (previewLocal) URL.revokeObjectURL(previewLocal);
    };
  }, [previewLocal]);

  if (!open) return null;

  const displaySrc = previewLocal || selected;

  const onPickFile = (e) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    if (!ALLOWED.includes(f.type)) {
      setError('Use JPEG, PNG, WebP, or GIF.');
      return;
    }
    if (f.size > MAX_BYTES) {
      setError('Image must be under 5MB.');
      return;
    }
    setError('');
    if (previewLocal) URL.revokeObjectURL(previewLocal);
    const url = URL.createObjectURL(f);
    setPreviewLocal(url);
    setFile(f);
    setSelected(''); // custom upload takes precedence in preview
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      let avatarUrl = selected;

      if (file) {
        const form = new FormData();
        form.append('image', file);
        const { data } = await api.post('/upload', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (!data?.url) throw new Error('Upload returned no URL');
        avatarUrl = data.url;
      }

      if (!avatarUrl && !file) {
        setError('Select a preset or upload an image.');
        setSaving(false);
        return;
      }

      const { data: updated } = await api.put('/users/me', { avatarUrl });
      onSaved?.(updated);
      onClose?.();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Could not save avatar. Your previous photo was kept.';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="q-av-overlay" role="dialog" aria-modal="true" aria-label="Choose avatar">
      <button type="button" className="q-av-backdrop" aria-label="Close" onClick={onClose} />
      <div className="q-av-modal">
        <header className="q-av-head">
          <h2>Choose your avatar</h2>
          <button type="button" className="q-av-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </header>

        <div className="q-av-preview-row">
          <UserAvatar src={displaySrc} name={userName} size={72} />
          <p className="q-av-preview-hint">Preview — nothing is saved until you press Save</p>
        </div>

        <div className="q-av-grid">
          {PRESET_AVATARS.map((src) => {
            const active = !previewLocal && selected === src;
            return (
              <button
                key={src}
                type="button"
                className={`q-av-option ${active ? 'is-selected' : ''}`}
                onClick={() => {
                  setFile(null);
                  if (previewLocal) URL.revokeObjectURL(previewLocal);
                  setPreviewLocal('');
                  setSelected(src);
                  setError('');
                }}
              >
                <img src={src} alt="" loading="lazy" />
              </button>
            );
          })}
        </div>

        <div className="q-av-divider">
          <span>Upload your own</span>
        </div>

        <div className="q-av-upload-row">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            hidden
            onChange={onPickFile}
          />
          <button type="button" className="q-av-btn ghost" onClick={() => inputRef.current?.click()}>
            Choose Image
          </button>
        </div>

        {error && <p className="q-av-error">{error}</p>}

        <footer className="q-av-actions">
          <button type="button" className="q-av-btn ghost" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="button" className="q-av-btn primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </footer>
      </div>
    </div>
  );
}
