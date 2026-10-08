export function postHref(post) {
  return post?.slug ? `/post/${post.slug}` : `/post/${post?._id}`;
}

export function readingMinutes(post) {
  const text = `${post?.title || ''} ${post?.excerpt || ''} ${post?.content || ''}`;
  const words = text.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function cleanExcerpt(post, max = 140) {
  const raw = (post?.excerpt || post?.content || '')
    .replace(/#{1,6}\s*/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\n+/g, ' ')
    .trim();
  if (raw.length <= max) return raw;
  return `${raw.slice(0, max)}…`;
}

export function categoryLabel(post) {
  const tag = post?.tags?.[0];
  if (tag) return String(tag).replace(/-/g, ' ').toUpperCase();
  return 'KNOWLEDGE';
}
