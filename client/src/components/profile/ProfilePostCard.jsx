import { Link } from 'react-router-dom';

function excerptOf(post, max = 120) {
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
      className="group flex flex-col overflow-hidden rounded-xl border border-white/[0.06] bg-[#12131a]/80 transition hover:border-violet-400/30 hover:bg-[#14151e]"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-[#0c0d12]">
        {post.coverImageUrl ? (
          <img
            src={post.coverImageUrl}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-600/20 to-indigo-600/10 text-2xl font-semibold text-white/30">
            {(post.title || 'Q').charAt(0)}
          </div>
        )}
        {(post.tags || []).length > 0 && (
          <span className="absolute left-2.5 top-2.5 rounded-md bg-black/55 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-200 backdrop-blur-sm">
            {post.tags[0]}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        <h3 className="line-clamp-2 text-[0.95rem] font-semibold leading-snug text-zinc-50">
          {post.title}
        </h3>
        {excerpt && (
          <p className="line-clamp-2 text-[0.8rem] leading-relaxed text-zinc-500">{excerpt}</p>
        )}
        <div className="mt-auto flex flex-wrap items-center gap-2 pt-1 text-[0.7rem] text-zinc-600">
          <span>{date}</span>
          <span aria-hidden>·</span>
          <span>♥ {post.likesCount || 0}</span>
          <span>💬 {post.commentsCount || 0}</span>
          <span className="rounded border border-violet-400/20 px-1 text-violet-300/80">AI</span>
        </div>
      </div>
    </Link>
  );
}
