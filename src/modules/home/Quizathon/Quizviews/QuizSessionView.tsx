'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { trpc } from "@/trpc/client";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from 'lucide-react';
import { QuizHeader } from '../components/QuizHeader';
import { QuestionCard } from '../components/QuestionCard';
import { EliminationArena } from '../components/EliminationArena';

export const QuizSessionView = ({ quizId }: { quizId: string }) => {
  const { data: quiz, isLoading: quizLoading } = trpc.quiz.getOne.useQuery({ id: quizId });
  const [questions] = trpc.quiz.getQuizQuestions.useSuspenseQuery({ quizId });
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [answeredIndices, setAnsweredIndices] = useState<Set<number>>(new Set());
  const [now, setNow] = useState(() => Date.now());

  const submitScoreMutation = trpc.quiz.submitFinalScore.useMutation();

  useEffect(() => {
    const ticker = setInterval(() => {
      const currentTime = Date.now();
      setNow(currentTime);

      if (quiz) {
        const startTime = new Date(`${quiz.date}T${quiz.time}:00`).getTime();
        const endTime = startTime + (5 * 60 * 1000);

        if (currentTime >= endTime && !submitScoreMutation.isPending && !submitScoreMutation.isSuccess) {
          submitScoreMutation.mutate({ quizId, score });
        }
      }
    }, 1000);
    return () => clearInterval(ticker);
  }, [quiz, quizId, score, submitScoreMutation]);

  const { timeLeft, isEliminationMode } = useMemo(() => {
    if (!quiz) return { timeLeft: 300, isEliminationMode: false };
    const endTime = new Date(`${quiz.date}T${quiz.time}:00`).getTime() + (5 * 60 * 1000);
    return { 
      timeLeft: Math.max(0, Math.floor((endTime - now) / 1000)), 
      isEliminationMode: now >= endTime 
    };
  }, [quiz, now]);

  const handleAnswer = (selected: string) => {
    // Prevent answering twice or answering after time/score submission
    if (answeredIndices.has(currentIndex) || feedback || submitScoreMutation.isPending) return;
    
    const isCorrect = selected === questions[currentIndex].correctAnswer;
    if (isCorrect) setScore(prev => prev + 10);
    setFeedback(isCorrect ? 'correct' : 'wrong');
    setAnsweredIndices(prev => new Set(prev).add(currentIndex));

    setTimeout(() => {
      setFeedback(null);
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
      }
    }, 800);
  };

  if (quizLoading) return <div className="h-screen flex items-center justify-center bg-slate-950"><Loader2 className="animate-spin text-emerald-500 w-12 h-12" /></div>;

  const MainQuizUI = (
    <div className="min-h-screen bg-white flex flex-col overflow-hidden font-sans">
      <QuizHeader 
        currentIndex={currentIndex} 
        total={questions.length} 
        timeLeft={timeLeft} 
        score={score} 
      />

      <main className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full"
          >
            <QuestionCard 
              question={questions[currentIndex]} 
              feedback={feedback} 
              onAnswer={handleAnswer}
              isAnswered={answeredIndices.has(currentIndex)}
            />
          </motion.div>
        </AnimatePresence>
      </main>
      
      <div className="w-full h-2 bg-slate-100">
        <motion.div 
          className="h-full bg-[#00a884]"
          initial={{ width: 0 }}
          animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>
    </div>
  );

  // If in elimination mode, wrap the UI so survivors can still see and answer questions
  if (isEliminationMode) {
    return (
      <EliminationArena quizId={quizId} userFinalScore={score}>
        {MainQuizUI}
      </EliminationArena>
    );
  }

  return MainQuizUI;
};