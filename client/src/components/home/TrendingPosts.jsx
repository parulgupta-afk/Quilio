import { Link } from 'react-router-dom';
import UserAvatar from '../UserAvatar';
import { postHref, readingMinutes } from './utils';

export default function TrendingPosts({ posts }) {
  if (!posts?.length) return null;
  const ranked = [...posts]
    .sort(
      (a, b) =>
        (b.likesCount || 0) + (b.commentsCount || 0) * 2 -
        ((a.likesCount || 0) + (a.commentsCount || 0) * 2)
    )
    .slice(0, 5);

  return (
    <section className="qh-section">
      <div className="qh-section-head">
        <h2>Trending in Quilio</h2>
        <p>Most engaged posts right now</p>
      </div>
      <div className="qh-trending">
        {ranked.map((p, i) => (
          <Link key={p._id} to={postHref(p)} className="qh-trend-row">
            <span className="qh-rank">{String(i + 1).padStart(2, '0')}</span>
            <div className="qh-trend-main">
              <h3>{p.title}</h3>
              <div className="qh-trend-meta">
                <UserAvatar src={p.author?.avatarUrl} name={p.author?.name} size={18} />
                <span>{p.author?.name || 'Author'}</span>
                <span>·</span>
                <span>♥ {p.likesCount || 0}</span>
                <span>💬 {p.commentsCount || 0}</span>
                <span>{readingMinutes(p)} min</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
