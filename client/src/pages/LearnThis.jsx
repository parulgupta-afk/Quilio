import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Layout from '../components/Layout';

export default function LearnThis() {
  const { postId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState('');
  const [keyConcepts, setKeyConcepts] = useState([]);
  const [questions, setQuestions] = useState([]);

  const [step, setStep] = useState('overview'); // overview | quiz | results
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState(null);

  useEffect(() => {
    const fetchLearn = async () => {
      try {
        const { data } = await api.get(`/learn/${postId}`);
        setSummary(data.summary);
        setKeyConcepts(data.keyConcepts || []);
        setQuestions(data.questions || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load learning content');
      } finally {
        setLoading(false);
      }
    };
    fetchLearn();
  }, [postId]);

  const handleSelect = (option) => {
    setSelectedAnswers((prev) => ({ ...prev, [currentQ]: option }));
  };

  const handleNext = () => {
    if (currentQ < questions.length - 1) setCurrentQ((q) => q + 1);
  };

  const handlePrev = () => {
    if (currentQ > 0) setCurrentQ((q) => q - 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const answers = questions.map((_, index) => ({
        questionIndex: index,
        selectedAnswer: selectedAnswers[index] || '',
      }));
      const { data } = await api.post(`/learn/${postId}/submit`, { answers });
      setResults(data);
      setStep('results');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading ──
  if (loading) {
    return (
      <Layout>
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '80px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: 18, marginBottom: 8 }}>🧠 Generating learning content…</p>
          <p style={{ fontSize: 14, color: 'var(--text-faint)' }}>This may take a few seconds</p>
        </div>
      </Layout>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <Layout>
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
          <p style={{ color: '#fca5a5', marginBottom: 16 }}>{error}</p>
          <button onClick={() => navigate(-1)} style={{ color: '#C9C9FF', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>
            ← Go back
          </button>
        </div>
      </Layout>
    );
  }

  // ── Results ──
  if (step === 'results' && results) {
    return (
      <Layout>
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '48px 24px 100px' }}>
          {/* Score */}
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ fontSize: 13, color: 'var(--text-faint)', marginBottom: 8 }}>🧠 Learn This · Results</div>
            <h1 className="serif" style={{ fontWeight: 500, fontSize: 30, margin: '0 0 8px' }}>Quiz complete</h1>
            <p
              style={{
                fontSize: 56, fontWeight: 700, margin: '20px 0 8px',
                background: 'linear-gradient(135deg,var(--accent-1),var(--accent-2))',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}
            >
              {results.percentage}%
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
              {results.score} of {results.totalQuestions} correct
            </p>
          </div>

          {/* Detailed answers */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 40 }}>
            {results.detailedAnswers?.map((ans, i) => (
              <div
                key={i}
                style={{
                  padding: 20, borderRadius: 12,
                  background: ans.isCorrect ? 'rgba(74,222,128,0.06)' : 'rgba(239,68,68,0.06)',
                  border: `1px solid ${ans.isCorrect ? 'rgba(74,222,128,0.25)' : 'rgba(239,68,68,0.25)'}`,
                }}
              >
                <p style={{ fontWeight: 500, marginBottom: 8, color: 'var(--text)', fontSize: 15 }}>
                  {i + 1}. {questions[i]?.question}
                </p>
                <p style={{ fontSize: 13.5, color: 'var(--text-muted)', margin: '0 0 4px' }}>
                  Your answer: <span style={{ fontWeight: 500, color: ans.isCorrect ? '#4ADE80' : '#fca5a5' }}>{ans.selectedAnswer || '—'}</span>
                </p>
                {!ans.isCorrect && (
                  <p style={{ fontSize: 13.5, color: 'var(--text-muted)', margin: '0 0 4px' }}>
                    Correct: <span style={{ fontWeight: 500, color: '#4ADE80' }}>{ans.correctAnswer}</span>
                  </p>
                )}
                {ans.explanation && (
                  <p style={{ fontSize: 13, color: 'var(--text-faint)', margin: '6px 0 0' }}>{ans.explanation}</p>
                )}
              </div>
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button
              onClick={() => { setStep('overview'); setCurrentQ(0); setSelectedAnswers({}); setResults(null); }}
              className="btn btn-ghost"
            >
              Review Concepts
            </button>
            <Link to="/" className="btn btn-primary">Back to Feed</Link>
          </div>
        </div>
      </Layout>
    );
  }

  // ── Quiz ──
  if (step === 'quiz') {
    const q = questions[currentQ];
    const progress = ((currentQ + 1) / questions.length) * 100;
    const LETTERS = ['A', 'B', 'C', 'D', 'E'];

    return (
      <Layout>
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '48px 24px 100px' }}>
          {/* Progress */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-faint)', marginBottom: 8 }}>
              <span>Question {currentQ + 1} of {questions.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div style={{ height: 6, borderRadius: 100, background: 'var(--bg-card)', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%', width: `${progress}%`,
                  background: 'linear-gradient(90deg,var(--accent-1),var(--accent-2))',
                  borderRadius: 100, transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>

          {/* Question */}
          <div className="card" style={{ padding: 26, marginBottom: 20 }}>
            <div style={{ fontSize: 13, color: 'var(--text-faint)', marginBottom: 10 }}>
              Question {currentQ + 1} of {questions.length}
            </div>
            <p className="serif" style={{ fontSize: 20, lineHeight: 1.4, margin: '0 0 22px', color: 'var(--text)' }}>
              {q.question}
            </p>

            {q.options?.map((option, oi) => {
              const isSelected = selectedAnswers[currentQ] === option;
              return (
                <div
                  key={option}
                  onClick={() => handleSelect(option)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '13px 16px',
                    border: `1px solid ${isSelected ? 'var(--accent-1)' : 'var(--border-strong)'}`,
                    borderRadius: 10, marginBottom: 10,
                    background: isSelected ? 'rgba(99,102,241,0.1)' : 'transparent',
                    cursor: 'pointer', fontSize: 14.5, color: isSelected ? '#C9C9FF' : 'var(--text-muted)',
                    transition: 'all 0.15s',
                  }}
                >
                  <span
                    style={{
                      width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                      border: `1px solid ${isSelected ? 'var(--accent-1)' : 'var(--text-faint)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, color: isSelected ? '#C9C9FF' : 'var(--text-faint)',
                    }}
                  >
                    {LETTERS[oi]}
                  </span>
                  {option}
                </div>
              );
            })}

            {/* Nav */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 22 }}>
              <button
                onClick={handlePrev}
                disabled={currentQ === 0}
                className="btn btn-ghost"
                style={{ padding: '9px 18px', fontSize: 13.5, opacity: currentQ === 0 ? 0.4 : 1 }}
              >
                Previous
              </button>
              {currentQ === questions.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  disabled={submitting || Object.keys(selectedAnswers).length < questions.length}
                  className="btn btn-primary"
                  style={{ padding: '9px 18px', fontSize: 13.5 }}
                >
                  {submitting ? 'Submitting…' : 'Submit Quiz'}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="btn btn-primary"
                  style={{ padding: '9px 18px', fontSize: 13.5 }}
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // ── Overview ──
  return (
    <Layout>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '48px 24px 100px' }}>

        {/* Header */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: '#C9C9FF', fontWeight: 600 }}>🧠 Learn This</span>
          </div>
          <h1 className="serif" style={{ fontWeight: 500, fontSize: 30, margin: '0 0 6px' }}>
            Key Concepts &amp; Quiz
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14.5, margin: '0 0 32px' }}>
            {keyConcepts.length} key concepts · {questions.length} questions
          </p>
        </div>

        {/* Progress bar placeholder */}
        <div style={{ height: 6, borderRadius: 100, background: 'var(--bg-card)', marginBottom: 36, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: '0%', background: 'linear-gradient(90deg,var(--accent-1),var(--accent-2))', borderRadius: 100 }} />
        </div>

        {/* Summary */}
        {summary && (
          <section
            style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 14, padding: '20px 22px', marginBottom: 32,
            }}
          >
            <h2 style={{ fontSize: 14, fontWeight: 600, color: '#C9C9FF', margin: '0 0 8px' }}>Summary</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 14.5, lineHeight: 1.65, margin: 0 }}>{summary}</p>
          </section>
        )}

        {/* Key Concepts grid */}
        <section style={{ marginBottom: 40 }}>
          <h2 className="serif" style={{ fontWeight: 500, fontSize: 22, margin: '0 0 14px' }}>Key Concepts</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {keyConcepts.map((concept, i) => (
              <div
                key={i}
                style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: 12, padding: '14px 16px', fontSize: 14,
                }}
              >
                <b style={{ display: 'block', fontSize: 14.5, marginBottom: 3, color: 'var(--text)' }}>{concept}</b>
              </div>
            ))}
          </div>
        </section>

        {/* Start quiz */}
        <section>
          <h2 className="serif" style={{ fontWeight: 500, fontSize: 22, margin: '0 0 6px' }}>
            Quiz ({questions.length} questions)
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14.5, marginBottom: 22 }}>
            Test your understanding of the article
          </p>
          <button
            onClick={() => setStep('quiz')}
            className="btn btn-primary"
            style={{ padding: '11px 28px' }}
          >
            Start Quiz →
          </button>
        </section>
      </div>
    </Layout>
  );
}
