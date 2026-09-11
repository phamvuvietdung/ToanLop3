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
import { sound } from './utils/audio';

export default function App() {
  const [appState, setAppState] = useState<'home' | 'loading' | 'playing' | 'end'>('home');
  const [questions, setQuestions] = useState<Question[]>(MATH_QUESTIONS);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [isAnsweredCorrectly, setIsAnsweredCorrectly] = useState<boolean>(false);
  const [userAnswers, setUserAnswers] = useState<Record<number, UserAnswer>>({});
  const [showHint, setShowHint] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

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

  // Select option before submission
  const handleSelectOption = useCallback((index: number) => {
    if (isChecked) return; // Prevent selection after submission
    sound.playSelect();
    setSelectedOption(index);
    setBearState('normal');
    setBearMessage('Bé đã chọn đáp án này, hãy kiểm tra thật chắc chắn rồi bấm nộp nhé! ✨');
  }, [isChecked]);

  // Single attempt submission & grading
  const handleCheckAnswer = useCallback(() => {
    if (isChecked) return;

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

  // Advance to next question or show end screen
  const handleNextQuestion = useCallback(() => {
    sound.playSelect();
    if (isLastQuestion) {
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
  }, [isLastQuestion]);

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
    setAppState('home');
  }, []);

  // Retake the SAME quiz to improve score after grading
  const handleRetrySameQuestions = useCallback(() => {
    setCurrentIdx(0);
    setScore(0);
    setSelectedOption(null);
    setIsChecked(false);
    setIsAnsweredCorrectly(false);
    setUserAnswers({});
    setShowHint(false);
    setBearState('normal');
    setBearMessage('Cùng làm lại bài nào! Lần này bé cố gắng đạt điểm tối đa 100/100 nhé! 🐻💪');
    setAppState('playing');
  }, []);

  // Generate a fresh set of 10 questions for the current lesson
  const handleGenerateNewQuestions = useCallback(async () => {
    if (!currentLesson) {
      setAppState('home');
      return;
    }
    setAppState('loading');
    try {
      const response = await fetch('/api/generate-questions-by-topic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: currentLesson.title,
          count: 10,
          forceRefresh: true,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Có lỗi xảy ra');
      }

      const data = await response.json();
      setQuestions(data.questions);
      setCurrentIdx(0);
      setScore(0);
      setSelectedOption(null);
      setIsChecked(false);
      setIsAnsweredCorrectly(false);
      setUserAnswers({});
      setShowHint(false);
      setBearState('normal');
      setBearMessage(
        data.notice
          ? 'Đã chuẩn bị 10 câu hỏi luyện tập cho bé! Cố lên nhé bé ơi! 🐻💪'
          : 'Bộ 10 câu hỏi mới toanh đã sẵn sàng! Cùng thử sức nhé bé! 🐻✨'
      );
      setAppState('playing');
    } catch (err: any) {
      alert(err.message || 'Không thể tạo câu hỏi mới. Vui lòng thử lại.');
      setAppState('end');
    }
  }, [currentLesson]);

  // Handler when user chooses a lesson from the Home Screen
  const handlePlayGenerated = useCallback((newQuestions: Question[], lesson: Lesson, notice?: string) => {
    setQuestions(newQuestions);
    setCurrentLesson(lesson);
    setCurrentIdx(0);
    setScore(0);
    setSelectedOption(null);
    setIsChecked(false);
    setIsAnsweredCorrectly(false);
    setUserAnswers({});
    setShowHint(false);
    setBearState('normal');
    setBearMessage(
      notice
        ? 'Gấu đã mở bài tập cho bé! Mỗi câu chỉ làm 1 lần, hãy tính thật cẩn thận nhé! 🐻'
        : 'Gấu đã chuẩn bị xong 10 câu hỏi! Mỗi câu chỉ làm 1 lần, bé cố gắng nhé! 🐻'
    );
    setAppState('playing');
  }, []);

  const questionIds = questions.map((q) => q.id);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-400 via-sky-200 to-amber-50 relative overflow-x-hidden text-slate-800 flex flex-col justify-between">
      {/* Background Decorative Cloud & Math Shapes */}
      <div className="fixed inset-0 pointer-events-none -z-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-300/40 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-32 w-80 h-80 bg-sky-300/40 rounded-full blur-3xl" />

        <span className="absolute top-12 left-10 text-4xl opacity-20 font-black text-sky-800 animate-float select-none">+</span>
        <span className="absolute top-36 right-16 text-4xl opacity-20 font-black text-amber-700 animate-float select-none" style={{ animationDelay: '1s' }}>×</span>
        <span className="absolute bottom-28 left-16 text-3xl opacity-20 font-black text-emerald-700 animate-float select-none" style={{ animationDelay: '1.5s' }}>÷</span>
        <span className="absolute bottom-36 right-12 text-3xl opacity-20 font-black text-sky-700 animate-float select-none" style={{ animationDelay: '2s' }}>=</span>
        <span className="absolute top-1/2 left-4 text-3xl opacity-20 select-none">⭐</span>
        <span className="absolute top-2/3 right-6 text-3xl opacity-20 select-none">📐</span>
      </div>

      <main className="relative z-10 w-full max-w-3xl mx-auto px-4 py-4 md:py-8 flex-1 flex flex-col">
        <Header
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
          onReset={handleBackToHome}
        />

        {appState === 'home' && (
          <div className="my-auto">
            <HomeScreen 
              onGenerateStart={() => setAppState('loading')} 
              onGenerateSuccess={handlePlayGenerated} 
              onGenerateError={(err) => { 
                alert(err); 
                setAppState('home'); 
              }} 
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
              onGenerateNewQuestions={handleGenerateNewQuestions}
              onBackToHome={handleBackToHome}
            />
          </div>
        )}
      </main>

      <footer className="relative z-10 py-3 text-center text-xs md:text-sm font-bold text-sky-900/70">
        <span>Bé Giỏi Toán Lớp 3 • Kết nối tri thức với cuộc sống 🌟</span>
      </footer>
    </div>
  );
}
