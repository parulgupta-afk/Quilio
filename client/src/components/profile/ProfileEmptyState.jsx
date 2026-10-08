import { Link } from 'react-router-dom';

export default function ProfileEmptyState({ isSelf }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-[#12131d]/60 px-6 py-20 text-center backdrop-blur-sm">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-500/20 bg-violet-500/10 text-xl text-violet-300 shadow-inner">
        <span className="material-symbols-outlined text-[24px]">edit_note</span>
      </div>
      <h3 className="text-lg font-bold text-zinc-100">No published stories yet</h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-400">
        {isSelf
          ? 'Share your first insight, essay, or thoughts and start building your knowledge footprint on Quilio.'
          : 'This scholar hasn’t published any public stories or essays yet.'}
      </p>
      {isSelf && (
        <Link
          to="/write"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-bold text-zinc-950 shadow-md transition hover:bg-zinc-200 hover:scale-105 active:scale-95"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          <span>Write your first post</span>
        </Link>
      )}
    </div>
  );
}
