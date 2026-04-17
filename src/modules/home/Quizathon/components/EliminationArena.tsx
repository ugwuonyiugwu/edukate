'use client';

import React, { useEffect } from 'react';
import { trpc } from "@/trpc/client";
import { useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import { Skull, Trophy, Loader2 } from 'lucide-react';

export const EliminationArena = ({ 
  quizId, 
  userFinalScore, 
  children 
}: { 
  quizId: string, 
  userFinalScore: number, 
  children: React.ReactNode 
}) => {
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

  const wasEliminated = participants && !participants.find(p => p.clerkId === user?.id);
  const isWinner = participants?.length === 1 && participants[0].clerkId === user?.id;

  if (isLoading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><Loader2 className="animate-spin text-white" /></div>;

  return (
    <div className="relative min-h-screen bg-slate-950 overflow-hidden">
      {/* Background Game UI - Blurs if you are out */}
      <div className={`transition-all duration-1000 ${wasEliminated ? 'blur-2xl grayscale pointer-events-none' : 'opacity-100'}`}>
        {children}
      </div>

      {/* Floating Leaderboard Sidebar */}
      <div className="fixed top-24 right-6 w-72 z-50 pointer-events-none hidden lg:block">
        <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl p-4 pointer-events-auto">
          <div className="flex items-center justify-between mb-4 px-1">
            <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-2">
              <Skull size={12}/> Live Purge
            </span>
            <span className="text-[10px] font-bold text-white/40">{participants?.length} Survivors</span>
          </div>
          
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {participants?.map((p, i) => {
                const isMe = p.clerkId === user?.id;
                return (
                  <motion.div 
                    layout key={p.clerkId} 
                    initial={{ opacity: 0, x: 20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    exit={{ opacity: 0, x: -20 }}
                    className={`p-3 rounded-lg border flex justify-between items-center transition-all 
                      ${isMe ? 'border-indigo-500 bg-indigo-500/20' : 'border-white/5 bg-white/5'}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-[9px] font-bold text-white/30">{i+1}</span>
                      <span className={`text-xs font-bold truncate w-32 ${isMe ? 'text-white' : 'text-slate-400'}`}>
                        {p.user?.firstName || "Anonymous"}
                      </span>
                    </div>
                    <span className="text-xs font-black text-indigo-400">{p.score}</span>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Full Screen Elimination Overlay */}
      <AnimatePresence>
        {wasEliminated && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="fixed inset-0 z-60 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center"
          >
            <Skull className="w-24 h-24 text-rose-600 mb-6 animate-pulse" />
            <h2 className="text-6xl font-black text-white uppercase italic tracking-tighter mb-2">Eliminated</h2>
            <p className="text-slate-500 font-mono text-sm tracking-widest uppercase">Your Data Has Been Purged</p>
            <div className="mt-8 px-6 py-2 bg-white/5 border border-white/10 rounded-full text-indigo-400 font-bold">
              FINAL SCORE: {userFinalScore}
            </div>
          </motion.div>
        )}

        {isWinner && (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="fixed inset-0 z-60 bg-indigo-600/20 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center"
          >
            <Trophy className="w-32 h-32 text-yellow-500 mb-6 animate-bounce" />
            <h2 className="text-7xl font-black text-white uppercase italic tracking-tighter">Champion</h2>
            <p className="text-white/80 font-bold tracking-[0.3em] uppercase mt-2">Sole Survivor</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};