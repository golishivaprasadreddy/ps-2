import React, { useEffect, useMemo, useState } from 'react';
import { useUser } from '../context/UserContext';
import { Link } from 'react-router-dom';
import { getCourses, getUserProfile } from '../services/coinService';
import { toast } from 'react-toastify';

const levelColor = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-yellow-100 text-yellow-800',
  advanced: 'bg-red-100 text-red-800',
};

const levelCoins = {
  beginner: 30,
  intermediate: 50,
  advanced: 80,
};

export default function Courses({ userId, token }) {
  const { user, loading } = useUser();
  const [courses, setCourses] = useState([]);
  const coins = user?.coins || 0;
  const badges = user?.badges || [];
  const completedCount = user?.completedCourses || 0;
  const progressMap = user?.courseProgress || {};

  useEffect(() => {
    getCourses(token)
      .then(res => setCourses(res.data))
      .catch(() => setCourses([]));
  }, [token]);

  // Manual completion removed; course completes automatically when all topics are viewed.

  const badgeList = useMemo(() => badges, [badges]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-50 via-purple-100 to-pink-100 font-sans pb-10">
      <div className="max-w-5xl mx-auto px-4 md:px-8 pt-8">
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 p-6 shadow-lg flex flex-col items-center justify-center animate__animated animate__fadeIn">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow mb-2">Explore Courses 📚</h1>
          <p className="text-lg text-white/90 font-medium mb-2">Complete courses, earn coins, and unlock badges as you learn!</p>
          <div className="flex flex-wrap gap-4 mt-2">
            <span className="bg-yellow-300 text-yellow-900 px-4 py-2 rounded-full font-bold animate-coin-tick shadow">🪙 {coins} Coins</span>
            <span className="bg-pink-200 text-pink-700 px-4 py-2 rounded-full font-bold animate-badge-shine shadow">🏅 {badgeList.length} Badges</span>
            <span className="bg-green-200 text-green-700 px-4 py-2 rounded-full font-bold shadow">📚 {completedCount} Completed</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {courses.map(course => (
            <div key={course._id} className="border-2 border-indigo-200 rounded-3xl p-6 shadow-xl bg-white hover:shadow-2xl transition-all duration-200 animate__animated animate__fadeIn">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-bold text-indigo-700 mb-1">
                    <Link className="hover:underline" to={`/courses/${course._id}`}>{course.title}</Link>
                  </h3>
                  <p className="text-slate-600 mt-1">{course.description || 'No description provided.'}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${levelColor[course.level] || 'bg-slate-100 text-slate-700'}`}>{course.level?.toUpperCase()}</span>
              </div>
              {course.isProgram && (
                <div className="mt-2 text-xs bg-indigo-50 text-indigo-700 inline-block px-2 py-1 rounded">Program</div>
              )}
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-indigo-700 font-semibold">Reward: <span className="font-bold">{levelCoins[course.level] || 30} Vitacoins</span></div>
                <Link to={`/courses/${course._id}`} className="text-sm bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg font-bold shadow hover:bg-indigo-700 transition">Open course</Link>
              </div>
              <div className="mt-3">
                {(() => {
                  const total = (course.topics || []).length;
                  const done = Array.isArray(progressMap[course._id]) ? progressMap[course._id].length : 0;
                  const percent = total ? Math.round((done / total) * 100) : 0;
                  return (
                    <div>
                      <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-green-400 via-green-500 to-green-600 animate__animated animate__slideInLeft" style={{ width: `${percent}%` }} />
                      </div>
                      <div className="text-xs text-slate-500 mt-1">Topic progress: {done}/{total} ({percent}%)</div>
                    </div>
                  );
                })()}
              </div>
            </div>
          ))}
          {courses.length === 0 && (
            <div className="col-span-full text-slate-500">No courses available yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
