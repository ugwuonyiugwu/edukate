'use client';

import React, { useState, useMemo } from 'react';
import { trpc } from "@/trpc/client";
import { UserQuizCard } from './components/UserQuizCard';
import { CreateQuizDialog } from './components/CreateQuizDialog';
import { RecentQuizCard } from './components/RecentQuizCard';
import { PublicQuizCard } from './components/PublicQuizCard';
import { BookOpen, Loader2, History, ChevronLeft } from 'lucide-react';
import { toast } from "sonner";
import { Card } from '@/components/ui/card';
import Link from 'next/link';

// --- TYPES ---
interface Participant {
  clerkId: string;
}

interface Quiz {
  id: string;
  title: string;
  category: string;
  points: number;
  date: string;
  time: string;
  clerkId: string;
  participants?: Participant[]; 
}

interface StatCardProps {
  label: string;
  value: number | string;
  color?: string;
}

export const QuizDashboardView = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // FIX: Use a stable state for current time to satisfy "pure render" rules
  const [now] = useState(() => Date.now());
  
  const utils = trpc.useUtils();

  const { data: user } = trpc.users.getOne.useQuery();
  const { data: quizzes, isLoading: isQuizzesLoading } = trpc.quiz.getMyQuizzes.useQuery();
  const { data: allQuizzes, isLoading: isAllQuizzesLoading } = trpc.quiz.getAllQuizzes.useQuery();

  const { data: serverOffset = 0 } = trpc.quiz.getServerTime.useQuery(undefined, {
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    select: (data) => data.serverTime - Date.now()
  });

  // --- LOGIC: Filter Expired Quizzes from YOUR Library ---
  const expiredMissions = useMemo(() => {
    if (!quizzes) return [];
    
    return (quizzes as unknown as Quiz[]).filter((quiz) => {
      // Create a stable target time from the quiz date/time strings
      const targetTime = new Date(`${quiz.date}T${quiz.time}:00`).getTime();
      
      // Use the stable 'now' state instead of calling Date.now() inside the filter
      return now > targetTime; 
    });
  }, [quizzes, now]);

  const createMutation = trpc.quiz.create.useMutation({
    onSuccess: () => {
      toast.success("Quiz launched successfully!");
      utils.quiz.getMyQuizzes.invalidate();
      utils.quiz.getAllQuizzes.invalidate();
      utils.users.getOne.invalidate();
      setIsDialogOpen(false);
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = trpc.quiz.delete.useMutation({
    onSuccess: () => {
      toast.success("Quiz deleted.");
      utils.quiz.getMyQuizzes.invalidate();
      utils.quiz.getAllQuizzes.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-10 md:pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 md:pt-8 flex items-center justify-between">
        <Link href="/dashboard" className="group flex items-center gap-2 text-slate-500 font-bold text-[10px] md:text-xs uppercase tracking-widest transition-all hover:text-indigo-600">
          <div className="p-2 bg-white rounded-full shadow-sm group-hover:shadow-md transition-all">
            <ChevronLeft size={16} />
          </div>
          <span>Home</span>
        </Link>
      </div>

      <div className="bg-[#0B1221] text-white p-6 md:p-10 mx-4 lg:mx-8 mt-6 rounded-sm shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-black text-[#FBB03B]">Quiz Creator Studio</h1>
            <p className="text-slate-400 text-xs md:text-sm">Design challenges and monitor student entry.</p>
          </div>
          <div className="w-full sm:w-auto">
            <CreateQuizDialog
              isOpen={isDialogOpen}
              setIsOpen={setIsDialogOpen}
              onSubmit={(data) => createMutation.mutate(data)}
              isPending={createMutation.isPending}
              userPoints={user?.points ?? 0}
              serverOffset={serverOffset}
            />
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 lg:px-8 mt-8 space-y-10 md:space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-5 md:p-6 rounded-sm border-blue-400 shadow-sm bg-white">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <h2 className="text-lg font-bold text-slate-700">Performance Overview</h2>
            </div>
            <div className="flex flex-col items-center justify-center py-6 md:py-10">
              <div className="text-center">
                <p className="text-4xl md:text-5xl font-black text-slate-800">0.0%</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Win Rate</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
              <StatItem label="Available Pts" value={user?.points ?? 0} color="text-amber-500" />
              <StatItem label="Wins" value="0" color="text-green-600" />
              <StatItem label="Draws" value="0" color="text-blue-600" />
              <StatItem label="Losses" value="0" color="text-red-600" />
            </div>
          </Card>

          {/* SIDEBAR: MISSION HISTORY */}
          <Card className="p-4 rounded-sm border-blue-600 shadow-sm bg-white flex flex-col min-h-100 lg:h-112.5">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-lg font-black text-slate-700 tracking-tighter">Mission History</h2>
              <History size={16} className="text-slate-400" />
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
              {isQuizzesLoading ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-slate-300" /></div>
              ) : expiredMissions.length > 0 ? (
                expiredMissions.slice(0, 6).map((quiz) => (
                  <RecentQuizCard
                    id={quiz.id}
                    key={quiz.id}
                    category={quiz.category}
                    title={quiz.title}
                    points={quiz.points}
                    date={quiz.date}
                    time={quiz.time}
                  />
                ))
              ) : (
                <div className="text-center py-20 px-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No Past Missions Found</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* YOUR LIBRARY SECTION */}
        <section>
          <div className="flex items-center gap-3 mb-6 md:mb-8">
            <div className="h-6 md:h-8 w-1.5 bg-[#5D5FEF] rounded-full" />
            <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">Your Quiz Library</h2>
          </div>

          {isQuizzesLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-[#5D5FEF]" size={40} />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3 md:gap-4">
              {(quizzes as unknown as Quiz[] | undefined)?.length ? (quizzes as unknown as Quiz[]).map((quiz) => {
                const isCreator = quiz.clerkId === user?.clerkId;
                const isJoined = quiz.participants?.some((p) => p.clerkId === user?.clerkId) ?? false;

                return (
                  <UserQuizCard
                    key={quiz.id}
                    {...quiz}
                    isCreator={isCreator}
                    isJoined={isJoined}
                    serverOffset={serverOffset}
                    onDelete={() => deleteMutation.mutate({ id: quiz.id })}
                  />
                );
              }) : (
                <div className="col-span-full py-16 md:py-20 text-center bg-white rounded-2xl border-2 border-dashed border-slate-200">
                  <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />
                  <p className="text-slate-400 font-bold px-4">You haven&apos;t created or joined any quizzes yet.</p>
                </div>
              )}
            </div>
          )}
        </section>

        {/* EXPLORE SECTION */}
        <section className="pt-6 md:pt-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-6 md:h-8 w-1.5 bg-blue-600 rounded-full" />
            <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">Explore Live Quizzes</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3 md:gap-4">
            {isAllQuizzesLoading ? (
               <div className="col-span-full flex justify-center py-10"><Loader2 className="animate-spin text-blue-600" /></div>
            ) : allQuizzes?.map((quiz) => (
              <PublicQuizCard
                key={quiz.id}
                {...quiz}
                serverOffset={serverOffset}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

function StatItem({ label, value, color = "text-slate-800" }: StatCardProps) {
  return (
    <div className="bg-slate-50 border border-slate-100 p-3 md:p-4 rounded-xl text-center">
      <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase mb-1 tracking-wider truncate">{label}</p>
      <p className={`text-lg md:text-xl font-black ${color}`}>{value}</p>
    </div>
  );
}