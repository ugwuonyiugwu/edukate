'use client';

import React, { useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import Image from 'next/image';

export interface Question {
  questionText: string;
  correctAnswer: string;
  wrongAnswer1: string;
  wrongAnswer2: string;
  wrongAnswer3: string;
  imageUrl?: string | null;
}

interface QuestionCardProps {
  question: Question | undefined;
  feedback: 'correct' | 'wrong' | null;
  onAnswer: (val: string) => void;
  isAnswered: boolean;
}

export const QuestionCard = ({ question, feedback, onAnswer, isAnswered }: QuestionCardProps) => {
  const options = useMemo(() => {
    if (!question) return [];
    return [
      question.correctAnswer,
      question.wrongAnswer1,
      question.wrongAnswer2,
      question.wrongAnswer3,
    ].sort();
  }, [question]);

  if (!question) return null;

  return (
    <div className="w-full max-w-5xl mx-auto min-h-[60vh] md:font-serif">
      
      <div className="flex flex-col gap-8">
        {/* Supporting Image (Reduced size, left-aligned) */}
        {question.imageUrl && (
          <div className="relative w-full max-w-md aspect-video rounded-md overflow-hidden bg-slate-50 border border-slate-100">
            <Image 
              src={question.imageUrl} 
              alt="Question visual" 
              fill 
              className="object-contain p-2"
              unoptimized
            />
          </div>
        )}

        {/* The Question Text */}
        <h2 className="text-2xl md:text-xl text-slate-800 leading-relaxed font-medium">
          {question.questionText}
        </h2>

        {/* The Options (List style with (A), (B) prefix as per image) */}
        <div className="flex flex-col gap-2 ">
          {options.map((opt, i) => {
            const isCorrect = opt === question.correctAnswer;
            const showSuccess = feedback && isCorrect;
            const letter = String.fromCharCode(65 + i); // A, B, C, D

            return (
              <button
                key={`${opt}-${i}`}
                disabled={!!feedback || isAnswered}
                onClick={() => onAnswer(opt)}
                className={`
                  group flex gap-2 items-center text-left transition-all rounded-md
                  ${!feedback && !isAnswered ? 'hover:bg-slate-50' : 'cursor-default'}
                  ${showSuccess ? 'text-emerald-600 font-bold ' : 'text-slate-700'}
                  ${feedback === 'wrong' && !isCorrect ? 'opacity-40' : ''}
                `}
              >
                {/* Prefix (A), (B)... */}
                <span className="text-lg font-medium min-w-10">({letter})</span>
                
                {/* Radio Circle Icon */}
                <div className={`
                  w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors
                  ${showSuccess ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300 group-hover:border-[#00a884]'}
                `}>
                  {showSuccess && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>

                {/* Option Text */}
                <span className="text-sm text-blue-900 md:text-lg ml-2">{opt}</span>

                {/* Feedback Icon */}
                {showSuccess && <CheckCircle2 className="ml-4 w-6 h-6 text-emerald-500" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};