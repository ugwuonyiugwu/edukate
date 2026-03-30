'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { trpc } from "@/trpc/client";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Skull, Timer, Trophy, Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';

const Confetti = dynamic(() => import('react-confetti'), { ssr: false });

export const QuizSessionView = ({ quizId }: { quizId: string }) => {
  const { data: quiz, isLoading: quizLoading } = trpc.quiz.getOne.useQuery({ id: quizId });
  const [questions] = trpc.quiz.getQuizQuestions.useSuspenseQuery({ quizId });
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const submitScoreMutation = trpc.quiz.submitFinalScore.useMutation();

  // 1. Unified Ticker & Auto-Submit Logic
  // This avoids "cascading renders" by triggering the mutation as an event inside the interval
  useEffect(() => {
    const ticker = setInterval(() => {
      const currentTime = Date.now();
      setNow(currentTime);

      if (quiz) {
        const startTime = new Date(`${quiz.date}T${quiz.time}:00`).getTime();
        const durationMs = 5 * 60 * 1000;
        const endTime = startTime + durationMs;

        // Trigger submission exactly when time hits zero
        if (currentTime >= endTime && !submitScoreMutation.isPending && !submitScoreMutation.isSuccess) {
          submitScoreMutation.mutate({ quizId, score });
        }
      }
    }, 1000);

    return () => clearInterval(ticker);
  }, [quiz, quizId, score, submitScoreMutation]);

  // 2. Automated Time Values for UI
  const { timeLeft, isEliminationMode } = useMemo(() => {
    if (!quiz) return { timeLeft: 300, isEliminationMode: false };
    const startTime = new Date(`${quiz.date}T${quiz.time}:00`).getTime();
    const endTime = startTime + (5 * 60 * 1000);
    const diff = Math.floor((endTime - now) / 1000);
    
    return {
      timeLeft: Math.max(0, diff),
      isEliminationMode: now >= endTime
    };
  }, [quiz, now]);

  const handleAnswer = (selected: string) => {
    // Block answers if time is up or we are already submitting
    if (isEliminationMode || feedback || submitScoreMutation.isPending || submitScoreMutation.isSuccess) return; 
    
    const isCorrect = selected === questions[currentIndex].correctAnswer;
    if (isCorrect) setScore(prev => prev + 10);
    setFeedback(isCorrect ? 'correct' : 'wrong');

    setTimeout(() => {
      setFeedback(null);
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
      }
    }, 600);
  };

  if (quizLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-emerald-500" /></div>;

  if (isEliminationMode) {
    return <EliminationArena quizId={quizId} userFinalScore={score} />;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col overflow-hidden font-sans">
      <div className="bg-[#00a884] p-4 text-white flex justify-between items-center shadow-xl z-10">
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-widest opacity-70">Mission Active</span>
          <span className="text-lg font-bold">Question {currentIndex + 1} <span className="opacity-50 text-sm">/ {questions.length}</span></span>
        </div>
        
        <div className={`flex items-center gap-3 px-5 py-2 rounded-full font-mono font-bold border-2 transition-all duration-500
          ${timeLeft < 60 ? 'bg-red-600 border-white animate-pulse scale-110' : 'bg-black/20 border-transparent'}`}>
          <Timer size={20} />
          <span className="text-xl">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
        </div>

        <div className="bg-white/10 px-4 py-1 rounded text-sm font-black tracking-tight">
          SCORE: {score}
        </div>
      </div>

      <div className="flex-1 p-6 flex flex-col items-center justify-center max-w-4xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full space-y-10"
          >
            <h2 className="text-3xl md:text-5xl font-black text-slate-800 text-center leading-tight tracking-tight">
              {questions[currentIndex]?.questionText}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                questions[currentIndex].correctAnswer,
                questions[currentIndex].wrongAnswer1,
                questions[currentIndex].wrongAnswer2,
                questions[currentIndex].wrongAnswer3,
              ].sort().map((opt, i) => {
                const isCorrectOpt = opt === questions[currentIndex].correctAnswer;
                const showCorrect = feedback && isCorrectOpt;
                
                return (
                  <Button
                    key={i}
                    disabled={!!feedback}
                    onClick={() => handleAnswer(opt)}
                    variant="outline"
                    className={`h-24 text-lg border-2 font-bold shadow-sm transition-all py-8 px-6 justify-start
                      ${showCorrect ? 'bg-green-500 border-green-600 text-white' : ''}
                      ${feedback === 'wrong' && !isCorrectOpt ? 'opacity-50' : ''}
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
          </motion.div>
        </AnimatePresence>
      </div>
      
      <div className="w-full h-2 bg-slate-100">
        <motion.div 
          className="h-full bg-[#00a884] shadow-[0_0_10px_rgba(0,168,132,0.5)]"
          initial={{ width: 0 }}
          animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>
    </div>
  );
};

const EliminationArena = ({ quizId, userFinalScore }: { quizId: string, userFinalScore: number }) => {
  const { data: participantList } = trpc.quiz.getLiveParticipants.useQuery({ quizId }, {
    refetchInterval: 3000 
  });
  
  const eliminateMutation = trpc.quiz.eliminateLowest.useMutation();

  useEffect(() => {
    const interval = setInterval(() => {
      if (participantList && participantList.length > 1 && !eliminateMutation.isPending) {
        eliminateMutation.mutate({ quizId });
      }
    }, 10000); 
    return () => clearInterval(interval);
  }, [participantList, quizId, eliminateMutation]);

  const isWinner = participantList?.length === 1;

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 overflow-hidden">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-lg space-y-8">
        <div className="text-center space-y-3">
          <Skull className="w-16 h-16 text-red-500 mx-auto animate-bounce" />
          <h2 className="text-4xl font-black text-white uppercase tracking-tighter italic">
            {isWinner ? "Sole Survivor" : "Elimination Loop"}
          </h2>
          <div className="flex flex-col items-center gap-2">
            <div className="px-4 py-1 bg-indigo-500/20 border border-indigo-500/40 rounded-full">
              <p className="text-indigo-300 font-mono text-[10px] uppercase font-bold tracking-widest">
                Your Final Score: {userFinalScore}
              </p>
            </div>
            <p className="text-red-400 font-mono text-[10px] uppercase font-bold tracking-[0.2em]">
              Combatants: {participantList?.length ?? 0}
            </p>
          </div>
        </div>

        <div className="space-y-3 relative">
          <AnimatePresence mode="popLayout">
            {participantList?.map((p, i) => (
              <motion.div 
                layout 
                key={p.clerkId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100, filter: "blur(10px)" }}
                className={`p-5 rounded-xl border-2 flex justify-between items-center transition-all duration-500
                  ${i === 0 && isWinner ? 'border-yellow-500 bg-yellow-500/10 shadow-[0_0_20px_rgba(234,179,8,0.2)]' : 'border-white/5 bg-white/5'}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs
                    ${i === 0 && isWinner ? 'bg-yellow-500 text-black' : 'bg-white/10 text-white'}`}>
                    {i + 1}
                  </div>
                  <span className="text-white font-bold tracking-tight">
                    {p.user?.firstName || `User_${p.clerkId.slice(-4)}`}
                  </span>
                </div>
                <span className={`font-black text-2xl ${i === 0 && isWinner ? 'text-yellow-500' : 'text-indigo-400'}`}>
                  {p.score}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {isWinner && (
          <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center pt-8">
            <Confetti numberOfPieces={400} recycle={false} gravity={0.2} />
            <Trophy className="w-24 h-24 text-yellow-500 mx-auto mb-6 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
            <Button size="lg" className="bg-yellow-500 hover:bg-yellow-400 text-black font-black rounded-full px-16 py-8 text-xl shadow-2xl transition-transform hover:scale-110">
              CLAIM CHAMPION PRIZE
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};