import React, { useState, useEffect, useRef } from 'react';
import {
  KeyRound,
  X,
  Check,
  Eye,
  EyeOff,
  AlertTriangle,
  Info,
  Clipboard,
  ExternalLink,
  Trash2,
  Sparkles,
  BookOpen,
  Loader2,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getStoredApiKey, setStoredApiKey, removeStoredApiKey, maskApiKey } from '../utils/apiKeyStorage';
import { testGeminiApiKey, KeyValidationResult } from '../utils/apiKeyValidator';
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

  // Testing Key State
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<KeyValidationResult | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      const currentStored = getStoredApiKey();
      setKeyValue(currentStored);
      setSaveSuccess(false);
      setPasteSuccess(false);
      setValidationError(null);
      setTestResult(null);

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

  const handleTestKey = async () => {
    const trimmed = keyValue.trim();
    if (!trimmed) {
      setValidationError('Vui lòng dán khóa API vào ô trước khi bấm kiểm tra.');
      if (inputRef.current) inputRef.current.focus();
      return;
    }

    setValidationError(null);
    setTestResult(null);
    setIsTesting(true);

    try {
      const result = await testGeminiApiKey(trimmed);
      setTestResult(result);
      if (result.valid) {
        sound.playCorrect();
      } else {
        sound.playIncorrect();
      }
    } catch {
      setTestResult({
        valid: false,
        status: 'network_error',
        message: 'Đã xảy ra lỗi khi kiểm tra. Vui lòng kiểm tra lại kết nối mạng.',
      });
      sound.playIncorrect();
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    const trimmed = keyValue.trim();
    if (!trimmed) {
      setValidationError('Vui lòng dán Gemini API Key hoặc chọn "Dùng đề chuẩn SGK"');
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
    setTestResult(null);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleUseStandardMode = () => {
    removeStoredApiKey();
    setKeyValue('');
    setTestResult(null);
    sound.playSelect();
    onSave(''); // Clear key and switch to standard SGK mode immediately
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setKeyValue(text.trim());
        setPasteSuccess(true);
        setValidationError(null);
        setTestResult(null);
        setTimeout(() => setPasteSuccess(false), 2000);
      }
    } catch {
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
                <Sparkles className="w-5 h-5 text-amber-200" />
              </div>
              <div>
                <h3 id="api-key-modal-title" className="font-black text-lg md:text-xl text-white tracking-tight">
                  Quản lý Khóa Gemini AI 🎓
                </h3>
                <p className="text-xs text-sky-100 font-medium">
                  Kiểm tra tính hợp lệ & Trạng thái hoạt động
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
            {/* Friendly Hybrid Mode Badge Banner */}
            <div className="p-3.5 rounded-2xl bg-emerald-50 border-2 border-emerald-200 text-emerald-900 text-xs sm:text-sm font-medium leading-relaxed flex items-start gap-3">
              <BookOpen className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-black text-emerald-950 mb-0.5">
                  Mặc định: 100% Miễn phí & Không cần API Key
                </p>
                <p className="text-emerald-800">
                  Ứng dụng đã tích hợp sẵn <strong>Bộ sinh đề toán thông minh chuẩn SGK Kết nối tri thức</strong>. Các con số và câu hỏi luôn được đổi mới ngẫu nhiên mỗi lần chơi!
                </p>
              </div>
            </div>

            {/* Quota Notice if any */}
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-900 text-xs sm:text-sm font-medium flex items-start gap-3 shadow-sm"
              >
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-black text-amber-950 mb-0.5">Thông báo từ hệ thống AI</p>
                  <p className="leading-relaxed">{errorMessage}</p>
                </div>
              </motion.div>
            )}

            {/* General Info */}
            {!errorMessage && infoMessage && (
              <div className="p-3.5 rounded-2xl bg-sky-50 border-2 border-sky-200 text-sky-900 text-xs sm:text-sm font-medium flex items-start gap-2.5">
                <Info className="w-5 h-5 text-sky-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="leading-relaxed">{infoMessage}</p>
                </div>
              </div>
            )}

            {/* Saved Key Status Indicator */}
            {currentSavedKey && (
              <div className="flex items-center justify-between px-3.5 py-2.5 bg-sky-50 border border-sky-200 rounded-xl text-xs font-bold text-sky-800">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Đang dùng AI Key: <code className="bg-sky-100 px-1.5 py-0.5 rounded font-mono text-sky-900">{maskApiKey(currentSavedKey)}</code>
                </span>
                <button
                  type="button"
                  onClick={handleUseStandardMode}
                  title="Xóa key và quay về Chế độ Đề chuẩn SGK"
                  className="text-rose-600 hover:text-rose-800 hover:underline flex items-center gap-1 text-xs cursor-pointer ml-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa Key</span>
                </button>
              </div>
            )}

            {/* Input Form for Optional AI Key */}
            <div className="pt-1">
              <label htmlFor="gemini-api-key-input" className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5 flex items-center justify-between">
                <span>Gemini API Key (Tùy chọn mở rộng AI):</span>
                <span className="text-slate-400 font-semibold lowercase">không bắt buộc</span>
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
                    setTestResult(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSave();
                    }
                  }}
                  placeholder="Dán AIzaSy... vào đây"
                  autoComplete="off"
                  spellCheck="false"
                  className="w-full pr-24 pl-4 py-3 bg-slate-50 border-2 border-slate-300 focus:border-sky-500 focus:bg-white rounded-2xl text-sm font-mono text-slate-800 outline-none transition-all shadow-inner"
                />

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

              {/* Test Key Button & Real-Time Status Result */}
              <div className="mt-2.5">
                <button
                  type="button"
                  onClick={handleTestKey}
                  disabled={isTesting || !keyValue.trim()}
                  className={`w-full py-2.5 px-4 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 border-2 transition-all cursor-pointer ${
                    !keyValue.trim()
                      ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                      : isTesting
                      ? 'bg-sky-50 border-sky-300 text-sky-700'
                      : 'bg-white hover:bg-sky-50 border-sky-300 hover:border-sky-400 text-sky-700 shadow-xs'
                  }`}
                >
                  {isTesting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-sky-600" />
                      <span>Đang kết nối thử nghiệm đến Google Gemini...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-sky-600" />
                      <span>Kiểm tra xem API Key có hoạt động không</span>
                    </>
                  )}
                </button>

                {/* Validation Test Result Box */}
                {testResult && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-2 p-3 rounded-xl border text-xs font-semibold flex items-start gap-2 ${
                      testResult.valid
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                        : testResult.status === 'quota_exceeded'
                        ? 'bg-amber-50 border-amber-300 text-amber-900'
                        : 'bg-rose-50 border-rose-300 text-rose-900'
                    }`}
                  >
                    {testResult.valid ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    ) : testResult.status === 'quota_exceeded' ? (
                      <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 leading-relaxed">
                      <p className="font-bold">
                        {testResult.valid
                          ? '✅ Khóa API chính xác & hoạt động tốt!'
                          : testResult.status === 'quota_exceeded'
                          ? '⚠️ Khóa đúng nhưng đang tạm hết hạn mức (429)'
                          : '❌ Khóa API không đúng hoặc không có quyền truy cập'}
                      </p>
                      <p className="mt-0.5 opacity-90">{testResult.message}</p>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Quick helper info */}
            <div className="bg-sky-50/70 border border-sky-200/80 rounded-2xl p-3.5 text-xs text-slate-600 space-y-1.5">
              <p className="font-bold text-sky-900">
                💡 Lưu ý hữu ích:
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-600 leading-relaxed">
                <li>
                  <strong>Không cần Key:</strong> Bấm "Dùng Đề chuẩn SGK" bên dưới để vào học ngay lập tức, nhanh tức thì và không lo bất kỳ giới hạn nào.
                </li>
                <li>
                  <strong>Dùng Gemini AI:</strong> Dán key và bấm <em>"Kiểm tra xem API Key có hoạt động không"</em> trước khi Lưu để chắc chắn key đúng.
                </li>
              </ul>
              <div className="pt-1">
                <a
                  href="https://aistudio.google.com/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sky-600 hover:text-sky-800 font-bold hover:underline text-xs"
                >
                  <span>Lấy Gemini API Key miễn phí tại Google AI Studio</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleUseStandardMode}
              className="px-4 py-2.5 rounded-2xl font-bold text-emerald-700 bg-emerald-100/70 hover:bg-emerald-200/80 text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-1.5"
            >
              <BookOpen className="w-4 h-4" />
              <span>Dùng Đề chuẩn SGK</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2.5 rounded-2xl font-bold text-slate-600 hover:bg-slate-200 text-xs sm:text-sm transition-all cursor-pointer"
              >
                Đóng
              </button>

              <button
                type="button"
                onClick={handleSave}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-black text-xs sm:text-sm shadow-md shadow-sky-200 hover:shadow-lg transition-all cursor-pointer"
              >
                {saveSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Đã lưu!</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Lưu Key AI</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
