import React, { useState, useMemo } from 'react';
import { BookOpen, Search, Sparkles, ChevronRight, CheckCircle2, Filter, X, ArrowRight, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Lesson } from '../types';
import { TOC } from '../data/toc';
import { sound } from '../utils/audio';

interface HomeScreenProps {
  onSelectLesson: (lesson: Lesson) => void;
}

// Visual themes for all 7 topics
const CHAPTER_THEMES = [
  {
    id: 'ch1',
    number: '01',
    tag: 'Chủ đề 1',
    name: 'Ôn tập & Bổ sung',
    icon: '🧮',
    gradient: 'from-sky-500 to-blue-600',
    border: 'border-sky-200 hover:border-sky-400',
    badge: 'bg-sky-100 text-sky-800',
    accentText: 'text-sky-600',
    itemHover: 'hover:bg-sky-50/80 hover:border-sky-200 text-sky-950',
    numBg: 'bg-sky-100 text-sky-700 group-hover:bg-sky-500 group-hover:text-white',
  },
  {
    id: 'ch2',
    number: '02',
    tag: 'Chủ đề 2',
    name: 'Bảng nhân, Bảng chia',
    icon: '✖️',
    gradient: 'from-violet-500 to-purple-600',
    border: 'border-violet-200 hover:border-violet-400',
    badge: 'bg-violet-100 text-violet-800',
    accentText: 'text-violet-600',
    itemHover: 'hover:bg-violet-50/80 hover:border-violet-200 text-violet-950',
    numBg: 'bg-violet-100 text-violet-700 group-hover:bg-violet-500 group-hover:text-white',
  },
  {
    id: 'ch3',
    number: '03',
    tag: 'Chủ đề 3',
    name: 'Hình phẳng & Hình khối',
    icon: '📐',
    gradient: 'from-emerald-500 to-teal-600',
    border: 'border-emerald-200 hover:border-emerald-400',
    badge: 'bg-emerald-100 text-emerald-800',
    accentText: 'text-emerald-600',
    itemHover: 'hover:bg-emerald-50/80 hover:border-emerald-200 text-emerald-950',
    numBg: 'bg-emerald-100 text-emerald-700 group-hover:bg-emerald-500 group-hover:text-white',
  },
  {
    id: 'ch4',
    number: '04',
    tag: 'Chủ đề 4',
    name: 'Nhân chia phạm vi 100',
    icon: '⚡',
    gradient: 'from-amber-500 to-orange-600',
    border: 'border-amber-200 hover:border-amber-400',
    badge: 'bg-amber-100 text-amber-800',
    accentText: 'text-amber-600',
    itemHover: 'hover:bg-amber-50/80 hover:border-amber-200 text-amber-950',
    numBg: 'bg-amber-100 text-amber-700 group-hover:bg-amber-500 group-hover:text-white',
  },
  {
    id: 'ch5',
    number: '05',
    tag: 'Chủ đề 5',
    name: 'Đo lường (mm, gam, ml, °C)',
    icon: '⚖️',
    gradient: 'from-rose-500 to-pink-600',
    border: 'border-rose-200 hover:border-rose-400',
    badge: 'bg-rose-100 text-rose-800',
    accentText: 'text-rose-600',
    itemHover: 'hover:bg-rose-50/80 hover:border-rose-200 text-rose-950',
    numBg: 'bg-rose-100 text-rose-700 group-hover:bg-rose-500 group-hover:text-white',
  },
  {
    id: 'ch6',
    number: '06',
    tag: 'Chủ đề 6',
    name: 'Nhân chia phạm vi 1000',
    icon: '🚀',
    gradient: 'from-indigo-500 to-cyan-600',
    border: 'border-indigo-200 hover:border-indigo-400',
    badge: 'bg-indigo-100 text-indigo-800',
    accentText: 'text-indigo-600',
    itemHover: 'hover:bg-indigo-50/80 hover:border-indigo-200 text-indigo-950',
    numBg: 'bg-indigo-100 text-indigo-700 group-hover:bg-indigo-500 group-hover:text-white',
  },
  {
    id: 'ch7',
    number: '07',
    tag: 'Chủ đề 7',
    name: 'Ôn tập học kì 1',
    icon: '🏆',
    gradient: 'from-amber-600 to-yellow-500',
    border: 'border-amber-300 hover:border-amber-500',
    badge: 'bg-yellow-100 text-yellow-900',
    accentText: 'text-amber-700',
    itemHover: 'hover:bg-amber-50/80 hover:border-amber-300 text-amber-950',
    numBg: 'bg-yellow-100 text-yellow-800 group-hover:bg-amber-500 group-hover:text-white',
  },
];

