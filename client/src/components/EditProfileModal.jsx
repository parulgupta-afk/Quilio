import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import UserAvatar from './UserAvatar';
import api from '../services/api';

/**
 * Watermelon Edit-Profile inspired modal — Quilio dark theme.
 * Saves via PUT /api/users/me (existing API).
 */
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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open || !initial) return;
    setName(initial.name || '');
    setBio(initial.bio || '');
    setAvatarUrl(initial.avatarUrl || '');
    setError('');
  }, [open, initial]);

  // Sync if parent updates avatar while modal open (from AvatarPicker)
  useEffect(() => {
    if (open && initial?.avatarUrl !== undefined) {
      setAvatarUrl(initial.avatarUrl || '');
    }
  }, [initial?.avatarUrl, open]);

  const handleSave = async () => {
    if (!name.trim() || name.trim().length < 2) {
      setError('Name must be at least 2 characters.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const { data } = await api.put('/users/me', {
        name: name.trim(),
        bio: bio.slice(0, 300),
        avatarUrl: avatarUrl || '',
      });
      onSaved?.(data);
      onClose?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save profile.');
    } finally {
      setSaving(false);
    }
  };

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

            <div className="q-ep-avatar-row">
              <UserAvatar src={avatarUrl} name={name} size={72} />
              <div className="q-ep-avatar-actions">
                <button type="button" className="q-ep-btn soft" onClick={() => onChangeAvatar?.()}>
                  Change avatar
                </button>
                <span className="q-ep-hint">Preset or upload — saved with this form</span>
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
