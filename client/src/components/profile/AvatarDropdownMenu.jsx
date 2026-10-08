import { useState, useRef, useEffect } from 'react';
import { AVATAR_OPTIONS, PRESET_AVATARS } from '../../constants/avatars';
import UserAvatar from '../UserAvatar';
import api from '../../services/api';

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export default function AvatarDropdownMenu({
  currentAvatar = '',
  userName = '',
  onSaved,
  open,
  onToggle,
  onClose,
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onToggle || ((val) => setInternalOpen(val));

  const [selected, setSelected] = useState(currentAvatar || '');
  const [previewLocal, setPreviewLocal] = useState('');
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const menuRef = useRef(null);
  const fileInputRef = useRef(null);

  // Sync with current avatar when opened
  useEffect(() => {
    if (isOpen) {
      setSelected(currentAvatar || '');
      setPreviewLocal('');
      setFile(null);
      setError('');
      setSuccess(false);
    }
  }, [isOpen, currentAvatar]);

  // Clean up blob URL on unmount or change
  useEffect(() => {
    return () => {
      if (previewLocal) URL.revokeObjectURL(previewLocal);
    };
  }, [previewLocal]);

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        if (onClose) onClose();
        else setInternalOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (onClose) onClose();
        else setInternalOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handlePickFile = (e) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    if (!ALLOWED.includes(f.type)) {
      setError('Supported formats: JPEG, PNG, WebP, or GIF.');
      return;
    }
    if (f.size > MAX_BYTES) {
      setError('Image file must be under 5MB.');
      return;
    }
    setError('');
    if (previewLocal) URL.revokeObjectURL(previewLocal);
    const url = URL.createObjectURL(f);
    setPreviewLocal(url);
    setFile(f);
    setSelected('__custom__');
  };

  const handleDropdownChange = (val) => {
    setError('');
    if (val === '__custom__') {
      fileInputRef.current?.click();
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

  const handleSelectPreset = (url) => {
    setFile(null);
    if (previewLocal) URL.revokeObjectURL(previewLocal);
    setPreviewLocal('');
    setSelected(url);
    setError('');
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

      const { data: updated } = await api.put('/users/me', {
        avatarUrl: avatarUrl || '',
      });

      setSuccess(true);
      onSaved?.(updated);
      setTimeout(() => {
        if (onClose) onClose();
        else setInternalOpen(false);
      }, 400);
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

  const displaySrc = previewLocal || (selected !== '__custom__' ? selected : '');
  const activeOption = AVATAR_OPTIONS.find((a) => a.url === selected);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      {/* Dropdown Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="group inline-flex items-center gap-1.5 rounded-full border border-violet-500/25 bg-violet-500/10 px-3 py-1.5 text-xs font-semibold text-violet-300 transition-all hover:border-violet-400/40 hover:bg-violet-500/20 active:scale-95"
        aria-expanded={isOpen}
        aria-haspopup="true"
        title="Choose avatar dropdown"
      >
        <span className="material-symbols-outlined text-[15px] transition-transform group-hover:rotate-12">
          face
        </span>
        <span>Choose Avatar</span>
        <svg
          className={`h-3.5 w-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180 text-violet-200' : 'text-violet-400'}`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Dropdown Menu Overlay / Card */}
      {isOpen && (
        <div
          className="absolute left-1/2 z-50 mt-2 w-[340px] -translate-x-1/2 sm:left-0 sm:translate-x-0 sm:w-[380px] rounded-2xl border border-white/10 bg-[#12131c]/95 p-4 shadow-2xl shadow-black/80 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150"
          role="menu"
          aria-orientation="vertical"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-500/20 text-xs text-violet-300">
                ✦
              </span>
              <div>
                <h4 className="text-sm font-semibold text-zinc-100">Choose Avatar</h4>
                <p className="text-[11px] text-zinc-400">Select via dropdown menu or grid</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => (onClose ? onClose() : setInternalOpen(false))}
              className="rounded-full p-1 text-zinc-400 hover:bg-white/10 hover:text-white"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* Live Preview Row */}
          <div className="my-3.5 flex items-center gap-3.5 rounded-xl border border-white/[0.06] bg-black/30 p-2.5">
            <div className="rounded-full p-1 bg-gradient-to-tr from-violet-500 to-indigo-500">
              <UserAvatar src={displaySrc} name={userName} size={50} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-zinc-200">
                {activeOption ? activeOption.name : file ? file.name : displaySrc ? 'Custom Avatar' : 'Initials Default'}
              </p>
              <p className="text-[11px] text-zinc-400">
                {activeOption?.description || (displaySrc ? 'Selected photo preview' : 'Using name initials')}
              </p>
            </div>
          </div>

          {/* Dropdown Menu Selector */}
          <div className="space-y-1.5">
            <label htmlFor="avatar-dropdown-select" className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
              <span>Select from Dropdown:</span>
              <span className="text-[10px] text-violet-400 font-normal">12 Curated Avatars</span>
            </label>
            <div className="relative">
              <select
                id="avatar-dropdown-select"
                value={file ? '__custom__' : selected === '' ? '__initials__' : selected}
                onChange={(e) => handleDropdownChange(e.target.value)}
                className="w-full appearance-none rounded-xl border border-white/10 bg-[#0c0d14] px-3.5 py-2.5 pr-8 text-xs font-medium text-zinc-100 shadow-inner focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer"
              >
                <optgroup label="Preset Avatars">
                  {AVATAR_OPTIONS.map((a) => (
                    <option key={a.id} value={a.url}>
                      {a.label}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Other Options">
                  <option value="__custom__">📷 Upload Custom Image File...</option>
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

          {/* Quick Grid Selector */}
          <div className="mt-3">
            <span className="block mb-2 text-[11px] font-medium text-zinc-400">
              Or click to pick an avatar:
            </span>
            <div className="grid grid-cols-6 gap-2">
              {AVATAR_OPTIONS.map((a) => {
                const isSelected = !file && selected === a.url;
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => handleSelectPreset(a.url)}
                    className={`relative rounded-full p-0.5 transition-all duration-150 ${
                      isSelected
                        ? 'ring-2 ring-violet-400 ring-offset-2 ring-offset-[#12131c] scale-110 shadow-md shadow-violet-500/30'
                        : 'opacity-75 hover:opacity-100 hover:scale-105'
                    }`}
                    title={a.name}
                  >
                    <img
                      src={a.url}
                      alt={a.name}
                      className="h-10 w-10 rounded-full object-cover"
                      loading="lazy"
                    />
                    {isSelected && (
                      <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-violet-500 text-[8px] text-white font-bold ring-1 ring-[#12131c]">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Upload Custom File */}
          <div className="mt-3 flex items-center justify-between border-t border-white/[0.06] pt-3">
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
              className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-violet-300 transition"
            >
              <span className="material-symbols-outlined text-[14px]">upload_file</span>
              <span>{file ? 'Change file' : 'Upload custom image'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleDropdownChange('__initials__')}
              className="text-[11px] text-zinc-500 hover:text-zinc-300 transition"
            >
              Reset to initials
            </button>
          </div>

          {error && <p className="mt-2 text-xs text-rose-400">{error}</p>}
          {success && <p className="mt-2 text-xs text-emerald-400">Avatar updated successfully!</p>}

          {/* Footer Actions */}
          <div className="mt-4 flex items-center justify-end gap-2 border-t border-white/[0.08] pt-3">
            <button
              type="button"
              onClick={() => (onClose ? onClose() : setInternalOpen(false))}
              disabled={saving}
              className="rounded-full px-3.5 py-1.5 text-xs font-semibold text-zinc-400 hover:bg-white/5 hover:text-zinc-200 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-zinc-950 transition hover:bg-zinc-200 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent" />
                  Saving...
                </>
              ) : (
                'Save Avatar'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
