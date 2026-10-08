import { Link } from 'react-router-dom';

/**
 * MagicUI-style overlapping avatar stack (no external deps).
 * avatarUrls: { imageUrl?, name?, profileUrl? }[]
 */
export default function AvatarCircles({
  avatarUrls = [],
  numPeople = 0,
  size = 36,
  className = '',
}) {
  return (
    <div className={`q-avatar-circles ${className}`}>
      {avatarUrls.map((a, index) => {
        const inner = a.imageUrl ? (
          <img src={a.imageUrl} alt={a.name || `Avatar ${index + 1}`} />
        ) : (
          <span>{(a.name || '?').charAt(0).toUpperCase()}</span>
        );
        const style = { width: size, height: size, zIndex: avatarUrls.length - index };
        if (a.profileUrl) {
          return (
            <Link
              key={a.profileUrl + index}
              to={a.profileUrl}
              className="q-avatar-circle"
              style={style}
              title={a.name}
            >
              {inner}
            </Link>
          );
        }
        return (
          <span key={index} className="q-avatar-circle" style={style} title={a.name}>
            {inner}
          </span>
        );
      })}
      {numPeople > 0 && (
        <span
          className="q-avatar-circle q-avatar-circle-more"
          style={{ width: size, height: size, fontSize: Math.max(10, size * 0.32) }}
        >
          +{numPeople}
        </span>
      )}
    </div>
  );
}
