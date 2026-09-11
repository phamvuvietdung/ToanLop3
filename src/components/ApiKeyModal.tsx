import React, { useState, useEffect, useRef } from 'react';
import { KeyRound, X, Check, Eye, EyeOff, AlertTriangle, Info, Clipboard, ExternalLink, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getStoredApiKey, setStoredApiKey, removeStoredApiKey, maskApiKey } from '../utils/apiKeyStorage';
import { sound } from '../utils/audio';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (savedKey: string) => void;
  errorMessage?: string | null;
  infoMessage?: string | null;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  onSave,
  errorMessage,
  infoMessage,
}) => {
  const [keyValue, setKeyValue] = useState<string>('');
  const [showKey, setShowKey] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [pasteSuccess, setPasteSuccess] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  // Sync stored key into state and autofocus when modal opens
  useEffect(() => {
    if (isOpen) {
      const currentStored = getStoredApiKey();
      setKeyValue(currentStored);
      setSaveSuccess(false);
      setPasteSuccess(false);
      setValidationError(null);

      // Focus and select input text so user can immediately paste/type over old key
      const focusTimer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 100);

      return () => clearTimeout(focusTimer);
    }
  }, [isOpen, errorMessage]);

  if (!isOpen) return null;

  const handleSave = () => {
    const trimmed = keyValue.trim();
    if (!trimmed) {
      setValidationError('Vui lòng nhập hoặc dán Gemini API Key trước khi lưu!');
      if (inputRef.current) inputRef.current.focus();
      return;
    }

    if (trimmed.length < 15) {
      setValidationError('Khóa API có vẻ quá ngắn. Khóa Gemini thường bắt đầu bằng "AIzaSy..."');
      return;
    }

    sound.playSelect();
    setStoredApiKey(trimmed);
    setSaveSuccess(true);
    setValidationError(null);

    setTimeout(() => {
      onSave(trimmed);
    }, 300);
  };

  const handleClear = () => {
    setKeyValue('');
    setValidationError(null);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleRemoveKey = () => {
    removeStoredApiKey();
    setKeyValue('');
    setValidationError('Đã xóa API Key khỏi bộ nhớ trình duyệt.');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setKeyValue(text.trim());
        setPasteSuccess(true);
        setValidationError(null);
        setTimeout(() => setPasteSuccess(false), 2000);
      }
    } catch {
      // If clipboard permission is blocked, focus input so user can press Ctrl+V / long press
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const currentSavedKey = getStoredApiKey();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-3xl shadow-2xl border-4 border-sky-200 max-w-lg w-full overflow-hidden flex flex-col"
          role="dialog"
          aria-modal="true"
          aria-labelledby="api-key-modal-title"
        >
          {/* Header */}
          <div className="px-6 py-4 bg-gradient-to-r from-sky-500 to-blue-600 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shadow-inner">
                <KeyRound className="w-5 h-5 text-amber-200" />
              </div>
              <div>
                <h3 id="api-key-modal-title" className="font-black text-lg md:text-xl text-white tracking-tight">
                  Cài đặt Gemini API Key 🔑
                </h3>
                <p className="text-xs text-sky-100 font-medium">
                  Lưu trên thiết bị • Không giới hạn tạo câu đố
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

          <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            {/* Friendly 429 Quota Exceeded Alert */}
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-800 text-sm font-bold flex items-start gap-3 shadow-sm"
              >
                <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-black text-rose-900 mb-0.5">Thông báo hạn mức</p>
                  <p className="leading-relaxed">{errorMessage}</p>
                </div>
              </motion.div>
            )}

            {/* General Info / Prompt to Enter Key */}
            {!errorMessage && infoMessage && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border-2 border-amber-200 text-amber-800 text-sm font-semibold flex items-start gap-2.5">
                <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="leading-relaxed">{infoMessage}</p>
                </div>
              </div>
            )}

            {/* Saved Key Status Indicator */}
            {currentSavedKey && (
              <div className="flex items-center justify-between px-3.5 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800">
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  Đang ghi nhớ: <code className="bg-emerald-100/70 px-1.5 py-0.5 rounded font-mono text-emerald-900">{maskApiKey(currentSavedKey)}</code>
                </span>
                <button
                  type="button"
                  onClick={handleRemoveKey}
                  title="Xóa khóa đã lưu này"
                  className="text-rose-600 hover:text-rose-800 hover:underline flex items-center gap-1 text-xs cursor-pointer ml-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa</span>
                </button>
              </div>
            )}

            {/* Input Form */}
            <div>
              <label htmlFor="gemini-api-key-input" className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                Nhập hoặc dán API Key của bạn:
              </label>

              <div className="relative flex items-center">
                <input
                  id="gemini-api-key-input"
                  ref={inputRef}
                  type={showKey ? 'text' : 'password'}
                  value={keyValue}
                  onChange={(e) => {
                    setKeyValue(e.target.value);
                    setValidationError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSave();
                    }
                  }}
                  placeholder="AIzaSy..."
                  autoComplete="off"
                  spellCheck="false"
                  className="w-full pr-24 pl-4 py-3 bg-slate-50 border-2 border-slate-300 focus:border-sky-500 focus:bg-white rounded-2xl text-sm font-mono text-slate-800 outline-none transition-all shadow-inner"
                />

                {/* Inner input controls (Clear, Paste, Show/Hide) */}
                <div className="absolute right-2 flex items-center gap-1">
                  {keyValue && (
                    <button
                      type="button"
                      onClick={handleClear}
                      title="Xóa nhanh ô nhập"
                      className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-all cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    title={showKey ? 'Ẩn khóa' : 'Hiện khóa'}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-all cursor-pointer"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>

                  <button
                    type="button"
                    onClick={handlePasteClipboard}
                    title="Dán từ Clipboard"
                    className="p-1.5 text-sky-600 hover:text-sky-800 hover:bg-sky-50 rounded-lg transition-all cursor-pointer"
                  >
                    <Clipboard className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {pasteSuccess && (
                <p className="text-xs font-bold text-emerald-600 mt-1 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Đã dán API Key từ bộ nhớ tạm!
                </p>
              )}

              {validationError && (
                <p className="text-xs font-bold text-rose-600 mt-1">
                  {validationError}
                </p>
              )}
            </div>

            {/* Quick helper info */}
            <div className="bg-sky-50/70 border border-sky-200/80 rounded-2xl p-3.5 text-xs text-slate-600 space-y-1.5">
              <p className="font-bold text-sky-900 flex items-center gap-1">
                <span>📌 Hướng dẫn & Lưu ý:</span>
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-600 leading-relaxed">
                <li>
                  Khóa API được lưu trên <strong>bộ nhớ trình duyệt (localStorage)</strong> của máy tính, điện thoại hoặc máy tính bảng của bạn.
                </li>
                <li>
                  Hệ thống dùng chính API Key này để tạo các đề Toán 3 ngẫu nhiên, hấp dẫn bám sát sách Kết nối tri thức.
                </li>
              </ul>
              <div className="pt-1 flex items-center justify-between">
                <a
                  href="https://aistudio.google.com/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sky-600 hover:text-sky-800 font-bold hover:underline"
                >
                  <span>Nhận Gemini API Key miễn phí tại Google AI Studio</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl font-bold text-slate-600 hover:bg-slate-200 text-sm transition-all cursor-pointer"
            >
              Để sau
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-sm shadow-md shadow-emerald-200 hover:shadow-lg transition-all cursor-pointer"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Đã lưu!</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Lưu API Key</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
