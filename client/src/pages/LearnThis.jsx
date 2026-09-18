import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Layout from '../components/Layout';

/* ── Study Mode Tab Bar ── */
function StudyTabBar({ tab, setTab, flashcards, questions }) {
  const tabs = [
    { id: 'concepts', label: 'Concepts', icon: 'auto_stories' },
    { id: 'flashcards', label: 'Flashcards', icon: 'style', count: flashcards.length },
    { id: 'quiz', label: 'Quiz', icon: 'quiz', count: questions.length },
    { id: 'results', label: 'Results', icon: 'bar_chart' },
  ];
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 4, background: '#0c0e13', borderRadius: 14, marginBottom: 16, gap: 2 }}>
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => setTab(t.id)}
          style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
            padding: '8px 4px', borderRadius: 10, border: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: tab === t.id ? 700 : 500, transition: 'all 0.2s',
            background: tab === t.id ? '#1e1f25' : 'transparent',
            color: tab === t.id ? '#c0c1ff' : '#908fa0',
            boxShadow: tab === t.id ? '0 2px 8px rgba(0,0,0,0.4)' : 'none',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16, ...(tab === t.id ? { fontVariationSettings: "'FILL' 1" } : {}) }}>{t.icon}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            {t.label}
            {t.count != null && t.count > 0 && (
              <span style={{ fontSize: 10, background: 'rgba(192,193,255,0.12)', color: '#c0c1ff', borderRadius: 4, padding: '1px 5px', fontWeight: 700 }}>{t.count}</span>
            )}
          </span>
        </button>
      ))}
    </div>
  );
}

