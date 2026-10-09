import { useState, useRef, useEffect, useCallback } from 'react';
import { AVATAR_OPTIONS } from '../../constants/avatars';
import UserAvatar from '../UserAvatar';
import api from '../../services/api';

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

/**
 * Avatar chooser dropdown — works controlled (open + onToggle) or uncontrolled.
 */
export default function AvatarDropdownMenu({
  currentAvatar = '',
  userName = '',
  onSaved,
  open: openProp,
  onToggle,
}) {
  const isControlled = openProp !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = isControlled ? openProp : internalOpen;

  const setOpen = useCallback(
    (next) => {
      const value = typeof next === 'function' ? next(isOpen) : next;
      if (isControlled) onToggle?.(value);
      else setInternalOpen(value);
    },
    [isControlled, onToggle, isOpen]
  );

  const close = useCallback(() => setOpen(false), [setOpen]);
  const toggle = useCallback(() => setOpen(!isOpen), [setOpen, isOpen]);

  const [selected, setSelected] = useState(currentAvatar || '');
  const [previewLocal, setPreviewLocal] = useState('');
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const rootRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    setSelected(currentAvatar || '');
    setPreviewLocal('');
    setFile(null);
    setError('');
    setSuccess(false);
  }, [isOpen, currentAvatar]);

  useEffect(() => {
    return () => {
      if (previewLocal) URL.revokeObjectURL(previewLocal);
    };
  }, [previewLocal]);

  // Outside click + Escape — always closes controlled/uncontrolled
  useEffect(() => {
    if (!isOpen) return undefined;
    const onPointer = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) close();
    };
    const onKey = (e) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [isOpen, close]);

  const pickFile = (e) => {
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
    setPreviewLocal(URL.createObjectURL(f));
    setFile(f);
    setSelected('__custom__');
  };

  const selectPreset = (url) => {
    setError('');
    setSuccess(false);
    if (previewLocal) URL.revokeObjectURL(previewLocal);
    setPreviewLocal('');
    setFile(null);
    setSelected(url);
  };

  const clearToInitials = () => {
    setError('');
    if (previewLocal) URL.revokeObjectURL(previewLocal);
    setPreviewLocal('');
    setFile(null);
    setSelected('');
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess(false);
    try {
      let avatarUrl = selected === '__custom__' ? '' : selected;

      if (file) {
        const form = new FormData();
        form.append('image', file);
        const { data } = await api.post('/upload', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (!data?.url) throw new Error('Upload failed');
        avatarUrl = data.url;
      }

      const { data: updated } = await api.put('/users/me', {
        avatarUrl: avatarUrl || '',
      });

      setSuccess(true);
      onSaved?.(updated);
      setTimeout(() => close(), 350);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'Could not save avatar.'
      );
    } finally {
      setSaving(false);
    }
  };

  const displaySrc =
    previewLocal || (selected && selected !== '__custom__' ? selected : '');

  return (
    <div className="av-dd" ref={rootRef}>
      <button type="button" className="av-dd-trigger" onClick={toggle} aria-expanded={isOpen}>
        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
          face
        </span>
        Choose avatar
        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
          {isOpen ? 'expand_less' : 'expand_more'}
        </span>
      </button>

      {isOpen && (
        <div className="av-dd-panel" role="dialog" aria-label="Choose avatar">
          <div className="av-dd-preview">
            <UserAvatar src={displaySrc} name={userName} size={56} />
            <div>
              <strong>Preview</strong>
              <p>Select a preset or upload. Save to apply.</p>
            </div>
          </div>

          <div className="av-dd-grid">
            {AVATAR_OPTIONS.map((a) => {
              const active = !previewLocal && selected === a.url;
              return (
                <button
                  key={a.id}
                  type="button"
                  className={`av-dd-opt ${active ? 'is-active' : ''}`}
                  onClick={() => selectPreset(a.url)}
                  title={a.name}
                >
                  <img src={a.url} alt={a.name} loading="lazy" />
                </button>
              );
            })}
          </div>

          <div className="av-dd-actions-row">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              hidden
              onChange={pickFile}
            />
            <button
              type="button"
              className="av-dd-btn ghost"
              onClick={() => fileInputRef.current?.click()}
            >
              Upload image
            </button>
            <button type="button" className="av-dd-btn ghost" onClick={clearToInitials}>
              Use initials
            </button>
          </div>

          {error && <p className="av-dd-error">{error}</p>}
          {success && <p className="av-dd-ok">Saved</p>}

          <div className="av-dd-foot">
            <button type="button" className="av-dd-btn ghost" onClick={close} disabled={saving}>
              Cancel
            </button>
            <button
              type="button"
              className="av-dd-btn primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
