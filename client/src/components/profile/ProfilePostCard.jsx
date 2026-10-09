import { Link } from 'react-router-dom';

function excerptOf(post, max = 110) {
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
    <Link to={href} className="profile-post-card">
      <div className="profile-post-media">
        {post.coverImageUrl ? (
          <img src={post.coverImageUrl} alt="" loading="lazy" />
        ) : (
          <div className="profile-post-fallback">{(post.title || 'Q').charAt(0)}</div>
        )}
        {(post.tags || [])[0] && (
          <span className="profile-post-tag">{post.tags[0]}</span>
        )}
      </div>
      <div className="profile-post-body">
        <h3>{post.title}</h3>
        {excerpt && <p>{excerpt}</p>}
        <div className="profile-post-meta">
          <span>{date}</span>
          <span>♥ {post.likesCount || 0}</span>
          <span>💬 {post.commentsCount || 0}</span>
        </div>
      </div>
    </Link>
  );
}
