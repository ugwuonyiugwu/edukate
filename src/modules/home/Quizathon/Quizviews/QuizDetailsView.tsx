// @/modules/home/Quizzes/views/QuizDetailsView.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { trpc } from "@/trpc/client";
import {
  Loader2, Users, Trophy,
  CheckCircle2, UploadCloud, PlayCircle,
  UserPlus, ChevronLeft, CalendarDays,
  ArrowRight,  XCircle, LucideIcon
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from "sonner";

// --- TYPES ---
interface ParticipantUser {
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
}

interface Participant {
  id: string;
  clerkId: string;
  user: ParticipantUser | null;
}

interface QuizData {
  id: string;
  title: string;
  category: string;
  date: string;
  time: string;
  points: number;
  clerkId: string; 
  participants: Participant[];
}

interface ActionStageProps {
  active: boolean;
  icon: LucideIcon; // Changed to LucideIcon type
  label: string;
  desc: string;
  status: string;
  onClick?: () => void;
  isLoading?: boolean;
  isDone?: boolean;
}

export const QuizDetailsView = ({ quizId }: { quizId: string }) => {

const router = useRouter(); // Add this line
  const [msLeft, setMsLeft] = useState<number | null>(null);
  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.quiz.getOne.useQuery({ id: quizId });
  const quiz = data as unknown as QuizData | undefined;
  const { data: currentUser } = trpc.users.getOne.useQuery();

  const joinMutation = trpc.quiz.join.useMutation({
    onSuccess: () => {
      toast.success("Mission Registered!");
      utils.quiz.getOne.invalidate({ id: quizId });
    },
    onError: (err) => toast.error(err.message)
  });

  const removeMutation = trpc.quiz.removeParticipant.useMutation({
    onSuccess: (res) => {
      toast.success(`Participant removed. ${res.refunded} points refunded.`);
      utils.quiz.getOne.invalidate({ id: quizId });
    },
    onError: (err) => toast.error(err.message)
  });

  useEffect(() => {
    if (!quiz) return;
    const target = new Date(`${quiz.date}T${quiz.time}:00`).getTime();
    const calculate = () => setMsLeft(Math.max(0, target - new Date().getTime()));
    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [quiz]);

  const hasJoined = useMemo(() => {
    return quiz?.participants.some(p => p.clerkId === currentUser?.clerkId) ?? false;
  }, [quiz, currentUser]);

  const isCreator = quiz?.clerkId === currentUser?.clerkId;

  if (isLoading) return (
    <div className="flex h-screen flex-col items-center justify-center bg-[#FDFDFD] p-4 text-center">
      <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
      <span className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">Synchronizing...</span>
    </div>
  );

  if (!quiz) return <div className="p-10 md:p-20 text-center font-bold text-slate-500">Quiz not found.</div>;

  const hourInMs = 60 * 60 * 1000;
  const twoMinsInMs = 2 * 60 * 1000;
  const currentMs = msLeft ?? 0;
  const isJoinActive = currentMs > hourInMs;
  const isUploadActive = hasJoined && currentMs <= hourInMs && currentMs > twoMinsInMs;
  const isTakeQuizActive = hasJoined && currentMs === 0;

  const formatCountdown = (ms: number) => {
    const h = Math.floor(ms / 3600000).toString().padStart(2, '0');
    const m = Math.floor((ms / 60000) % 60).toString().padStart(2, '0');
    const s = Math.floor((ms / 1000) % 60).toString().padStart(2, '0');
    return { h, m, s };
  };

  const time = formatCountdown(currentMs);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-10 md:pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 md:pt-8 flex items-center justify-between">
        <Link href="/quizathon" className="group flex items-center gap-2 text-slate-500 font-bold text-[10px] md:text-xs uppercase tracking-widest transition-all hover:text-indigo-600">
          <div className="p-2 bg-white rounded-full shadow-sm group-hover:shadow-md transition-all">
            <ChevronLeft size={16} />
          </div>
          <span>Back to Terminal</span>
        </Link>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 mt-6 md:mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <div className="relative overflow-hidden bg-[#0F172A] p-6 md:p-10 text-white shadow-2xl rounded-sm">
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-none mb-6">
              {quiz.title}
            </h1>
            <div className="flex flex-wrap gap-8">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Schedule</span>
                <div className="flex items-center gap-2 text-sm font-bold">
                  <CalendarDays size={16} className="text-indigo-400" /> {quiz.date} — {quiz.time}
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Prize Pool</span>
                <div className="flex items-center gap-2 text-sm font-bold">
                  <Trophy size={16} className="text-amber-400" /> {quiz.points.toLocaleString()} Points
                </div>
              </div>
            </div>
            {/* Countdown Display */}
            <div className="mt-10 pt-6 border-t border-white/5 flex items-center gap-4">
              <span className="text-4xl font-black tabular-nums">{time.h}:{time.m}:{time.s}</span>
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Until Launch</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ActionStage
              active={isJoinActive && !hasJoined}
              icon={UserPlus} // Passed as component
              label={hasJoined ? "Registered" : "Join"}
              desc={hasJoined ? "Entry secured" : "Reserve spot"}
              status={isJoinActive ? "Open" : "Closed"}
              onClick={() => joinMutation.mutate({ quizId })}
              isLoading={joinMutation.isPending}
              isDone={hasJoined}
            />
            <ActionStage
              active={isUploadActive}
              icon={UploadCloud}
              label="Submit Work"
              desc="Verify research"
              status={isUploadActive ? "Active" : "Locked"}
              // UPDATE THIS LINE BELOW
              onClick={() => router.push(`/quizathon/${quizId}/submit`)}
            />
            <ActionStage
              active={isTakeQuizActive}
              icon={PlayCircle}
              label="Start Quiz"
              desc="Begin competition"
              status={isTakeQuizActive ? "Live" : "Standby"}
              onClick={() => router.push(`/quizathon/${quizId}/questions`)}
            />
          </div>
        </div>

        {/* ATTENDEES COLUMN */}
        <div className="lg:col-span-4">
          <Card className="p-6 rounded-sm border-blue-500 bg-white h-full flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-sm font-black uppercase tracking-tighter flex items-center gap-2">
                <Users size={18} className="text-indigo-600" /> Attendees
              </h2>
              <span className="text-[10px] font-black text-slate-400">{quiz.participants.length}/50</span>
            </div>

            <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {quiz.participants.map((p) => (
                <div key={p.clerkId} className="flex items-center justify-between group p-2 bg-slate-50/50 rounded-lg hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-xs">
                      {p.user?.firstName?.[0] || 'U'}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-slate-700 truncate max-w-[120px]">
                        {p.user?.firstName} {p.user?.lastName}
                      </span>
                      {p.clerkId === quiz.clerkId ? (
                        <span className="text-[8px] font-black text-indigo-600 uppercase">Host</span>
                      ) : (
                        <span className="text-[9px] font-bold text-green-500 uppercase flex items-center gap-1 italic">
                          <CheckCircle2 size={10} /> Verified
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {isCreator && p.clerkId !== currentUser?.clerkId && (
                    <button 
                      onClick={() => {
                        if(confirm(`Remove ${p.user?.firstName} and refund points?`)) {
                          removeMutation.mutate({ quizId: quiz.id, participantClerkId: p.clerkId });
                        }
                      }}
                      className="p-2 hover:bg-red-50 text-red-400 hover:text-red-600 rounded-lg transition-all"
                      disabled={removeMutation.isPending}
                    >
                      {removeMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={16} />}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

function ActionStage({ active, icon: Icon, label, desc, onClick, isLoading, isDone }: ActionStageProps) {
  return (
    <button
      disabled={!active || isLoading}
      onClick={onClick}
      className={`group relative flex items-center gap-4 p-4 w-full rounded-sm transition-all border text-left ${
        isDone ? 'bg-indigo-50 border-indigo-200' : active ? 'bg-white border-blue-700 shadow-lg' : 'bg-slate-50 opacity-60'
      }`}
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all shrink-0 ${
        active || isDone ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-400'
      }`}>
        {isLoading ? <Loader2 size={18} className="animate-spin" /> : isDone ? <CheckCircle2 size={18} /> : <Icon size={18} />}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className={`text-[11px] font-black uppercase tracking-tight ${active || isDone ? 'text-slate-800' : 'text-slate-400'}`}>{label}</h3>
        <p className="text-[10px] font-bold text-slate-400 truncate">{desc}</p>
      </div>
      {active && !isDone && <ArrowRight size={14} className="text-indigo-600 shrink-0" />}
    </button>
  );
}