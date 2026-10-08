import { useState } from 'react';
import { Link } from 'react-router-dom';
import UserAvatar from '../UserAvatar';
import AvatarCircles from '../AvatarCircles';
import AvatarDropdownMenu from './AvatarDropdownMenu';

export default function ProfileHeader({
  profile,
  isSelf,
  isAuthenticated,
  following,
  onFollow,
  onEdit,
  onAvatar,
  onLogout,
  postCount,
  circles = [],
  onAvatarSaved,
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const joined = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString(undefined, {
        month: 'short',
        year: 'numeric',
      })
    : null;

  return (
    <header className="mb-10">
      {/* Cover Banner */}
      <div
        className="relative h-36 w-full overflow-hidden rounded-2xl border border-white/[0.08] sm:h-48 sm:rounded-3xl"
        style={{
          background:
            'radial-gradient(ellipse 80% 120% at 20% 30%, rgba(99,102,241,0.35), transparent 60%), radial-gradient(ellipse 60% 100% at 85% 20%, rgba(168,85,247,0.22), transparent 55%), linear-gradient(135deg, #131422, #0b0c12)',
        }}
        aria-hidden
      >
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:20px_20px] opacity-60" />
      </div>

      {/* Main Info Section */}
      <div className="-mt-14 flex flex-col gap-6 px-2 sm:-mt-20 sm:flex-row sm:items-end sm:justify-between sm:gap-6 sm:px-4">
        {/* Left: Avatar & Identity */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
          {/* Avatar with Ring & Dropdown */}
          <div className="relative flex shrink-0 flex-col items-center sm:items-start">
            <div className="group relative rounded-full bg-gradient-to-tr from-violet-500 via-indigo-500 to-fuchsia-500 p-[3px] shadow-xl shadow-violet-500/20">
              <div className="rounded-full bg-[#0c0e14] p-1">
                <UserAvatar
                  src={profile.avatarUrl}
                  name={profile.name}
                  size={104}
                  onClick={isSelf ? () => setDropdownOpen(!dropdownOpen) : undefined}
                  title={isSelf ? 'Choose avatar' : profile.name}
                  className="transition duration-200 group-hover:scale-105"
                />
              </div>

              {/* Quick camera icon badge if self */}
              {isSelf && (
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="absolute bottom-1 right-1 flex h-7 w-7 items-center justify-center rounded-full bg-violet-600 text-white shadow-lg ring-2 ring-[#0c0e14] transition hover:bg-violet-500 hover:scale-110 active:scale-95"
                  title="Choose avatar"
                >
                  <span className="material-symbols-outlined text-[15px]">photo_camera</span>
                </button>
              )}
            </div>

            {/* Dropdown Menu for Choosing Avatar */}
            {isSelf && (
              <div className="mt-2.5">
                <AvatarDropdownMenu
                  currentAvatar={profile.avatarUrl || ''}
                  userName={profile.name}
                  onSaved={onAvatarSaved}
                  open={dropdownOpen}
                  onToggle={setDropdownOpen}
                  onClose={() => setDropdownOpen(false)}
                />
              </div>
            )}
          </div>

          {/* Identity details */}
          <div className="min-w-0 flex-1 pb-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <h1 className="truncate text-2xl font-bold tracking-tight text-white sm:text-3xl">
                {profile.name}
              </h1>
              {profile.reputationScore > 0 && (
                <span
                  className="inline-flex items-center gap-1 rounded-full border border-violet-400/30 bg-violet-500/10 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-violet-300"
                  title="Reputation Score"
                >
                  <span className="text-amber-400">★</span>
                  <span>{profile.reputationScore} rep</span>
                </span>
              )}
            </div>

            {profile.email && isSelf && (
              <p className="mt-1 text-xs text-zinc-400">{profile.email}</p>
            )}

            {profile.bio ? (
              <p className="mt-2.5 max-w-xl text-sm leading-relaxed text-zinc-300">
                {profile.bio}
              </p>
            ) : isSelf ? (
              <p className="mt-2.5 text-sm italic text-zinc-500">
                Add a short bio so others know what you write about.
              </p>
            ) : null}

            {/* Stats row with clean pill cards */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5 sm:justify-start">
              <div className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-xs">
                <span className="font-bold text-white">{postCount}</span>
                <span className="text-zinc-400">Posts</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-xs">
                <span className="font-bold text-white">{profile.followersCount || 0}</span>
                <span className="text-zinc-400">Followers</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-xs">
                <span className="font-bold text-white">{profile.followingCount || 0}</span>
                <span className="text-zinc-400">Following</span>
              </div>
              {joined && (
                <div className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-xs">
                  <span className="text-zinc-500">Joined</span>
                  <span className="font-medium text-zinc-300">{joined}</span>
                </div>
              )}
            </div>

            {circles.length > 0 && (
              <div className="mt-3.5 flex items-center justify-center gap-3 sm:justify-start">
                <AvatarCircles
                  avatarUrls={circles}
                  numPeople={Math.max(0, (profile.followersCount || 0) - circles.length)}
                  size={30}
                />
                <span className="text-xs text-zinc-500">Network connection</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:justify-end sm:pb-2">
          {isAuthenticated && !isSelf && (
            <button
              type="button"
              onClick={onFollow}
              className={`inline-flex items-center rounded-full px-5 py-2 text-sm font-semibold transition shadow-sm ${
                following
                  ? 'border border-white/15 bg-white/5 text-zinc-200 hover:bg-white/10'
                  : 'bg-white text-zinc-950 hover:bg-zinc-200'
              }`}
            >
              {following ? 'Following' : 'Follow'}
            </button>
          )}

          {isSelf && (
            <>
              <button
                type="button"
                onClick={onEdit}
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-semibold text-zinc-950 shadow-sm transition hover:bg-zinc-200"
              >
                <span className="material-symbols-outlined text-[15px]">edit</span>
                <span>Edit profile</span>
              </button>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.03] px-4 py-2 text-xs font-semibold text-zinc-200 transition hover:bg-white/10"
              >
                <span className="material-symbols-outlined text-[15px]">space_dashboard</span>
                <span>Dashboard</span>
              </Link>
              <Link
                to="/write"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.03] px-4 py-2 text-xs font-semibold text-zinc-200 transition hover:bg-white/10"
              >
                <span className="material-symbols-outlined text-[15px]">edit_note</span>
                <span>Write</span>
              </Link>
              <button
                type="button"
                onClick={onLogout}
                className="inline-flex items-center gap-1.5 rounded-full border border-red-500/25 bg-red-500/10 px-3.5 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-500/20"
                title="Log out"
              >
                <span className="material-symbols-outlined text-[15px]">logout</span>
                <span>Log out</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
