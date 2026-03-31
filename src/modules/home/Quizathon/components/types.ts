export interface QuizData {
  id: string;
  title: string;
  category: string;
  date: string;
  time: string;
  points: number;
  serverOffset: number;
}

// Shared Types
export interface QuizParticipant {
  clerkId: string;
  score: number;
  user?: {
    firstName?: string;
  };
}

export interface Question {
  questionText: string;
  correctAnswer: string;
  wrongAnswer1: string;
  wrongAnswer2: string;
  wrongAnswer3: string;
}