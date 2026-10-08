const TABS = [
  { id: 'posts', label: 'Published Posts', icon: 'auto_stories' },
  { id: 'about', label: 'About & Details', icon: 'badge' },
];

export default function ProfileTabs({ active, onChange, postCount = 0 }) {
  return (
    <div
      className="flex gap-2 overflow-x-auto border-b border-white/[0.08] pb-px"
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
            className={`group relative flex shrink-0 items-center gap-2 px-4 py-3 text-sm font-semibold transition-all duration-150 ${
              selected
                ? 'text-white'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[18px] transition-colors ${
                selected ? 'text-violet-400' : 'text-zinc-500 group-hover:text-zinc-400'
              }`}
            >
              {tab.icon}
            </span>
            <span>{tab.label}</span>
            {tab.id === 'posts' && (
              <span
                className={`ml-0.5 rounded-full px-2 py-0.5 text-xs font-bold transition ${
                  selected
                    ? 'bg-violet-500/20 text-violet-300'
                    : 'bg-white/5 text-zinc-400 group-hover:bg-white/10'
                }`}
              >
                {postCount}
              </span>
            )}
            {selected && (
              <span className="absolute inset-x-0 -bottom-[1px] h-0.5 rounded-full bg-gradient-to-r from-violet-500 via-indigo-400 to-fuchsia-500 shadow-sm shadow-violet-500/50" />
            )}
          </button>
        );
      })}
    </div>
  );
}
