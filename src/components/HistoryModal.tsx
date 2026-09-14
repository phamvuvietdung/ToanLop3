import React, { useState, useEffect, useRef } from 'react';
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
  Download,
  Upload,
  RefreshCw,
  CheckCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { StudyRecord, Lesson } from '../types';
import {
  getStudyHistory,
  clearStudyHistory,
  syncHistoryWithServer,
  exportHistoryAsJson,
  importHistoryFromJson,
} from '../utils/historyStorage';
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
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setRecords(getStudyHistory());
      setShowConfirmClear(false);
      setNotificationMsg(null);

      // Auto-sync with server in background whenever opened
      setIsSyncing(true);
      syncHistoryWithServer()
        .then((latest) => {
          setRecords(latest);
        })
        .finally(() => {
          setIsSyncing(false);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClearHistory = () => {
    clearStudyHistory();
    setRecords([]);
    setShowConfirmClear(false);
    sound.playSelect();
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    sound.playSelect();
    try {
      const merged = await syncHistoryWithServer();
      setRecords(merged);
      setNotificationMsg('Đã đồng bộ lịch sử thành công!');
      setTimeout(() => setNotificationMsg(null), 3000);
    } catch {
      setNotificationMsg('Không thể kết nối máy chủ');
      setTimeout(() => setNotificationMsg(null), 3000);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleExportBackup = () => {
    sound.playSelect();
    exportHistoryAsJson();
    setNotificationMsg('Đã tải xuống file sao lưu lịch sử!');
    setTimeout(() => setNotificationMsg(null), 3000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importHistoryFromJson(content);
        if (success) {
          setRecords(getStudyHistory());
          sound.playCorrect();
          setNotificationMsg('Khôi phục lịch sử thành công!');
        } else {
          sound.playIncorrect();
          setNotificationMsg('File không đúng định dạng sao lưu!');
        }
        setTimeout(() => setNotificationMsg(null), 3500);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
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
                  Tự động sao lưu kép: Lưu trên trình duyệt & Máy chủ
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

          {/* Backup & Sync Action Bar */}
          <div className="px-5 py-2.5 bg-amber-50/90 border-b border-amber-200/80 flex items-center justify-between gap-2 flex-wrap text-xs">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleManualSync}
                disabled={isSyncing}
                title="Đồng bộ lại với máy chủ"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-amber-300 rounded-xl font-bold text-amber-900 hover:bg-amber-100/70 transition-colors cursor-pointer shadow-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-amber-600 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ máy chủ'}</span>
              </button>

              <button
                type="button"
                onClick={handleExportBackup}
                title="Tải file sao lưu về máy tính"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-amber-300 rounded-xl font-bold text-amber-900 hover:bg-amber-100/70 transition-colors cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-amber-600" />
                <span>Tải sao lưu</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Nhập file sao lưu từ máy"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-amber-300 rounded-xl font-bold text-amber-900 hover:bg-amber-100/70 transition-colors cursor-pointer shadow-xs"
              >
                <Upload className="w-3.5 h-3.5 text-amber-600" />
                <span>Nạp sao lưu</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {notificationMsg && (
              <span className="font-extrabold text-emerald-700 flex items-center gap-1 bg-emerald-100/80 px-2.5 py-1 rounded-lg">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                {notificationMsg}
              </span>
            )}
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
                    {perfectScores}
                  </div>
                  <div className="text-[11px] font-bold text-emerald-900 uppercase">
                    Điểm 10 Tuyệt Đối
                  </div>
                </div>

                <div className="bg-sky-50 border border-sky-200 rounded-2xl p-3 text-center">
                  <div className="text-xl md:text-2xl font-black text-sky-600">
                    {averagePercentage}%
                  </div>
                  <div className="text-[11px] font-bold text-sky-900 uppercase">
                    Tỉ lệ đúng TB
                  </div>
                </div>
              </div>
            )}

            {/* List of Sessions */}
            {records.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center text-slate-300">
                  <BookOpen className="w-8 h-8" />
                </div>
                <p className="font-bold text-slate-600 text-base">Bé chưa có lượt làm bài nào!</p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  Hãy chọn một bài học từ mục lục để hoàn thành thử thách và nhận điểm số đầu tiên nhé!
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
                      className="bg-white hover:bg-slate-50 border-2 border-slate-100 hover:border-amber-200 rounded-2xl p-3.5 transition-all flex items-center justify-between gap-3 shadow-xs"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                              rec.source === 'ai'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-sky-100 text-sky-700'
                            }`}
                          >
                            {rec.source === 'ai' ? 'Trí tuệ nhân tạo' : 'Đề chuẩn SGK'}
                          </span>
                          <h4 className="font-black text-slate-800 text-sm md:text-base truncate">
                            {rec.lessonTitle}
                          </h4>
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
