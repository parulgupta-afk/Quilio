export default function ProfileSkeleton() {
  return (
    <div className="profile-skeleton">
      <div className="sk-banner" />
      <div className="sk-avatar" />
      <div className="sk-line w40" />
      <div className="sk-line w60" />
      <div className="sk-stats">
        <div className="sk-line w20" />
        <div className="sk-line w20" />
        <div className="sk-line w20" />
      </div>
      <div className="sk-grid">
        <div className="sk-card" />
        <div className="sk-card" />
      </div>
    </div>
  );
}
