import React, { useState, useEffect } from 'react';
import { getUserProfile, getLeaderboard, getTransactionHistory, claimDailyCoins } from '../services/coinService';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import BadgeIcon from '../components/BadgeIcon';

const CELEBRATION_COIN_THRESHOLD = 1000;
const BADGE_PROGRESS = { "Quiz Master": 5 };

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [coins, setCoins] = useState(0);
  const [badges, setBadges] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [quizProgress, setQuizProgress] = useState(0);
  const [completedCourses, setCompletedCourses] = useState(0);
  const [penalty, setPenalty] = useState(null);
  
  const token = localStorage.getItem('token') || '';
  const userId = localStorage.getItem('userId') || '';

  useEffect(() => {
    if (!userId || !token) return;

    getUserProfile(userId, token).then(res => {
      setUser(res.data);
      setCoins(res.data.coins);
      setBadges(res.data.badges);
  setQuizProgress(res.data.quizProgress || 0);
  setCompletedCourses(res.data.completedCourses || 0);
      setShowCelebration(res.data.coins >= CELEBRATION_COIN_THRESHOLD);
    });

    getLeaderboard().then(res => setLeaderboard(res.data));

    getTransactionHistory(userId, token).then(res => {
      setTransactions(res.data);
      const penaltyTx = res.data.find(tx => tx.type === "debit" && tx.reason.toLowerCase().includes("penalty"));
      setPenalty(penaltyTx);
    });
  }, [userId, token]);

  const handleClaimDaily = async () => {
    try {
      const res = await claimDailyCoins(userId, token);
      toast.success(res.data.message || "Daily coins claimed!");
      let start = coins;
      let end = res.data.coins;
      let step = (end - start) / 20;
      let current = start;

      const interval = setInterval(() => {
        current += step;
        if (current >= end) {
          current = end;
          clearInterval(interval);
        }
        setCoins(Math.floor(current));
      }, 40);

      if (end >= CELEBRATION_COIN_THRESHOLD) setShowCelebration(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Already claimed today or error!");
    }
  };

  return (
  <div className="min-h-screen w-full bg-white overflow-y-auto font-sans pb-10">
      
      {showCelebration && (
        <>
          <Confetti recycle={false} numberOfPieces={300} />
          <motion.div 
            className="fixed inset-0 flex items-center justify-center z-50"
            initial={{ opacity: 0, scale: 0.8 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white bg-opacity-95 rounded-3xl p-10 shadow-2xl border-4 border-yellow-400 text-center">
              <span className="text-7xl mb-2 block">🎉</span>
              <h2 className="text-4xl font-extrabold text-yellow-600 mb-2">Super Achiever!</h2>
              <p className="text-xl text-green-700 mb-4">You crossed 1,000 Vitacoins!</p>
              <span className="mt-2 px-6 py-3 bg-yellow-300 text-yellow-900 rounded-full font-bold animate-pulse text-lg shadow">
                Super Achiever Badge
              </span>
              <button 
                onClick={() => setShowCelebration(false)} 
                className="mt-6 px-8 py-3 bg-blue-600 text-white rounded-xl font-bold shadow hover:bg-blue-700 transition"
              >
                Close
              </button>
            </div>
          </motion.div>
        </>
      )}

  <div className="max-w-7xl mx-auto w-full px-4 pt-8 gap-0 md:px-8 flex flex-col">
        
        <div className="w-full pt-2 pb-6">
          <h1 className="text-4xl font-extrabold mb-2 text-blue-700 text-left">Welcome, {user?.name || 'Jane'}!</h1>
          <p className="text-md mb-2 text-gray-600 text-left">Here's your Vitaversity journey at a glance. Earn coins, unlock badges, and help your peers!</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2 mb-4">
            <div className="bg-blue-50 px-4 py-2 rounded-lg text-blue-700 font-semibold">Total Coins: <span className="font-bold">{coins}</span></div>
            <div className="bg-yellow-50 px-4 py-2 rounded-lg text-yellow-700 font-semibold">Badges: <span className="font-bold">{badges.length}</span></div>
            <div className="bg-green-50 px-4 py-2 rounded-lg text-green-700 font-semibold">Leaderboard Rank: <span className="font-bold">{leaderboard.findIndex(u => u.name === user?.name) + 1 || '-'}</span></div>
            <div className="bg-indigo-50 px-4 py-2 rounded-lg text-indigo-700 font-semibold">Courses Completed: <span className="font-bold">{completedCourses}</span></div>
          </div>
          <div className="text-sm text-gray-500 mb-2">Tip: Complete quizzes and help in forums to earn more coins and badges!</div>
          {penalty && (
            <div className="mt-2 px-4 py-2 bg-red-50 text-red-800 rounded-lg border border-red-200 text-left">
              <span className="font-bold">Penalty:</span> {penalty.amount} coins deducted for {penalty.reason}. Stay on track!
            </div>
          )}
        </div>
        <div className="w-full border-t border-slate-100 my-4"></div>

        <div className="w-full flex flex-row items-center justify-between py-6">
          <div className="flex flex-col gap-2">
            <div className="text-2xl font-bold text-blue-700">Vitacoins</div>
            <div className="text-4xl font-extrabold text-blue-700 flex items-center">{coins} <span className="ml-2 text-yellow-400">🪙</span></div>
          </div>
          <button
            onClick={handleClaimDaily}
            className="bg-yellow-400 text-white font-bold py-3 px-8 rounded-full shadow-lg ring-4 ring-yellow-300 ring-offset-2 ring-offset-white text-lg hover:bg-yellow-500 transition"
          >
            Claim Daily Coins
          </button>
        </div>
        <div className="w-full border-t border-slate-100 my-4"></div>

        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-6">
          <Link
            className="inline-flex items-center justify-center bg-pink-500 text-white font-bold py-6 rounded-xl shadow hover:bg-pink-600 transition"
            to="/quiz"
          >
            Go to Quiz
          </Link>
          <Link
            className="inline-flex items-center justify-center bg-indigo-600 text-white font-bold py-6 rounded-xl shadow hover:bg-indigo-700 transition"
            to="/courses"
          >
            Browse Courses
          </Link>
          <Link
            className="inline-flex items-center justify-center bg-blue-600 text-white font-bold py-6 rounded-xl shadow hover:bg-blue-700 transition"
            to="/forum"
          >
            Go to Forum
          </Link>
        </div>
        <div className="w-full border-t border-slate-100 my-4"></div>

        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 py-6">
          <div className="flex-1">
            <div className="text-xl font-bold text-purple-600 mb-2">Badges</div>
            <div className="flex gap-4 flex-wrap items-center">
              {badges.map(badge => (
                <BadgeIcon key={badge} name={badge} size={40} />
              ))}
              {coins >= CELEBRATION_COIN_THRESHOLD && !badges.includes('Super Achiever') && (
                <BadgeIcon name="Super Achiever" size={44} />
              )}
            </div>
          </div>
          <div className="flex-1">
            <div className="text-xl font-bold text-blue-600 mb-2">Leaderboard</div>
            <ul className="space-y-1">
              {leaderboard.map((u, idx) => (
                <li 
                  key={u.name} 
                  className={`py-1 px-2 rounded ${u.name === user?.name ? "bg-green-100 font-bold text-green-700 shadow" : "bg-slate-50"}`}
                >
                  {idx + 1}. {u.name} - {u.coins} coins
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="w-full border-t border-slate-100 my-4"></div>

        <div className="w-full py-6">
          <div className="text-xl font-bold text-green-600 mb-2">Transaction History</div>
          <ul className="space-y-1 max-h-64 overflow-y-auto">
            {transactions.map(tx => (
              <li 
                key={tx._id} 
                className={`py-1 px-2 rounded ${tx.type === "credit" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
              >
                {tx.reason}: {tx.type === "credit" ? "+" : "-"}{tx.amount} 
                <span className="ml-2 text-xs text-gray-500">({new Date(tx.createdAt).toLocaleDateString()})</span>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
