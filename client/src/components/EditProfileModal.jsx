import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import UserAvatar from './UserAvatar';
import { AVATAR_OPTIONS } from '../constants/avatars';
import api from '../services/api';

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export default function EditProfileModal({
  open,
  onClose,
  initial,
  onSaved,
  onChangeAvatar,
}) {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [previewUpload, setPreviewUpload] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!open || !initial) return;
    setName(initial.name || '');
    setBio(initial.bio || '');
    setAvatarUrl(initial.avatarUrl || '');
    setUploadFile(null);
    setPreviewUpload('');
    setError('');
  }, [open, initial]);

  useEffect(() => {
    if (open && initial?.avatarUrl !== undefined) {
      setAvatarUrl(initial.avatarUrl || '');
    }
  }, [initial?.avatarUrl, open]);

  useEffect(() => {
    return () => {
      if (previewUpload) URL.revokeObjectURL(previewUpload);
    };
  }, [previewUpload]);

  const handlePickFile = (e) => {
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
    if (previewUpload) URL.revokeObjectURL(previewUpload);
    const url = URL.createObjectURL(f);
    setPreviewUpload(url);
    setUploadFile(f);
  };

  const handleDropdownAvatarChange = (val) => {
    setError('');
    if (val === '__custom__') {
      fileInputRef.current?.click();
      return;
    }
    if (uploadFile) {
      setUploadFile(null);
      if (previewUpload) URL.revokeObjectURL(previewUpload);
      setPreviewUpload('');
    }
    setAvatarUrl(val === '__initials__' ? '' : val);
  };

  const handleSave = async () => {
    if (!name.trim() || name.trim().length < 2) {
      setError('Name must be at least 2 characters.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      let finalAvatarUrl = avatarUrl;

      if (uploadFile) {
        const form = new FormData();
        form.append('image', uploadFile);
        const { data: uploadRes } = await api.post('/upload', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (!uploadRes?.url) throw new Error('Upload returned no URL');
        finalAvatarUrl = uploadRes.url;
      }

      const { data } = await api.put('/users/me', {
        name: name.trim(),
        bio: bio.slice(0, 300),
        avatarUrl: finalAvatarUrl || '',
      });
      onSaved?.(data);
      onClose?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save profile.');
    } finally {
      setSaving(false);
    }
  };

  const currentDisplay = previewUpload || avatarUrl;

  return (
    <AnimatePresence>
      {open && (
        <div className="q-ep-overlay" role="dialog" aria-modal="true" aria-label="Edit profile">
          <motion.button
            type="button"
            className="q-ep-backdrop"
            aria-label="Close"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="q-ep-modal"
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: 'spring', damping: 22, stiffness: 320 }}
          >
            <header className="q-ep-head">
              <div>
                <h2>Edit profile</h2>
                <p>Update how you appear across Quilio</p>
              </div>
              <button type="button" className="q-ep-x" onClick={onClose} aria-label="Close">
                ✕
              </button>
            </header>

            {/* Avatar Section with Dropdown Selector */}
            <div className="q-ep-avatar-row">
              <div className="rounded-full p-1 bg-gradient-to-tr from-violet-500 to-indigo-500 shrink-0">
                <UserAvatar src={currentDisplay} name={name} size={64} />
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                <div className="space-y-1">
                  <label htmlFor="modal-avatar-select" className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                    <span>Avatar Selection Menu:</span>
                  </label>
                  <select
                    id="modal-avatar-select"
                    value={uploadFile ? '__custom__' : avatarUrl === '' ? '__initials__' : avatarUrl}
                    onChange={(e) => handleDropdownAvatarChange(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#0c0d14] px-3 py-2 text-xs font-medium text-zinc-100 focus:border-violet-500 focus:outline-none"
                  >
                    <optgroup label="Preset Avatars">
                      {AVATAR_OPTIONS.map((a) => (
                        <option key={a.id} value={a.url}>
                          {a.label}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Options">
                      <option value="__custom__">📷 Upload Custom Photo...</option>
                      <option value="__initials__">🔤 Default Initials (No Photo)</option>
                    </optgroup>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-0.5">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    hidden
                    onChange={handlePickFile}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[11px] font-medium text-violet-300 hover:text-violet-200 transition"
                  >
                    {uploadFile ? 'Change image file' : 'Upload custom file'}
                  </button>
                  <span className="text-zinc-600">·</span>
                  <button
                    type="button"
                    onClick={() => handleDropdownAvatarChange('__initials__')}
                    className="text-[11px] text-zinc-400 hover:text-zinc-200 transition"
                  >
                    Use initials
                  </button>
                </div>
              </div>
            </div>

            <div className="q-ep-fields">
              <label className="q-ep-field">
                <span>Display name</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={50}
                  autoComplete="name"
                />
              </label>
              <label className="q-ep-field">
                <span>Email</span>
                <input type="email" value={initial?.email || ''} disabled readOnly />
              </label>
              <label className="q-ep-field">
                <span>Bio</span>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={300}
                  rows={3}
                  placeholder="What do you write and learn about?"
                />
                <em>{bio.length}/300</em>
              </label>
            </div>

            {error && <p className="q-ep-error">{error}</p>}

            <footer className="q-ep-foot">
              <button type="button" className="q-ep-btn ghost" onClick={onClose} disabled={saving}>
                Cancel
              </button>
              <button type="button" className="q-ep-btn primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            </footer>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
