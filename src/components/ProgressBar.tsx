import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Star, CheckCircle2, XCircle } from 'lucide-react';
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
  score,
  userAnswers,
  questionIds,
}) => {
  const progressPercent = Math.min(100, Math.round(((currentIndex) / totalQuestions) * 100));

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-4 md:p-5 shadow-lg border-2 border-sky-100 mb-6">
      {/* Top row: Questions indicator and Score badge */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="bg-sky-500 text-white font-extrabold text-sm md:text-base px-3.5 py-1.5 rounded-full shadow-sm flex items-center gap-1.5">
            <Star className="w-4 h-4 fill-yellow-300 text-yellow-300" />
            <span>Câu {currentIndex + 1} / {totalQuestions}</span>
          </div>
          <span className="hidden sm:inline font-bold text-slate-500 text-sm">
            (Chặng ôn tập Toán 3)
          </span>
        </div>

        {/* Score pill */}
        <motion.div
          key={score}
          initial={{ scale: 0.9 }}
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 0.35 }}
          className="flex items-center gap-2 bg-amber-400 text-amber-950 font-black text-base md:text-lg px-4 py-1.5 rounded-full shadow-md border-2 border-yellow-200"
        >
          <Trophy className="w-5 h-5 text-amber-900 fill-amber-300" />
          <span>{score} Điểm</span>
        </motion.div>
      </div>

      {/* Progress Track */}
      <div className="relative w-full h-5 bg-sky-100 rounded-full overflow-hidden p-1 shadow-inner">
        <motion.div
          className="h-full bg-gradient-to-r from-emerald-400 via-teal-400 to-sky-400 rounded-full relative"
          initial={{ width: '0%' }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          {/* Shimmer light effect */}
          <div className="absolute inset-0 bg-white/30 rounded-full animate-pulse" />
        </motion.div>
      </div>

      {/* Milestone Badges */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 mt-3 px-1 custom-scrollbar">
        {Array.from({ length: totalQuestions }).map((_, idx) => {
          const qId = questionIds[idx];
          const answer = qId !== undefined ? userAnswers[qId] : undefined;
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex;

          let badgeStyle = 'bg-slate-100 text-slate-400 border border-slate-200';
          if (isCurrent) {
            badgeStyle = 'bg-sky-500 text-white ring-4 ring-sky-200 scale-110 shadow-md';
          } else if (isCompleted) {
            if (answer && answer.isCorrect) {
              badgeStyle = 'bg-emerald-500 text-white shadow-emerald-200 ring-2 ring-emerald-300';
            } else if (answer && !answer.isCorrect) {
              badgeStyle = 'bg-rose-500 text-white shadow-rose-200 ring-2 ring-rose-300';
            } else {
              badgeStyle = 'bg-emerald-500 text-white';
            }
          }

          return (
            <div key={idx} className="flex flex-col items-center flex-shrink-0" style={{ minWidth: '38px' }}>
              <div
                className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center font-black text-xs md:text-sm transition-all duration-300 shadow-sm ${badgeStyle}`}
              >
                {isCompleted ? (
                  answer && !answer.isCorrect ? (
                    <XCircle className="w-4 h-4 md:w-5 md:h-5 text-white" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-white" />
                  )
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>
              <span
                className={`text-[10px] md:text-xs font-bold mt-1 ${
                  isCurrent
                    ? 'text-sky-600 font-black'
                    : isCompleted && answer && !answer.isCorrect
                    ? 'text-rose-500'
                    : isCompleted
                    ? 'text-emerald-600'
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
