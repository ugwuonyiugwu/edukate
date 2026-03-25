'use client';

import React, { useState } from 'react';
import { trpc } from "@/trpc/client"; 
import { UserQuizCard } from './components/UserQuizCard';
import { CreateQuizDialog } from './components/CreateQuizDialog';
import { BookOpen, FileText, Loader2 } from 'lucide-react';
import { toast } from "sonner";
import { Card } from '@/components/ui/card';

interface StatCardProps {
  label: string;
  value: number | string;
  color?: string;
}


export default function QuizDashboardView() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const utils = trpc.useUtils();

  const { data: quizzes, isLoading } = trpc.quiz.getMyQuizzes.useQuery();
  
  const createMutation = trpc.quiz.create.useMutation({
    onSuccess: () => {
      toast.success("Quiz launched successfully!");
      utils.quiz.getMyQuizzes.invalidate();
      setIsDialogOpen(false);
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = trpc.quiz.delete.useMutation({
    onSuccess: () => {
      toast.success("Quiz deleted.");
      utils.quiz.getMyQuizzes.invalidate();
    },
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      <div className="bg-[#0B1221] text-white p-6 md:p-10 mx-4 md:mx-8 mt-6 rounded-2xl shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-[#FBB03B]">Quiz Creator Studio</h1>
            <p className="text-slate-400 text-sm">Design challenges and monitor student entry.</p>
            <CreateQuizDialog 
              isOpen={isDialogOpen} 
              setIsOpen={setIsDialogOpen} 
              onSubmit={(data) => createMutation.mutate(data)}
              isPending={createMutation.isPending}
            />
          </div>
        </div>
      </div>


        <main className="max-w-7xl mx-auto px-4 md:px-8 mt-8 space-y-6">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* PERFORMANCE CARD */}
          <Card className="lg:col-span-2 p-6 rounded-sm border-slate-200 shadow-sm bg-white">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <h2 className="text-lg font-bold text-slate-700">Quiz Performance</h2>
              <div className="flex flex-wrap gap-4 text-[10px] font-bold uppercase text-slate-400">
                <span className="flex items-center gap-1"><div className="w-2 h-2 bg-green-600 "></div> Wins</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 bg-blue-600 "></div> Draws</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 bg-red-600"></div> Losses</span>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center py-10">
                <div className="text-center">
                    <p className="text-5xl font-black text-slate-800">0.0%</p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Win Rate</p>
                </div>
            </div>

            {/* Responsive Stats Grid: 2 cols on mobile, 4 on desktop */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
              <StatItem label="Pending" value="1" color="text-black" />
              <StatItem label="Wins" value="0" color="text-green-600" />
              <StatItem label="Draws" value="0" color="text-blue-600"/>
              <StatItem label="Losses" value="0" color="text-red-600"/>
            </div>
          </Card>

          {/* RECENT ACTIVITY */}
          <Card className="p-6 rounded-xl border-slate-200 shadow-sm bg-white relative">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-700">Recent Activity</h2>
            </div>
            
            <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
              <div className="w-16 h-20 bg-slate-100 rounded-lg flex items-center justify-center">
                <FileText className="text-slate-400" size={32} />
              </div>
              <div>
                <p className="font-bold text-slate-800">No recent plays</p>
                <p className="text-xs text-slate-400 max-w-50 mx-auto">When students take your quiz, their activity will show up here.</p>
              </div>
            </div>
          </Card>
        </div>

       
      </main>




      <main className="max-w-7xl mx-auto px-4 md:px-8 mt-12">
        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#5D5FEF]" size={40} /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {quizzes?.length ? quizzes.map((quiz) => (
              <UserQuizCard 
                key={quiz.id} 
                {...quiz} 
                onDelete={() => deleteMutation.mutate({ id: quiz.id })} 
              />
            )) : (
              <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
                <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />
                <p className="text-slate-400 font-bold">No quizzes created yet.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function StatItem({ label, value, color = "text-slate-800" }: StatCardProps) {
  return (
    <div className="bg-slate-50 border border-blue-100 p-4 rounded-lg text-center">
      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{label}</p>
      <p className={`text-xl font-black ${color}`}>{value}</p>
    </div>
  );
}