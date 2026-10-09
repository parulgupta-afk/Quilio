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
    <header className="profile-header">
      <div className="profile-banner" aria-hidden />

      <div className="profile-identity">
        <div className="profile-avatar-wrap">
          <div className="profile-avatar-ring">
            <UserAvatar
              src={profile.avatarUrl}
              name={profile.name}
              size={104}
              onClick={isSelf ? () => setDropdownOpen((v) => !v) : undefined}
              title={isSelf ? 'Choose avatar' : profile.name}
            />
          </div>
          {isSelf && (
            <button
              type="button"
              className="profile-avatar-cam"
              onClick={() => setDropdownOpen((v) => !v)}
              aria-label="Change avatar"
            >
              <span className="material-symbols-outlined">photo_camera</span>
            </button>
          )}
        </div>

        {isSelf && (
          <div className="profile-avatar-menu">
            <AvatarDropdownMenu
              currentAvatar={profile.avatarUrl || ''}
              userName={profile.name}
              onSaved={onAvatarSaved}
              open={dropdownOpen}
              onToggle={setDropdownOpen}
            />
          </div>
        )}

        <h1 className="profile-name">{profile.name}</h1>
        {isSelf && profile.email && (
          <p className="profile-email">{profile.email}</p>
        )}
        {profile.bio ? (
          <p className="profile-bio">{profile.bio}</p>
        ) : isSelf ? (
          <p className="profile-bio is-empty">
            Add a short bio so readers know what you write about.
          </p>
        ) : null}

        <div className="profile-stats">
          <div>
            <strong>{postCount}</strong>
            <span>Posts</span>
          </div>
          <div>
            <strong>{profile.followersCount || 0}</strong>
            <span>Followers</span>
          </div>
          <div>
            <strong>{profile.followingCount || 0}</strong>
            <span>Following</span>
          </div>
          {joined && (
            <div>
              <strong>{joined}</strong>
              <span>Joined</span>
            </div>
          )}
        </div>

        {circles.length > 0 && (
          <div className="profile-circles">
            <AvatarCircles
              avatarUrls={circles}
              numPeople={Math.max(0, (profile.followersCount || 0) - circles.length)}
              size={28}
            />
          </div>
        )}

        <div className="profile-actions">
          {isAuthenticated && !isSelf && (
            <button
              type="button"
              className={`profile-btn ${following ? 'ghost' : 'primary'}`}
              onClick={onFollow}
            >
              {following ? 'Following' : 'Follow'}
            </button>
          )}
          {isSelf && (
            <>
              <button type="button" className="profile-btn primary" onClick={onEdit}>
                Edit profile
              </button>
              <Link to="/write" className="profile-btn ghost">
                Write
              </Link>
              <Link to="/dashboard" className="profile-btn ghost">
                Dashboard
              </Link>
              <button type="button" className="profile-btn danger" onClick={onLogout}>
                Log out
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
