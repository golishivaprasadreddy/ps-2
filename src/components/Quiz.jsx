import React, { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import toast from 'react-hot-toast';
import { getQuizzes, submitQuizAnswers, getUserProfile } from '../services/coinService';
import BadgeIcon from './BadgeIcon';

const CELEBRATION_COIN_THRESHOLD = 1000;

const Quiz = ({ userId, token }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [level, setLevel] = useState('easy');
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [coins, setCoins] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [badges, setBadges] = useState([]);
  const [result, setResult] = useState(null); // {score, percent, passed}

  useEffect(() => {
  getQuizzes(level, token).then(res => setQuizzes(res.data)).catch(() => setQuizzes([]));
    getUserProfile(userId, token).then(res => {
      setCoins(res.data.coins || 0);
      setProgress(res.data.quizProgress || 0);
      setBadges(res.data.badges || []);
    }).catch(() => {});
  }, [userId, token, level]);

  useEffect(() => {
    if (completed) {
      getUserProfile(userId, token).then(res => {
        setCoins(res.data.coins || 0);
        setProgress(res.data.quizProgress || 0);
        setBadges(res.data.badges || []);
        if ((res.data.coins || 0) >= CELEBRATION_COIN_THRESHOLD) setShowCelebration(true);
      }).catch(() => {});
    }
  }, [completed, userId, token]);

  const handleSelectQuiz = quiz => {
    setSelectedQuiz(quiz);
    setAnswers({});
    setCompleted(false);
  };

  const handleChange = (idx, value) => {
    setAnswers({ ...answers, [idx]: value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
  const payloadAnswers = selectedQuiz.questions.map((_, idx) => (answers[idx] != null ? Number(answers[idx]) : -1));
  const res = await submitQuizAnswers(userId, selectedQuiz._id, payloadAnswers, token);
  setResult({ score: res.data.score, percent: res.data.percent, passed: res.data.passed });
  toast[res.data.passed ? 'success' : 'info'](res.data.message || (res.data.passed ? 'Quiz passed' : 'Quiz not passed'));
  setCompleted(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error submitting quiz');
    }
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-slate-200">
      <h2 className="text-3xl font-extrabold text-pink-600 mb-6 text-center">Course & Quiz Challenge</h2>
      <div className="mb-4 text-center text-blue-700 font-bold">Your Coins: {coins}</div>
  <div className="mb-4 text-center text-green-700 font-bold">Quiz Progress: {progress}/5</div>
      {badges.length > 0 && (
        <div className="mb-4 flex justify-center">
          <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-lg">
            <span className="text-yellow-700 font-semibold">Latest Badge:</span>
            <BadgeIcon name={badges[badges.length - 1]} size={36} />
          </div>
        </div>
      )}
      {showCelebration && <Confetti recycle={false} numberOfPieces={200} />}
      {!selectedQuiz ? (
        <div>
          <div className="flex items-center justify-center gap-2 mb-4">
            <label className="text-sm text-slate-600">Level:</label>
            <select value={level} onChange={e => setLevel(e.target.value)} className="border rounded px-2 py-1">
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <h3 className="mb-4 text-lg font-bold text-gray-700 text-center">Select a Quiz ({level}):</h3>
          <ul className="mb-6 flex flex-col gap-3 items-center">
            {quizzes.map(quiz => (
              <li key={quiz._id}>
                <button className="text-blue-600 underline font-bold text-lg hover:text-blue-800 transition" onClick={() => handleSelectQuiz(quiz)}>
                  {quiz.title}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <h3 className="font-bold text-xl mb-4 text-center text-gray-800">{selectedQuiz.title}</h3>
          {selectedQuiz.questions.map((q, idx) => (
            <div key={idx} className="flex flex-col gap-2 mb-2">
              <span className="font-semibold text-gray-700 mb-1">{q.question}</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {q.options.map((opt, optIdx) => {
                  const chosen = Number(answers[idx]) === optIdx;
                  const showCorrect = completed && optIdx === q.correctAnswer;
                  const isWrongChoice = completed && chosen && optIdx !== q.correctAnswer;
                  return (
                    <label key={optIdx} className={`flex items-center gap-2 border rounded-lg p-2 ${completed ? 'cursor-default' : 'cursor-pointer'} ${showCorrect ? 'border-green-500 bg-green-50' : isWrongChoice ? 'border-red-400 bg-red-50' : chosen ? 'border-pink-400 bg-pink-50' : 'border-slate-300'}`}>
                      <input
                        type="radio"
                        name={`q-${idx}`}
                        value={optIdx}
                        checked={Number(answers[idx]) === optIdx}
                        onChange={e => handleChange(idx, e.target.value)}
                        disabled={completed}
                      />
                      <span className={`${showCorrect ? 'text-green-700 font-semibold' : isWrongChoice ? 'text-red-700' : ''}`}>{opt}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
          <button
            type="submit"
            className="bg-pink-500 text-white py-3 rounded-lg font-bold text-lg hover:bg-pink-700 transition shadow"
            disabled={loading || completed}
          >
            {completed ? 'Completed!' : loading ? 'Submitting...' : 'Submit Quiz'}
          </button>
          {completed && result && (
            <div className="text-center mt-2 text-sm">
              <span className={result.passed ? 'text-green-700 font-semibold' : 'text-red-700 font-semibold'}>
                {result.passed ? `Passed (${result.percent}%)` : `Not passed (${result.percent}%) - Need 80%`}
              </span>
            </div>
          )}
        </form>
      )}
      {/* Forum component removed; visit the /forum route instead. */}
    </div>
  );
};

export default Quiz;
