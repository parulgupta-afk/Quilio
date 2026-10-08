import { getInitials } from '../constants/avatars';

/**
 * Unified avatar display — image URL or initials fallback.
 */
export default function UserAvatar({
  src,
  name = '',
  size = 40,
  className = '',
  onClick,
  title,
}) {
  const style = {
    width: size,
    height: size,
    fontSize: Math.max(11, Math.round(size * 0.36)),
  };

  if (src) {
    return (
      <button
        type="button"
        className={`q-user-avatar q-user-avatar-img ${className}`}
        style={style}
        onClick={onClick}
        title={title}
        disabled={!onClick}
      >
        <img src={src} alt={name ? `${name} avatar` : 'Avatar'} loading="lazy" />
      </button>
    );
  }

  return (
    <button
      type="button"
      className={`q-user-avatar q-user-avatar-fallback ${className}`}
      style={style}
      onClick={onClick}
      title={title}
      disabled={!onClick}
    >
      {getInitials(name)}
    </button>
  );
}