export const HomeScreen: React.FC<HomeScreenProps> = ({ onSelectLesson }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTopicFilter, setActiveTopicFilter] = useState<string>('all');

  const handleLessonPick = (lesson: Lesson) => {
    sound.playSelect();
    onSelectLesson(lesson);
  };

  // Filter lessons based on search text and active tab
  const filteredChapters = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return TOC.map((chapter) => {
      // Check if topic matches active filter
      const matchesTopic = activeTopicFilter === 'all' || chapter.id === activeTopicFilter;
      if (!matchesTopic) return null;

      if (!query) {
        return chapter;
      }

      const chapterTitleMatch = chapter.title.toLowerCase().includes(query);
      const matchedLessons = chapter.lessons.filter(
        (l) => l.title.toLowerCase().includes(query) || chapterTitleMatch
      );

      if (matchedLessons.length === 0) return null;

      return {
        ...chapter,
        lessons: matchedLessons,
      };
    }).filter(Boolean) as typeof TOC;
  }, [searchQuery, activeTopicFilter]);

  const totalLessonsCount = TOC.reduce((acc, ch) => acc + ch.lessons.length, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full space-y-6"
    >
      {/* Top Banner & Search */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-xl border-4 border-sky-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-sky-100 text-sky-800 uppercase tracking-wider">
                Sách Giáo Khoa Toán 3
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800">
                Tập Một • Kết nối tri thức
              </span>
            </div>
            <h2 className="text-2xl md:text-4xl font-black text-slate-800 tracking-tight">
              Mục Lục 7 Chủ Đề Học Tập 📚
            </h2>
            <p className="text-slate-600 font-medium text-sm md:text-base mt-1">
              Bé hãy chọn một bài học dưới đây để bắt đầu làm 10 câu đố thông minh nhé!
            </p>
          </div>

          {/* Highlights */}
          <div className="flex items-center gap-2 md:gap-3 flex-wrap md:flex-nowrap">
            <div className="bg-sky-50 border border-sky-200 px-3.5 py-2.5 rounded-2xl text-center flex-1 min-w-[100px]">
              <div className="text-xl md:text-2xl font-black text-sky-600">7</div>
              <div className="text-[11px] font-bold text-sky-900 uppercase">Chủ đề</div>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 px-3.5 py-2.5 rounded-2xl text-center flex-1 min-w-[100px]">
              <div className="text-xl md:text-2xl font-black text-emerald-600">{totalLessonsCount}</div>
              <div className="text-[11px] font-bold text-emerald-900 uppercase">Bài học</div>
            </div>
            <div className="bg-amber-50 border border-amber-200 px-3.5 py-2.5 rounded-2xl text-center flex-1 min-w-[110px]">
              <div className="text-xl md:text-2xl font-black text-amber-600">100%</div>
              <div className="text-[11px] font-bold text-amber-900 uppercase">Miễn phí</div>
            </div>
          </div>
        </div>

        {/* Search Bar & Quick Filter Pills */}
        <div className="pt-6 space-y-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm nhanh bài học... (Ví dụ: Bảng nhân 7, Góc vuông, Gam, Mi-li-lít, Chu vi...)"
              className="w-full pl-12 pr-10 py-3.5 bg-slate-50 border-2 border-slate-200 focus:border-sky-500 focus:bg-white rounded-2xl text-sm md:text-base font-semibold text-slate-800 placeholder-slate-400 outline-none transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Pills for 7 Topics */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => {
                sound.playSelect();
                setActiveTopicFilter('all');
              }}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all cursor-pointer ${
                activeTopicFilter === 'all'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Tất cả 7 chủ đề
            </button>

            {TOC.map((ch, idx) => {
              const theme = CHAPTER_THEMES[idx] || CHAPTER_THEMES[0];
              const isActive = activeTopicFilter === ch.id;
              return (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => {
                    sound.playSelect();
                    setActiveTopicFilter(isActive ? 'all' : ch.id);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>{theme.icon}</span>
                  <span>{theme.tag}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 7 Topics Grid Layout (Full Width, Spacious, 2-3 Columns) */}
      {filteredChapters.length === 0 ? (
        <div className="bg-white/90 rounded-3xl p-12 text-center border-2 border-slate-200 shadow-md">
          <p className="text-4xl mb-3">🔍</p>
          <h3 className="text-lg font-black text-slate-700">Không tìm thấy bài học nào phù hợp</h3>
          <p className="text-slate-500 text-sm mt-1">
            Bé hãy thử tìm với từ khóa khác như "nhân", "chia", "hình", "đo" nhé!
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setActiveTopicFilter('all');
            }}
            className="mt-4 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm rounded-xl cursor-pointer"
          >
            Hiện lại tất cả bài học
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredChapters.map((chapter) => {
            const originalIndex = TOC.findIndex((c) => c.id === chapter.id);
            const theme = CHAPTER_THEMES[originalIndex] || CHAPTER_THEMES[0];

            return (
              <motion.div
                key={chapter.id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                className={`bg-white rounded-3xl border-2 ${theme.border} shadow-md hover:shadow-xl transition-all duration-200 flex flex-col overflow-hidden`}
              >
                {/* Chapter Card Header */}
                <div className={`p-4 md:p-5 bg-gradient-to-r ${theme.gradient} text-white flex items-center justify-between gap-3`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shadow-inner flex-shrink-0">
                      {theme.icon}
                    </div>
                    <div>
                      <div className="text-[11px] uppercase font-black tracking-wider text-white/80">
                        {theme.tag}
                      </div>
                      <h3 className="font-black text-base md:text-lg text-white leading-tight">
                        {chapter.title.replace(/^Chủ đề \d+:\s*/i, '')}
                      </h3>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-xl bg-white/25 backdrop-blur-md text-white text-xs font-black whitespace-nowrap shadow-sm">
                    {chapter.lessons.length} bài
                  </span>
                </div>

                {/* Chapter Lessons List */}
                <div className="p-3.5 md:p-4 flex-1 flex flex-col space-y-2 bg-slate-50/40">
                  {chapter.lessons.map((lesson) => {
                    // Extract lesson number badge if available (e.g., "Bài 1. ...")
                    const match = lesson.title.match(/^Bài\s+(\d+)\.\s*(.*)$/i);
                    const lessonNum = match ? match[1] : '';
                    const cleanTitle = match ? match[2] : lesson.title;

                    return (
                      <button
                        key={lesson.id}
                        type="button"
                        onClick={() => handleLessonPick(lesson)}
                        className={`w-full text-left p-3 rounded-2xl bg-white border border-slate-200/80 ${theme.itemHover} transition-all duration-150 flex items-center justify-between gap-3 group cursor-pointer shadow-xs hover:shadow-md`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black transition-colors flex-shrink-0 ${theme.numBg}`}>
                            {lessonNum || '•'}
                          </span>
                          <span className="font-bold text-xs md:text-sm text-slate-700 group-hover:text-slate-950 truncate">
                            {cleanTitle}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 text-slate-400 group-hover:text-sky-600 transition-colors flex-shrink-0">
                          <span className="text-[11px] font-black opacity-0 group-hover:opacity-100 transition-opacity hidden sm:inline">
                            Vào học
                          </span>
                          <ArrowRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};
