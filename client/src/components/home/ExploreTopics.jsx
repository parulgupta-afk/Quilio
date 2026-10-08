import { Link } from 'react-router-dom';

const FALLBACK = [
  'Artificial Intelligence',
  'Software Engineering',
  'Web Development',
  'Design',
  'Startups',
  'Science',
  'Technology',
  'Productivity',
];

export default function ExploreTopics({ tags = [] }) {
  const topics = tags.length
    ? tags.slice(0, 12).map((t) => ({ name: t.tag || t, count: t.count }))
    : FALLBACK.map((name) => ({ name, count: null }));

  return (
    <section className="qh-section">
      <div className="qh-section-head">
        <h2>Explore ideas</h2>
        <p>{tags.length ? 'From posts in your feed' : 'Popular knowledge areas'}</p>
      </div>
      <div className="qh-topics">
        {topics.map((t) => (
          <Link
            key={t.name}
            to={`/search?q=${encodeURIComponent(t.name)}`}
            className="qh-topic"
          >
            <span className="qh-topic-name">{t.name}</span>
            {t.count != null && <span className="qh-topic-count">{t.count}</span>}
          </Link>
        ))}
      </div>
    </section>
  );
}
