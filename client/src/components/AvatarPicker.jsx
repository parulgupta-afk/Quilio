import { useEffect, useRef, useState } from 'react';
import api from '../services/api';
import { AVATAR_OPTIONS, PRESET_AVATARS } from '../constants/avatars';
import UserAvatar from './UserAvatar';

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

/**
 * Avatar Picker dialog with dropdown menu selection, visual presets, and custom upload.
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

  const displaySrc = previewLocal || (selected !== '__custom__' ? selected : '');

  const onPickFile = (e) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    if (!ALLOWED.includes(f.type)) {
      setError('Use JPEG, PNG, WebP, or GIF format.');
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
    setSelected('__custom__');
  };

  const handleDropdownSelect = (val) => {
    setError('');
    if (val === '__custom__') {
      inputRef.current?.click();
      return;
    }
    if (val === '__initials__') {
      setFile(null);
      if (previewLocal) URL.revokeObjectURL(previewLocal);
      setPreviewLocal('');
      setSelected('');
      return;
    }
    setFile(null);
    if (previewLocal) URL.revokeObjectURL(previewLocal);
    setPreviewLocal('');
    setSelected(val);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      let avatarUrl = selected === '__custom__' ? '' : selected;

      if (file) {
        const form = new FormData();
        form.append('image', file);
        const { data } = await api.post('/upload', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (!data?.url) throw new Error('Upload returned no URL');
        avatarUrl = data.url;
      }

      const { data: updated } = await api.put('/users/me', { avatarUrl: avatarUrl || '' });
      onSaved?.(updated);
      onClose?.();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Could not save avatar. Please try again.';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const activeOption = AVATAR_OPTIONS.find((a) => a.url === selected);

  return (
    <div className="q-av-overlay" role="dialog" aria-modal="true" aria-label="Choose avatar">
      <button type="button" className="q-av-backdrop" aria-label="Close" onClick={onClose} />
      <div className="q-av-modal">
        <header className="q-av-head">
          <div>
            <h2>Choose your avatar</h2>
            <p className="text-xs text-zinc-400 mt-0.5">Select from the dropdown menu or presets</p>
          </div>
          <button type="button" className="q-av-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </header>

        {/* Preview */}
        <div className="q-av-preview-row">
          <div className="rounded-full p-1 bg-gradient-to-tr from-violet-500 to-indigo-500">
            <UserAvatar src={displaySrc} name={userName} size={72} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-zinc-100">
              {activeOption ? activeOption.name : file ? file.name : displaySrc ? 'Custom Photo' : 'Initials Default'}
            </p>
            <p className="q-av-preview-hint">Preview — nothing is saved until you press Save</p>
          </div>
        </div>

        {/* Dropdown Menu */}
        <div className="mb-4">
          <label htmlFor="av-picker-select" className="block mb-1.5 text-xs font-semibold text-zinc-300">
            Select Avatar Style from Dropdown:
          </label>
          <div className="relative">
            <select
              id="av-picker-select"
              value={file ? '__custom__' : selected === '' ? '__initials__' : selected}
              onChange={(e) => handleDropdownSelect(e.target.value)}
              className="w-full appearance-none rounded-xl border border-white/10 bg-[#0d0e15] px-3.5 py-2.5 pr-8 text-xs font-medium text-zinc-100 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer"
            >
              <optgroup label="Preset Avatars">
                {AVATAR_OPTIONS.map((a) => (
                  <option key={a.id} value={a.url}>
                    {a.label}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Options">
                <option value="__custom__">📷 Upload Custom Image...</option>
                <option value="__initials__">🔤 Default Initials (No Photo)</option>
              </optgroup>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-zinc-400">
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3zm-3.75 9.25a.75.75 0 011.1 1.02L10 16.148l2.7-2.908a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 01.05-1.02z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        {/* Visual Preset Grid */}
        <div className="q-av-grid">
          {AVATAR_OPTIONS.map((a) => {
            const active = !file && selected === a.url;
            return (
              <button
                key={a.id}
                type="button"
                className={`q-av-option ${active ? 'is-selected' : ''}`}
                onClick={() => {
                  setFile(null);
                  if (previewLocal) URL.revokeObjectURL(previewLocal);
                  setPreviewLocal('');
                  setSelected(a.url);
                  setError('');
                }}
                title={a.name}
              >
                <img src={a.url} alt={a.name} loading="lazy" />
              </button>
            );
          })}
        </div>

        <div className="q-av-divider">
          <span>Or upload your own image</span>
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
            {file ? 'Change file' : 'Choose Image File'}
          </button>
          <button
            type="button"
            className="text-xs text-zinc-400 hover:text-zinc-200"
            onClick={() => handleDropdownSelect('__initials__')}
          >
            Clear (Use Initials)
          </button>
        </div>

        {error && <p className="q-av-error">{error}</p>}

        <footer className="q-av-actions">
          <button type="button" className="q-av-btn ghost" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="button" className="q-av-btn primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save Avatar'}
          </button>
        </footer>
      </div>
    </div>
  );
}
