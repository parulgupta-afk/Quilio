const TABS = [
  { id: 'posts', label: 'Posts' },
  { id: 'about', label: 'About' },
];

export default function ProfileTabs({ active, onChange, postCount = 0 }) {
  return (
    <div className="profile-tabs" role="tablist" aria-label="Profile sections">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={active === tab.id}
          className={`profile-tab ${active === tab.id ? 'is-active' : ''}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
          {tab.id === 'posts' && <span className="profile-tab-count">{postCount}</span>}
        </button>
      ))}
    </div>
  );
}
