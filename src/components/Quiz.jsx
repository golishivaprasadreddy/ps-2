import React, { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import toast from 'react-hot-toast';
import { getQuizzes, submitQuizAnswers, getUserProfile } from '../services/coinService';
import BadgeIcon from './BadgeIcon';

const CELEBRATION_COIN_THRESHOLD = 1000;

const Quiz = ({ userId, token }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [level, setLevel] = useState('all');
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [coins, setCoins] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [badges, setBadges] = useState([]); // earned badges
  const [allBadges, setAllBadges] = useState([]); // all available badges
  const [result, setResult] = useState(null);

  useEffect(() => {
    // Fetch all quizzes
    fetch('https://vitacoin-backend.onrender.com/api/quizzes')
      .then(res => res.json())
      .then(data => {
        if (level === 'all') {
          setQuizzes(data);
        } else {
          setQuizzes(data.filter(q => q.level === level));
        }
      })
      .catch(() => setQuizzes([]));
    // Fetch all badges
    fetch('https://vitacoin-backend.onrender.com/api/badges')
      .then(res => res.json())
      .then(data => setAllBadges(data))
      .catch(() => setAllBadges([]));
    // Fetch user profile
    getUserProfile(userId, token)
      .then(res => {
        setCoins(res.data.coins || 0);
        setBadges(res.data.badges || []);
        setProgress(Math.min(res.data.quizProgress || 0, quizzes.length));
        if (res.data.coins >= CELEBRATION_COIN_THRESHOLD) setShowCelebration(true);
      })
      .catch(() => {});
  }, [level, userId, token]);

  const handleChange = (idx, value) => {
    setAnswers({ ...answers, [idx]: value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      // answers should be an array, one per question
      const answersArray = selectedQuiz.questions.map((_, idx) => Number(answers[idx]));
      const payload = {
        userId,
        quizId: selectedQuiz._id,
        answers: answersArray
      };
      const res = await fetch('https://vitacoin-backend.onrender.com/api/quizzes/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
  setCompleted(true);
  setResult(data.result);
  toast.success(data.message || 'Quiz submitted!');
  setShowCelebration(data.coins >= CELEBRATION_COIN_THRESHOLD);
  // Update badges and progress from response
  if (Array.isArray(data.badges)) setBadges(data.badges);
  if (typeof data.progress === 'number') setProgress(data.progress);
  setCoins(data.coins || coins);
    } catch (err) {
      toast.error('Error submitting quiz');
    }
    setLoading(false);
  };

  return (
    <div className="bg-gradient-to-br from-pink-100 via-blue-100 to-green-100 rounded-3xl shadow-2xl p-10 mb-10 border-2 border-pink-300 animate-fade-in">
      <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-blue-500 to-green-500 mb-8 text-center drop-shadow-lg">
        Course & Quiz Challenge
      </h2>
      <div className="mb-6 flex justify-center gap-6">
        <div className="flex flex-col items-center bg-white/80 rounded-xl px-6 py-3 shadow">
          <span className="text-xs text-slate-500">Your Coins</span>
          <span className="text-2xl font-bold text-pink-600">{coins}</span>
        </div>
        <div className="flex flex-col items-center bg-white/80 rounded-xl px-6 py-3 shadow">
          <span className="text-xs text-slate-500">Quiz Progress</span>
          <span className="text-2xl font-bold text-blue-600">{progress}/{quizzes.length}</span>
          <div className="w-32 h-2 bg-slate-200 rounded-full mt-2">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-pink-400 to-blue-400"
              style={{ width: `${quizzes.length > 0 ? (progress / quizzes.length) * 100 : 0}%` }}
            ></div>
          </div>
        </div>
      </div>
      {/* Badges & Achievements Section */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-pink-700 mb-4 text-center">Badges & Achievements</h3>
        <div className="flex flex-wrap justify-center gap-6">
          {allBadges.map(badge => (
            <div key={badge.name} className="flex flex-col items-center">
              <img src={badge.image} alt={badge.name} className="w-16 h-16 mb-2" />
              <span className="font-semibold" style={{ color: badge.color || '#db2777' }}>{badge.name}</span>
              {badge.description && <span className="text-xs text-slate-500 text-center mt-1">{badge.description}</span>}
            </div>
          ))}
        </div>
      </div>
      {badges.length > 0 && (
        <div className="mb-6 flex justify-center">
          <div className="flex items-center gap-2 bg-yellow-100 px-6 py-3 rounded-xl shadow border border-yellow-300 animate-bounce-in">
            <span className="text-yellow-700 font-semibold text-lg">Latest Badge:</span>
            <BadgeIcon name={badges[badges.length - 1]} size={40} />
          </div>
        </div>
      )}
      {showCelebration && <Confetti recycle={false} numberOfPieces={200} />}
      <div className="flex items-center justify-center gap-4 mb-6">
        <label className="text-base text-slate-700 font-semibold">Filter by Level:</label>
        <select
          value={level}
          onChange={e => setLevel(e.target.value)}
          className="border-2 border-pink-300 rounded-lg px-4 py-2 bg-white text-pink-700 font-bold focus:ring-2 focus:ring-pink-400"
        >
          <option value="all">All</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>
      <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 justify-center">
        {quizzes.map((quiz, idx) => (
          <div
            key={quiz._id}
            className="bg-white rounded-2xl shadow-xl border-2 border-pink-200 hover:border-blue-400 transition-all duration-200 p-6 flex flex-col items-center cursor-pointer group animate-fade-in"
          >
            <div className="mb-3">
              <span className="inline-block bg-gradient-to-r from-pink-400 to-blue-400 text-white rounded-full px-4 py-2 text-lg font-bold shadow-lg group-hover:scale-110 transition-transform duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="inline-block mr-2" width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" fill="#f472b6" />
                  <text x="12" y="16" textAnchor="middle" fontSize="12" fill="white" fontFamily="Arial" fontWeight="bold">
                    {idx + 1}
                  </text>
                </svg>
                {quiz.title}
              </span>
            </div>
            <div className="text-slate-600 text-sm mb-2 text-center">{quiz.description || 'Test your knowledge!'}</div>
            <button
              className="mt-4 bg-blue-500 text-white font-bold px-5 py-2 rounded-lg shadow group-hover:bg-pink-500 transition-colors duration-200"
              onClick={() => {
                setSelectedQuiz(quiz);
                setShowQuizModal(true);
                setAnswers({});
                setCompleted(false);
                setResult(null);
              }}
            >
              Take Test
            </button>
          </div>
        ))}
      </div>
      {showQuizModal && selectedQuiz && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl p-4 sm:p-8 w-full max-w-2xl relative border-2 border-blue-300 mx-2 overflow-y-auto max-h-[90vh]">
            <button
              className="absolute top-4 right-4 text-xl text-pink-500 hover:text-blue-500 font-bold"
              onClick={() => {
                setShowQuizModal(false);
                setSelectedQuiz(null);
                setAnswers({});
                setCompleted(false);
                setResult(null);
              }}
            >
              &times;
            </button>
            <form onSubmit={e => { e.preventDefault(); handleSubmit(e); }} className="flex flex-col gap-6 sm:gap-8">
              <h3 className="font-bold text-xl sm:text-2xl mb-4 sm:mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-pink-500 drop-shadow">
                {selectedQuiz.title}
              </h3>
              {selectedQuiz.questions.map((q, idx) => (
                <div key={idx} className="flex flex-col gap-2 sm:gap-3 mb-2 sm:mb-4 bg-white/90 rounded-xl shadow-lg p-4 sm:p-6 border-2 border-blue-200 animate-fade-in">
                  <span className="font-semibold text-base sm:text-lg text-blue-700 mb-1 sm:mb-2">
                    Q{idx + 1}. {q.question}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                    {q.options.map((opt, optIdx) => {
                      const chosen = Number(answers[idx]) === optIdx;
                      const showCorrect = completed && optIdx === q.correctAnswer;
                      const isWrongChoice = completed && chosen && optIdx !== q.correctAnswer;
                      return (
                        <label
                          key={optIdx}
                          className={`flex items-center gap-2 sm:gap-3 border-2 rounded-xl px-2 sm:px-4 py-2 sm:py-3 font-medium text-base sm:text-lg transition-all duration-200 shadow cursor-pointer
                            ${completed ? 'cursor-default' : 'hover:scale-105'}
                            ${showCorrect ? 'border-green-500 bg-green-100 text-green-700 font-bold animate-correct' : isWrongChoice ? 'border-red-400 bg-red-100 text-red-700 font-bold animate-wrong' : chosen ? 'border-pink-400 bg-pink-100 text-pink-700 font-bold animate-chosen' : 'border-slate-300 bg-white text-slate-700'}`}
                        >
                          <input
                            type="radio"
                            name={`q-${idx}`}
                            value={optIdx}
                            checked={Number(answers[idx]) === optIdx}
                            onChange={e => handleChange(idx, e.target.value)}
                            disabled={completed}
                            className="accent-pink-500 scale-110 sm:scale-125 mr-1 sm:mr-2"
                          />
                          <span>{opt}</span>
                          {showCorrect && <span className="ml-1 sm:ml-2 text-green-600 text-xs sm:text-base">✔</span>}
                          {isWrongChoice && <span className="ml-1 sm:ml-2 text-red-600 text-xs sm:text-base">✖</span>}
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
              <button
                type="submit"
                className="bg-gradient-to-r from-pink-500 to-blue-500 text-white py-3 sm:py-4 rounded-xl font-bold text-lg sm:text-xl shadow-lg hover:scale-105 transition-transform duration-200"
                disabled={loading || completed}
              >
                {completed ? 'Completed!' : loading ? 'Submitting...' : 'Submit Quiz'}
              </button>
              {completed && result && (
                <div className="text-center mt-2 sm:mt-4 text-base sm:text-lg animate-fade-in">
                  <div className="mb-2 font-bold text-indigo-700">{result.message}</div>
                  <span className={result.passed ? 'text-green-700 font-bold' : 'text-red-700 font-bold'}>
                    {result.passed
                      ? `🎉 Passed! (${result.percent}%)`
                      : `❌ Not passed (${result.percent}%) - Need 80%`}
                  </span>
                  <div className="mt-1 sm:mt-2 text-slate-600">Score: {result.score}</div>
                  <div className="mt-1 text-pink-700 font-semibold">Vitacoins: {result.coins}</div>
                  {/* Show newly earned badges visually */}
                  {badges && badges.length > 0 && (
                    <div className="mt-4 flex flex-wrap justify-center gap-3">
                      <span className="block w-full text-center text-lg font-bold text-yellow-700 mb-2">New Badges:</span>
                      {badges.map(badge => (
                        <div key={badge} className="flex flex-col items-center">
                          <BadgeIcon name={badge} size={40} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </form>
          </div>
        </div>
      )}
      {/* Forum component removed; visit the /forum route instead. */}
    </div>
  );
};

export default Quiz;