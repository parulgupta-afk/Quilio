import { Link } from 'react-router-dom';

const FEATURES = [
  {
    title: 'Chat with this article',
    text: 'Ask questions directly about the content with grounded answers.',
    to: '/search',
    icon: '💬',
  },
  {
    title: 'Learn this',
    text: 'Turn an article into concepts, flashcards, and quizzes.',
    to: '/progress',
    icon: '📘',
  },
  {
    title: 'Discover connections',
    text: 'Find related ideas and similar posts through embeddings.',
    to: '/search',
    icon: '🕸️',
  },
];

export default function AIKnowledgeSection() {
  return (
    <section className="qh-section">
      <div className="qh-ai-banner">
        <div>
          <h2>Turn any article into a conversation.</h2>
          <p>
            Ask questions, explore concepts, and understand the ideas behind what you read — using
            Quilio&apos;s existing AI tools on each post.
          </p>
        </div>
        <div className="qh-ai-minis">
          {FEATURES.map((f) => (
            <Link key={f.title} to={f.to} className="qh-ai-mini">
              <span className="qh-ai-ico" aria-hidden>
                {f.icon}
              </span>
              <strong>{f.title}</strong>
              <span>{f.text}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
