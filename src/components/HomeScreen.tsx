import React, { useState } from 'react';
import { BookOpen, ChevronRight, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Question, Lesson } from '../types';
import { TOC } from '../data/toc';

interface HomeScreenProps {
  onSelectLesson: (lesson: Lesson) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onSelectLesson,
}) => {
  const [expandedChapter, setExpandedChapter] = useState<string | null>(TOC[0].id);

  const handleSelectLesson = (lesson: Lesson) => {
    onSelectLesson(lesson);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/95 backdrop-blur-md rounded-3xl shadow-xl border-4 border-sky-200 w-full max-w-3xl mx-auto flex flex-col max-h-[85vh] overflow-hidden"
    >
      <div className="p-6 md:p-8 pb-4 text-center border-b-2 border-sky-100 flex-shrink-0">
        <h2 className="text-2xl md:text-3xl font-black text-sky-600 mb-2">Mục Lục Sách Giáo Khoa 📚</h2>
        <p className="text-slate-600 font-semibold text-sm md:text-base">
          Toán 3 - Tập Một - Kết nối tri thức với cuộc sống
        </p>
        <p className="text-emerald-600 font-bold text-sm mt-1">
          ✨ Chọn 1 bài học để nhận ngay 10 câu đố ngẫu nhiên nhé!
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50/50">
        <div className="space-y-4">
          {TOC.map((chapter) => {
            const isExpanded = expandedChapter === chapter.id;
            return (
              <div key={chapter.id} className="bg-white rounded-2xl border-2 border-slate-100 overflow-hidden shadow-sm">
                <button
                  onClick={() => setExpandedChapter(isExpanded ? null : chapter.id)}
                  className="w-full px-5 py-4 flex items-center justify-between bg-sky-50/50 hover:bg-sky-100/50 transition-colors"
                >
                  <h3 className="font-black text-lg text-sky-800 text-left">{chapter.title}</h3>
                  {isExpanded ? (
                    <ChevronDown className="w-6 h-6 text-sky-600" />
                  ) : (
                    <ChevronRight className="w-6 h-6 text-sky-600" />
                  )}
                </button>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-3 grid gap-2">
                        {chapter.lessons.map((lesson) => (
                          <button
                            key={lesson.id}
                            onClick={() => handleSelectLesson(lesson)}
                            className="text-left px-4 py-3 rounded-xl hover:bg-sky-50 hover:text-sky-700 text-slate-600 font-semibold transition-all border border-transparent hover:border-sky-200 flex items-center group"
                          >
                            <BookOpen className="w-5 h-5 mr-3 text-slate-400 group-hover:text-sky-500 transition-colors" />
                            <span className="flex-1">{lesson.title}</span>
                            <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                              Chơi ngay
                            </span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};
