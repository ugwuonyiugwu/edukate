import React, { useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Question } from './types';

interface QuestionCardProps {
  question: Question;
  feedback: 'correct' | 'wrong' | null;
  onAnswer: (val: string) => void;
}

export const QuestionCard = ({ question, feedback, onAnswer }: QuestionCardProps) => {
  // Memoize options so they don't shuffle on every re-render
  const options = useMemo(() => [
    question.correctAnswer,
    question.wrongAnswer1,
    question.wrongAnswer2,
    question.wrongAnswer3,
  ].sort(), [question]);

  return (
    <div className="space-y-10">
      <h2 className="text-3xl md:text-5xl font-black text-slate-800 text-center leading-tight tracking-tight">
        {question.questionText}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {options.map((opt, i) => {
          const isCorrect = opt === question.correctAnswer;
          const showCorrect = feedback && isCorrect;
          
          return (
            <Button
              key={i}
              disabled={!!feedback}
              onClick={() => onAnswer(opt)}
              variant="outline"
              className={`h-24 text-lg border-2 font-bold shadow-sm transition-all py-8 px-6 justify-start
                ${showCorrect ? 'bg-green-500 border-green-600 text-white' : ''}
                ${feedback === 'wrong' && !isCorrect ? 'opacity-50' : ''}
                ${!feedback ? 'hover:border-[#00a884] hover:bg-[#00a884]/5' : ''}
              `}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 text-xs shrink-0 
                ${showCorrect ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                 {String.fromCharCode(65+i)}
              </div>
              <span className="truncate">{opt}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};