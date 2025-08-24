import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { claimDailyCoins } from '../services/coinService';
import { useUser } from '../context/UserContext';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import BadgeIcon from '../components/BadgeIcon';
import { FixedSizeList as List } from 'react-window';

const CELEBRATION_COIN_THRESHOLD = 1000;
const BADGE_PROGRESS = { "Quiz Master": 5 };

const Dashboard = () => {
  const { user, leaderboard, transactions, loading, refresh } = useUser();
  const [coins, setCoins] = useState(0);
  const [badges, setBadges] = useState([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [quizProgress, setQuizProgress] = useState(0);
  const [completedCourses, setCompletedCourses] = useState(0);
  const [penalty, setPenalty] = useState(null);
  
  const token = useMemo(() => localStorage.getItem('token') || '', []);
  const userId = useMemo(() => localStorage.getItem('userId') || '', []);

  useEffect(() => {
    if (user) {
      setCoins(user.coins);
      setBadges(Array.isArray(user.badges) ? user.badges : []);
      setQuizProgress(user.quizProgress || 0);
      setCompletedCourses(user.completedCourses || 0);
      setShowCelebration(user.coins >= CELEBRATION_COIN_THRESHOLD);
    }
    if (transactions) {
      const penaltyTx = transactions.find(tx => tx.type === "debit" && tx.reason.toLowerCase().includes("penalty"));
      setPenalty(penaltyTx);
    }
  }, [user, transactions]);

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
  <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-purple-100 to-indigo-100 overflow-y-auto font-sans pb-10">
      
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
          <div className="mb-4 rounded-2xl bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 p-6 shadow-lg flex flex-col items-center justify-center animate__animated animate__fadeIn">
            <h1 className="text-5xl font-extrabold text-white drop-shadow mb-2">Welcome, {user?.name || 'Jane'}!</h1>
            <p className="text-lg text-white/90 font-medium mb-2">Your learning journey starts here. Earn coins, unlock badges, and inspire others!</p>
            <div className="flex gap-4 mt-2">
              <span className="bg-yellow-300 text-yellow-900 px-4 py-2 rounded-full font-bold animate-coin-tick shadow">🪙 {coins} Coins</span>
              <span className="bg-pink-200 text-pink-700 px-4 py-2 rounded-full font-bold animate-badge-shine shadow">🏅 {badges.length} Badges</span>
              <span className="bg-green-200 text-green-700 px-4 py-2 rounded-full font-bold animate-leaderboard-highlight shadow">🏆 Rank: {leaderboard.findIndex(u => u.name === user?.name) + 1 || '-'}</span>
              <span className="bg-indigo-200 text-indigo-700 px-4 py-2 rounded-full font-bold shadow">📚 {completedCourses} Courses</span>
            </div>
            <div className="mt-3 text-white/80 text-sm">Tip: Complete quizzes and help in forums to earn more coins and badges!</div>
          </div>
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
            <div className="text-4xl font-extrabold text-blue-700 flex items-center animate-coin-tick">{coins} <span className="ml-2 text-yellow-400">🪙</span></div>
          </div>
          <button
            onClick={handleClaimDaily}
            className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-white font-bold py-3 px-8 rounded-full shadow-lg ring-4 ring-yellow-300 ring-offset-2 ring-offset-white text-lg hover:bg-yellow-500 transition animate__animated animate__pulse"
          >
            Claim Daily Coins
          </button>
        </div>
        <div className="w-full border-t border-slate-100 my-4"></div>

        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-6">
          <Link
            className="inline-flex items-center justify-center bg-gradient-to-r from-pink-500 via-pink-400 to-pink-600 text-white font-bold py-6 rounded-xl shadow-lg hover:bg-pink-600 transition text-lg animate__animated animate__fadeIn"
            to="/quiz"
          >
            🎯 Go to Quiz
          </Link>
          <Link
            className="inline-flex items-center justify-center bg-gradient-to-r from-indigo-600 via-indigo-400 to-indigo-700 text-white font-bold py-6 rounded-xl shadow-lg hover:bg-indigo-700 transition text-lg animate__animated animate__fadeIn"
            to="/courses"
          >
            📚 Browse Courses
          </Link>
          <Link
            className="inline-flex items-center justify-center bg-gradient-to-r from-blue-600 via-blue-400 to-blue-700 text-white font-bold py-6 rounded-xl shadow-lg hover:bg-blue-700 transition text-lg animate__animated animate__fadeIn"
            to="/forum"
          >
            💬 Go to Forum
          </Link>
        </div>
        <div className="w-full border-t border-slate-100 my-4"></div>

        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 py-6">
          <div className="flex-1">
            <div className="text-xl font-extrabold text-pink-600 mb-4 drop-shadow">Badges & Achievements</div>
            <div className="flex gap-4 flex-wrap items-center bg-gradient-to-r from-pink-100 via-purple-100 to-indigo-100 p-4 rounded-2xl shadow-lg">
              {badges && badges.length > 0 ? (
                badges.map(badge => (
                  <BadgeIcon key={badge} name={badge} size={48} />
                ))
              ) : (
                <span className="text-slate-500 font-semibold">No badges earned yet.</span>
              )}
              {coins >= CELEBRATION_COIN_THRESHOLD && !badges.includes('Super Achiever') && (
                <BadgeIcon name="Super Achiever" size={54} />
              )}
            </div>
          </div>
          <div className="flex-1">
            <div className="text-xl font-extrabold text-indigo-600 mb-4 drop-shadow">Leaderboard</div>
            <div className="bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 rounded-2xl shadow-lg p-4">
              <List
                height={220}
                itemCount={leaderboard.length}
                itemSize={56}
                width={"100%"}
              >
                {({ index, style }) => {
                  const u = leaderboard[index];
                  return (
                    <div style={style} key={u._id || u.name} className={`flex items-center gap-4 py-3 px-4 rounded-xl font-semibold text-base ${u.name === user?.name ? "bg-green-200 text-green-700 shadow animate-leaderboard-highlight" : "bg-white text-indigo-700"}`}>
                      <span className="font-bold text-xl">{index + 1}</span>
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="truncate font-bold">{u.name}</span>
                        <span className="truncate text-xs text-slate-500">@{u.username}</span>
                      </div>
                      <span className="bg-yellow-200 text-yellow-800 px-3 py-1 rounded-full font-bold">🪙 {u.coins}</span>
                      <div className="flex gap-1 ml-2">
                        {Array.isArray(u.badges) && u.badges.length > 0 ? (
                          u.badges.map(badge => (
                            <BadgeIcon key={badge} name={badge} size={28} />
                          ))
                        ) : (
                          <span className="text-slate-400 text-xs">No badges</span>
                        )}
                      </div>
                    </div>
                  );
                }}
              </List>
            </div>
          </div>
        </div>
        <div className="w-full border-t border-slate-100 my-4"></div>

        <div className="w-full py-6">
          <div className="text-xl font-extrabold text-green-600 mb-4 drop-shadow">Transaction History</div>
          <div className="bg-gradient-to-r from-green-100 via-yellow-100 to-pink-100 rounded-2xl shadow-lg p-4">
            <List
              height={256}
              itemCount={transactions.length}
              itemSize={44}
              width={"100%"}
            >
              {({ index, style }) => {
                const tx = transactions[index];
                return (
                  <div style={style} key={tx._id} className={`flex items-center gap-3 py-2 px-4 rounded-xl font-semibold text-lg ${tx.type === "credit" ? "bg-green-50 text-green-700" : "bg-red-100 text-red-700"}`}>
                    <span className="font-bold">{tx.type === "credit" ? "+" : "-"}{tx.amount}</span>
                    <span className="truncate">{tx.reason}</span>
                    <span className="ml-auto text-xs text-gray-500">{new Date(tx.createdAt).toLocaleDateString()}</span>
                  </div>
                );
              }}
            </List>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
