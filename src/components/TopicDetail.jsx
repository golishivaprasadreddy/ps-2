import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// Topic row that navigates to a dedicated Topic page for full content
export default function TopicDetail({ topic, index, isDone, courseId: propCourseId }) {
  const done = useMemo(() => !!isDone, [isDone]);
  const navigate = useNavigate();
  const params = useParams();
  const courseId = propCourseId || params.id;

  const goToTopic = () => {
    if (!courseId && process.env.NODE_ENV !== 'production') {
      // Fallback: do nothing if courseId missing in dev
      return;
    }
    navigate(`/courses/${courseId}/topics/${index}`);
  };

  return (
    <div
      className={`group border rounded-xl p-4 mb-3 transition shadow-sm hover:shadow-md cursor-pointer ${done ? 'bg-green-50 border-green-200' : 'bg-white border-slate-200 hover:border-slate-300'}`}
      onClick={goToTopic}
    >
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-slate-800 truncate">{index + 1}. {topic.title}</h4>
            <span className={`text-xs px-2 py-0.5 rounded-full ${topic.type === 'video' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>{topic.type}</span>
          </div>
          <div className="text-xs mt-1 text-slate-500 truncate">Click to view full content</div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-sm ${done ? 'text-green-700' : 'text-slate-400'}`}>{done ? 'Completed' : 'Not completed'}</span>
          <button
            type="button"
            className="opacity-0 group-hover:opacity-100 transition text-sm px-3 py-1 rounded-lg bg-slate-800 text-white hover:bg-slate-700"
            onClick={(e) => { e.stopPropagation(); goToTopic(); }}
          >View</button>
        </div>
      </div>
    </div>
  );
}
