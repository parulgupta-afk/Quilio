const TABS = [
  { id: 'posts', label: 'Posts' },
  { id: 'about', label: 'About' },
];

export default function ProfileTabs({ active, onChange, postCount = 0 }) {
  return (
    <div
      className="flex gap-1 overflow-x-auto border-b border-white/[0.06]"
      role="tablist"
      aria-label="Profile sections"
    >
      {TABS.map((tab) => {
        const selected = active === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(tab.id)}
            className={`relative shrink-0 px-3 py-2.5 text-sm font-medium transition ${
              selected ? 'text-zinc-50' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {tab.label}
            {tab.id === 'posts' && (
              <span className="ml-1.5 text-xs text-zinc-600">{postCount}</span>
            )}
            {selected && (
              <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-violet-400" />
            )}
          </button>
        );
      })}
    </div>
  );
}
