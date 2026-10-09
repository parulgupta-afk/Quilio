/** Predefined Quilio avatars (served from /public/avatars) */
export const AVATAR_OPTIONS = [
  { id: 'avatar-1', name: 'Violet Aurora', label: 'Avatar 1 · Violet Aurora (Cosmic Scholar)', url: '/avatars/avatar-1.svg', theme: 'violet' },
  { id: 'avatar-2', name: 'Cyan Nebula', label: 'Avatar 2 · Cyan Nebula (Deep Sky)', url: '/avatars/avatar-2.svg', theme: 'cyan' },
  { id: 'avatar-3', name: 'Emerald Spark', label: 'Avatar 3 · Emerald Spark (Jade Energy)', url: '/avatars/avatar-3.svg', theme: 'emerald' },
  { id: 'avatar-4', name: 'Amber Sunset', label: 'Avatar 4 · Amber Sunset (Warm Dusk)', url: '/avatars/avatar-4.svg', theme: 'amber' },
  { id: 'avatar-5', name: 'Rose Quartz', label: 'Avatar 5 · Rose Quartz (Soft Magenta)', url: '/avatars/avatar-5.svg', theme: 'rose' },
  { id: 'avatar-6', name: 'Electric Indigo', label: 'Avatar 6 · Electric Indigo (Vibrant Indigo)', url: '/avatars/avatar-6.svg', theme: 'indigo' },
  { id: 'avatar-7', name: 'Teal Mirage', label: 'Avatar 7 · Teal Mirage (Turquoise)', url: '/avatars/avatar-7.svg', theme: 'teal' },
  { id: 'avatar-8', name: 'Crimson Glow', label: 'Avatar 8 · Crimson Glow (Ruby Radiant)', url: '/avatars/avatar-8.svg', theme: 'crimson' },
  { id: 'avatar-9', name: 'Golden Sol', label: 'Avatar 9 · Golden Sol (Solar Gold)', url: '/avatars/avatar-9.svg', theme: 'gold' },
  { id: 'avatar-10', name: 'Fuchsia Neon', label: 'Avatar 10 · Fuchsia Neon (Ultraviolet)', url: '/avatars/avatar-10.svg', theme: 'fuchsia' },
  { id: 'avatar-11', name: 'Deep Ocean', label: 'Avatar 11 · Deep Ocean (Midnight Blue)', url: '/avatars/avatar-11.svg', theme: 'blue' },
  { id: 'avatar-12', name: 'Cosmic Violet', label: 'Avatar 12 · Cosmic Violet (Royal Purple)', url: '/avatars/avatar-12.svg', theme: 'purple' },
];


export function getInitials(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

