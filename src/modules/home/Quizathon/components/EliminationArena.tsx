import React, { useEffect } from 'react';
import { trpc } from "@/trpc/client";
import { useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Skull, Trophy, XCircle, Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';

const Confetti = dynamic(() => import('react-confetti'), { ssr: false });

export const EliminationArena = ({ quizId, userFinalScore }: { quizId: string, userFinalScore: number }) => {
  const { user } = useUser();
  const { data: participants, isLoading } = trpc.quiz.getLiveParticipants.useQuery({ quizId }, {
    refetchInterval: 2000 
  });
  
  const eliminateMutation = trpc.quiz.eliminateLowest.useMutation();

  useEffect(() => {
    const interval = setInterval(() => {
      if (participants && participants.length > 1 && !eliminateMutation.isPending) {
        eliminateMutation.mutate({ quizId });
      }
    }, 8000); 
    return () => clearInterval(interval);
  }, [participants, quizId, eliminateMutation]);

  const isGameOver = participants?.length === 1;
  const isWinner = isGameOver && participants[0].clerkId === user?.id;
  const wasEliminated = participants && !participants.find(p => p.clerkId === user?.id);

  if (isLoading) return <div className="min-h-screen bg-[#020617] flex items-center justify-center"><Loader2 className="animate-spin text-white" /></div>;

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 overflow-hidden text-white">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-lg space-y-8">
        
        {/* Header Section */}
        <div className="text-center space-y-3">
          {isWinner ? (
             <Trophy className="w-20 h-20 text-yellow-500 mx-auto animate-bounce" />
          ) : wasEliminated ? (
             <XCircle className="w-20 h-20 text-red-600 mx-auto opacity-70" />
          ) : (
             <Skull className="w-16 h-16 text-red-500 mx-auto animate-pulse" />
          )}
          <h2 className="text-4xl font-black uppercase tracking-tighter italic">
            {isWinner ? "Champion" : wasEliminated ? "Purged" : "Elimination Loop"}
          </h2>
          <div className="px-4 py-1 bg-white/10 rounded-full inline-block font-mono text-[10px]">
            YOUR SCORE: {userFinalScore} | SURVIVORS: {participants?.length}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {participants?.map((p, i) => {
              const isMe = p.clerkId === user?.id;
              return (
                <motion.div 
                  layout key={p.clerkId} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -50 }}
                  className={`p-5 rounded-xl border-2 flex justify-between items-center transition-all 
                    ${isMe ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/5 bg-white/5'}
                    ${isGameOver && i === 0 ? 'border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.3)]' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <span className="w-6 h-6 rounded bg-white/10 flex items-center justify-center text-[10px] font-bold">{i+1}</span>
                    <span className="font-bold">{p.user?.firstName || "Anonymous"} {isMe && "(You)"}</span>
                  </div>
                  <span className="font-black text-xl text-indigo-400">{p.score}</span>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        {isWinner && (
          <div className="text-center pt-4">
            <Confetti numberOfPieces={300} recycle={false} />
            <Button size="lg" className="bg-yellow-500 text-black font-black w-full rounded-full py-8 text-xl hover:scale-105 transition-transform">
              CLAIM PRIZE
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
};