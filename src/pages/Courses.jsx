import React, { useEffect, useMemo, useState } from 'react';
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
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [coins, setCoins] = useState(0);
  const [badges, setBadges] = useState([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [progressMap, setProgressMap] = useState({});

  useEffect(() => {
    getCourses(token)
      .then(res => setCourses(res.data))
      .catch(() => setCourses([]));
    if (userId && token) {
      getUserProfile(userId, token)
        .then(res => {
          setCoins(res.data.coins || 0);
          setBadges(res.data.badges || []);
          setCompletedCount(res.data.completedCourses || 0);
          setProgressMap(res.data.courseProgress || {});
        })
        .catch(() => {});
    }
  }, [userId, token]);

  // Manual completion removed; course completes automatically when all topics are viewed.

  const badgeList = useMemo(() => badges || [], [badges]);

  return (
    <div className="min-h-screen w-full bg-white font-sans pb-10">
      <div className="max-w-5xl mx-auto px-4 md:px-8 pt-8">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold text-blue-700">Courses</h1>
          <p className="text-slate-600 mt-1">Complete courses to earn Vitacoins and unlock badges.</p>
          <div className="flex flex-wrap gap-3 mt-4">
            <div className="bg-blue-50 px-3 py-2 rounded-lg text-blue-700 font-semibold">Coins: <span className="font-bold">{coins}</span></div>
            <div className="bg-purple-50 px-3 py-2 rounded-lg text-purple-700 font-semibold">Badges: <span className="font-bold">{badgeList.length}</span></div>
            <div className="bg-green-50 px-3 py-2 rounded-lg text-green-700 font-semibold">Courses Completed: <span className="font-bold">{completedCount}</span></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map(course => (
            <div key={course._id} className="border border-slate-200 rounded-2xl p-5 shadow-sm bg-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">
                    <Link className="hover:underline" to={`/courses/${course._id}`}>{course.title}</Link>
                  </h3>
                  <p className="text-slate-600 mt-1">{course.description || 'No description provided.'}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${levelColor[course.level] || 'bg-slate-100 text-slate-700'}`}>
                  {course.level?.toUpperCase()}
                </span>
              </div>
              {course.isProgram && (
                <div className="mt-2 text-xs bg-indigo-50 text-indigo-700 inline-block px-2 py-1 rounded">Program</div>
              )}
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-slate-500">Reward: <span className="font-semibold text-slate-800">{levelCoins[course.level] || 30} Vitacoins</span></div>
                <Link to={`/courses/${course._id}`} className="text-sm text-blue-600 hover:underline">Open course</Link>
              </div>
              <div className="mt-3">
                {(() => {
                  const total = (course.topics || []).length;
                  const done = Array.isArray(progressMap[course._id]) ? progressMap[course._id].length : 0;
                  const percent = total ? Math.round((done / total) * 100) : 0;
                  return (
                    <div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500" style={{ width: `${percent}%` }} />
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
