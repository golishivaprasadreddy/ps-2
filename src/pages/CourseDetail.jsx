import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getCourseById, completeCourseTopic, getUserProfile, completeCourse } from '../services/coinService';
import { toast } from 'react-toastify';
import TopicDetail from '../components/TopicDetail';

export default function CourseDetail({ userId, token }) {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [profile, setProfile] = useState(null);
  const [progress, setProgress] = useState({ completed: 0, total: 0, percent: 0 });
  const [busy, setBusy] = useState(false);
  const timersRef = useRef({});
  const videoRefs = useRef({});

  useEffect(() => {
    if (!token) return;
    getCourseById(id, token).then(res => {
      setCourse(res.data);
    }).catch(() => setCourse(null));
    if (userId) {
      getUserProfile(userId, token).then(res => setProfile(res.data)).catch(() => {});
    }
  }, [id, token, userId]);

  useEffect(() => {
    if (!profile || !course) return;
    const key = id;
    const arr = profile.courseProgress?.[key] || [];
    const total = course.topics?.length || 0;
    const completed = Array.isArray(arr) ? arr.length : 0;
    const percent = total ? Math.round((completed / total) * 100) : 0;
    setProgress({ completed, total, percent });
  }, [profile, course, id]);

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
    <div className="min-h-screen w-full bg-white font-sans pb-10">
      <div className="max-w-4xl mx-auto px-4 md:px-8 pt-8">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold text-blue-700">{course.title}</h1>
          <p className="text-slate-600 mt-1">{course.description}</p>
          <div className="mt-4">
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600" style={{ width: `${progress.percent}%` }} />
            </div>
            <div className="text-sm text-slate-600 mt-2">Progress: {progress.completed}/{progress.total} ({progress.percent}%)</div>
            <div className="text-xs text-slate-500">Reward: {coinRewardText}</div>
          </div>
        </div>

        <div className="space-y-4">
          {(course.topics || []).map((t, idx) => (
            <TopicDetail
              key={idx}
              topic={t}
              index={idx}
              isDone={(profile?.courseProgress?.[id] || []).includes(idx)}
              onComplete={markTopic}
              autoSecondsText={5}
              autoSecondsVideo={5}
            />
          ))}
        </div>
        {/* Course will auto-complete when all topics are viewed */}
      </div>
    </div>
  );
}
