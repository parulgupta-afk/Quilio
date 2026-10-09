import { useEffect, useState, useCallback } from 'react';

const SLIDES = [
  {
    id: 'understand',
    kicker: 'Read Beyond the Surface',
    title: 'Don\'t Just Read. Understand.',
    body: 'Turn articles into deeper understanding with AI-powered explanations, concepts, and insights.',
    visual: 'doc',
  },
  {
    id: 'chat',
    kicker: 'Chat With Knowledge',
    title: 'Have a Conversation With Every Article.',
    body: 'Ask questions, explore ideas, and get grounded answers directly from the content you\'re reading.',
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
      <svg className="qs-connectors" viewBox="0 0 200 120" preserveAspectRatio="none">
        <path d="M90 40 C120 30, 140 25, 170 20" className="qs-path" />
        <path d="M90 55 C130 55, 145 70, 175 75" className="qs-path" />
        <path d="M90 70 C125 90, 140 95, 165 100" className="qs-path" />
      </svg>
    </div>
  );
}

function VisualChat() {
  return (
    <div className="qs-visual qs-visual-chat" aria-hidden>
      <div className="qs-glass qs-chat-panel">
        <div className="qs-chat-bubble qs-user">Explain this concept simply.</div>
        <div className="qs-chat-bubble qs-ai">A grounded answer drawn from the article…</div>
        <div className="qs-chat-bubble qs-user">How does this relate to machine learning?</div>
        <div className="qs-chat-bubble qs-ai">It connects through embeddings and retrieval…</div>
      </div>
      <div className="qs-glass qs-mini-doc">
        <span>Article</span>
        <div className="qs-doc-line w90" />
        <div className="qs-doc-line w70" />
      </div>
    </div>
  );
}

function VisualPipeline() {
  const steps = ['Article', 'Concepts', 'Quiz', 'Progress'];
  return (
    <div className="qs-visual qs-visual-pipeline" aria-hidden>
      <div className="qs-pipeline">
        {steps.map((s, i) => (
          <div key={s} className="qs-pipe-step">
            <div className="qs-glass qs-pipe-node">{s}</div>
            {i < steps.length - 1 && <div className="qs-pipe-arrow">→</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

function VisualGraph() {
  const nodes = [
    { label: 'AI', x: 50, y: 20 },
    { label: 'ML', x: 18, y: 55 },
    { label: 'Neural Nets', x: 78, y: 48 },
    { label: 'Embeddings', x: 35, y: 85 },
    { label: 'RAG', x: 70, y: 82 },
  ];
  return (
    <div className="qs-visual qs-visual-graph" aria-hidden>
      <svg className="qs-graph-svg" viewBox="0 0 100 100">
        <line x1="50" y1="20" x2="18" y2="55" className="qs-path" />
        <line x1="50" y1="20" x2="78" y2="48" className="qs-path" />
        <line x1="18" y1="55" x2="35" y2="85" className="qs-path" />
        <line x1="78" y1="48" x2="70" y2="82" className="qs-path" />
        <line x1="35" y1="85" x2="70" y2="82" className="qs-path" />
        <line x1="50" y1="20" x2="70" y2="82" className="qs-path qs-path-dim" />
      </svg>
      {nodes.map((n) => (
        <div
          key={n.label}
          className="qs-glass qs-graph-node"
          style={{ left: `${n.x}%`, top: `${n.y}%` }}
        >
          {n.label}
        </div>
      ))}
    </div>
  );
}

function VisualSocial() {
  return (
    <div className="qs-visual qs-visual-social" aria-hidden>
      <div className="qs-glass qs-center-node">Quilio</div>
      <div className="qs-float qs-social-card qs-sc-a">
        <div className="qs-avatar-dot" />
        <div className="qs-doc-line w80" />
        <div className="qs-doc-line w50" />
      </div>
      <div className="qs-float qs-social-card qs-sc-b">
        <div className="qs-avatar-dot" />
        <div className="qs-doc-line w70" />
        <div className="qs-doc-line w40" />
      </div>
      <div className="qs-float qs-social-card qs-sc-c">
        <div className="qs-avatar-dot" />
        <div className="qs-doc-line w60" />
        <div className="qs-doc-line w55" />
      </div>
    </div>
  );
}

function SlideVisual({ type }) {
  switch (type) {
    case 'doc':
      return <VisualDoc />;
    case 'chat':
      return <VisualChat />;
    case 'pipeline':
      return <VisualPipeline />;
    case 'graph':
      return <VisualGraph />;
    case 'social':
      return <VisualSocial />;
    default:
      return null;
  }
}

/**
 * Left-panel showcase only. No auth logic.
 * Pointer events isolated to this panel (dots/arrows only).
 */
export default function LoginShowcase() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const len = SLIDES.length;

  const go = useCallback(
    (i) => {
      setIndex(((i % len) + len) % len);
    },
    [len]
  );

  useEffect(() => {
    if (paused) return undefined;
    const id = setInterval(() => {
      setIndex((v) => (v + 1) % len);
    }, 5500);
    return () => clearInterval(id);
  }, [paused, len]);

  const slide = SLIDES[index];

  return (
    <aside
      className="qs-showcase"
      aria-label="What is Quilio"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
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

      <div className="qs-stage">
        {SLIDES.map((s, i) => (
          <div
            key={s.id}
            className={`qs-slide ${i === index ? 'is-active' : ''} ${i === (index - 1 + len) % len ? 'is-exit' : ''}`}
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
        <button
          type="button"
          className="qs-arrow"
          aria-label="Previous slide"
          onClick={() => go(index - 1)}
        >
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
        <button
          type="button"
          className="qs-arrow"
          aria-label="Next slide"
          onClick={() => go(index + 1)}
        >
          ›
        </button>
      </div>

      <p className="qs-footnote" aria-hidden>
        Blog → Understand → Discuss → Learn → Connect → Grow
      </p>
    </aside>
  );
}
