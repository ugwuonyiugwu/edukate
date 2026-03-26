// @/modules/home/Quizzes/views/QuizDetailsView.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { trpc } from "@/trpc/client";
import {
  Loader2, Users, Trophy,
  CheckCircle2, UploadCloud, PlayCircle,
  UserPlus, ChevronLeft, CalendarDays,
  ArrowRight, Trash2
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { toast } from "sonner";

// --- TYPES ---
type LucideIconElement = React.ReactElement<{ size?: number; className?: string }>;

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
  creatorId: string;
  participants: Participant[];
}

interface ActionStageProps {
  active: boolean;
  icon: LucideIconElement;
  label: string;
  desc: string;
  status: string;
  onClick?: () => void;
  isLoading?: boolean;
  isDone?: boolean;
}

export const QuizDetailsView = ({ quizId }: { quizId: string }) => {
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
    onSuccess: () => {
      toast.success("Participant removed from roster.");
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

  const isCreator = quiz?.creatorId === currentUser?.clerkId;

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
      {/* Top Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 md:pt-8 flex items-center justify-between">
        <Link href="/quizathon" className="group flex items-center gap-2 text-slate-500 font-bold text-[10px] md:text-xs uppercase tracking-widest transition-all hover:text-indigo-600">
          <div className="p-2 bg-white rounded-full shadow-sm group-hover:shadow-md transition-all">
            <ChevronLeft size={16} />
          </div>
          <span className="hidden sm:inline">Back to Terminal</span>
          <span className="sm:hidden">Back</span>
        </Link>
        <div className="flex items-center gap-2 text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Live System
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 mt-6 md:mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        {/* Left Column: Details & Actions */}
        <div className="lg:col-span-8 space-y-6 md:space-y-8">
          <div className="relative overflow-hidden bg-[#0F172A]  p-6 md:p-10 text-white shadow-2xl">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-linear-to-l from-indigo-500/10 to-transparent pointer-events-none" />
            
            <div className="relative z-10 space-y-4 md:space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">{quiz.category}</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-none text-white max-w-2xl">
                {quiz.title}
              </h1>

              <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 pt-2 md:pt-4">
                <div className="flex flex-col text-white">
                  <span className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Schedule</span>
                  <div className="flex items-center gap-2 text-xs md:text-sm font-bold">
                    <CalendarDays size={16} className="text-indigo-400" /> {quiz.date} — {quiz.time}
                  </div>
                </div>
                <div className="flex flex-col text-white">
                  <span className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Prize Pool</span>
                  <div className="flex items-center gap-2 text-xs md:text-sm font-bold">
                    <Trophy size={16} className="text-amber-400" /> {quiz.points.toLocaleString()} Points
                  </div>
                </div>
              </div>
            </div>

            {/* Countdown Section */}
            <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-white/5 flex flex-wrap items-center gap-3 md:gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl md:text-4xl font-black tabular-nums">{time.h}</span>
                  <span className="text-[10px] font-black text-indigo-400 uppercase">H</span>
                </div>
                <span className="text-xl md:text-2xl text-slate-700">:</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl md:text-4xl font-black tabular-nums">{time.m}</span>
                  <span className="text-[10px] font-black text-indigo-400 uppercase">M</span>
                </div>
                <span className="text-xl md:text-2xl text-slate-700">:</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl md:text-4xl font-black tabular-nums">{time.s}</span>
                  <span className="text-[10px] font-black text-indigo-400 uppercase">S</span>
                </div>
              </div>
              <div className="ml-auto text-[9px] md:text-[10px] font-black text-slate-400 bg-white/5 px-3 py-2 rounded-xl border border-white/5 uppercase text-center min-w-full sm:min-w-0">
                {currentMs === 0 ? "MISSION LIVE" : "T-MINUS UNTIL LAUNCH"}
              </div>
            </div>
          </div>

          {/* Action Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <ActionStage
              active={isJoinActive && !hasJoined}
              icon={<UserPlus />}
              label={hasJoined ? "Registered" : "Join"}
              desc={hasJoined ? "Entry secured" : "Reserve spot"}
              status={isJoinActive ? "Open" : "Closed"}
              onClick={() => joinMutation.mutate({ quizId })}
              isLoading={joinMutation.isPending}
              isDone={hasJoined}
            />
            <ActionStage
              active={isUploadActive}
              icon={<UploadCloud />}
              label="Submit Work"
              desc="Verify research"
              status={isUploadActive ? "Active" : "Locked"}
              onClick={() => toast.info("Opening secure portal...")}
            />
            <ActionStage
              active={isTakeQuizActive}
              icon={<PlayCircle />}
              label="Start Quiz"
              desc="Begin competition"
              status={isTakeQuizActive ? "Live" : "Standby"}
              onClick={() => toast.success("Redirecting...")}
            />
          </div>
        </div>

        {/* Right Column: Attendees */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-5 md:p-6 rounded-sm border-blue-500 shadow-sm bg-white h-full lg:min-h-[450px]">
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <h2 className="text-sm font-black uppercase tracking-tighter flex items-center gap-2 text-slate-800">
                <Users size={18} className="text-indigo-600" /> Attendees
              </h2>
              <div className="text-[9px] font-black text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
                {quiz.participants.length}/50 LIMIT
              </div>
            </div>

            <div className="space-y-4 max-h-[350px] lg:max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {quiz.participants.map((p) => (
                <div key={p.id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-black text-xs md:text-sm shrink-0">
                      {p.user?.firstName?.[0] || 'U'}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-black text-slate-700 truncate max-w-[120px] sm:max-w-none">
                        {p.user?.firstName} {p.user?.lastName} {p.clerkId === quiz.creatorId && "(Host)"}
                      </span>
                      <span className="text-[9px] font-bold text-green-500 uppercase flex items-center gap-1 italic">
                        <CheckCircle2 size={10} /> Verified
                      </span>
                    </div>
                  </div>
                  
                  {isCreator && p.clerkId !== currentUser?.clerkId && (
                    <button 
                      onClick={() => removeMutation.mutate({ quizId: quiz.id, participantClerkId: p.clerkId })}
                      className="opacity-100 lg:opacity-0 group-hover:opacity-100 p-2 hover:bg-red-50 text-red-500 rounded-lg transition-all shrink-0"
                      title="Remove participant"
                    >
                      {removeMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
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

function ActionStage({ active, icon, label, desc, status, onClick, isLoading, isDone }: ActionStageProps) {
  return (
    <button
      disabled={!active || isLoading}
      onClick={onClick}
      className={`group relative flex items-center gap-4 p-4 w-full rounded-sm transition-all border text-left ${
        isDone 
          ? 'bg-indigo-50 border-blue-700' 
          : active 
            ? 'bg-white border-blue-700 shadow-sm md:shadow-lg hover:-translate-y-1' 
            : 'bg-slate-50 border-transparent opacity-60 grayscale cursor-not-allowed'
      }`}
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all shrink-0 ${
        active || isDone ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-400'
      }`}>
        {isLoading ? <Loader2 size={18} className="animate-spin" /> : isDone ? <CheckCircle2 size={18} /> : React.cloneElement(icon, { size: 18 })}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className={`text-[11px] font-black uppercase tracking-tight ${active || isDone ? 'text-slate-800' : 'text-slate-400'}`}>{label}</h3>
        <p className="text-[10px] font-bold text-slate-400 truncate">{desc}</p>
      </div>
      {active && !isDone && <ArrowRight size={14} className="text-indigo-600 shrink-0" />}
    </button>
  );
}