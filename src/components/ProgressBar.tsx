import React from 'react';
import { motion } from 'motion/react';
import { Star, Check } from 'lucide-react';
import { UserAnswer } from '../types';

interface ProgressBarProps {
  currentIndex: number;
  totalQuestions: number;
  score: number;
  userAnswers: Record<number, UserAnswer>;
  questionIds: number[];
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentIndex,
  totalQuestions,
  userAnswers,
  questionIds,
}) => {
  const progressPercent = Math.min(100, Math.round(((currentIndex) / totalQuestions) * 100));
  const answeredCount = Object.keys(userAnswers).length;

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-4 md:p-6 shadow-lg border-2 border-sky-100 mb-6 w-full">
      {/* Top row: Questions indicator and Answered count pill */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="bg-sky-500 text-white font-extrabold text-sm md:text-base px-4 py-1.5 rounded-full shadow-sm flex items-center gap-1.5">
            <Star className="w-4 h-4 fill-yellow-300 text-yellow-300" />
            <span>Câu {currentIndex + 1} / {totalQuestions}</span>
          </div>
          <span className="hidden sm:inline font-bold text-slate-500 text-sm">
            (Chế độ làm bài thi: Chấm điểm và xem lời giải chi tiết khi nộp bài)
          </span>
        </div>

        {/* Answered indicator pill */}
        <div className="flex items-center gap-2 bg-sky-50 text-sky-800 font-extrabold text-sm md:text-base px-3.5 py-1.5 rounded-full border border-sky-200">
          <span>Đã làm: <span className="text-sky-600 font-black">{answeredCount}</span>/{totalQuestions}</span>
        </div>
      </div>

      {/* Progress Track */}
      <div className="relative w-full h-4 bg-sky-100 rounded-full overflow-hidden p-0.5 shadow-inner">
        <motion.div
          className="h-full bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 rounded-full relative"
          initial={{ width: '0%' }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {/* Shimmer light effect */}
          <div className="absolute inset-0 bg-white/25 rounded-full animate-pulse" />
        </motion.div>
      </div>

      {/* Question Number Badges (Shows completed with neutral checkmark, no right/wrong reveal) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 mt-3 px-1 custom-scrollbar">
        {Array.from({ length: totalQuestions }).map((_, idx) => {
          const qId = questionIds[idx];
          const hasAnswered = qId !== undefined ? userAnswers[qId] !== undefined : false;
          const isCurrent = idx === currentIndex;

          let badgeStyle = 'bg-slate-100 text-slate-400 border border-slate-200';
          if (isCurrent) {
            badgeStyle = 'bg-sky-500 text-white ring-4 ring-sky-200 scale-110 shadow-md font-black';
          } else if (hasAnswered) {
            badgeStyle = 'bg-sky-100 text-sky-700 border border-sky-300 font-bold';
          }

          return (
            <div key={idx} className="flex flex-col items-center flex-shrink-0" style={{ minWidth: '38px' }}>
              <div
                className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm transition-all duration-200 shadow-xs ${badgeStyle}`}
              >
                {hasAnswered && !isCurrent ? (
                  <Check className="w-4 h-4 text-sky-600 stroke-[3]" />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>
              <span
                className={`text-[10px] md:text-xs font-bold mt-1 ${
                  isCurrent
                    ? 'text-sky-600 font-black'
                    : hasAnswered
                    ? 'text-sky-700'
                    : 'text-slate-400'
                }`}
              >
                C.{idx + 1}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
