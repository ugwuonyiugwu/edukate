'use client';

import React, { useState, useEffect } from 'react';
import { trpc } from "@/trpc/client";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Trophy, Skull, Timer, CheckCircle2, XCircle, ChevronRight, AlertCircle } from 'lucide-react';
import { toast } from "sonner";
import dynamic from 'next/dynamic';

// Dynamic import to prevent SSR errors and improve performance
const Confetti = dynamic(() => import('react-confetti'), { ssr: false });

export const QuizSessionView = ({ quizId }: { quizId: string }) => {
  // 1. Fetch questions (Uses Suspense from the Prefetch)
  const [questions] = trpc.quiz.getQuizQuestions.useSuspenseQuery({ quizId });
  const submitScore = trpc.quiz.submitFinalScore.useMutation();

  // 2. States
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 Minutes
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  // 3. Countdown Timer for Elimination
  useEffect(() => {
    if (isFinished && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [isFinished, timeLeft]);

  // --- SAFETY GUARD: Check if questions exist ---
  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <AlertCircle className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-2xl font-bold text-slate-800">No Questions Found</h2>
        <p className="text-slate-500 max-w-xs mt-2">There are no questions uploaded for this quiz yet.</p>
        <Button className="mt-6 bg-[#00a884]" onClick={() => window.history.back()}>Go Back</Button>
      </div>
    );
  }

  const handleAnswer = (selected: string) => {
    const isCorrect = selected === questions[currentIndex].correctAnswer;
    
    if (isCorrect) {
      setScore(prev => prev + 10);
      setFeedback('correct');
    } else {
      setFeedback('wrong');
    }

    setTimeout(() => {
      setFeedback(null);
      // Logic to prevent "Out of Bounds" index error
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setIsFinished(true);
        submitScore.mutate({ quizId, score: score + (isCorrect ? 10 : 0) });
      }
    }, 1000);
  };

  // --- FINISHED STATE: SCORE & TIMER ---
  if (isFinished) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 text-center">
        {timeLeft > 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6 max-w-md w-full">
            <Trophy className="w-20 h-20 text-yellow-500 mx-auto animate-bounce" />
            <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">Mission Ended</h1>
            <div className="py-8 bg-white/5 rounded-3xl border border-white/10">
              <p className="text-slate-400 text-sm uppercase font-bold tracking-widest">Final Score</p>
              <p className="text-7xl font-black text-indigo-400 mt-2">{score}</p>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl">
              <p className="text-red-500 text-xs font-bold uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
                <Skull size={14} /> Elimination Starts In
              </p>
              <p className="text-4xl font-mono text-white">
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </p>
            </div>
          </motion.div>
        ) : (
          <EliminationArena quizId={quizId} />
        )}
      </div>
    );
  }

  // --- ACTIVE QUIZ STATE ---
  const currentQ = questions[currentIndex];
  // Safety check for the specific question object
  if (!currentQ) return null;

  const options = [
    currentQ.correctAnswer,
    currentQ.wrongAnswer1,
    currentQ.wrongAnswer2,
    currentQ.wrongAnswer3,
  ].filter(Boolean).sort(); // Sort makes it consistent; filter(Boolean) removes empty strings

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans overflow-hidden">
      <AnimatePresence>
        {feedback && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm 
              ${feedback === 'correct' ? 'bg-green-600/30' : 'bg-red-600/30'}`}
          >
            <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }}>
              {feedback === 'correct' ? <CheckCircle2 className="w-32 h-32 text-green-500" /> : <XCircle className="w-32 h-32 text-red-500" />}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-[#00a884] p-4 text-white flex justify-between items-center shadow-md">
        <span className="font-bold">Question {currentIndex + 1} of {questions.length}</span>
        <div className="bg-black/20 px-4 py-1.5 rounded-lg border border-white/10 font-mono font-bold tracking-tighter">
          SCORE: {score}
        </div>
      </div>

      <div className="flex-1 p-6 md:p-12 max-w-4xl mx-auto w-full">
        <motion.div key={currentIndex} initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-10">
          <h2 className="text-2xl md:text-3xl font-medium text-slate-800 leading-tight">
            {currentQ.questionText}
          </h2>
          <div className="grid gap-4">
            {options.map((option, idx) => (
              <Button
                key={idx}
                onClick={() => handleAnswer(option)}
                variant="outline"
                className="h-20 justify-start px-8 text-lg border-2 border-slate-200 hover:border-[#00a884] hover:bg-[#00a884]/5 transition-all group relative overflow-hidden"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#00a884] opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="mr-6 text-slate-400 font-black italic">{String.fromCharCode(65 + idx)}</span>
                <span className="text-slate-700 font-medium truncate">{option}</span>
              </Button>
            ))}
          </div>
        </motion.div>
      </div>
      
      {/* Visual Progress Bar */}
      <div className="h-2 bg-slate-200 w-full">
        <motion.div 
          className="h-full bg-[#00a884]" 
          initial={{ width: 0 }} 
          animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} 
        />
      </div>
    </div>
  );
};

// --- ELIMINATION ARENA COMPONENT ---
const EliminationArena = ({ quizId }: { quizId: string }) => {
  const utils = trpc.useUtils();
  const { data: participantList } = trpc.quiz.getLiveParticipants.useQuery({ quizId });
  const eliminateMutation = trpc.quiz.eliminateLowest.useMutation({
    onSuccess: () => {
      utils.quiz.getLiveParticipants.invalidate();
      toast.error("Elimination Protocol: User De-activated", { position: 'top-center' });
    }
  });

  useEffect(() => {
    const interval = setInterval(() => {
      if (participantList && participantList.length > 1) {
        eliminateMutation.mutate({ quizId });
      }
    }, 8000); // 8 seconds per elimination
    return () => clearInterval(interval);
  }, [participantList, quizId]);

  const isWinner = participantList?.length === 1;

  return (
    <div className="w-full max-w-lg space-y-8 p-4">
      <h2 className="text-2xl font-black text-white uppercase tracking-[0.3em] italic">
        {isWinner ? "The Winner Is" : "Elimination Arena"}
      </h2>
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {participantList?.map((p, i) => (
            <motion.div 
              layout key={p.clerkId} 
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.8 }}
              className={`p-5 rounded-2xl border-2 flex justify-between items-center transition-all
                ${i === 0 && isWinner ? 'border-yellow-500 bg-yellow-500/10 shadow-[0_0_20px_rgba(234,179,8,0.2)]' : 'border-white/10 bg-white/5'}`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold 
                  ${i === 0 && isWinner ? 'bg-yellow-500 text-black' : 'bg-slate-800 text-white'}`}>{i + 1}</div>
                <span className="text-white font-bold">User_{p.clerkId.slice(-4)}</span>
              </div>
              <span className="font-mono text-xl text-indigo-400 font-bold">{p.score}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {isWinner && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="pt-8">
          <Confetti numberOfPieces={200} recycle={false} />
          <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-black font-black rounded-full px-12">
            CLAIM REWARD <ChevronRight className="ml-2" />
          </Button>
        </motion.div>
      )}
    </div>
  );
};