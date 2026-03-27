// @/modules/home/Quizzes/views/components/UserQuizCard.tsx
'use client';

import React from 'react';
import { Calendar, Clock, BookOpen, Coins, Trash2, Users, XCircle, Loader2, ShieldAlert } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { QuizData } from './types';
import { trpc } from "@/trpc/client";
import { toast } from "sonner";

interface UserQuizCardProps extends QuizData {
  onDelete: (id: string) => void;
  serverOffset: number;
}

export function UserQuizCard({ id, title, category, date, time, points, onDelete }: UserQuizCardProps) {
  const utils = trpc.useUtils();

  // 1. Fetch participants specifically for this quiz
  const { data: participants, isLoading: isLoadingParticipants } = trpc.quiz.getParticipants.useQuery({ 
    quizId: id 
  });

  // 2. Mutation to remove participant and refund points
  const removeParticipant = trpc.quiz.removeParticipant.useMutation({
    onSuccess: (data) => {
      toast.success(`User removed. ${data.refunded} points refunded to them.`, {
        style: { background: '#0B1221', color: '#FBB03B', border: '1px solid #FBB03B' }
      });
      // Invalidate the list so it updates immediately
      utils.quiz.getParticipants.invalidate({ quizId: id });
    },
    onError: (err) => toast.error(err.message),
  });

  const handleKick = (participantClerkId: string) => {
    if (window.confirm("Are you sure you want to remove this participant? Their entry points will be refunded.")) {
      removeParticipant.mutate({ quizId: id, participantClerkId });
    }
  };

  return (
    <Card className="overflow-hidden border-slate-200 shadow-sm bg-white group hover:border-blue-400 transition-all duration-300 flex flex-col h-full hover:shadow-xl relative">
      {/* HEADER SECTION */}
      <div className="h-32 bg-slate-50 border-b border-slate-100 relative p-6 flex flex-col justify-center overflow-hidden">
        <div className="bg-blue-600 text-white text-[9px] font-black px-2.5 py-1 rounded-full inline-block w-fit mb-2 z-10 tracking-widest uppercase">
          {category}
        </div>
        <h3 className="text-slate-800 text-lg font-black leading-tight z-10 group-hover:text-blue-700 transition-colors line-clamp-2">
          {title}
        </h3>
        <BookOpen className="absolute right-3.75 bottom-3.75 text-slate-200/40 group-hover:text-blue-500/10 group-hover:rotate-12 transition-all duration-500" size={80} />
      </div>

      <div className="p-5 flex flex-col flex-1 space-y-4">
        {/* TIME & COST INFO */}
        <div className="grid grid-cols-2 gap-3 border-b border-slate-50 pb-4">
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-wider">
             <Calendar size={14} className="text-blue-500"/> {date}
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-wider">
             <Clock size={14} className="text-blue-500"/> {time}
          </div>
          <div className="flex items-center gap-2 text-[11px] font-black text-slate-700 uppercase col-span-2 bg-orange-50 p-2 rounded-lg border border-orange-100">
             <Coins size={14} className="text-orange-500"/> Entry: {points} Points
          </div>
        </div>

        {/* PARTICIPANTS MANAGEMENT SECTION */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter flex items-center gap-1">
              <Users size={12} className="text-blue-500" /> Participants ({participants?.length || 0})
            </span>
          </div>

          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 custom-scrollbar min-h-[80px]">
            {isLoadingParticipants ? (
              <div className="flex justify-center py-6"><Loader2 className="animate-spin text-slate-200" size={20} /></div>
            ) : participants?.length ? (
              participants.map((p) => (
                <div key={p.clerkId} className="flex items-center justify-between bg-slate-50 border border-slate-100 p-2.5 rounded-lg group/item transition-all hover:bg-white hover:border-blue-200">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-slate-700 truncate max-w-[140px]">
                      {p.name}
                    </span>
                    <span className="text-[8px] text-slate-400 font-medium uppercase tracking-tighter">Joined {new Date(p.joinedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  
                  <button 
                    onClick={() => handleKick(p.clerkId)}
                    disabled={removeParticipant.isPending}
                    className="p-1.5 rounded-md text-slate-300 bg-blue-700 hover:text-red-500 hover:bg-red-50 transition-all"
                    title="Kick participant and refund points"
                  >
                    {removeParticipant.isPending ? (
                      <Loader2 className="animate-spin" size={14} />
                    ) : (
                      <XCircle size={16} />
                    )}
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-6 border-2 border-dashed border-slate-100 rounded-xl flex flex-col items-center justify-center">
                <Users size={20} className="text-slate-200 mb-1" />
                <p className="text-[10px] text-slate-400 font-bold italic">Waiting for entrants...</p>
              </div>
            )}
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1 border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600 text-xs font-black h-10 rounded-xl transition-all uppercase tracking-tight">
                Session Hub
            </Button>
            <Button 
                onClick={() => {
                  if(confirm("Permanently delete this quiz? All participants will be removed.")) {
                    onDelete(id);
                  }
                }}
                variant="outline" 
                className="w-12 border-red-100 text-red-400 hover:bg-red-50 hover:text-red-600 h-10 rounded-xl transition-all shadow-sm shadow-red-100/50"
            >
                <Trash2 size={16} />
            </Button>
        </div>
      </div>
    </Card>
  );
}