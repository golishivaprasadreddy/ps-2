import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getUserProfile, getLeaderboard, getTransactionHistory } from '../services/coinService';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  const fetchUser = useCallback(async () => {
    if (!userId || !token) return;
    setLoading(true);
    try {
      const res = await getUserProfile(userId, token);
      setUser(res.data);
    } catch {}
    setLoading(false);
  }, [userId, token]);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await getLeaderboard();
      setLeaderboard(res.data);
    } catch {}
  }, []);

  const fetchTransactions = useCallback(async () => {
    if (!userId || !token) return;
    try {
      const res = await getTransactionHistory(userId, token);
      let txs = Array.isArray(res.data) ? res.data : [];
      // Add registration bonus if not present
      const hasRegistrationBonus = txs.some(tx => tx.reason && tx.reason.toLowerCase().includes('registration'));
      if (!hasRegistrationBonus && user) {
        txs = [
          {
            _id: 'registration-bonus',
            type: 'credit',
            amount: 100,
            reason: 'Registration Bonus',
            createdAt: user.createdAt || new Date(),
          },
          ...txs
        ];
      }
      setTransactions(txs);
    } catch {}
  }, [userId, token, user]);

  useEffect(() => {
    fetchUser();
    fetchLeaderboard();
    fetchTransactions();
  }, [fetchUser, fetchLeaderboard, fetchTransactions]);

  return (
    <UserContext.Provider value={{ user, leaderboard, transactions, loading, refresh: fetchUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
