import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Layout from '../components/Layout';

export default function LearnThis() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  const [tab, setTab] = useState('concepts'); // concepts | flashcards | quiz | results
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState(null);
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [level, setLevel] = useState('beginner'); // beginner | intermediate

  useEffect(() => {
    api
      .get(`/learn/${postId}`)
      .then((r) => setData(r.data))
      .catch((e) => setError(e.response?.data?.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }, [postId]);

  const submit = async () => {
    setSubmitting(true);
    try {
      const answers = (data.questions || []).map((_, i) => ({
        questionIndex: i,
        selectedAnswer: selected[i] || '',
      }));
      const { data: res } = await api.post(`/learn/${postId}/submit`, { answers });
      setResults(res);
      setTab('results');
    } catch (e) {
      alert(e.response?.data?.message || 'Submit failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="page muted" style={{ textAlign: 'center', paddingTop: 80 }}>
          🧠 Generating learning package…
          <p style={{ marginTop: 12, fontSize: 13 }}>Concepts · Flashcards · Quiz</p>
        </div>
      </Layout>
    );
  }

  if (error || !data) {
    return (
      <Layout>
        <div className="page" style={{ color: '#fca5a5' }}>
          {error || 'Failed'}
          <br />
          <button className="btn btn-ghost" style={{ marginTop: 16 }} onClick={() => navigate(-1)}>
            Go back
          </button>
        </div>
      </Layout>
    );
  }

  const questions = data.questions || [];
  const flashcards = data.flashcards || [];

  // RESULTS
  if (tab === 'results' && results) {
    return (
      <Layout>
        <div className="page" style={{ textAlign: 'center' }}>
          <h1 className="serif" style={{ fontSize: 28, color: '#F1F1F4' }}>Quiz Results</h1>
          <div style={{ fontSize: 56, fontWeight: 700, color: '#A855F7', margin: '24px 0' }}>
            {results.percentage}%
          </div>
          <p className="muted" style={{ marginBottom: 32 }}>
            {results.score} / {results.totalQuestions} correct
          </p>
          {results.detailedAnswers?.map((ans, i) => (
            <div
              key={i}
              className="card"
              style={{
                textAlign: 'left',
                borderColor: ans.isCorrect ? 'rgba(74,222,128,0.35)' : 'rgba(239,68,68,0.35)',
              }}
            >
              <p style={{ color: '#F1F1F4', marginBottom: 8 }}>
                {i + 1}. {questions[i]?.question}
              </p>
              <p className="muted" style={{ fontSize: 13 }}>
                Your answer: {ans.selectedAnswer || '—'}
              </p>
              {!ans.isCorrect && (
                <p style={{ color: '#4ADE80', fontSize: 13 }}>Correct: {ans.correctAnswer}</p>
              )}
              {ans.explanation && (
                <p className="faint" style={{ fontSize: 13, marginTop: 6 }}>
                  {ans.explanation}
                </p>
              )}
            </div>
          ))}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }}>
            <button
              className="btn btn-ghost"
              onClick={() => {
                setTab('concepts');
                setCurrentQ(0);
                setSelected({});
                setResults(null);
              }}
            >
              Review concepts
            </button>
            <Link to="/progress" className="btn btn-primary">
              View progress
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  // QUIZ
  if (tab === 'quiz') {
    const q = questions[currentQ];
    const progress = questions.length ? ((currentQ + 1) / questions.length) * 100 : 0;
    return (
      <Layout>
        <div className="page">
          <div className="faint" style={{ fontSize: 13, marginBottom: 8 }}>
            Question {currentQ + 1} of {questions.length}
          </div>
          <div
            style={{
              height: 6,
              background: '#15171F',
              borderRadius: 99,
              marginBottom: 28,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${progress}%`,
                background: 'linear-gradient(90deg,#6366F1,#A855F7)',
              }}
            />
          </div>
          <h2 className="serif" style={{ fontSize: 22, marginBottom: 24, color: '#F1F1F4' }}>
            {q?.question}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
            {q?.options?.map((opt) => (
              <button
                key={opt}
                onClick={() => setSelected((s) => ({ ...s, [currentQ]: opt }))}
                className="card"
                style={{
                  textAlign: 'left',
                  cursor: 'pointer',
                  marginBottom: 0,
                  borderColor: selected[currentQ] === opt ? '#6366F1' : undefined,
                  background: selected[currentQ] === opt ? 'rgba(99,102,241,0.12)' : undefined,
                }}
              >
                {opt}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button
              className="btn btn-ghost"
              disabled={currentQ === 0}
              onClick={() => setCurrentQ((c) => c - 1)}
            >
              Previous
            </button>
            {currentQ === questions.length - 1 ? (
              <button className="btn btn-primary" disabled={submitting} onClick={submit}>
                {submitting ? '…' : 'Submit'}
              </button>
            ) : (
              <button className="btn btn-primary" onClick={() => setCurrentQ((c) => c + 1)}>
                Next
              </button>
            )}
          </div>
        </div>
      </Layout>
    );
  }

  // FLASHCARDS
  if (tab === 'flashcards') {
    const card = flashcards[cardIndex];
    return (
      <Layout>
        <div className="page">
          <div className="tabs" style={{ marginBottom: 24 }}>
            <button onClick={() => setTab('concepts')}>Concepts</button>
            <button className="on" onClick={() => setTab('flashcards')}>
              Flashcards
            </button>
            <button onClick={() => setTab('quiz')}>Quiz</button>
          </div>

          {flashcards.length === 0 ? (
            <p className="muted">No flashcards generated for this post.</p>
          ) : (
            <>
              <p className="faint" style={{ fontSize: 13, marginBottom: 16 }}>
                Card {cardIndex + 1} of {flashcards.length} · Click card to flip
              </p>
              <button
                type="button"
                onClick={() => setFlipped((f) => !f)}
                className="card ambient-glow"
                style={{
                  minHeight: 200,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  cursor: 'pointer',
                  padding: 32,
                  marginBottom: 20,
                }}
              >
                <div>
                  <div className="ai-pill" style={{ marginBottom: 12 }}>
                    {flipped ? 'Answer' : 'Prompt'}
                  </div>
                  <p className="serif" style={{ fontSize: 20, color: '#F1F1F4', lineHeight: 1.4 }}>
                    {flipped ? card?.back : card?.front}
                  </p>
                </div>
              </button>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button
                  className="btn btn-ghost"
                  disabled={cardIndex === 0}
                  onClick={() => {
                    setCardIndex((i) => i - 1);
                    setFlipped(false);
                  }}
                >
                  Previous
                </button>
                <button className="btn btn-ghost" onClick={() => setFlipped((f) => !f)}>
                  Flip
                </button>
                <button
                  className="btn btn-primary"
                  disabled={cardIndex >= flashcards.length - 1}
                  onClick={() => {
                    setCardIndex((i) => i + 1);
                    setFlipped(false);
                  }}
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      </Layout>
    );
  }

  // CONCEPTS (default)
  const explanation =
    level === 'beginner' ? data.beginnerExplanation : data.intermediateExplanation;

  return (
    <Layout>
      <div className="page">
        <div className="ai-pill" style={{ marginBottom: 12 }}>
          🧠 Learn This · AI-assisted
        </div>
        <h1 className="serif" style={{ fontSize: 28, color: '#F1F1F4', marginBottom: 8 }}>
          Learning package
        </h1>
        <p className="muted" style={{ marginBottom: 20 }}>
          Generated from this article · concepts, flashcards & quiz
        </p>

        <div className="tabs">
          <button className="on" onClick={() => setTab('concepts')}>
            Concepts
          </button>
          <button onClick={() => setTab('flashcards')}>
            Flashcards ({flashcards.length})
          </button>
          <button onClick={() => setTab('quiz')}>Quiz ({questions.length})</button>
        </div>

        {data.summary && (
          <div
            className="card"
            style={{
              background: 'rgba(99,102,241,0.08)',
              borderColor: 'rgba(99,102,241,0.25)',
              marginBottom: 20,
            }}
          >
            <p style={{ color: '#C9C9FF', fontWeight: 600, marginBottom: 8, fontSize: 13 }}>
              Summary
            </p>
            <p style={{ color: '#DADCE4', lineHeight: 1.6 }}>{data.summary}</p>
          </div>
        )}

        {/* Level toggle */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <button
            className={level === 'beginner' ? 'btn btn-primary' : 'btn btn-ghost'}
            style={{ padding: '8px 14px', fontSize: 13 }}
            onClick={() => setLevel('beginner')}
          >
            Beginner
          </button>
          <button
            className={level === 'intermediate' ? 'btn btn-primary' : 'btn btn-ghost'}
            style={{ padding: '8px 14px', fontSize: 13 }}
            onClick={() => setLevel('intermediate')}
          >
            Intermediate
          </button>
        </div>

        {explanation && (
          <div className="card" style={{ marginBottom: 20 }}>
            <p className="muted" style={{ fontSize: 13, marginBottom: 8 }}>
              {level === 'beginner' ? 'Simple explanation' : 'Deeper explanation'}
            </p>
            <p style={{ color: '#DADCE4', lineHeight: 1.65 }}>{explanation}</p>
          </div>
        )}

        {data.prerequisites?.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <h2 className="serif" style={{ fontSize: 17, color: '#F1F1F4', marginBottom: 10 }}>
              Prerequisites
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {data.prerequisites.map((p, i) => (
                <span key={i} className="chip">
                  {p}
                </span>
              ))}
            </div>
          </div>
        )}

        <h2 className="serif" style={{ fontSize: 17, color: '#F1F1F4', marginBottom: 10 }}>
          Key concepts
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
          {(data.keyConcepts || []).map((c, i) => (
            <span key={i} className="chip" style={{ padding: '8px 14px', color: '#F1F1F4' }}>
              {c}
            </span>
          ))}
        </div>

        {data.terminology?.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <h2 className="serif" style={{ fontSize: 17, color: '#F1F1F4', marginBottom: 12 }}>
              Terminology
            </h2>
            {data.terminology.map((t, i) => (
              <div key={i} className="card" style={{ marginBottom: 10 }}>
                <b style={{ color: '#C9C9FF' }}>{t.term}</b>
                <p className="muted" style={{ margin: '6px 0 0', fontSize: 14, lineHeight: 1.5 }}>
                  {t.definition}
                </p>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => setTab('flashcards')}>
            Study flashcards →
          </button>
          <button className="btn btn-ghost" onClick={() => setTab('quiz')}>
            Start quiz ({questions.length})
          </button>
        </div>
      </div>
    </Layout>
  );
}
