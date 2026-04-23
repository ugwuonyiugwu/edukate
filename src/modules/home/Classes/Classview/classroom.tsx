'use client';

import { useEffect, useState, useMemo } from 'react';
import { trpc } from "@/trpc/client";
import { 
  ChevronLeft, MessageSquare, 
  Play, BookOpen, Download, Timer, Trophy, HelpCircle 
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export const ClassroomView = ({ classId }: { classId: string }) => {
  const router = useRouter();
  const [ts, setTs] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTs(Date.now());
    }, 1000);

    const firstTick = requestAnimationFrame(() => {
      setTs(Date.now());
    });

    return () => {
      clearInterval(timer);
      cancelAnimationFrame(firstTick);
    };
  }, []);

  const [classData] = trpc.classes.getById.useSuspenseQuery({ id: classId });
  const [questions] = trpc.questions.getByClassId.useSuspenseQuery({ classId });

  const { countdownText, isExamWindow } = useMemo(() => {
    if (ts === 0 || !classData?.createdAt) {
      return { countdownText: "--d --h --m", isExamWindow: false };
    }
    
    const start = new Date(classData.createdAt).getTime();
    const cycleMs = (classData.examDelayDays || 0) * 86400000;
    
    if (cycleMs === 0) return { countdownText: "LIVE", isExamWindow: true };

    const elapsed = ts - start;
    const remaining = cycleMs - (elapsed % cycleMs);
    
    // Window opens 1 hour before the cycle ends
    const isWindow = remaining < 3600000; 

    if (isWindow) return { countdownText: "LIVE", isExamWindow: true };
    
    // NEW MATH: Calculating Days, Hours, and Minutes
    const d = Math.floor(remaining / 86400000);
    const h = Math.floor((remaining % 86400000) / 3600000);
    const m = Math.floor((remaining % 3600000) / 60000);
    
    return { 
      countdownText: `${d}d ${h}h ${m}m`, 
      isExamWindow: false 
    };
  }, [classData, ts]);

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden">
      <header className="h-16 border-b border-slate-100 flex items-center justify-between px-6 shrink-0 z-20 bg-white">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/classes')} className="p-2 hover:bg-slate-50 rounded-lg transition-all">
            <ChevronLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2">
               <span className="px-2 py-0.5 bg-slate-900 text-white text-[8px] font-black uppercase rounded-md tracking-tighter">{classData.level}</span>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{classData.subject}</p>
            </div>
            <h1 className="text-sm font-black uppercase leading-none mt-1">{classData.title}</h1>
          </div>
        </div>

        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${isExamWindow ? "bg-red-50 border-red-100 text-red-600 animate-pulse" : "bg-slate-50 border-slate-100 text-slate-400"}`}>
          <Timer size={14} />
          <span 
            suppressHydrationWarning 
            className="text-[10px] font-black tabular-nums"
          >
            {countdownText}
          </span>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden">
        {/* MEDIA VIEWER */}
        <section className="w-[65%] bg-slate-50 border-r border-slate-200 relative flex items-center justify-center p-12">
          {classData.youtubeUrl ? (
            <div className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-2xl bg-black">
               {classData.thumbnailUrl && <Image src={classData.thumbnailUrl} alt="Thumbnail" fill className="object-cover opacity-60" />}
               <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center shadow-2xl cursor-pointer">
                    <Play size={32} className="text-slate-900 ml-1" fill="currentColor" />
                  </div>
               </div>
            </div>
          ) : (
            <div className="relative flex flex-col items-center">
              <div className="relative w-64 h-80 bg-white shadow-2xl rounded-r-2xl border-l-[12px] border-slate-900 overflow-hidden transition-transform hover:rotate-[-2deg]">
                {classData.thumbnailUrl && <Image src={classData.thumbnailUrl} alt="Cover" fill className="object-cover opacity-40 mix-blend-multiply" />}
                <div className="relative p-8 h-full flex flex-col">
                  <BookOpen size={32} className="text-slate-900 mb-4" />
                  <div className="mt-auto">
                     <p className="text-[10px] font-black uppercase text-slate-400">Module Resource</p>
                     <h2 className="text-lg font-black text-slate-900">{classData.subject}</h2>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* SIDEBAR */}
        <section className="w-[35%] flex flex-col bg-white overflow-y-auto border-l border-slate-100 p-8">
          <div className="flex items-center gap-2 mb-8">
            <MessageSquare className="text-blue-600" size={18} />
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-900">Curriculum ({questions.length} Qs)</h2>
          </div>

          <div className="mb-10 p-6 rounded-[24px] bg-slate-50 border border-slate-100">
             <button onClick={() => router.push(`/classes/${classId}/practice`)} className="w-full py-3 bg-white border border-slate-200 rounded-xl font-black text-[10px] uppercase hover:border-blue-600 transition-all shadow-sm">Review Questions</button>
          </div>

          <div className={`p-6 rounded-[24px] border-2 transition-all ${isExamWindow ? "bg-red-50 border-red-200" : "bg-slate-50 border-slate-100 opacity-60"}`}>
             <button disabled={!isExamWindow} onClick={() => router.push(`/classes/${classId}/exam`)} className={`w-full py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${isExamWindow ? "bg-red-600 text-white hover:bg-red-700" : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}>
               {isExamWindow ? "Launch Final Exam" : "Access Restricted"}
             </button>
          </div>
        </section>
      </main>
    </div>
  );
};