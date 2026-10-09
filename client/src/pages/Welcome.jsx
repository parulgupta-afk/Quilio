import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const QuilioMark = ({ small = false }) => (
  <span className={`q-intro-mark ${small ? 'is-small' : ''}`} aria-hidden="true">
    <span>Q</span>
  </span>
);

const FeatureIcon = ({ children }) => (
  <span className="q-intro-feature-icon" aria-hidden="true">{children}</span>
);

export default function Welcome() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const enterPath = isAuthenticated ? '/home' : '/login';

  return (
    <div className="q-intro">
      <div className="q-intro-noise" aria-hidden="true" />
      <div className="q-intro-glow q-intro-glow-a" aria-hidden="true" />
      <div className="q-intro-glow q-intro-glow-b" aria-hidden="true" />

      <header className="q-intro-header">
        <Link to="/welcome" className="q-intro-brand" aria-label="Quilio home">
          <QuilioMark small />
          <span>Quilio</span>
          <em>Scholar</em>
        </Link>
        <nav className="q-intro-nav" aria-label="Intro navigation">
          <a href="#how-it-works">How it works</a>
          <Link to="/login" className="q-intro-signin">Sign in <span aria-hidden="true">↗</span></Link>
        </nav>
      </header>

      <main className="q-intro-main">
        <section className="q-intro-hero" aria-labelledby="intro-title">
          <div className="q-intro-copy">
            <div className="q-intro-eyebrow"><span /> A smarter way to stay curious</div>
            <h1 id="intro-title">Read widely.<br /><span>Think deeply.</span></h1>
            <p className="q-intro-lede">
              Quilio turns the articles you save into a living learning space — with grounded AI, useful conversations, and ideas you can actually remember.
            </p>
            <div className="q-intro-actions">
              <button className="q-intro-primary" onClick={() => navigate(enterPath)}>
                <span>{isAuthenticated ? 'Enter workspace' : 'Start learning free'}</span>
                <span className="q-intro-arrow" aria-hidden="true">↗</span>
              </button>
              <a className="q-intro-secondary" href="#how-it-works">See how it works <span aria-hidden="true">↓</span></a>
            </div>
            <div className="q-intro-proof">
              <div className="q-intro-avatars" aria-hidden="true"><i>AM</i><i>RK</i><i>NS</i><b>+</b></div>
              <p><strong>For the relentlessly curious.</strong><br />Read, question, connect, grow.</p>
            </div>
          </div>

          <div className="q-intro-visual" aria-label="Quilio learning loop preview">
            <div className="q-intro-visual-caption"><span className="q-live-dot" /> Your learning loop</div>
            <div className="q-intro-orbit q-intro-orbit-outer" aria-hidden="true" />
            <div className="q-intro-orbit q-intro-orbit-inner" aria-hidden="true" />
            <div className="q-intro-core"><QuilioMark /><strong>Quilio</strong><small>make knowledge yours</small></div>
            <div className="q-intro-node q-node-read"><FeatureIcon>↘</FeatureIcon><span>Read</span><small>Find a signal</small></div>
            <div className="q-intro-node q-node-ask"><FeatureIcon>?</FeatureIcon><span>Ask</span><small>Go deeper</small></div>
            <div className="q-intro-node q-node-learn"><FeatureIcon>✦</FeatureIcon><span>Learn</span><small>Make it stick</small></div>
            <div className="q-intro-annotation q-annotation-top">context, not noise</div>
            <div className="q-intro-annotation q-annotation-bottom">ideas worth keeping</div>
            <div className="q-intro-spark q-spark-one" aria-hidden="true" />
            <div className="q-intro-spark q-spark-two" aria-hidden="true" />
            <div className="q-intro-spark q-spark-three" aria-hidden="true" />
          </div>
        </section>

        <section className="q-intro-strip" id="how-it-works" aria-label="How Quilio works">
          <div><span className="q-strip-number">01</span><strong>Bring your curiosity</strong><p>Save the ideas that pull you in.</p></div>
          <div><span className="q-strip-number">02</span><strong>Make sense of it</strong><p>Chat with articles, grounded in their sources.</p></div>
          <div><span className="q-strip-number">03</span><strong>Keep the insight</strong><p>Turn understanding into lasting progress.</p></div>
        </section>
      </main>

      <footer className="q-intro-footer"><span>Quilio / a home for active learning</span><span>Built for readers who ask better questions</span></footer>
    </div>
  );
}
