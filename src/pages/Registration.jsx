import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import CoinBalance from '../components/CoinBalance';
import DailyLoginBonus from '../components/DailyLoginBonus';
import ActionRewards from '../components/ActionRewards';
import TransactionHistory from '../components/TransactionHistory';
import BadgeProgress from '../components/BadgeProgress';
import Leaderboard from '../components/Leaderboard';
import Navigation from '../components/Navigation';

const Registration = () => {
  const [user, setUser] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    coinBalance: 450,
    lastLogin: new Date().toISOString().split('T')[0],
    badges: ['newbie', 'active_learner'],
    streak: 3
  });

  const [transactions, setTransactions] = useState([
    { id: 1, type: 'earn', amount: 100, reason: 'Registration Bonus', timestamp: new Date(), icon: '🎁' },
    { id: 2, type: 'earn', amount: 50, reason: 'Daily Login', timestamp: new Date(Date.now() - 86400000), icon: '📅' },
    { id: 3, type: 'earn', amount: 25, reason: 'Quiz Completion', timestamp: new Date(Date.now() - 172800000), icon: '🧠' },
    { id: 4, type: 'penalty', amount: -10, reason: 'Late Assignment', timestamp: new Date(Date.now() - 259200000), icon: '⚠️' }
  ]);

  const updateCoinBalance = (amount, reason, type = 'earn') => {
    const newTransaction = {
      id: transactions.length + 1,
      type,
      amount: type === 'penalty' ? -Math.abs(amount) : Math.abs(amount),
      reason,
      timestamp: new Date(),
      icon: type === 'penalty' ? '⚠️' : '🎁'
    };

    setTransactions(prev => [newTransaction, ...prev]);
    setUser(prev => ({
      ...prev,
      coinBalance: prev.coinBalance + (type === 'penalty' ? -Math.abs(amount) : Math.abs(amount))
    }));

    if (type === 'penalty') {
      toast.error(`💔 ${reason} (-${Math.abs(amount)} Vitacoins)`, {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });
    } else {
      toast.success(`🎉 ${reason} (+${amount} Vitacoins)`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      <Navigation />
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-indigo-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-indigo-800">Vitaversity</h1>
              <span className="ml-2 text-2xl">🏛️</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user.name}!</span>
              <CoinBalance balance={user.coinBalance} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Daily Login & Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DailyLoginBonus 
                onClaim={(amount) => updateCoinBalance(amount, 'Daily Login Bonus')}
                lastLogin={user.lastLogin}
                streak={user.streak}
              />
              <ActionRewards 
                onAction={(amount, reason) => updateCoinBalance(amount, reason)}
              />
            </div>

            {/* Badge Progress */}
            <BadgeProgress 
              userCoins={user.coinBalance}
              userStreak={user.streak}
            />

            {/* Transaction History */}
            <TransactionHistory transactions={transactions} />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <Leaderboard currentUser={user} />
            
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => updateCoinBalance(15, 'Forum Post')}
                  className="w-full py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  📝 Create Forum Post (+15)
                </button>
                <button 
                  onClick={() => updateCoinBalance(30, 'Assignment Submission')}
                  className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  📚 Submit Assignment (+30)
                </button>
                <button 
                  onClick={() => updateCoinBalance(10, 'Late Submission', 'penalty')}
                  className="w-full py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  ⚠️ Simulate Penalty (-10)
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Registration;
