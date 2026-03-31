import React, { useMemo } from 'react';
import { Button } from "@/components/ui/button";

// Define the shape of the question to avoid 'any' errors
export interface Question {
  questionText: string;
  correctAnswer: string;
  wrongAnswer1: string;
  wrongAnswer2: string;
  wrongAnswer3: string;
}

interface QuestionCardProps {
  question: Question | undefined; // Allow undefined to prevent property-read crashes
  feedback: 'correct' | 'wrong' | null;
  onAnswer: (val: string) => void;
}

export const QuestionCard = ({ question, feedback, onAnswer }: QuestionCardProps) => {
  /**
   * 1. Safe Memoization
   * We check if the question exists before trying to access its properties.
   * If it doesn't exist yet, we return an empty array to satisfy the .map() below.
   */
  const options = useMemo(() => {
    if (!question) return [];

    return [
      question.correctAnswer,
      question.wrongAnswer1,
      question.wrongAnswer2,
      question.wrongAnswer3,
    ].sort();
  }, [question]);

  /**
   * 2. Component Guard
   * If the question data is still being fetched or is missing, we return a 
   * loading state instead of letting the JSX attempt to render undefined data.
   */
  if (!question) {
    return (
      <div className="h-64 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 font-medium animate-pulse text-sm uppercase tracking-widest">
          Transmitting Data...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Question Text */}
      <h2 className="text-3xl md:text-5xl font-black text-slate-800 text-center leading-tight tracking-tight">
        {question.questionText}
      </h2>

      {/* Answer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {options.map((opt, i) => {
          const isCorrect = opt === question.correctAnswer;
          const showCorrect = feedback && isCorrect;
          
          return (
            <Button
              key={`${opt}-${i}`} // Stable unique key
              disabled={!!feedback}
              onClick={() => onAnswer(opt)}
              variant="outline"
              className={`h-24 text-lg border-2 font-bold shadow-sm transition-all py-8 px-6 justify-start
                ${showCorrect ? 'bg-green-500 border-green-600 text-white hover:bg-green-500' : ''}
                ${feedback === 'wrong' && !isCorrect ? 'opacity-50' : ''}
                ${!feedback ? 'hover:border-[#00a884] hover:bg-[#00a884]/5 active:scale-[0.98]' : ''}
              `}
            >
              {/* Option Letter Bubble */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 text-xs shrink-0 font-black
                ${showCorrect ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                 {String.fromCharCode(65 + i)}
              </div>

              {/* Answer Text */}
              <span className="truncate">{opt}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};