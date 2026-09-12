import React, { useState, useEffect } from 'react';
import {
  History,
  Trophy,
  X,
  Trash2,
  Calendar,
  Sparkles,
  BookOpen,
  Award,
  ArrowRight,
  TrendingUp,
  RotateCcw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { StudyRecord, Lesson } from '../types';
import { getStudyHistory, clearStudyHistory } from '../utils/historyStorage';
import { sound } from '../utils/audio';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLesson?: (lesson: Lesson) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  onSelectLesson,
}) => {
  const [records, setRecords] = useState<StudyRecord[]>([]);
  const [showConfirmClear, setShowConfirmClear] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setRecords(getStudyHistory());
      setShowConfirmClear(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClearHistory = () => {
    clearStudyHistory();
    setRecords([]);
    setShowConfirmClear(false);
    sound.playSelect();
  };

  const handleReplay = (rec: StudyRecord) => {
    if (onSelectLesson) {
      sound.playSelect();
      onClose();
      onSelectLesson({
        id: rec.lessonId,
        title: rec.lessonTitle,
      });
    }
  };

  const totalSessions = records.length;
  const perfectScores = records.filter(
    (r) => r.totalQuestions > 0 && r.correctCount === r.totalQuestions
  ).length;
  const averagePercentage =
    totalSessions > 0
      ? Math.round(
          records.reduce((acc, r) => {
            const p = r.totalQuestions > 0 ? (r.correctCount / r.totalQuestions) * 100 : 0;
            return acc + p;
          }, 0) / totalSessions
        )
      : 0;

  const formatDate = (timestamp: number) => {
    try {
      const d = new Date(timestamp);
      return `${d.getHours().toString().padStart(2, '0')}:${d
        .getMinutes()
        .toString()
        .padStart(2, '0')} • ${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    } catch {
      return '';
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-3xl shadow-2xl border-4 border-amber-200 max-w-2xl w-full overflow-hidden flex flex-col max-h-[88vh]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="history-modal-title"
        >
          {/* Header */}
          <div className="px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shadow-inner">
                <Trophy className="w-5 h-5 text-yellow-200" />
              </div>
              <div>
                <h3 id="history-modal-title" className="font-black text-lg md:text-xl text-white tracking-tight">
                  Lịch Sử Học Tập & Điểm Số 📜
                </h3>
                <p className="text-xs text-amber-100 font-medium">
                  Ghi nhận quá trình ôn tập và kết quả của bé
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              title="Đóng cửa sổ"
              className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 md:p-6 overflow-y-auto space-y-4 flex-1">
            {/* Quick Stats Overview */}
            {totalSessions > 0 && (
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-center">
                  <div className="text-xl md:text-2xl font-black text-amber-600">
                    {totalSessions}
                  </div>
                  <div className="text-[11px] font-bold text-amber-900 uppercase">
                    Lần luyện tập
                  </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-center">
                  <div className="text-xl md:text-2xl font-black text-emerald-600">
                    {averagePercentage}%
                  </div>
                  <div className="text-[11px] font-bold text-emerald-900 uppercase">
                    Tỉ lệ đúng TB
                  </div>
                </div>

                <div className="bg-sky-50 border border-sky-200 rounded-2xl p-3 text-center">
                  <div className="text-xl md:text-2xl font-black text-sky-600">
                    {perfectScores} 🌟
                  </div>
                  <div className="text-[11px] font-bold text-sky-900 uppercase">
                    Điểm 10 tuyệt đối
                  </div>
                </div>
              </div>
            )}

            {/* List of Sessions */}
            {records.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <p className="text-4xl mb-2">⭐</p>
                <h4 className="font-black text-slate-700 text-base">Bé chưa có lịch sử làm bài nào</h4>
                <p className="text-slate-500 text-xs md:text-sm mt-1">
                  Hãy chọn một bài học từ Mục lục và hoàn thành 10 câu hỏi để xem điểm số tại đây nhé!
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {records.map((rec) => {
                  const percentage =
                    rec.totalQuestions > 0
                      ? Math.round((rec.correctCount / rec.totalQuestions) * 100)
                      : 0;

                  const isHigh = percentage >= 80;
                  const isMedium = percentage >= 50 && percentage < 80;

                  return (
                    <div
                      key={rec.id}
                      className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all flex items-center justify-between gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-bold text-xs md:text-sm text-slate-800 truncate">
                            {rec.lessonTitle}
                          </span>
                          {rec.source === 'ai' ? (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-sky-100 text-sky-700 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-amber-500" /> AI
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-100 text-emerald-700 flex items-center gap-1">
                              <BookOpen className="w-3 h-3 text-emerald-600" /> SGK
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {formatDate(rec.timestamp)}
                          </span>
                          <span>•</span>
                          <span>Đúng {rec.correctCount}/{rec.totalQuestions} câu</span>
                        </div>
                      </div>

                      {/* Score Badge and Practice Again Button */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div
                          className={`px-3 py-1.5 rounded-xl font-black text-xs md:text-sm text-center min-w-[65px] ${
                            isHigh
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : isMedium
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-rose-100 text-rose-800 border border-rose-300'
                          }`}
                        >
                          <div>{rec.score} đ</div>
                          <div className="text-[10px] opacity-80">{percentage}%</div>
                        </div>

                        {onSelectLesson && (
                          <button
                            type="button"
                            onClick={() => handleReplay(rec)}
                            title="Luyện tập lại bài này"
                            className="p-2 rounded-xl text-sky-600 hover:bg-sky-50 border border-sky-200 transition-all cursor-pointer"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer with Clear History Option */}
          <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3 flex-shrink-0">
            {records.length > 0 ? (
              showConfirmClear ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-rose-600">Xác nhận xóa hết?</span>
                  <button
                    type="button"
                    onClick={handleClearHistory}
                    className="px-2.5 py-1 bg-rose-600 text-white rounded-lg text-xs font-black cursor-pointer hover:bg-rose-700"
                  >
                    Xóa
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowConfirmClear(false)}
                    className="px-2.5 py-1 bg-slate-200 text-slate-700 rounded-lg text-xs font-bold cursor-pointer"
                  >
                    Hủy
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowConfirmClear(true)}
                  className="text-slate-400 hover:text-rose-600 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa lịch sử</span>
                </button>
              )
            ) : (
              <div />
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-black text-xs md:text-sm rounded-xl transition-all cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
