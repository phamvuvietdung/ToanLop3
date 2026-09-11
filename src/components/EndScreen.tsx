import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Star, Award, Sparkles, CheckCircle2, XCircle, ChevronDown, ChevronUp, BookOpen, RefreshCw } from 'lucide-react';
import { sound } from '../utils/audio';
import { Question, UserAnswer, Lesson } from '../types';

interface EndScreenProps {
  score: number;
  totalScore: number;
  questions: Question[];
  userAnswers: Record<number, UserAnswer>;
  currentLesson: Lesson | null;
  onRetrySameQuestions: () => void;
  onGenerateNewQuestions: () => void;
  onBackToHome: () => void;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

export const EndScreen: React.FC<EndScreenProps> = ({
  score,
  totalScore,
  questions,
  userAnswers,
  currentLesson,
  onRetrySameQuestions,
  onGenerateNewQuestions,
  onBackToHome,
}) => {
  const [expandedDetails, setExpandedDetails] = useState<boolean>(true);

  const totalQuestions = questions.length;
  const correctCount = questions.filter((q) => userAnswers[q.id]?.isCorrect).length;
  const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  useEffect(() => {
    if (percentage >= 70) {
      sound.playVictory();

      // Trigger celebratory fireworks for good scores
      const duration = 3 * 1000;
      const end = Date.now() + duration;

      const interval = setInterval(() => {
        if (Date.now() > end) {
          return clearInterval(interval);
        }
        confetti({
          startVelocity: 30,
          spread: 360,
          ticks: 60,
          origin: { x: Math.random(), y: Math.random() - 0.2 },
          colors: ['#38BDF8', '#F59E0B', '#10B981', '#F43F5E', '#A855F7'],
        });
      }, 300);

      return () => clearInterval(interval);
    } else {
      sound.playSelect();
    }
  }, [percentage]);

  // Title & badge based on score
  let badgeTitle = 'CHIẾN BINH KIÊN TRÌ';
  let badgeEmoji = '🌱';
  let headingText = 'Bé Đã Hoàn Thành Bài Thi!';
  let subText = 'Bé hãy xem kỹ lại các câu chưa đúng bên dưới rồi bấm "Làm lại bài" để nâng cao điểm số nhé!';
  let trophyColor = 'from-sky-400 to-blue-500';

  if (percentage === 100) {
    badgeTitle = 'THIÊN TÀI TOÁN HỌC NHÍ';
    badgeEmoji = '👑';
    headingText = 'Xuất Sắc Tuyệt Đối Bé Ơi!';
    subText = 'Bé đã trả lời đúng tất cả các câu hỏi của bài học một cách chuẩn xác! Thật phi thường! 🎉';
    trophyColor = 'from-amber-400 to-yellow-500';
  } else if (percentage >= 80) {
    badgeTitle = 'CAO THỦ TOÁN HỌC NHÍ';
    badgeEmoji = '🌟';
    headingText = 'Rất Giỏi! Gần Tuyệt Đối Rồi!';
    subText = 'Bé nắm kiến thức rất vững chắc! Chỉ cần cẩn thận một xíu nữa là đạt 100 điểm trọn vẹn rồi nè!';
    trophyColor = 'from-emerald-400 to-teal-500';
  } else if (percentage >= 50) {
    badgeTitle = 'NGÔI SAO CHĂM CHỈ';
    badgeEmoji = '⭐';
    headingText = 'Bé Làm Rất Tốt!';
    subText = 'Bé đã vượt qua hơn một nửa thử thách! Hãy xem các câu sai để rút kinh nghiệm và làm lại nhé!';
    trophyColor = 'from-amber-400 to-orange-500';
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="bg-white/95 backdrop-blur-md rounded-3xl p-5 md:p-8 shadow-2xl border-4 border-sky-200 text-center relative overflow-hidden max-w-3xl mx-auto"
    >
      {/* Decorative radial blur */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-b from-sky-200/40 via-amber-100/20 to-transparent rounded-full -z-0 pointer-events-none blur-2xl" />

      {/* Trophy / Star Avatar */}
      <div className="relative z-10 my-1">
        <motion.div
          animate={{ y: [0, -12, 0], rotate: [0, -2, 2, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="inline-block"
        >
          <div className="relative">
            <span className="text-7xl md:text-8xl filter drop-shadow-lg select-none">
              {percentage >= 70 ? '🏆' : '🐻'}
            </span>
            {percentage >= 70 && (
              <motion.div
                animate={{ scale: [1, 1.25, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute -top-2 -right-2 text-amber-500"
              >
                <Sparkles className="w-9 h-9 fill-amber-400" />
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      <div className="relative z-10 max-w-2xl mx-auto">
        {/* Badge Title */}
        <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-900 px-4 py-1.5 rounded-full font-black text-xs md:text-sm mb-3 border border-amber-300 shadow-2xs">
          <span>{badgeEmoji}</span>
          <span>DANH HIỆU: {badgeTitle}</span>
        </div>

        <h1 className="text-2xl md:text-4xl font-black text-slate-800 mb-1.5">
          {headingText}
        </h1>

        {currentLesson && (
          <p className="text-sky-700 font-extrabold text-sm md:text-base mb-2">
            📖 {currentLesson.title}
          </p>
        )}

        <p className="text-sm md:text-base font-bold text-slate-600 mb-6">
          {subText}
        </p>

        {/* Score Board Box */}
        <div className={`bg-gradient-to-br ${trophyColor} p-1 rounded-3xl shadow-lg mb-6 max-w-sm mx-auto`}>
          <div className="bg-white/95 rounded-[22px] p-5">
            <span className="text-xs md:text-sm font-extrabold uppercase tracking-wider text-slate-500">
              Tổng điểm của bé
            </span>
            <div className="flex items-center justify-center gap-2 mt-1">
              <Trophy className="w-8 h-8 text-amber-500 fill-amber-300 flex-shrink-0" />
              <span className="text-4xl md:text-5xl font-black text-slate-800">
                {score}
              </span>
              <span className="text-2xl md:text-3xl font-bold text-slate-400">
                / {totalScore}
              </span>
            </div>
            <p className="text-xs md:text-sm font-extrabold text-sky-700 mt-2 flex items-center justify-center gap-1.5">
              <Award className="w-4 h-4 text-amber-500" /> Đúng {correctCount} trên {totalQuestions} câu ({percentage}%)
            </p>
          </div>
        </div>

        {/* Detailed Question Review List */}
        <div className="bg-sky-50/80 rounded-2xl p-4 md:p-5 mb-6 text-left border border-sky-200">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h2 className="text-xs md:text-sm font-black uppercase tracking-wide text-sky-800 flex items-center gap-1.5">
              <span>Bảng chấm điểm chi tiết từng câu ({correctCount}/{totalQuestions} đúng)</span>
            </h2>
            <button
              type="button"
              onClick={() => setExpandedDetails(!expandedDetails)}
              className="text-xs font-extrabold text-sky-600 hover:text-sky-800 flex items-center gap-1 cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-sky-200"
            >
              <span>{expandedDetails ? 'Thu gọn' : 'Xem chi tiết'}</span>
              {expandedDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {expandedDetails && (
            <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
              {questions.map((q, idx) => {
                const answer = userAnswers[q.id];
                const isCorrect = answer?.isCorrect ?? false;
                const userChoiceIdx = answer?.selectedIndex;

                return (
                  <div
                    key={q.id}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isCorrect
                        ? 'bg-emerald-50/80 border-emerald-200'
                        : 'bg-rose-50/80 border-rose-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{q.categoryIcon}</span>
                        <span className="font-black text-sm text-slate-800">
                          Câu {idx + 1}: <span className="font-bold text-slate-600">{q.question}</span>
                        </span>
                      </div>
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-black flex items-center gap-1 flex-shrink-0 ${
                          isCorrect
                            ? 'bg-emerald-500 text-white shadow-xs'
                            : 'bg-rose-500 text-white shadow-xs'
                        }`}
                      >
                        {isCorrect ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" /> +10đ
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5" /> 0đ
                          </>
                        )}
                      </span>
                    </div>

                    {/* Answer Comparison */}
                    <div className="mt-2 text-xs md:text-sm font-bold pl-7">
                      {isCorrect ? (
                        <p className="text-emerald-800">
                          ✓ Bé chọn đáp án đúng:{' '}
                          <span className="font-black text-emerald-900">
                            {userChoiceIdx !== undefined ? `${OPTION_LETTERS[userChoiceIdx]}. ${q.options[userChoiceIdx]}` : ''}
                          </span>
                        </p>
                      ) : (
                        <div className="space-y-1">
                          <p className="text-rose-700">
                            ✗ Bé đã chọn:{' '}
                            <span className="line-through font-bold text-rose-900">
                              {userChoiceIdx !== undefined ? `${OPTION_LETTERS[userChoiceIdx]}. ${q.options[userChoiceIdx]}` : 'Chưa chọn'}
                            </span>
                          </p>
                          <p className="text-emerald-800">
                            ➜ Đáp án đúng là:{' '}
                            <span className="font-black text-emerald-900 bg-emerald-100/90 px-2 py-0.5 rounded-md border border-emerald-300">
                              {OPTION_LETTERS[q.correctIndex]}. {q.options[q.correctIndex]}
                            </span>
                          </p>
                        </div>
                      )}

                      {/* Explanation */}
                      <p className="mt-1.5 text-xs text-slate-600 bg-white/80 p-2 rounded-xl border border-slate-200">
                        💡 <span className="font-bold text-slate-800">Lời giải:</span> {q.explanation}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 3 Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch justify-center pt-2">
          {/* Retry Same Questions */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => {
              sound.playSelect();
              onRetrySameQuestions();
            }}
            className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-base md:text-lg py-3.5 px-5 rounded-2xl shadow-lg shadow-emerald-200 border-b-4 border-emerald-700 active:border-b-0 active:translate-y-1 flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-5 h-5 stroke-[3]" />
            <span>Làm Lại Bài Này 🔄</span>
          </motion.button>

          {/* Generate 10 New Questions for this topic */}
          {currentLesson && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => {
                sound.playSelect();
                onGenerateNewQuestions();
              }}
              className="flex-1 bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white font-black text-base md:text-lg py-3.5 px-5 rounded-2xl shadow-lg shadow-sky-200 border-b-4 border-blue-700 active:border-b-0 active:translate-y-1 flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Luyện 10 Câu Mới ⚡</span>
            </motion.button>
          )}

          {/* Back to Table of Contents */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => {
              sound.playSelect();
              onBackToHome();
            }}
            className="sm:w-auto bg-amber-400 hover:bg-amber-500 text-amber-950 font-black text-base md:text-lg py-3.5 px-6 rounded-2xl shadow-lg border-b-4 border-amber-600 active:border-b-0 active:translate-y-1 flex items-center justify-center gap-2 cursor-pointer"
          >
            <BookOpen className="w-5 h-5" />
            <span>Mục Lục SGK</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};
