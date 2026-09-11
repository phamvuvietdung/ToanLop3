import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Question } from '../types';
import { Lightbulb, Check, ArrowRight, CheckCircle2, XCircle } from 'lucide-react';
import { sound } from '../utils/audio';

interface QuestionCardProps {
  question: Question;
  selectedOption: number | null;
  isChecked: boolean;
  isAnsweredCorrectly: boolean;
  onSelectOption: (index: number) => void;
  onCheckAnswer: () => void;
  onNextQuestion: () => void;
  showHint: boolean;
  onToggleHint: () => void;
  isLastQuestion: boolean;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  selectedOption,
  isChecked,
  isAnsweredCorrectly,
  onSelectOption,
  onCheckAnswer,
  onNextQuestion,
  showHint,
  onToggleHint,
  isLastQuestion,
}) => {
  return (
    <div className="bg-white rounded-3xl p-5 md:p-8 shadow-xl border-4 border-sky-200 relative overflow-hidden transition-all duration-300">
      {/* Decorative top strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-5 border-b-2 border-dashed border-sky-100">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{question.categoryIcon}</span>
          <div>
            <h2 className="text-xs md:text-sm font-extrabold uppercase tracking-wider text-sky-600">
              {question.stageName}
            </h2>
            <p className="text-sm md:text-base font-bold text-slate-500">
              {question.category}
            </p>
          </div>
        </div>

        {/* Hint toggle button - only available before checking */}
        {!isChecked && (
          <button
            type="button"
            onClick={() => {
              sound.playHint();
              onToggleHint();
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl font-bold text-sm md:text-base transition-all duration-200 shadow-sm border-2 cursor-pointer ${
              showHint
                ? 'bg-amber-100 border-amber-300 text-amber-900 shadow-inner'
                : 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100 hover:scale-105 active:scale-95'
            }`}
          >
            <Lightbulb className={`w-5 h-5 ${showHint ? 'fill-amber-400 text-amber-600' : 'text-amber-500'}`} />
            <span>{showHint ? 'Ẩn Gợi Ý' : 'Gợi ý làm bài'}</span>
          </button>
        )}
      </div>

      {/* Main Question Text */}
      <div className="bg-sky-50/70 border-2 border-sky-200/80 rounded-2xl p-4 md:p-6 mb-6">
        <p className="text-lg md:text-2xl font-black text-slate-800 leading-relaxed text-center sm:text-left">
          {question.question}
        </p>
      </div>

      {/* 4 Options Grid (A, B, C, D) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 md:gap-4 mb-6">
        {question.options.map((optionText, idx) => {
          const letter = OPTION_LETTERS[idx];
          const isSelected = selectedOption === idx;
          const isCorrect = idx === question.correctIndex;

          let btnStyles = 'bg-slate-50 hover:bg-sky-50 border-slate-200 text-slate-700';
          let badgeStyles = 'bg-white border-2 border-slate-200 text-slate-700';

          if (isChecked) {
            if (isCorrect) {
              btnStyles = 'bg-emerald-500 border-emerald-600 text-white shadow-lg ring-4 ring-emerald-200';
              badgeStyles = 'bg-white text-emerald-600 font-black shadow-sm';
            } else if (isSelected) {
              btnStyles = 'bg-rose-500 border-rose-600 text-white shadow-lg ring-4 ring-rose-200';
              badgeStyles = 'bg-white text-rose-600 font-black shadow-sm';
            } else {
              btnStyles = 'bg-slate-100/60 border-slate-200 text-slate-400 opacity-60';
              badgeStyles = 'bg-white/70 border border-slate-200 text-slate-400';
            }
          } else if (isSelected) {
            btnStyles = 'bg-sky-500 border-sky-600 text-white shadow-lg ring-4 ring-sky-200';
            badgeStyles = 'bg-white text-sky-600 font-black shadow-sm';
          }

          return (
            <motion.button
              key={idx}
              whileTap={!isChecked ? { scale: 0.97 } : undefined}
              disabled={isChecked}
              onClick={() => onSelectOption(idx)}
              className={`w-full min-h-[68px] md:min-h-[76px] p-4 rounded-2xl border-3 text-left font-bold text-base md:text-xl flex items-center gap-3.5 transition-all duration-200 shadow-md ${btnStyles} ${
                isChecked ? 'cursor-default' : 'cursor-pointer'
              }`}
            >
              {/* Badge letter A, B, C, D */}
              <div
                className={`w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center text-base md:text-lg flex-shrink-0 transition-colors ${badgeStyles}`}
              >
                {letter}
              </div>

              {/* Option Text */}
              <span className="flex-1 font-extrabold tracking-wide">
                {optionText}
              </span>

              {/* Status icon inside button */}
              {isChecked && isCorrect && (
                <CheckCircle2 className="w-6 h-6 text-white fill-emerald-600 flex-shrink-0" />
              )}
              {isChecked && isSelected && !isCorrect && (
                <XCircle className="w-6 h-6 text-white fill-rose-600 flex-shrink-0" />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Hint Box (Shown when triggered before checking) */}
      <AnimatePresence>
        {!isChecked && showHint && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="mb-6 overflow-hidden"
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

      {/* Result Explanation Box after single answer submission */}
      <AnimatePresence>
        {isChecked && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            transition={{ duration: 0.35 }}
            className="mb-6 overflow-hidden"
          >
            {isAnsweredCorrectly ? (
              <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-4 md:p-5 flex items-start gap-3 shadow-sm">
                <div className="bg-emerald-500 text-white p-2 rounded-xl flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-black text-emerald-900 text-base md:text-lg">
                    Chính xác! Bé được cộng +10 điểm 🎉
                  </h3>
                  <p className="text-emerald-800 text-sm md:text-base font-bold mt-1">
                    {question.explanation}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 md:p-5 flex items-start gap-3 shadow-sm">
                <div className="bg-rose-500 text-white p-2 rounded-xl flex-shrink-0 mt-0.5">
                  <XCircle className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-black text-rose-900 text-base md:text-lg">
                    Chưa chính xác rồi bé ơi! (0 điểm)
                  </h3>
                  <p className="text-rose-800 text-sm md:text-base font-bold mt-1">
                    Đáp án đúng là:{' '}
                    <span className="font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-lg border border-emerald-300">
                      {OPTION_LETTERS[question.correctIndex]}. {question.options[question.correctIndex]}
                    </span>
                  </p>
                  <div className="mt-2 bg-white/90 p-3 rounded-xl border border-rose-200">
                    <p className="text-slate-700 text-xs md:text-sm font-bold">
                      💡 <span className="font-black text-slate-900">Lời giải chi tiết:</span> {question.explanation}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons Row */}
      <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Helper text */}
        <div className="text-center sm:text-left text-xs md:text-sm font-bold text-slate-500">
          {!isChecked ? (
            <span>⚡ Bé chỉ được chọn và nộp bài 1 lần cho mỗi câu</span>
          ) : (
            <span className="text-sky-700 font-extrabold">
              Đã chấm điểm xong! Bấm tiếp tục để qua câu kế nhé.
            </span>
          )}
        </div>

        {/* Primary Controls */}
        <div className="flex items-center gap-3">
          {!isChecked ? (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              type="button"
              onClick={onCheckAnswer}
              className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-lg md:text-xl px-8 py-3.5 rounded-2xl shadow-lg shadow-emerald-200 border-b-4 border-emerald-700 active:border-b-0 active:translate-y-1 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check className="w-6 h-6 stroke-[3]" />
              <span>Kiểm tra kết quả</span>
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              type="button"
              onClick={onNextQuestion}
              className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-lg md:text-xl px-8 py-3.5 rounded-2xl shadow-lg shadow-amber-200 border-b-4 border-amber-700 active:border-b-0 active:translate-y-1 flex items-center justify-center gap-2 cursor-pointer animate-pulse-glow"
            >
              <span>{isLastQuestion ? 'Xem Bảng Điểm 🏆' : 'Tiến vào câu tiếp theo'}</span>
              <ArrowRight className="w-6 h-6 stroke-[3]" />
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
};
