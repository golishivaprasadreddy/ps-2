import React from 'react';
import quizMaster from '../assets/badges/quiz-master.png';
import courseChampion from '../assets/badges/course-champion.png';
import programFinisher from '../assets/badges/program-finisher.png';
import superAchiever from '../assets/badges/super-achiever.png';

const map = {
  'Quiz Master': quizMaster,
  'Course Champion': courseChampion,
  'Program Finisher': programFinisher,
  'Super Achiever': superAchiever,
};

export default function BadgeIcon({ name, size = 64, label = true }) {
  const src = map[name] || quizMaster;
  return (
    <div className="inline-flex items-center gap-3">
      <div className="shrink-0" style={{ width: size, height: size }}>
        <img
          src={src}
          alt={name}
          className="w-full h-full object-cover select-none rounded-md"
          draggable={false}
          loading="lazy"
        />
      </div>
      {label && <span className="text-sm font-semibold text-slate-700">{name}</span>}
    </div>
  );
}