/* ── Context Badge ── */
function ContextBadge({ postTitle }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: '#1a1b21', borderRadius: 14, padding: '10px 14px', marginBottom: 14,
      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
        <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#c0c1ff', flexShrink: 0 }}>menu_book</span>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#908fa0', marginBottom: 1 }}>Learning Suite</div>
          <div style={{ fontFamily: "'Newsreader', serif", fontSize: 14, fontStyle: 'italic', color: '#e2e2e9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }}>
            {postTitle || 'This Article'}
          </div>
        </div>
      </div>
      <span style={{ flexShrink: 0, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 9999, background: '#282a2f', color: '#c0c1ff', letterSpacing: '0.03em' }}>
        AI Synthesized
      </span>
    </div>
  );
}

export default function LearnThis() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  const [tab, setTab] = useState('concepts');
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState(null);
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [level, setLevel] = useState('beginner');

  useEffect(() => {
    api.get(`/learn/${postId}`)
      .then(r => setData(r.data))
      .catch(e => setError(e.response?.data?.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }, [postId]);

  const submit = async () => {
    setSubmitting(true);
    try {
      const answers = (data.questions || []).map((_, i) => ({ questionIndex: i, selectedAnswer: selected[i] || '' }));
      const { data: res } = await api.post(`/learn/${postId}/submit`, { answers });
      setResults(res);
      setTab('results');
    } catch (e) {
      alert(e.response?.data?.message || 'Submit failed');
    } finally { setSubmitting(false); }
  };

  if (loading) {
    return (
      <Layout>
        <div className="ns-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '4rem', gap: 16 }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(128,131,255,0.2), rgba(110,0,190,0.2))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'spin 2s linear infinite',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 32, color: '#c0c1ff' }}>menu_book</span>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: "'Newsreader', serif", fontSize: 18, fontWeight: 500, color: '#e2e2e9', marginBottom: 6 }}>Generating Learning Package…</div>
            <p style={{ fontSize: 13, color: '#908fa0' }}>Concepts · Flashcards · Quiz</p>
          </div>
        </div>
        <style>{`@keyframes spin { from{transform:rotate(0deg)}to{transform:rotate(360deg)} }`}</style>
      </Layout>
    );
  }

  if (error || !data) {
    return (
      <Layout>
        <div className="ns-page" style={{ textAlign: 'center', paddingTop: '4rem' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 40, color: '#ffb4ab', display: 'block', marginBottom: 12 }}>error</span>
          <p style={{ color: '#ffb4ab', marginBottom: 16 }}>{error || 'Failed to load'}</p>
          <button className="ns-btn ns-btn-ghost" onClick={() => navigate(-1)}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span>
            Go back
          </button>
        </div>
      </Layout>
    );
  }

  const questions = data.questions || [];
  const flashcards = data.flashcards || [];

  /* ── RESULTS tab ── */
  if (tab === 'results' && results) {
    const pct = results.percentage || 0;
    const scoreColor = pct >= 80 ? '#22c55e' : pct >= 60 ? '#eab308' : '#ef4444';
    return (
      <Layout>
        <div className="ns-page">
          <ContextBadge postTitle={data.postTitle} />
          <StudyTabBar tab={tab} setTab={setTab} flashcards={flashcards} questions={questions} />

          {/* Score card */}
          <div style={{
            position: 'relative', borderRadius: 16, padding: 1,
            background: `linear-gradient(135deg, ${scoreColor}44, transparent)`, marginBottom: 16,
          }}>
            <div style={{ borderRadius: 15, background: '#1a1b21', padding: '2rem', textAlign: 'center' }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#908fa0', marginBottom: 12 }}>Quiz Results</div>
              <div style={{ fontSize: 64, fontWeight: 700, color: scoreColor, lineHeight: 1, marginBottom: 8, fontFamily: "'Inter', sans-serif" }}>
                {pct}%
              </div>
              <p style={{ color: '#908fa0', fontSize: 14 }}>{results.score} / {results.totalQuestions} correct</p>
            </div>
          </div>

          {/* Detail answers */}
          {results.detailedAnswers?.map((ans, i) => (
            <div key={i} style={{
              background: '#1a1b21', borderRadius: 14, padding: '14px',
              border: `1px solid ${ans.isCorrect ? 'rgba(34,197,94,0.3)' : 'rgba(255,180,171,0.3)'}`,
              marginBottom: 10,
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18, color: ans.isCorrect ? '#22c55e' : '#ffb4ab', flexShrink: 0 }}>
                  {ans.isCorrect ? 'check_circle' : 'cancel'}
                </span>
                <p style={{ fontSize: 14, color: '#e2e2e9', lineHeight: 1.5, margin: 0 }}>{i + 1}. {questions[i]?.question}</p>
              </div>
              <p style={{ fontSize: 13, color: '#908fa0', marginLeft: 28, marginBottom: ans.isCorrect ? 0 : 4 }}>Your answer: <b style={{ color: '#c7c4d7' }}>{ans.selectedAnswer || '—'}</b></p>
              {!ans.isCorrect && <p style={{ fontSize: 13, color: '#4ADE80', marginLeft: 28, marginBottom: ans.explanation ? 4 : 0 }}>Correct: <b>{ans.correctAnswer}</b></p>}
              {ans.explanation && <p style={{ fontSize: 12, color: '#464554', marginLeft: 28, lineHeight: 1.5, margin: 0 }}>{ans.explanation}</p>}
            </div>
          ))}

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 20 }}>
            <button className="ns-btn ns-btn-ghost" onClick={() => { setTab('concepts'); setCurrentQ(0); setSelected({}); setResults(null); }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>restart_alt</span>
              Review Concepts
            </button>
            <Link to="/progress" className="ns-btn ns-btn-gradient">
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>insights</span>
              View Progress
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  /* ── QUIZ tab ── */
  if (tab === 'quiz') {
    const q = questions[currentQ];
    const progress = questions.length ? ((currentQ + 1) / questions.length) * 100 : 0;
    const options = q?.options || [];
    const letters = ['A', 'B', 'C', 'D'];
    return (
      <Layout>
        <div className="ns-page">
          <ContextBadge postTitle={data.postTitle} />
          <StudyTabBar tab={tab} setTab={setTab} flashcards={flashcards} questions={questions} />

          {/* Progress */}
          <div style={{ background: '#1a1b21', borderRadius: 14, padding: '12px 16px', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#e2e2e9' }}>Question {currentQ + 1} of {questions.length}</span>
                <span style={{ fontSize: 12, color: '#908fa0', marginLeft: 8 }}>· Single Choice</span>
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#c0c1ff' }}>{Math.round(progress)}% Complete</span>
            </div>
            <div className="ns-progress-bar">
              <div className="ns-progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 15, color: '#ddb7ff' }}>auto_awesome</span>
              <span style={{ fontSize: 11, color: '#908fa0' }}>
                Grounded in <span style={{ color: '#c0c1ff', fontStyle: 'italic' }}>{data.postTitle || 'this article'}</span>
              </span>
            </div>
          </div>

          {/* Question card */}
          <div style={{ position: 'relative', background: '#1e1f25', borderRadius: 14, padding: '1.25rem', marginBottom: 12, overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -48, right: -48, width: 160, height: 160, background: 'radial-gradient(circle, rgba(192,193,255,0.08), transparent 70%)', filter: 'blur(24px)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative', zIndex: 1, marginBottom: 16 }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#c0c1ff', display: 'block', marginBottom: 6 }}>
                Inquiry {String(currentQ + 1).padStart(2, '0')}
              </span>
              <h2 style={{ fontFamily: "'Newsreader', serif", fontSize: 20, fontWeight: 500, color: '#e2e2e9', lineHeight: 1.35, margin: 0 }}>
                {q?.question}
              </h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, position: 'relative', zIndex: 1 }}>
              {options.map((opt, idx) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setSelected(s => ({ ...s, [currentQ]: opt }))}
                  className={`ns-quiz-option${selected[currentQ] === opt ? ' selected' : ''}`}
                  style={{ border: 'none', width: '100%', fontFamily: 'inherit', textAlign: 'left' }}
                >
                  <div className={`ns-option-letter`}>{letters[idx]}</div>
                  <span style={{ fontSize: 14, color: selected[currentQ] === opt ? '#e2e2e9' : '#c7c4d7', lineHeight: 1.45, flex: 1 }}>{opt}</span>
                  {selected[currentQ] === opt && (
                    <div style={{ marginLeft: 'auto', flexShrink: 0 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#c0c1ff', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button
              className="ns-btn ns-btn-surface"
              disabled={currentQ === 0}
              onClick={() => setCurrentQ(c => c - 1)}
              style={{ padding: '10px 16px', gap: 6, fontSize: 13 }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 17 }}>arrow_back</span>
              Previous
            </button>
            {currentQ === questions.length - 1 ? (
              <button
                className="ns-btn ns-btn-gradient"
                style={{ flex: 1, gap: 6, fontSize: 13 }}
                disabled={submitting}
                onClick={submit}
              >
                {submitting ? 'Submitting…' : 'Submit Answers'}
                <span className="material-symbols-outlined" style={{ fontSize: 17 }}>arrow_forward</span>
              </button>
            ) : (
              <button
                className="ns-btn ns-btn-gradient"
                style={{ flex: 1, gap: 6, fontSize: 13 }}
                onClick={() => setCurrentQ(c => c + 1)}
              >
                Next Question
                <span className="material-symbols-outlined" style={{ fontSize: 17 }}>arrow_forward</span>
              </button>
            )}
          </div>
        </div>
      </Layout>
    );
  }

  /* ── FLASHCARDS tab ── */
  if (tab === 'flashcards') {
    const card = flashcards[cardIndex];
    return (
      <Layout>
        <div className="ns-page">
          <ContextBadge postTitle={data.postTitle} />
          <StudyTabBar tab={tab} setTab={setTab} flashcards={flashcards} questions={questions} />

          {flashcards.length === 0 ? (
            <p style={{ color: '#908fa0', fontSize: 14 }}>No flashcards generated for this post.</p>
          ) : (
            <>
              {/* Card header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#ddb7ff' }}>style</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#e2e2e9' }}>Concept Flashcard</span>
                </div>
                <span style={{ fontSize: 12, color: '#908fa0', fontWeight: 500 }}>
                  Card {cardIndex + 1} of {flashcards.length}
                </span>
              </div>

              {/* Flashcard */}
              <button
                type="button"
                className="ns-flashcard"
                style={{ width: '100%', border: '1px solid rgba(255,255,255,0.06)' }}
                onClick={() => setFlipped(f => !f)}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: flipped ? '#c0c1ff' : '#ddb7ff' }}>
                    {flipped ? 'Answer' : 'Prompt'}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#908fa0' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>touch_app</span>
                    Tap to flip
                  </span>
                </div>
                <h3 style={{ fontFamily: "'Newsreader', serif", fontSize: 20, fontWeight: 500, color: '#e2e2e9', lineHeight: 1.35, margin: '8px 0' }}>
                  {flipped ? card?.back : card?.front}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ddb7ff', display: 'inline-block' }} />
                    <span style={{ fontSize: 12, color: '#908fa0' }}>Terminology</span>
                  </div>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#908fa0' }}>flip_to_back</span>
                </div>
              </button>

              {/* Deck controls */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, paddingTop: 12 }}>
                <button
                  className="ns-btn ns-btn-ghost"
                  style={{ fontSize: 13, padding: '8px 14px', gap: 6 }}
                  onClick={() => setFlipped(f => !f)}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>flip_to_back</span>
                  Flip
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    className="ns-icon-btn"
                    style={{ background: '#1e1f25', width: 36, height: 36 }}
                    disabled={cardIndex === 0}
                    onClick={() => { setCardIndex(i => i - 1); setFlipped(false); }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>chevron_left</span>
                  </button>
                  <button
                    className="ns-icon-btn"
                    style={{ background: '#1e1f25', width: 36, height: 36 }}
                    disabled={cardIndex >= flashcards.length - 1}
                    onClick={() => { setCardIndex(i => i + 1); setFlipped(false); }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>chevron_right</span>
                  </button>
                </div>
              </div>

              <button
                className="ns-btn ns-btn-gradient"
                style={{ marginTop: 16, width: '100%', gap: 8 }}
                onClick={() => setTab('quiz')}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 17 }}>quiz</span>
                Take the Quiz
              </button>
            </>
          )}
        </div>
      </Layout>
    );
  }

  /* ── CONCEPTS tab (default) ── */
  const explanation = level === 'beginner' ? data.beginnerExplanation : data.intermediateExplanation;

  return (
    <Layout>
      <div className="ns-page">
        <ContextBadge postTitle={data.postTitle} />
        <StudyTabBar tab={tab} setTab={setTab} flashcards={flashcards} questions={questions} />

        {/* AI badge */}
        <div className="ns-ai-pill" style={{ marginBottom: 12 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>auto_awesome</span>
          Learn This · AI-Synthesized
        </div>

        <h1 style={{ fontFamily: "'Newsreader', serif", fontSize: 26, fontWeight: 500, color: '#e2e2e9', marginBottom: 4 }}>
          Learning Package
        </h1>
        <p style={{ fontSize: 14, color: '#908fa0', marginBottom: 20 }}>Generated from this article — concepts, flashcards &amp; quiz</p>

        {/* Summary card */}
        {data.summary && (
          <div style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 14, padding: '14px 16px', marginBottom: 16 }}>
            <p style={{ color: '#c0c1ff', fontWeight: 600, marginBottom: 8, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Summary</p>
            <p style={{ color: '#DADCE4', lineHeight: 1.65, fontSize: 14 }}>{data.summary}</p>
          </div>
        )}

        {/* Level toggle */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {['beginner', 'intermediate'].map(l => (
            <button
              key={l}
              onClick={() => setLevel(l)}
              style={{
                padding: '8px 16px', borderRadius: 9999, cursor: 'pointer', fontSize: 13, fontWeight: 500,
                background: level === l ? 'linear-gradient(135deg, #8083ff, #6f00be)' : '#1a1b21',
                color: level === l ? '#e2e2e9' : '#908fa0',
                border: `1px solid ${level === l ? 'transparent' : 'rgba(255,255,255,0.07)'}`,
                transition: 'all 0.2s', textTransform: 'capitalize',
              }}
            >
              {l}
            </button>
          ))}
        </div>

        {/* Explanation */}
        {explanation && (
          <div style={{ background: '#1a1b21', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '14px 16px', marginBottom: 16 }}>
            <p style={{ fontSize: 11, color: '#908fa0', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
              {level === 'beginner' ? 'Simple Explanation' : 'Deeper Explanation'}
            </p>
            <p style={{ color: '#DADCE4', lineHeight: 1.7, fontSize: 14 }}>{explanation}</p>
          </div>
        )}

        {/* Prerequisites */}
        {data.prerequisites?.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontFamily: "'Newsreader', serif", fontSize: 16, color: '#e2e2e9', marginBottom: 10 }}>Prerequisites</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {data.prerequisites.map((p, i) => <span key={i} className="ns-chip ns-chip-active">{p}</span>)}
            </div>
          </div>
        )}

        {/* Key concepts */}
        <h2 style={{ fontFamily: "'Newsreader', serif", fontSize: 16, color: '#e2e2e9', marginBottom: 10 }}>Key Concepts</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
          {(data.keyConcepts || []).map((c, i) => (
            <span key={i} className="ns-chip" style={{ padding: '8px 14px', color: '#c7c4d7', fontSize: 13 }}>{c}</span>
          ))}
        </div>

        {/* Terminology */}
        {data.terminology?.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontFamily: "'Newsreader', serif", fontSize: 16, color: '#e2e2e9', marginBottom: 12 }}>Terminology</h2>
            {data.terminology.map((t, i) => (
              <div key={i} style={{ background: '#1a1b21', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '12px 14px', marginBottom: 8 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: '#c0c1ff', marginBottom: 4 }}>{t.term}</div>
                <p style={{ fontSize: 13, color: '#908fa0', lineHeight: 1.6, margin: 0 }}>{t.definition}</p>
              </div>
            ))}
          </div>
        )}

        {/* CTA row */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="ns-btn ns-btn-gradient" onClick={() => setTab('flashcards')} style={{ flex: 1, gap: 6 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 17 }}>style</span>
            Study Flashcards
          </button>
          <button className="ns-btn ns-btn-ghost" onClick={() => setTab('quiz')} style={{ flex: 1, gap: 6 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 17 }}>quiz</span>
            Start Quiz ({questions.length})
          </button>
        </div>
      </div>
    </Layout>
  );
}
