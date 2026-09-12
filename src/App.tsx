import { useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { MATH_QUESTIONS } from './data/questions';
import { BearState, Question, UserAnswer, Lesson } from './types';
import { BearCheerleader } from './components/BearCheerleader';
import { ProgressBar } from './components/ProgressBar';
import { QuestionCard } from './components/QuestionCard';
import { EndScreen } from './components/EndScreen';
import { Header } from './components/Header';
import { HomeScreen } from './components/HomeScreen';
import { LoadingScreen } from './components/LoadingScreen';
import { ApiKeyModal } from './components/ApiKeyModal';
import { HistoryModal } from './components/HistoryModal';
import { getStoredApiKey, hasStoredApiKey } from './utils/apiKeyStorage';
import { requestQuestions, ApiError } from './utils/questionService';
import { saveStudyRecord } from './utils/historyStorage';
import { sound } from './utils/audio';

export default function App() {
  const [appState, setAppState] = useState<'home' | 'loading' | 'playing' | 'end'>('home');
  const [questions, setQuestions] = useState<Question[]>(MATH_QUESTIONS);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [activeQuestionSource, setActiveQuestionSource] = useState<'ai' | 'smart_standard'>('smart_standard');
  
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [isAnsweredCorrectly, setIsAnsweredCorrectly] = useState<boolean>(false);
  const [userAnswers, setUserAnswers] = useState<Record<number, UserAnswer>>({});
  const [showHint, setShowHint] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // History modal state
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);

  // Gemini API Key modal & pending action states
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);
  const [apiKeyErrorMessage, setApiKeyErrorMessage] = useState<string | null>(null);
  const [apiKeyInfoMessage, setApiKeyInfoMessage] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState<boolean>(() => hasStoredApiKey());
  const [pendingAction, setPendingAction] = useState<
    | { type: 'lesson'; lesson: Lesson }
    | { type: 'generate_new'; lesson: Lesson }
    | null
  >(null);

  // Bear cheer state
  const [bearState, setBearState] = useState<BearState>('normal');
  const [bearMessage, setBearMessage] = useState<string>('Chào bé! Cùng học Toán nhé! Mỗi câu chỉ trả lời 1 lần thôi nhé! 🐻');

  const currentQuestion = questions[currentIdx];
  const isLastQuestion = currentIdx === questions.length - 1;

  // Toggle sound
  const handleToggleSound = useCallback(() => {
    sound.enabled = !soundEnabled;
    setSoundEnabled(!soundEnabled);
  }, [soundEnabled]);

  // Open API Key Modal
  const handleOpenApiKeyModal = useCallback((errorMsg?: string, infoMsg?: string) => {
    setApiKeyErrorMessage(errorMsg || null);
    setApiKeyInfoMessage(infoMsg || null);
    setIsApiKeyModalOpen(true);
  }, []);

  const handleCloseApiKeyModal = useCallback(() => {
    setIsApiKeyModalOpen(false);
    setApiKeyErrorMessage(null);
    setApiKeyInfoMessage(null);
  }, []);

  // Option selection
  const handleSelectOption = useCallback((index: number) => {
    if (isChecked) return;
    sound.playSelect();
    setSelectedOption(index);
    setBearState('thinking');
    setBearMessage('Bé đã chọn đáp án rồi! Hãy bấm nút KIỂM TRA ĐÁP ÁN bên dưới nhé! 🐾');
  }, [isChecked]);

  // Answer validation
  const handleCheckAnswer = useCallback(() => {
    if (isChecked || !currentQuestion) return;

    if (selectedOption === null) {
      setBearState('thinking');
      setBearMessage('Bé hãy chọn một đáp án trước khi bấm kiểm tra nhé! 👆');
      sound.playIncorrect();
      return;
    }

    const isCorrect = selectedOption === currentQuestion.correctIndex;
    setIsChecked(true);
    setIsAnsweredCorrectly(isCorrect);
    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        questionId: currentQuestion.id,
        selectedIndex: selectedOption,
        isCorrect,
      },
    }));

    if (isCorrect) {
      sound.playCorrect();
      setScore((prev) => prev + 10);
      setBearState('celebrate');
      setBearMessage('Xuất sắc quá! Bé trả lời đúng rồi! 🎉 (+10 điểm)');

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.65 },
        colors: ['#38BDF8', '#F59E0B', '#10B981', '#F43F5E', '#A855F7'],
      });
    } else {
      sound.playIncorrect();
      setBearState('thinking');
      setBearMessage('Tiếc quá, chưa chính xác rồi! Bé xem đáp án đúng và lời giải chi tiết nhé! 💪');
    }
  }, [isChecked, selectedOption, currentQuestion]);

  // Advance to next question or show end screen and save history
  const handleNextQuestion = useCallback(() => {
    sound.playSelect();
    if (isLastQuestion) {
      // Calculate and save record to study history
      if (currentLesson) {
        const correctCount = questions.filter((q) => {
          if (q.id === currentQuestion?.id) {
            return isAnsweredCorrectly;
          }
          return userAnswers[q.id]?.isCorrect;
        }).length;

        saveStudyRecord({
          lessonId: currentLesson.id,
          lessonTitle: currentLesson.title,
          score: score,
          totalScore: questions.length * 10,
          correctCount: correctCount,
          totalQuestions: questions.length,
          source: activeQuestionSource,
        });
      }

      setAppState('end');
    } else {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOption(null);
      setIsChecked(false);
      setIsAnsweredCorrectly(false);
      setShowHint(false);
      setBearState('normal');
      setBearMessage('Câu tiếp theo đang đợi bé! Đọc kỹ đề bài trước khi chọn nhé! 🚀');
    }
  }, [isLastQuestion, currentLesson, questions, currentQuestion, isAnsweredCorrectly, userAnswers, score, activeQuestionSource]);

  const handleToggleHint = useCallback(() => {
    setShowHint((prev) => {
      const nextState = !prev;
      if (nextState) {
        setBearMessage('Bé đọc kỹ gợi ý nhé, đáp án ở rất gần rồi! 💡');
      }
      return nextState;
    });
  }, []);

  // Return to Table of Contents
  const handleBackToHome = useCallback(() => {
    sound.playSelect();
    setAppState('home');
    setBearState('normal');
    setBearMessage('Chào bé! Bé hãy chọn bài học trong 7 chủ đề bên dưới để luyện tập nhé! 🐻');
  }, []);

  // Re-play the exact same set of questions
  const handleRetrySameQuestions = useCallback(() => {
    sound.playSelect();
    setCurrentIdx(0);
    setScore(0);
    setSelectedOption(null);
    setIsChecked(false);
    setIsAnsweredCorrectly(false);
    setUserAnswers({});
    setShowHint(false);
    setBearState('normal');
    setBearMessage('Cố gắng đạt điểm tối đa ở lần thử này nhé bé ơi! 🐻💪');
    setAppState('playing');
  }, []);

  // Handler when user chooses a lesson from the Home Screen
  const handleStartLesson = useCallback(async (lesson: Lesson, overrideKey?: string) => {
    const key = overrideKey !== undefined ? overrideKey : getStoredApiKey();

    setAppState('loading');
    try {
      const data = await requestQuestions(lesson.title, 10, key, false);

      setQuestions(data.questions);
      setCurrentLesson(lesson);
      setActiveQuestionSource(data.source);
      setCurrentIdx(0);
      setScore(0);
      setSelectedOption(null);
      setIsChecked(false);
      setIsAnsweredCorrectly(false);
      setUserAnswers({});
      setShowHint(false);
      setPendingAction(null);
      setBearState('normal');
      setBearMessage(
        data.notice
          ? 'Gấu đã mở bài tập cho bé! Mỗi câu chỉ làm 1 lần, hãy tính thật cẩn thận nhé! 🐻'
          : 'Gấu đã chuẩn bị xong 10 câu hỏi! Mỗi câu chỉ làm 1 lần, bé cố gắng nhé! 🐻'
      );
      setAppState('playing');
    } catch (err: any) {
      if (err instanceof ApiError && err.code === 429) {
        // Fallback gracefully to smart curriculum so the child is NEVER blocked
        try {
          const fallbackData = await requestQuestions(lesson.title, 10, '', false);
          setQuestions(fallbackData.questions);
          setCurrentLesson(lesson);
          setActiveQuestionSource('smart_standard');
          setCurrentIdx(0);
          setScore(0);
          setSelectedOption(null);
          setIsChecked(false);
          setIsAnsweredCorrectly(false);
          setUserAnswers({});
          setShowHint(false);
          setPendingAction(null);
          setBearState('thinking');
          setBearMessage('API Key tạm hết hạn mức (429). Gấu đã tự động bật Bộ đề thông minh chuẩn SGK cho bé nhé! 🐻✨');
          setAppState('playing');
          return;
        } catch {
          // If fallback fails
        }
      }

      setAppState('home');
      if (err instanceof ApiError && err.code === 401) {
        setPendingAction({ type: 'lesson', lesson });
        handleOpenApiKeyModal(
          err.message || 'API Key không hợp lệ. Vui lòng kiểm tra lại!',
          null
        );
        return;
      }

      alert(err.message || 'Không thể tạo câu hỏi mới. Vui lòng thử lại.');
    }
  }, [handleOpenApiKeyModal]);

  // Generate a fresh set of 10 questions for the current lesson from EndScreen
  const handleGenerateNewQuestions = useCallback(async (overrideKey?: string) => {
    if (!currentLesson) {
      setAppState('home');
      return;
    }

    const key = overrideKey !== undefined ? overrideKey : getStoredApiKey();

    setAppState('loading');
    try {
      const data = await requestQuestions(currentLesson.title, 10, key, true);

      setQuestions(data.questions);
      setActiveQuestionSource(data.source);
      setCurrentIdx(0);
      setScore(0);
      setSelectedOption(null);
      setIsChecked(false);
      setIsAnsweredCorrectly(false);
      setUserAnswers({});
      setShowHint(false);
      setPendingAction(null);
      setBearState('normal');
      setBearMessage('10 câu hỏi hoàn toàn mới đã sẵn sàng! Cùng thử sức nào bé ơi! 🐻🚀');
      setAppState('playing');
    } catch (err: any) {
      if (err instanceof ApiError && err.code === 429) {
        // Fallback to fresh smart standard questions
        try {
          const fallbackData = await requestQuestions(currentLesson.title, 10, '', true);
          setQuestions(fallbackData.questions);
          setActiveQuestionSource('smart_standard');
          setCurrentIdx(0);
          setScore(0);
          setSelectedOption(null);
          setIsChecked(false);
          setIsAnsweredCorrectly(false);
          setUserAnswers({});
          setShowHint(false);
          setPendingAction(null);
          setBearState('thinking');
          setBearMessage('API Key tạm hết hạn mức (429). Gấu đã tạo 10 câu hỏi thông minh mới cho bé rồi nhé! 🐻✨');
          setAppState('playing');
          return;
        } catch {
          // If fallback fails
        }
      }

      setAppState('end');
      if (err instanceof ApiError && err.code === 401) {
        setPendingAction({ type: 'generate_new', lesson: currentLesson });
        handleOpenApiKeyModal(
          err.message || 'API Key không hợp lệ. Vui lòng kiểm tra lại!',
          null
        );
        return;
      }

      alert(err.message || 'Không thể tạo câu hỏi mới. Vui lòng thử lại.');
    }
  }, [currentLesson, handleOpenApiKeyModal]);

  // Handler when user saves or changes mode in the modal
  const handleSaveApiKey = useCallback((newKey: string) => {
    const isKeySaved = Boolean(newKey && newKey.trim());
    setHasApiKey(isKeySaved);
    setIsApiKeyModalOpen(false);
    setApiKeyErrorMessage(null);
    setApiKeyInfoMessage(null);

    // If an action was pending, resume it seamlessly!
    if (pendingAction) {
      const action = pendingAction;
      setPendingAction(null);
      if (action.type === 'lesson') {
        handleStartLesson(action.lesson, newKey);
      } else if (action.type === 'generate_new') {
        handleGenerateNewQuestions(newKey);
      }
    } else {
      setBearState('celebrate');
      setBearMessage(
        isKeySaved
          ? 'Đã kích hoạt chế độ Gemini AI! Bé cùng bắt đầu ôn tập nhé! 🐻✨'
          : 'Đã chuyển sang chế độ Đề chuẩn SGK (Miễn phí 100%)! Cùng học nào bé ơi! 🐻📚'
      );
    }
  }, [pendingAction, handleStartLesson, handleGenerateNewQuestions]);

  const questionIds = questions.map((q) => q.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100 font-sans text-slate-800 flex flex-col relative overflow-x-hidden selection:bg-sky-200">
      {/* Decorative math background badges */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <span className="absolute top-12 left-10 text-4xl opacity-20 font-black text-sky-700 animate-float select-none">+</span>
        <span className="absolute top-36 right-16 text-4xl opacity-20 font-black text-amber-700 animate-float select-none" style={{ animationDelay: '1s' }}>×</span>
        <span className="absolute bottom-28 left-16 text-3xl opacity-20 font-black text-emerald-700 animate-float select-none" style={{ animationDelay: '1.5s' }}>÷</span>
        <span className="absolute bottom-36 right-12 text-3xl opacity-20 font-black text-sky-700 animate-float select-none" style={{ animationDelay: '2s' }}>=</span>
        <span className="absolute top-1/2 left-4 text-3xl opacity-20 select-none">⭐</span>
        <span className="absolute top-2/3 right-6 text-3xl opacity-20 select-none">📐</span>
      </div>

      <main
        className={`relative z-10 w-full ${
          appState === 'home' ? 'max-w-7xl' : 'max-w-3xl'
        } mx-auto px-4 py-4 md:py-8 flex-1 flex flex-col transition-all duration-300`}
      >
        <Header
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
          onReset={handleBackToHome}
          hasApiKey={hasApiKey}
          onOpenApiKeyModal={() => handleOpenApiKeyModal()}
          onOpenHistoryModal={() => setIsHistoryModalOpen(true)}
        />

        {appState === 'home' && (
          <div className="w-full my-2 md:my-4">
            <HomeScreen
              onSelectLesson={handleStartLesson}
              onOpenHistory={() => setIsHistoryModalOpen(true)}
            />
          </div>
        )}

        {appState === 'loading' && <LoadingScreen />}

        {appState === 'playing' && currentQuestion && (
          <div className="flex-1 flex flex-col justify-center">
            <div className="mb-4">
              <BearCheerleader
                state={bearState}
                message={bearMessage}
              />
            </div>
            <ProgressBar
              currentIndex={currentIdx}
              totalQuestions={questions.length}
              score={score}
              userAnswers={userAnswers}
              questionIds={questionIds}
            />
            <QuestionCard
              question={currentQuestion}
              selectedOption={selectedOption}
              isChecked={isChecked}
              isAnsweredCorrectly={isAnsweredCorrectly}
              onSelectOption={handleSelectOption}
              onCheckAnswer={handleCheckAnswer}
              onNextQuestion={handleNextQuestion}
              showHint={showHint}
              onToggleHint={handleToggleHint}
              isLastQuestion={isLastQuestion}
            />
          </div>
        )}

        {appState === 'end' && (
          <div className="my-auto">
            <EndScreen
              score={score}
              totalScore={questions.length * 10}
              questions={questions}
              userAnswers={userAnswers}
              currentLesson={currentLesson}
              onRetrySameQuestions={handleRetrySameQuestions}
              onGenerateNewQuestions={() => handleGenerateNewQuestions()}
              onBackToHome={handleBackToHome}
            />
          </div>
        )}
      </main>

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={handleCloseApiKeyModal}
        onSave={handleSaveApiKey}
        errorMessage={apiKeyErrorMessage}
        infoMessage={apiKeyInfoMessage}
      />

      {/* History & Scoreboard Modal */}
      <HistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        onSelectLesson={handleStartLesson}
      />

      <footer className="relative z-10 py-3 text-center text-xs md:text-sm font-bold text-sky-900/70">
        <span>Bé Giỏi Toán Lớp 3 • Kết nối tri thức với cuộc sống 🌟</span>
      </footer>
    </div>
  );
}
