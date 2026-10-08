import { Link } from 'react-router-dom';
import UserAvatar from '../UserAvatar';
import AvatarCircles from '../AvatarCircles';

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
}) {
  const joined = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString(undefined, {
        month: 'short',
        year: 'numeric',
      })
    : null;

  return (
    <header className="mb-8">
      <div
        className="h-28 rounded-2xl border border-white/[0.05] sm:h-32"
        style={{
          background:
            'radial-gradient(ellipse 80% 120% at 15% 50%, rgba(99,102,241,0.28), transparent 55%), radial-gradient(ellipse 50% 100% at 85% 30%, rgba(168,85,247,0.18), transparent 50%), linear-gradient(135deg,#12121a,#0c0e13)',
        }}
        aria-hidden
      />

      <div className="-mt-12 flex flex-col gap-5 px-1 sm:-mt-14 sm:flex-row sm:items-end sm:gap-6">
        {/* Avatar */}
        <div className="flex shrink-0 flex-col items-center gap-1.5 sm:items-start">
          <div className="rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 p-[3px] shadow-lg shadow-violet-500/20">
            <div className="rounded-full bg-[#0c0e13] p-0.5">
              <UserAvatar
                src={profile.avatarUrl}
                name={profile.name}
                size={96}
                onClick={isSelf ? onAvatar : undefined}
                title={isSelf ? 'Change avatar' : profile.name}
              />
            </div>
          </div>
          {isSelf && (
            <button
              type="button"
              onClick={onAvatar}
              className="text-xs font-medium text-violet-300/90 hover:text-violet-200"
            >
              Change photo
            </button>
          )}
        </div>

        {/* Identity */}
        <div className="min-w-0 flex-1 pb-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate text-2xl font-semibold tracking-tight text-zinc-50 sm:text-[1.65rem]">
              {profile.name}
            </h1>
            {profile.reputationScore > 0 && (
              <span
                className="rounded-full border border-violet-400/25 bg-violet-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-300"
                title="Reputation"
              >
                {profile.reputationScore} rep
              </span>
            )}
          </div>

          {profile.email && isSelf && (
            <p className="mt-0.5 text-sm text-zinc-500">{profile.email}</p>
          )}

          {profile.bio ? (
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-400">{profile.bio}</p>
          ) : isSelf ? (
            <p className="mt-2 text-sm italic text-zinc-600">
              Add a short bio so others know what you write about.
            </p>
          ) : null}

          {/* Stats */}
          <div className="mt-4 flex flex-wrap gap-5 text-sm">
            <div>
              <span className="font-semibold text-zinc-100">{postCount}</span>
              <span className="ml-1 text-zinc-500">Posts</span>
            </div>
            <div>
              <span className="font-semibold text-zinc-100">{profile.followersCount || 0}</span>
              <span className="ml-1 text-zinc-500">Followers</span>
            </div>
            <div>
              <span className="font-semibold text-zinc-100">{profile.followingCount || 0}</span>
              <span className="ml-1 text-zinc-500">Following</span>
            </div>
            {joined && (
              <div>
                <span className="font-semibold text-zinc-100">{joined}</span>
                <span className="ml-1 text-zinc-500">Joined</span>
              </div>
            )}
          </div>

          {circles.length > 0 && (
            <div className="mt-4 flex items-center gap-3">
              <AvatarCircles
                avatarUrls={circles}
                numPeople={Math.max(0, (profile.followersCount || 0) - circles.length)}
                size={30}
              />
              <span className="text-xs text-zinc-600">Network</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 sm:pb-1">
          {isAuthenticated && !isSelf && (
            <button
              type="button"
              onClick={onFollow}
              className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold transition ${
                following
                  ? 'border border-white/12 bg-transparent text-zinc-200 hover:bg-white/5'
                  : 'bg-white text-zinc-900 hover:bg-zinc-200'
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
                className="inline-flex items-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-200"
              >
                Edit profile
              </button>
              <Link
                to="/dashboard"
                className="inline-flex items-center rounded-full border border-white/12 px-4 py-2 text-sm font-semibold text-zinc-200 transition hover:bg-white/5"
              >
                Dashboard
              </Link>
              <Link
                to="/write"
                className="inline-flex items-center rounded-full border border-white/12 px-4 py-2 text-sm font-semibold text-zinc-200 transition hover:bg-white/5"
              >
                Write
              </Link>
              <button
                type="button"
                onClick={onLogout}
                className="inline-flex items-center rounded-full border border-red-400/25 px-4 py-2 text-sm font-semibold text-red-300/90 transition hover:bg-red-400/10"
              >
                Log out
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
