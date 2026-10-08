import { Link } from 'react-router-dom';

export default function HeroSection() {
  return (
    <section className="qh-hero">
      <div className="qh-hero-bg" aria-hidden>
        <div className="qh-hero-glow a" />
        <div className="qh-hero-glow b" />
        <div className="qh-hero-grid" />
      </div>
      <div className="qh-hero-content">
        <p className="qh-hero-kicker">Quilio · AI social learning</p>
        <h1 className="qh-hero-title">Learn something worth remembering.</h1>
        <p className="qh-hero-sub">
          Discover ideas, understand complex topics, and have conversations with the knowledge you read.
        </p>
        <div className="qh-hero-actions">
          <a href="#latest" className="qh-btn primary">
            Explore Ideas
          </a>
          <Link to="/search" className="qh-btn ghost">
            Ask Quilio AI
          </Link>
        </div>
        <p className="qh-hero-path">Read → Understand → Ask → Learn → Connect → Grow</p>
      </div>
    </section>
  );
}
