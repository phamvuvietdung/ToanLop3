import React from 'react';
import { Volume2, VolumeX, BookOpen, KeyRound } from 'lucide-react';
import { sound } from '../utils/audio';

interface HeaderProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  onReset: () => void;
  hasApiKey: boolean;
  onOpenApiKeyModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  soundEnabled,
  onToggleSound,
  onReset,
  hasApiKey,
  onOpenApiKeyModal,
}) => {
  return (
    <header className="flex items-center justify-between gap-3 mb-6 bg-white/80 backdrop-blur-md px-4 md:px-6 py-3.5 rounded-3xl shadow-md border-2 border-sky-100">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 md:w-12 md:h-12 bg-gradient-to-tr from-sky-400 to-blue-500 rounded-2xl flex items-center justify-center text-2xl shadow-md shadow-sky-200">
          ⭐
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-black text-sky-900 tracking-tight flex items-center gap-1.5">
            <span>Bé Giỏi Toán Lớp 3</span>
          </h1>
          <p className="text-xs md:text-sm font-bold text-sky-600">
            Trò chơi ôn tập kiến thức sinh động
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Gemini API Key Button */}
        <button
          type="button"
          onClick={() => {
            sound.playSelect();
            onOpenApiKeyModal();
          }}
          title={hasApiKey ? 'Cài đặt Gemini API Key (Đã lưu)' : 'Chưa nhập Gemini API Key'}
          className={`flex items-center gap-1.5 px-3 py-2.5 rounded-2xl font-extrabold text-xs md:text-sm border-2 transition-all cursor-pointer shadow-sm ${
            hasApiKey
              ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-300'
              : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-300 animate-pulse'
          }`}
        >
          <KeyRound className="w-4 h-4 text-emerald-600" />
          <span className="hidden sm:inline">
            {hasApiKey ? 'API Key' : 'Nhập API Key'}
          </span>
          <span
            className={`w-2 h-2 rounded-full ${
              hasApiKey ? 'bg-emerald-500 ring-2 ring-emerald-200' : 'bg-amber-500 ring-2 ring-amber-200'
            }`}
          />
        </button>

        {/* Sound Toggle */}
        <button
          type="button"
          onClick={onToggleSound}
          title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
          className={`p-2.5 md:p-3 rounded-2xl border-2 transition-all cursor-pointer ${
            soundEnabled
              ? 'bg-sky-50 border-sky-200 text-sky-700 hover:bg-sky-100'
              : 'bg-slate-100 border-slate-300 text-slate-400'
          }`}
        >
          {soundEnabled ? (
            <Volume2 className="w-5 h-5" />
          ) : (
            <VolumeX className="w-5 h-5" />
          )}
        </button>

        {/* Return to Table of Contents */}
        <button
          type="button"
          onClick={() => {
            sound.playSelect();
            onReset();
          }}
          title="Về Mục Lục Bài Học"
          className="flex items-center gap-1.5 px-3 py-2.5 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-700 font-extrabold text-xs md:text-sm border-2 border-amber-200 transition-all cursor-pointer"
        >
          <BookOpen className="w-4 h-4" />
          <span className="hidden sm:inline">Mục lục</span>
        </button>
      </div>
    </header>
  );
};
