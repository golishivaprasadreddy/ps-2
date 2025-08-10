import React, { useEffect, useRef } from 'react';

/**
 * TopicViewerModal
 * Props:
 * - open: boolean
 * - onClose: () => void
 * - topic: { title, type: 'video'|'text', contentUrl?, content? }
 * - index: number
 * - isDone: boolean
 * - onComplete: (index: number) => void
 * - autoSecondsText?: number (default 5)
 * - autoSecondsVideo?: number (default 5)
 */
export default function TopicViewerModal({ open, onClose, topic, index, isDone, onComplete, autoSecondsText = 5, autoSecondsVideo = 5 }) {
  const textTimerRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    if (topic?.type === 'text' && !isDone) {
      textTimerRef.current = setTimeout(() => {
        onComplete(index);
      }, autoSecondsText * 1000);
    }
    return () => {
      if (textTimerRef.current) clearTimeout(textTimerRef.current);
    };
  }, [open, topic, isDone, index, onComplete, autoSecondsText]);

  const onTimeUpdate = (e) => {
    if (!open || isDone) return;
    const v = e.currentTarget;
    if (v.currentTime >= Math.min(autoSecondsVideo, v.duration || autoSecondsVideo)) {
      onComplete(index);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-6 relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-slate-500 hover:text-slate-800">✕</button>
        <h3 className="text-xl font-bold text-slate-800 mb-3">{topic?.title}</h3>
        {topic?.type === 'video' ? (
          topic?.contentUrl ? (
            <video
              ref={videoRef}
              className="rounded-lg w-full max-h-[60vh]"
              controls
              src={topic.contentUrl}
              onTimeUpdate={onTimeUpdate}
            />
          ) : (
            <div className="text-slate-500">Video content not available.</div>
          )
        ) : (
          <div className="text-slate-700 whitespace-pre-wrap max-h-[60vh] overflow-auto">
            {topic?.content || 'No content provided.'}
            <div className="text-xs text-slate-500 mt-2">Viewing for {autoSecondsText}s marks this topic complete.</div>
          </div>
        )}
      </div>
    </div>
  );
}
