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
    minWidth: size,
    minHeight: size,
    fontSize: Math.max(11, Math.round(size * 0.36)),
  };

  const baseClasses = `q-user-avatar relative inline-flex shrink-0 items-center justify-center rounded-full overflow-hidden select-none font-semibold text-white transition-transform ${
    onClick ? 'cursor-pointer hover:scale-105 active:scale-95' : 'cursor-default'
  } ${className}`;

  const content = src ? (
    <img
      src={src}
      alt={name ? `${name} avatar` : 'Avatar'}
      loading="lazy"
      className="h-full w-full object-cover rounded-full"
    />
  ) : (
    <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 tracking-wider">
      {getInitials(name)}
    </span>
  );

  if (onClick) {
    return (
      <button
        type="button"
        className={`${baseClasses} ${src ? 'q-user-avatar-img' : 'q-user-avatar-fallback'} border-0 p-0 bg-transparent`}
        style={style}
        onClick={onClick}
        title={title}
      >
        {content}
      </button>
    );
  }

  return (
    <div
      className={`${baseClasses} ${src ? 'q-user-avatar-img' : 'q-user-avatar-fallback'}`}
      style={style}
      title={title}
    >
      {content}
    </div>
  );
}

