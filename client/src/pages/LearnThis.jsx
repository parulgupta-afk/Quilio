import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function LearnThis() {
  const { postId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState('');
  const [keyConcepts, setKeyConcepts] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [quizId, setQuizId] = useState(null);

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
        setQuizId(data.quizId);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load learning content');
      } finally {
        setLoading(false);
      }
    };

    fetchLearn();
  }, [postId]);

  const handleSelect = (option) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQ]: option,
    }));
  };

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ((q) => q + 1);
    }
  };

  const handlePrev = () => {
    if (currentQ > 0) {
      setCurrentQ((q) => q - 1);
    }
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

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center text-gray-500">
        <p className="text-lg mb-2">🧠 Generating learning content...</p>
        <p className="text-sm">This may take a few seconds</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="text-indigo-600 hover:underline"
        >
          ← Go back
        </button>
      </div>
    );
  }

  // ========== RESULTS ==========
  if (step === 'results' && results) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2">Quiz Results</h1>
          <p className="text-5xl font-bold text-indigo-600 my-6">
            {results.percentage}%
          </p>
          <p className="text-gray-600">
            You got {results.score} out of {results.totalQuestions} correct
          </p>
        </div>

        <div className="space-y-6 mb-10">
          {results.detailedAnswers?.map((ans, i) => (
            <div
              key={i}
              className={`p-5 rounded-xl border ${
                ans.isCorrect
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <p className="font-medium mb-2">
                {i + 1}. {questions[i]?.question}
              </p>
              <p className="text-sm">
                Your answer:{' '}
                <span className="font-medium">{ans.selectedAnswer || '—'}</span>
              </p>
              {!ans.isCorrect && (
                <p className="text-sm mt-1">
                  Correct answer:{' '}
                  <span className="font-medium text-green-700">
                    {ans.correctAnswer}
                  </span>
                </p>
              )}
              {ans.explanation && (
                <p className="text-sm text-gray-600 mt-2">{ans.explanation}</p>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={() => {
              setStep('overview');
              setCurrentQ(0);
              setSelectedAnswers({});
              setResults(null);
            }}
            className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Review Concepts
          </button>
          <Link
            to="/"
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Back to Feed
          </Link>
        </div>
      </div>
    );
  }

  // ========== QUIZ ==========
  if (step === 'quiz') {
    const q = questions[currentQ];
    const progress = ((currentQ + 1) / questions.length) * 100;

    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>
              Question {currentQ + 1} of {questions.length}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <h2 className="text-xl font-semibold mb-6">{q.question}</h2>

        <div className="space-y-3 mb-10">
          {q.options?.map((option) => (
            <button
              key={option}
              onClick={() => handleSelect(option)}
              className={`w-full text-left px-5 py-3.5 rounded-xl border transition ${
                selectedAnswers[currentQ] === option
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-800'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="flex justify-between">
          <button
            onClick={handlePrev}
            disabled={currentQ === 0}
            className="px-5 py-2.5 border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition"
          >
            Previous
          </button>

          {currentQ === questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={submitting || Object.keys(selectedAnswers).length < questions.length}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
            >
              {submitting ? 'Submitting...' : 'Submit Quiz'}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Next
            </button>
          )}
        </div>
      </div>
    );
  }

  // ========== OVERVIEW ==========
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🧠 Learn This</h1>
        <p className="text-gray-600">
          Key concepts and a quiz generated from this article
        </p>
      </div>

      {summary && (
        <section className="mb-10 p-6 bg-indigo-50 rounded-2xl">
          <h2 className="font-semibold text-indigo-900 mb-2">Summary</h2>
          <p className="text-indigo-800 leading-relaxed">{summary}</p>
        </section>
      )}

      <section className="mb-10">
        <h2 className="text-xl font-bold mb-4">Key Concepts</h2>
        <div className="flex flex-wrap gap-3">
          {keyConcepts.map((concept, i) => (
            <span
              key={i}
              className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-800"
            >
              {concept}
            </span>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2">
          Quiz ({questions.length} questions)
        </h2>
        <p className="text-gray-600 mb-6">
          Test your understanding of the article
        </p>

        <button
          onClick={() => setStep('quiz')}
          className="px-8 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition"
        >
          Start Quiz →
        </button>
      </section>
    </div>
  );
}
