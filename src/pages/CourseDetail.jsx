import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getCourseById, completeCourseTopic, completeCourse } from '../services/coinService';
import { useUser } from '../context/UserContext';
import { toast } from 'react-toastify';
import TopicDetail from '../components/TopicDetail';

export default function CourseDetail({ userId, token }) {
  const { id } = useParams();
  const { user } = useUser();
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState({ completed: 0, total: 0, percent: 0 });
  const [busy, setBusy] = useState(false);
  const timersRef = useRef({});
  const videoRefs = useRef({});

  useEffect(() => {
    if (!token) return;
    getCourseById(id, token).then(res => {
      setCourse(res.data);
    }).catch(() => setCourse(null));
  }, [id, token]);

  useEffect(() => {
    if (!user || !course) return;
    const key = id;
    const arr = user.courseProgress?.[key] || [];
    const total = course.topics?.length || 0;
    const completed = Array.isArray(arr) ? arr.length : 0;
    const percent = total ? Math.round((completed / total) * 100) : 0;
    setProgress({ completed, total, percent });
  }, [user, course, id]);

  const markTopic = async (idx) => {
    if (!userId || busy) return;
    setBusy(true);
    try {
      const res = await completeCourseTopic(userId, id, idx, token);
      toast.success(res.data.message || 'Topic completed');
      const prof = await getUserProfile(userId, token);
      setProfile(prof.data);
      // If all topics done, auto-complete the course
      const total = (course?.topics || []).length;
      const done = (prof.data.courseProgress?.[id] || []).length;
      if (total && done === total) {
        try {
          const fin = await completeCourse(userId, id, token);
          toast.success(fin.data.message || 'Course completed!');
        } catch (e) {
          // ignore if already completed recently
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not mark topic');
    }
    setBusy(false);
  };

  // finishCourse removed; course completes automatically

  const coinRewardText = useMemo(() => {
    if (!course) return '';
    const levelCoins = { beginner: 30, intermediate: 50, advanced: 80 };
    return `${levelCoins[course.level] || 30} Vitacoins on completion`;
  }, [course]);

  if (!course) return <div className="min-h-[50vh] flex items-center justify-center text-slate-500">Loading course...</div>;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-50 via-purple-100 to-pink-100 font-sans pb-10">
      <div className="max-w-4xl mx-auto px-4 md:px-8 pt-8">
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 p-6 shadow-lg flex flex-col items-center justify-center animate__animated animate__fadeIn">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow mb-2">{course.title}</h1>
          <p className="text-lg text-white/90 font-medium mb-2">{course.description}</p>
          <div className="mt-4 w-full">
            <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 animate__animated animate__slideInLeft" style={{ width: `${progress.percent}%` }} />
            </div>
            <div className="text-sm text-white/80 mt-2">Progress: {progress.completed}/{progress.total} ({progress.percent}%)</div>
            <div className="text-xs text-white/70">Reward: {coinRewardText}</div>
          </div>
        </div>

        <div className="space-y-6">
          {(course.topics || []).map((t, idx) => (
            <div className="animate__animated animate__fadeIn">
              <TopicDetail
                key={idx}
                topic={t}
                index={idx}
                isDone={(user?.courseProgress?.[id] || []).includes(idx)}
                onComplete={markTopic}
                autoSecondsText={5}
                autoSecondsVideo={5}
              />
            </div>
          ))}
        </div>
        {/* Course will auto-complete when all topics are viewed */}
      </div>
    </div>
  );
}
