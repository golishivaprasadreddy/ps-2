import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { completeCourseTopic, getCourseById, getUserProfile } from '../services/coinService';
import { toast } from 'react-toastify';

export default function TopicPage() {
  const { id: courseId, topicIndex } = useParams();
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isDone, setIsDone] = useState(false);
  const [loading, setLoading] = useState(true);
  const seenTopRef = useRef(false);

  const index = Number(topicIndex);
  const topic = useMemo(() => (course?.topics || [])[index], [course, index]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const [c, p] = await Promise.all([
          getCourseById(courseId, token),
          userId ? getUserProfile(userId, token) : Promise.resolve({ data: {} }),
        ]);
        if (!mounted) return;
        setCourse(c.data);
        setProfile(p.data);
        const done = Array.isArray(p.data?.courseProgress?.[courseId]) && p.data.courseProgress[courseId].includes(index);
        setIsDone(done);
      } catch (e) {
        toast.error('Failed to load topic');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [courseId, index, token, userId]);

  useEffect(() => {
    if (!topic || isDone || topic.type !== 'text') return;
    const nearTopPx = 50; // consider near top when <= 50px from top
    const bottomProgress = 0.98; // 98% of page height

    const checkProgress = () => {
      const doc = document.documentElement;
      const scrolled = window.scrollY;
      const viewport = window.innerHeight;
      const page = doc.scrollHeight;
      const progress = (scrolled + viewport) / (page || 1);
      if (scrolled <= nearTopPx) {
        seenTopRef.current = true;
      }
      if (seenTopRef.current && progress >= bottomProgress) {
        complete();
      }
    };

    // initial check (in case content fits in one screen)
    checkProgress();
    window.addEventListener('scroll', checkProgress, { passive: true });
    return () => {
      window.removeEventListener('scroll', checkProgress);
    };
  }, [topic, isDone]);

  const onTimeUpdate = (e) => {
    if (!topic || isDone || topic.type !== 'video') return;
    const v = e.currentTarget;
    if (v.currentTime >= Math.min(5, v.duration || 5)) complete();
  };

  // YouTube embeds removed; we use HTML5 video tag only

  const complete = async () => {
    if (!userId || isDone) return;
    try {
      await completeCourseTopic(userId, courseId, index, token);
      setIsDone(true);
      toast.success('Topic completed');
    } catch (e) {
      // no-op on duplicate
    }
  };

  const goBack = () => navigate(`/courses/${courseId}`);

  // Helpers to embed YouTube links (for resources only)
  const isYouTubeUrl = (url) => /youtube\.com|youtu\.be/.test(url || '');
  const toYouTubeEmbed = (url) => {
    if (!url) return '';
    try {
      const u = new URL(url);
      if (u.hostname.includes('youtu.be')) {
        const id = u.pathname.replace('/', '');
        return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`;
      }
      if (u.hostname.includes('youtube.com')) {
        const id = u.searchParams.get('v');
        if (id) return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`;
        if (u.pathname.includes('/embed/')) return url;
      }
    } catch {}
    return url;
  };

  if (loading) return <div className="min-h-screen w-screen flex items-center justify-center text-slate-500">Loading...</div>;
  if (!topic) return <div className="min-h-screen w-screen flex items-center justify-center text-slate-500">Topic not found</div>;

  return (
    <div className="min-h-screen w-screen bg-white">
      {/* Header (below navbar) */}
      <div className="w-screen pt-0 px-4 md:px-8">
        <button onClick={goBack} className="text-sm text-blue-700 hover:underline">← Back to course</button>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 mt-2">{topic.title}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <div className="text-xs px-2 py-1 rounded-full inline-block bg-slate-100 text-slate-700">{topic.type}</div>
          {topic.estimatedMinutes ? (
            <div className="text-xs px-2 py-1 rounded-full inline-block bg-emerald-50 text-emerald-700">~{topic.estimatedMinutes} min</div>
          ) : null}
        </div>
        {topic.summary ? (<p className="mt-3 text-slate-600 max-w-5xl">{topic.summary}</p>) : null}
        {topic.imageUrl ? (<img src={topic.imageUrl} alt="topic" className="mt-4 rounded-xl border border-slate-100 max-w-5xl" />) : null}
      </div>

      {/* Main content full-width */}
      <div className="mt-4">
        {topic.type === 'video' ? (
          topic.contentUrl ? (
            <div className="w-screen h-[calc(100vh-160px)] bg-black">
              <video className="w-full h-full object-contain" controls src={topic.contentUrl} onTimeUpdate={onTimeUpdate} />
            </div>
          ) : (
            <div className="text-slate-500 px-4 md:px-8">Video content not available.</div>
          )
        ) : (
          <div className="px-4 md:px-8">
            <div className="text-slate-700 whitespace-pre-wrap leading-relaxed text-base md:text-lg">{topic.content || 'No content provided.'}</div>
          </div>
        )}
      </div>

      {/* Extras */}
      <div className="px-4 md:px-8 max-w-6xl">
        {topic.codeSnippet ? (
          <pre className="mt-6 bg-slate-900 text-slate-100 p-4 rounded-lg overflow-auto text-sm max-w-5xl"><code>{topic.codeSnippet}</code></pre>
        ) : null}
        {Array.isArray(topic.objectives) && topic.objectives.length > 0 ? (
          <div className="mt-6">
            <div className="font-semibold text-slate-800">Objectives</div>
            <ul className="list-disc list-inside text-slate-700 mt-1">
              {topic.objectives.map((o, i) => <li key={i}>{o}</li>)}
            </ul>
          </div>
        ) : null}
        {Array.isArray(topic.tips) && topic.tips.length > 0 ? (
          <div className="mt-6">
            <div className="font-semibold text-slate-800">Tips</div>
            <ul className="list-disc list-inside text-slate-700 mt-1">
              {topic.tips.map((t, i) => <li key={i}>{t}</li>)}
            </ul>
          </div>
        ) : null}
        {Array.isArray(topic.resources) && topic.resources.length > 0 ? (
          <div className="mt-6">
            <div className="font-semibold text-slate-800">Resources</div>
            <div className="mt-2 space-y-4">
              {topic.resources.map((r, i) => (
                <div key={i}>
                  {isYouTubeUrl(r.url) ? (
                    <div>
                      <div className="aspect-video w-full max-w-5xl rounded-lg overflow-hidden bg-black">
                        <iframe
                          className="w-full h-full"
                          src={toYouTubeEmbed(r.url)}
                          title={r.label || `resource-${i}`}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          referrerPolicy="strict-origin-when-cross-origin"
                          allowFullScreen
                        />
                      </div>
                      {r.label ? (<div className="text-sm text-slate-600 mt-1">{r.label}</div>) : null}
                    </div>
                  ) : (
                    <a className="text-blue-700 hover:underline" href={r.url} target="_blank" rel="noreferrer">{r.label || r.url}</a>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : null}
        <div className="mt-6 mb-8 text-sm">Status: <span className={isDone ? 'text-green-700' : 'text-slate-500'}>{isDone ? 'Completed' : 'Not completed'}</span></div>
      </div>
    </div>
  );
}
