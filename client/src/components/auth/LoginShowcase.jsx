import { useEffect, useState, useCallback } from 'react';

const SLIDES = [
  {
    id: 'understand',
    kicker: 'Read Beyond the Surface',
    title: "Don't Just Read. Understand.",
    body: 'Turn articles into deeper understanding with AI-powered explanations, concepts, and insights.',
    visual: 'doc',
  },
  {
    id: 'chat',
    kicker: 'Chat With Knowledge',
    title: 'Have a Conversation With Every Article.',
    body: "Ask questions, explore ideas, and get grounded answers directly from the content you're reading.",
    visual: 'chat',
  },
  {
    id: 'learn',
    kicker: 'Learn This',
    title: 'Turn Reading Into Learning.',
    body: 'Transform articles into key concepts, quizzes, flashcards, and personalized learning experiences.',
    visual: 'pipeline',
  },
  {
    id: 'graph',
    kicker: 'Knowledge Is Connected',
    title: 'Discover How Ideas Connect.',
    body: 'Explore related concepts and articles through an intelligent knowledge network.',
    visual: 'graph',
  },
  {
    id: 'social',
    kicker: 'Learn Together',
    title: 'Knowledge Gets Better When Shared.',
    body: 'Follow creators, discuss ideas, remix knowledge, and grow with a community of curious minds.',
    visual: 'social',
  },
];

function VisualDoc() {
  return (
    <div className="qs-visual qs-visual-doc" aria-hidden>
      <div className="qs-glass qs-doc-card">
        <div className="qs-doc-line w80" />
        <div className="qs-doc-line w60" />
        <div className="qs-doc-line w90" />
        <div className="qs-doc-line w50" />
        <div className="qs-doc-highlight">Key concept</div>
        <div className="qs-doc-line w70" />
      </div>
      <div className="qs-float qs-chip qs-chip-a">Embeddings</div>
      <div className="qs-float qs-chip qs-chip-b">RAG</div>
      <div className="qs-float qs-chip qs-chip-c">Citations</div>
    </div>
  );
}

function VisualChat() {
  return (
    <div className="qs-visual qs-visual-chat" aria-hidden>
      <div className="qs-glass qs-chat-panel">
        <div className="qs-chat-bubble qs-user">Explain this concept simply.</div>
        <div className="qs-chat-bubble qs-ai">
          A grounded answer drawn from the article — with citations you can check.
        </div>
      </div>
      <div className="qs-glass qs-mini-doc">
        <span>Source passage</span>
        Relevant excerpt from the post…
      </div>
    </div>
  );
}

function VisualPipeline() {
  return (
    <div className="qs-visual qs-visual-pipeline" aria-hidden>
      <div className="qs-pipeline">
        {['Article', 'Concepts', 'Quiz', 'Progress'].map((label, i) => (
          <div key={label} className="qs-pipe-step">
            <div className="qs-glass qs-pipe-node">{label}</div>
            {i < 3 && <span className="qs-pipe-arrow">→</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

function VisualGraph() {
  return (
    <div className="qs-visual qs-visual-graph" aria-hidden>
      <div className="qs-glass qs-center-node">Quilio</div>
      <div className="qs-glass qs-graph-node" style={{ left: '18%', top: '22%' }}>
        Trees
      </div>
      <div className="qs-glass qs-graph-node" style={{ left: '78%', top: '28%' }}>
        Graphs
      </div>
      <div className="qs-glass qs-graph-node" style={{ left: '22%', top: '72%' }}>
        Search
      </div>
      <div className="qs-glass qs-graph-node" style={{ left: '75%', top: '70%' }}>
        Learning
      </div>
    </div>
  );
}

function VisualSocial() {
  return (
    <div className="qs-visual qs-visual-social" aria-hidden>
      <div className="qs-glass qs-social-card" style={{ left: '8%', top: '20%' }}>
        <strong>Aria</strong>
        <span>Published a note</span>
      </div>
      <div className="qs-glass qs-social-card" style={{ right: '10%', top: '35%' }}>
        <strong>Marcus</strong>
        <span>Started a discussion</span>
      </div>
      <div className="qs-glass qs-social-card" style={{ left: '20%', bottom: '18%' }}>
        <strong>Priya</strong>
        <span>Completed a quiz</span>
      </div>
    </div>
  );
}

function SlideVisual({ type }) {
  switch (type) {
    case 'chat':
      return <VisualChat />;
    case 'pipeline':
      return <VisualPipeline />;
    case 'graph':
      return <VisualGraph />;
    case 'social':
      return <VisualSocial />;
    default:
      return <VisualDoc />;
  }
}

export default function LoginShowcase() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const len = SLIDES.length;

  const go = useCallback(
    (next) => {
      setIndex(((next % len) + len) % len);
    },
    [len]
  );

  useEffect(() => {
    if (paused) return undefined;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined;
    }
    const id = setInterval(() => {
      setIndex((v) => (v + 1) % len);
    }, 5500);
    return () => clearInterval(id);
  }, [paused, len]);

  return (
    <aside
      className="qs-showcase"
      aria-label="What is Quilio"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setPaused(false);
      }}
    >
      <div className="qs-bg" aria-hidden>
        <div className="qs-bg-grid" />
        <div className="qs-bg-glow qs-bg-glow-a" />
        <div className="qs-bg-glow qs-bg-glow-b" />
      </div>

      <div className="qs-brand">
        <span className="qs-brand-mark">Q</span>
        <span className="qs-brand-text">Quilio</span>
        <span className="qs-brand-pill">Scholar</span>
      </div>

      <div className="qs-stage" aria-live="polite">
        {SLIDES.map((s, i) => (
          <div
            key={s.id}
            className={`qs-slide ${i === index ? 'is-active' : ''}`}
            aria-hidden={i !== index}
          >
            <div className="qs-slide-copy">
              <p className="qs-kicker">{s.kicker}</p>
              <h2 className="qs-title">{s.title}</h2>
              <p className="qs-body">{s.body}</p>
            </div>
            <div className="qs-slide-visual">
              <SlideVisual type={s.visual} />
            </div>
          </div>
        ))}
      </div>

      <div className="qs-controls">
        <button type="button" className="qs-arrow" aria-label="Previous slide" onClick={() => go(index - 1)}>
          ‹
        </button>
        <div className="qs-dots" role="tablist" aria-label="Slides">
          {SLIDES.map((s, i) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Slide ${i + 1}: ${s.kicker}`}
              className={`qs-dot ${i === index ? 'is-active' : ''}`}
              onClick={() => go(i)}
            />
          ))}
        </div>
        <button type="button" className="qs-arrow" aria-label="Next slide" onClick={() => go(index + 1)}>
          ›
        </button>
      </div>

      <p className="qs-footnote" aria-hidden>
        Blog → Understand → Discuss → Learn → Connect → Grow
      </p>
    </aside>
  );
}
