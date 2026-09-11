export type BearState = 'normal' | 'thinking' | 'celebrate' | 'happy';

export interface Question {
  id: number;
  stageName: string;
  category: string;
  categoryIcon: string;
  question: string;
  options: string[];
  correctIndex: number;
  hint: string;
  explanation: string;
}

export interface UserAnswer {
  questionId: number;
  selectedIndex: number;
  isCorrect: boolean;
}

export interface GameStats {
  score: number;
  questionsAnswered: number;
  correctAnswersCount: number;
  hintsUsed: number;
}

export interface Lesson {
  id: string;
  title: string;
}

export interface Chapter {
  id: string;
  title: string;
  lessons: Lesson[];
}
