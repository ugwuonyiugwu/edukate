'use client';

import { useEffect, useState, useMemo } from 'react';
import { trpc } from "@/trpc/client";
import { 
  ChevronLeft, MessageSquare, 
  Play, BookOpen, Timer, Download, ExternalLink
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export const ClassroomView = ({ classId }: { classId: string }) => {
  const router = useRouter();
  const [ts, setTs] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTs(Date.now()), 1000);
    const firstTick = requestAnimationFrame(() => setTs(Date.now()));
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
    const isWindow = remaining < 3600000; 

    if (isWindow) return { countdownText: "LIVE", isExamWindow: true };
    
    const d = Math.floor(remaining / 86400000);
    const h = Math.floor((remaining % 86400000) / 3600000);
    const m = Math.floor((remaining % 3600000) / 60000);
    
    return { countdownText: `${d}d ${h}h ${m}m`, isExamWindow: false };
  }, [classData, ts]);

  return (
    <div className="flex flex-col min-h-screen lg:h-screen bg-white">
      {/* HEADER */}
      <header className="h-16 border-b border-slate-100 flex items-center justify-between px-4 md:px-6 shrink-0 z-20 bg-white sticky top-0">
        <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
          <button onClick={() => router.push('/classes')} className="p-2 hover:bg-slate-50 rounded-lg transition-all shrink-0">
            <ChevronLeft size={20} />
          </button>
          <div className="truncate">
            <div className="flex items-center gap-2">
               <span className="px-2 py-0.5 bg-slate-900 text-white text-[8px] font-black uppercase rounded-md tracking-tighter shrink-0">{classData.level}</span>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{classData.subject}</p>
            </div>
            <h1 className="text-xs md:text-sm font-black uppercase leading-none mt-1 truncate">{classData.title}</h1>
          </div>
        </div>

        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all shrink-0 ${isExamWindow ? "bg-red-50 border-red-100 text-red-600 animate-pulse" : "bg-slate-50 border-slate-100 text-slate-400"}`}>
          <Timer size={14} />
          <span suppressHydrationWarning className="text-[10px] font-black tabular-nums">{countdownText}</span>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex flex-col lg:flex-row flex-1 overflow-y-auto lg:overflow-hidden">
        
        {/* RESOURCE SECTION */}
        <section className="w-full lg:w-[65%] bg-slate-50 border-r border-slate-200 overflow-y-auto p-6 md:p-12">
          <div className="max-w-4xl mx-auto flex flex-col gap-8 items-center">
            
            {/* PDF Placeholder & Download Button */}
            <div className="w-full flex flex-col items-center py-10 bg-white rounded-3xl shadow-2xl border border-slate-100">
              <div className="relative w-48 h-64 md:w-56 md:h-72 bg-white shadow-2xl rounded-r-sm overflow-hidden transition-transform hover:rotate-2">
                {classData.thumbnailUrl && (
                  <Image src={classData.thumbnailUrl} alt="Cover" fill className="object-cover mix-blend-multiply" />
                )}
              </div>
              
              {/* Fix: Null coalescing to undefined for TS safety */}
              <a 
                href={classData.youtubeUrl ?? undefined} 
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-8 flex items-center gap-2 px-6 py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all shadow-lg active:scale-95"
              >
                <Download size={16} /> Download Material
              </a>
            </div>

            {/* Video Thumbnail Section - Size Reduced */}
            {classData.youtubeUrl && (
              <div className="flex flex-col gap-4 w-full max-w-md"> 
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                    <Play size={16} className="text-red-600" />
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Video Lecture</h3>
                  </div>
                  <ExternalLink size={14} className="text-slate-300" />
                </div>
                
                {/* Redirect Button with null check */}
                <button 
                  onClick={() => {
                    if (classData.youtubeUrl) window.open(classData.youtubeUrl, '_blank');
                  }}
                  className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-xl bg-black group transition-transform hover:scale-[1.02] active:scale-95"
                >
                   {classData.thumbnailUrl && (
                     <Image 
                       src={classData.thumbnailUrl} 
                       alt="Thumbnail" 
                       fill 
                       className="object-cover opacity-60 group-hover:opacity-40 transition-all duration-700" 
                     />
                   )}
                   <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/90 flex items-center justify-center shadow-2xl">
                        <Play size={24} className="text-slate-900 ml-1" fill="currentColor" />
                      </div>
                   </div>
                   <div className="absolute bottom-3 right-3 bg-black/60 px-2 py-1 rounded text-[8px] text-white font-bold backdrop-blur-sm">
                     WATCH ON YOUTUBE
                   </div>
                </button>
              </div>
            )}
          </div>
        </section>

        {/* SIDEBAR */}
        <section className="w-full lg:w-[35%] flex flex-col bg-white border-l border-slate-100 p-6 md:p-8 shrink-0">
          <div className="flex items-center gap-2 mb-8">
            <MessageSquare className="text-blue-600" size={18} />
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-900">Curriculum ({questions.length} Qs)</h2>
          </div>

          <div className="space-y-4">
            <div className="p-6 rounded-sm bg-slate-50 border border-slate-100">
               <p className="text-[10px] font-bold text-slate-400 uppercase mb-4 tracking-tighter">Self-Paced Learning</p>
               <button 
                 onClick={() => router.push(`/classes/${classId}/practice`)} 
                 className="w-full py-4 bg-white border border-slate-200 rounded-xl font-black text-[10px] uppercase hover:border-blue-600 transition-all shadow-sm active:scale-95"
               >
                 Review Questions
               </button>


               <div className={`p-6 rounded-sm border-2 transition-all ${isExamWindow ? "bg-red-50 border-red-200" : "bg-slate-50 border-slate-100 opacity-60"}`}>
               <p className="text-[10px] font-bold text-slate-400 uppercase mb-4 tracking-tighter">Certification Exam</p>
               <button 
                 disabled={!isExamWindow} 
                 onClick={() => router.push(`/classes/${classId}/exam`)} 
                 className={`w-full py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 ${isExamWindow ? "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-200" : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}
               >
                 {isExamWindow ? "Launch Final Exam" : "Access Restricted"}
               </button>
            </div>
            </div>

            
          </div>
        </section>
      </main>
    </div>
  );
};