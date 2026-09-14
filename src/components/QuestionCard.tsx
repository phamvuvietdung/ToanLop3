import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Question } from '../types';
import { Lightbulb, ArrowRight, CheckCircle } from 'lucide-react';
import { sound } from '../utils/audio';

interface QuestionCardProps {
  question: Question;
  selectedOption: number | null;
  onSelectOption: (index: number) => void;
  onNextQuestion: () => void;
  showHint: boolean;
  onToggleHint: () => void;
  isLastQuestion: boolean;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  selectedOption,
  onSelectOption,
  onNextQuestion,
  showHint,
  onToggleHint,
  isLastQuestion,
}) => {
  const hasSelected = selectedOption !== null;

  return (
    <div className="w-full bg-white rounded-3xl p-5 md:p-8 lg:p-10 shadow-xl border-4 border-sky-200 relative overflow-hidden transition-all duration-300">
      {/* Decorative top strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-5 border-b-2 border-dashed border-sky-100">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{question.categoryIcon}</span>
          <div>
            <h2 className="text-xs md:text-sm font-extrabold uppercase tracking-wider text-sky-600">
              {question.stageName}
            </h2>
            <p className="text-sm md:text-base font-bold text-slate-500">
              {question.category}
            </p>
          </div>
        </div>

        {/* Hint toggle button */}
        <button
          type="button"
          onClick={() => {
            sound.playHint();
            onToggleHint();
          }}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl font-bold text-sm md:text-base transition-all duration-200 shadow-sm border-2 cursor-pointer ${
            showHint
              ? 'bg-amber-100 border-amber-300 text-amber-900 shadow-inner'
              : 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100 hover:scale-105 active:scale-95'
          }`}
        >
          <Lightbulb className={`w-5 h-5 ${showHint ? 'fill-amber-400 text-amber-600' : 'text-amber-500'}`} />
          <span>{showHint ? 'Ẩn Gợi Ý' : 'Gợi ý làm bài'}</span>
        </button>
      </div>

      {/* Main Question Text */}
      <div className="bg-sky-50/70 border-2 border-sky-200/80 rounded-2xl p-5 md:p-7 mb-6 md:mb-8">
        <p className="text-xl md:text-3xl font-black text-slate-800 leading-relaxed text-center sm:text-left">
          {question.question}
        </p>
      </div>

      {/* 4 Options Grid (A, B, C, D) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 mb-6 md:mb-8">
        {question.options.map((optionText, idx) => {
          const letter = OPTION_LETTERS[idx];
          const isSelected = selectedOption === idx;

          let btnStyles = 'bg-slate-50 hover:bg-sky-50/80 border-slate-200 text-slate-700 hover:border-sky-300';
          let badgeStyles = 'bg-white border-2 border-slate-200 text-slate-700';

          if (isSelected) {
            btnStyles = 'bg-sky-500 border-sky-600 text-white shadow-lg ring-4 ring-sky-200';
            badgeStyles = 'bg-white text-sky-600 font-black shadow-sm';
          }

          return (
            <motion.button
              key={idx}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectOption(idx)}
              className={`w-full min-h-[72px] md:min-h-[82px] p-4 md:p-5 rounded-2xl border-3 text-left font-bold text-base md:text-xl flex items-center gap-4 transition-all duration-200 shadow-sm cursor-pointer ${btnStyles}`}
            >
              {/* Badge letter A, B, C, D */}
              <div
                className={`w-11 h-11 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-lg md:text-xl flex-shrink-0 transition-colors ${badgeStyles}`}
              >
                {letter}
              </div>

              {/* Option Text */}
              <span className="flex-1 font-extrabold tracking-wide">
                {optionText}
              </span>

              {/* Selection indicator */}
              {isSelected && (
                <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                  <div className="w-3 h-3 rounded-full bg-sky-600" />
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Hint Box (Shown when triggered) */}
      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="mb-6 md:mb-8 overflow-hidden"
          >
            <div className="bg-amber-50 border-2 border-dashed border-amber-300 rounded-2xl p-4 md:p-5 flex items-start gap-3 shadow-sm">
              <div className="bg-amber-400 text-white p-2 rounded-xl flex-shrink-0 mt-0.5">
                <Lightbulb className="w-6 h-6 fill-amber-100" />
              </div>
              <div className="flex-1">
                <h3 className="font-extrabold text-amber-900 text-sm md:text-base">
                  💡 Gợi ý tư duy cho bé:
                </h3>
                <p className="text-amber-800 text-sm md:text-base font-bold mt-1 leading-relaxed">
                  {question.hint}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons Row */}
      <div className="pt-3 border-t-2 border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Guide text */}
        <div className="text-center sm:text-left text-xs md:text-sm font-bold text-slate-500">
          {hasSelected ? (
            <span className="text-emerald-700 font-extrabold flex items-center justify-center sm:justify-start gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              Bé đã chọn đáp án {OPTION_LETTERS[selectedOption]}. Bấm tiếp tục để qua câu tiếp theo!
            </span>
          ) : (
            <span>👆 Bé bấm chọn 1 đáp án mà bé cho là đúng nhất</span>
          )}
        </div>

        {/* Next / Submit Button */}
        <div>
          <motion.button
            whileHover={hasSelected ? { scale: 1.03 } : undefined}
            whileTap={hasSelected ? { scale: 0.96 } : undefined}
            type="button"
            disabled={!hasSelected}
            onClick={onNextQuestion}
            className={`w-full sm:w-auto font-black text-lg md:text-xl px-8 py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2.5 transition-all duration-200 ${
              hasSelected
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-sky-200 border-b-4 border-sky-700 active:border-b-0 active:translate-y-1 cursor-pointer'
                : 'bg-slate-200 text-slate-400 border-b-4 border-slate-300 cursor-not-allowed'
            }`}
          >
            <span>{isLastQuestion ? 'Nộp Bài & Xem Điểm 🏆' : 'Câu tiếp theo'}</span>
            <ArrowRight className="w-6 h-6 stroke-[3]" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};
