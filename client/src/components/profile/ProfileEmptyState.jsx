import { Link } from 'react-router-dom';

export default function ProfileEmptyState({ isSelf }) {
  return (
    <div className="profile-empty">
      <div className="profile-empty-icon">✎</div>
      <h3>No stories yet</h3>
      <p>
        {isSelf
          ? 'Share your first idea and start building your knowledge trail.'
          : 'This scholar hasn’t published any posts yet.'}
      </p>
      {isSelf && (
        <Link to="/write" className="profile-btn primary">
          Write a post
        </Link>
      )}
    </div>
  );
}
