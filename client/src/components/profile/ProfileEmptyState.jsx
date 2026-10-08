import { Link } from 'react-router-dom';

export default function ProfileEmptyState({ isSelf }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-16 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-violet-500/10 text-lg text-violet-300">
        ✎
      </div>
      <h3 className="text-base font-semibold text-zinc-100">No stories yet</h3>
      <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-zinc-500">
        {isSelf
          ? 'Share your first idea and start building your knowledge trail on Quilio.'
          : 'This scholar hasn’t published any posts yet.'}
      </p>
      {isSelf && (
        <Link
          to="/write"
          className="mt-5 inline-flex items-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-200"
        >
          Write a post
        </Link>
      )}
    </div>
  );
}
