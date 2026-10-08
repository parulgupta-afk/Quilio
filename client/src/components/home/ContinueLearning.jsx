import { Link } from 'react-router-dom';

export default function ContinueLearning({ attempts }) {
  if (!attempts?.length) return null;

  // Deduplicate by post
  const seen = new Set();
  const items = [];
  for (const a of attempts) {
    const pid = a.post?._id || a.post;
    if (!pid || seen.has(String(pid))) continue;
    seen.add(String(pid));
    items.push(a);
    if (items.length >= 4) break;
  }
  if (!items.length) return null;

  return (
    <section className="qh-section">
      <div className="qh-section-head">
        <h2>Continue learning</h2>
        <p>Pick up where you left off</p>
      </div>
      <div className="qh-continue-row">
        {items.map((a) => {
          const pct = Math.round(a.percentage ?? 0);
          const title = a.post?.title || 'Article';
          const slug = a.post?.slug;
          const id = a.post?._id || a.post;
          const href = slug ? `/post/${slug}` : `/learn/${id}`;
          return (
            <div key={a._id} className="qh-continue-card">
              <div className="qh-continue-top">
                <h3>{title}</h3>
                <span>{pct}%</span>
              </div>
              <div className="qh-progress">
                <div className="qh-progress-bar" style={{ width: `${Math.min(100, pct)}%` }} />
              </div>
              <div className="qh-continue-foot">
                <span className="qh-muted">
                  {a.createdAt ? new Date(a.createdAt).toLocaleDateString() : ''}
                </span>
                <Link to={href} className="qh-link">
                  Continue →
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
