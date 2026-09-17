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
  const [step, setStep] = useState('overview');
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState(null);

  useEffect(() => {
    api.get(`/learn/${postId}`)
      .then((r) => {
        setSummary(r.data.summary || '');
        setKeyConcepts(r.data.keyConcepts || []);
        setQuestions(r.data.questions || []);
      })
      .catch((e) => setError(e.response?.data?.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }, [postId]);

  const submit = async () => {
    setSubmitting(true);
    try {
      const answers = questions.map((_, i) => ({ questionIndex: i, selectedAnswer: selected[i] || '' }));
      const { data } = await api.post(`/learn/${postId}/submit`, { answers });
      setResults(data);
      setStep('results');
    } catch (e) {
      alert(e.response?.data?.message || 'Submit failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Layout><div className="page muted" style={{ textAlign: 'center', paddingTop: 80 }}>🧠 Generating learning content…</div></Layout>;
  if (error) return <Layout><div className="page" style={{ color: '#fca5a5' }}>{error}<br /><button className="btn btn-ghost" style={{ marginTop: 16 }} onClick={() => navigate(-1)}>Go back</button></div></Layout>;

  if (step === 'results' && results) {
    return (
      <Layout>
        <div className="page" style={{ textAlign: 'center' }}>
          <h1 className="serif" style={{ fontSize: 28, color: '#F1F1F4' }}>Quiz Results</h1>
          <div style={{ fontSize: 56, fontWeight: 700, color: '#A855F7', margin: '24px 0' }}>{results.percentage}%</div>
          <p className="muted" style={{ marginBottom: 32 }}>{results.score} / {results.totalQuestions} correct</p>
          {results.detailedAnswers?.map((ans, i) => (
            <div key={i} className="card" style={{ textAlign: 'left', borderColor: ans.isCorrect ? 'rgba(74,222,128,0.3)' : 'rgba(239,68,68,0.3)' }}>
              <p style={{ color: '#F1F1F4', marginBottom: 8 }}>{i + 1}. {questions[i]?.question}</p>
              <p className="muted" style={{ fontSize: 13 }}>Your answer: {ans.selectedAnswer || '—'}</p>
              {!ans.isCorrect && <p style={{ color: '#4ADE80', fontSize: 13 }}>Correct: {ans.correctAnswer}</p>}
              {ans.explanation && <p className="faint" style={{ fontSize: 13, marginTop: 6 }}>{ans.explanation}</p>}
            </div>
          ))}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24 }}>
            <button className="btn btn-ghost" onClick={() => { setStep('overview'); setCurrentQ(0); setSelected({}); setResults(null); }}>Review</button>
            <Link to="/" className="btn btn-primary">Home</Link>
          </div>
        </div>
      </Layout>
    );
  }

  if (step === 'quiz') {
    const q = questions[currentQ];
    const progress = ((currentQ + 1) / questions.length) * 100;
    return (
      <Layout>
        <div className="page">
          <div className="faint" style={{ fontSize: 13, marginBottom: 8 }}>Question {currentQ + 1} of {questions.length}</div>
          <div style={{ height: 6, background: '#15171F', borderRadius: 99, marginBottom: 28, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg,#6366F1,#A855F7)' }} />
          </div>
          <h2 className="serif" style={{ fontSize: 22, marginBottom: 24, color: '#F1F1F4' }}>{q?.question}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
            {q?.options?.map((opt) => (
              <button
                key={opt}
                onClick={() => setSelected((s) => ({ ...s, [currentQ]: opt }))}
                className="card"
                style={{
                  textAlign: 'left', cursor: 'pointer', marginBottom: 0,
                  borderColor: selected[currentQ] === opt ? '#6366F1' : undefined,
                  background: selected[currentQ] === opt ? 'rgba(99,102,241,0.12)' : undefined,
                }}
              >
                {opt}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button className="btn btn-ghost" disabled={currentQ === 0} onClick={() => setCurrentQ((c) => c - 1)}>Previous</button>
            {currentQ === questions.length - 1 ? (
              <button className="btn btn-primary" disabled={submitting} onClick={submit}>{submitting ? '…' : 'Submit'}</button>
            ) : (
              <button className="btn btn-primary" onClick={() => setCurrentQ((c) => c + 1)}>Next</button>
            )}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="page">
        <div className="ai-pill" style={{ marginBottom: 12 }}>🧠 Learn This</div>
        <h1 className="serif" style={{ fontSize: 28, color: '#F1F1F4', marginBottom: 8 }}>Key concepts & quiz</h1>
        <p className="muted" style={{ marginBottom: 28 }}>Generated from this article</p>
        {summary && (
          <div className="card" style={{ background: 'rgba(99,102,241,0.08)', borderColor: 'rgba(99,102,241,0.2)', marginBottom: 28 }}>
            <p style={{ color: '#C9C9FF', fontWeight: 600, marginBottom: 8, fontSize: 13 }}>Summary</p>
            <p style={{ color: '#DADCE4', lineHeight: 1.6 }}>{summary}</p>
          </div>
        )}
        <h2 className="serif" style={{ fontSize: 18, color: '#F1F1F4', marginBottom: 14 }}>Key Concepts</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 32 }}>
          {keyConcepts.map((c, i) => (
            <span key={i} className="chip" style={{ padding: '8px 14px', color: '#F1F1F4' }}>{c}</span>
          ))}
        </div>
        <button className="btn btn-primary" onClick={() => setStep('quiz')}>
          Start Quiz ({questions.length} questions) →
        </button>
      </div>
    </Layout>
  );
}
