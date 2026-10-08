import { Link } from 'react-router-dom';

function excerptOf(post, max = 130) {
  const raw = (post?.excerpt || post?.content || '')
    .replace(/#{1,6}\s*/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\n+/g, ' ')
    .trim();
  if (raw.length <= max) return raw;
  return `${raw.slice(0, max)}…`;
}

export default function ProfilePostCard({ post }) {
  const href = post.slug ? `/post/${post.slug}` : `/post/${post._id}`;
  const excerpt = excerptOf(post);
  const date = post.createdAt
    ? new Date(post.createdAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  return (
    <Link
      to={href}
      className="group flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#12131d]/90 backdrop-blur-sm transition-all duration-200 hover:-translate-y-1 hover:border-violet-500/40 hover:bg-[#151624] hover:shadow-xl hover:shadow-violet-950/20"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-[#0a0b10]">
        {post.coverImageUrl ? (
          <img
            src={post.coverImageUrl}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-900/30 via-indigo-900/20 to-purple-900/10 text-3xl font-bold text-violet-300/40">
            {(post.title || 'Q').charAt(0)}
          </div>
        )}
        {(post.tags || []).length > 0 && (
          <span className="absolute left-3 top-3 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-violet-200 backdrop-blur-md ring-1 ring-white/10">
            #{post.tags[0]}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <h3 className="line-clamp-2 text-base font-bold leading-snug text-zinc-100 transition-colors group-hover:text-violet-200">
          {post.title}
        </h3>
        {excerpt && (
          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-zinc-400">
            {excerpt}
          </p>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-2.5 pt-4 text-[11px] font-medium text-zinc-500">
          <span>{date}</span>
          <span aria-hidden>·</span>
          <span className="flex items-center gap-1 text-zinc-400">
            <span className="text-red-400/80">♥</span> {post.likesCount || 0}
          </span>
          <span aria-hidden>·</span>
          <span className="flex items-center gap-1 text-zinc-400">
            <span>💬</span> {post.commentsCount || 0}
          </span>
          <span className="ml-auto rounded-full border border-violet-500/20 bg-violet-500/10 px-2 py-0.5 text-[10px] font-semibold text-violet-300">
            Essay
          </span>
        </div>
      </div>
    </Link>
  );
}
