'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from "next/navigation";
import { trpc } from "@/trpc/client";
import { ArrowRight, Gem, Play, Timer, Lock, Unlock, Search, X } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

interface ClassData {
  id: string;
  title: string;
  subject: string;
  level: string;
  examDelayDays: number;
  pointsRequired: number;
  thumbnailUrl?: string | null;
  createdAt: Date | string | null;
}

interface DirectoryClassCardProps {
  c: ClassData;
  onJoin: (id: string) => void;
  isPending: boolean;
  currentTimestamp: number;
  isEnrolled: boolean;
  onMouseEnter: () => void;
}

const DirectoryClassCard = ({ 
  c, 
  onJoin, 
  isPending, 
  currentTimestamp, 
  isEnrolled,
  onMouseEnter 
}: DirectoryClassCardProps) => {
  const router = useRouter();
  
  const countdownText = useMemo(() => {
    if (currentTimestamp === 0 || !c.createdAt) {
      return `${c.examDelayDays}d Cycle`;
    }
    
    const start = new Date(c.createdAt).getTime();
    const cycleMs = c.examDelayDays * 86400000;
    const timePassed = currentTimestamp - start;
    const remainingInCycle = cycleMs - (timePassed % cycleMs);
    
    const d = Math.floor(remainingInCycle / 86400000);
    const h = Math.floor((remainingInCycle % 86400000) / 3600000);
    const m = Math.floor((remainingInCycle % 3600000) / 60000);
    const s = Math.floor((remainingInCycle % 60000) / 1000);
    
    return `${d}d ${h}h ${m}m ${s}s`;
  }, [c.createdAt, c.examDelayDays, currentTimestamp]);

  const handleButtonClick = () => {
    if (isEnrolled) {
      router.push(`/classes/${c.id}`);
    } else {
      onJoin(c.id);
    }
  };

  return (
    <div className="group cursor-pointer" onMouseEnter={onMouseEnter}>
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-slate-200 mb-4 shadow-sm group-hover:shadow-xl transition-all duration-300 border border-slate-100">
        {c.thumbnailUrl ? (
          <Image 
            src={c.thumbnailUrl} 
            alt={c.title} 
            fill 
            className="object-cover transition-transform duration-500 group-hover:scale-105" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-900"><Play className="text-white/20" size={48} /></div>
        )}
        
        <div className="absolute bottom-3 right-3 backdrop-blur-md bg-black/80 text-white text-[10px] font-black px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 tabular-nums z-10">
          <Timer size={12} className="text-blue-400" />
          {countdownText}
        </div>
      </div>

      <div className="flex gap-4">
        <div className="px-4 flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-base font-black text-slate-900 leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
              {c.title}
            </h3>
            <div className={`shrink-0 mt-1 ${isEnrolled ? "text-green-500" : "text-slate-300"}`}>
              {isEnrolled ? <Unlock size={26} strokeWidth={3} /> : <Lock size={26} strokeWidth={3} />}
            </div>
          </div>
          
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{c.subject}</p>
              <span className="text-slate-300">•</span>
              <div className="flex items-center gap-1 text-blue-600">
                <Gem size={10} />
                <span className="text-[11px] font-black">{c.pointsRequired}</span>
              </div>
            </div>
          </div>

          <button 
            onClick={handleButtonClick}
            disabled={isPending} 
            className={`mt-5 w-full py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all border-2 ${
              isEnrolled 
              ? "bg-slate-900 border-slate-900 text-white hover:bg-slate-800" 
              : "bg-white border-slate-900/5 hover:border-slate-900 hover:bg-slate-900 hover:text-white text-slate-900 shadow-sm"
            }`}
          >
            {isPending ? "Validating..." : isEnrolled ? "Enter Classroom" : "Unlock Session"} 
            {!isPending && (isEnrolled ? <Play size={14} fill="currentColor" /> : <ArrowRight size={14} />)}
          </button>
        </div>
      </div>
    </div>
  );
};

export const AcademyDirectoryView = ({ selectedLevel }: { selectedLevel: string }) => {
  const router = useRouter();
  const [ts, setTs] = useState(0); 
  const [activeSubject, setActiveSubject] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const frame = requestAnimationFrame(() => setTs(Date.now()));
    const timer = setInterval(() => setTs(Date.now()), 1000);
    return () => { clearInterval(timer); cancelAnimationFrame(frame); };
  }, [selectedLevel]);

  const utils = trpc.useUtils();
  const [classes] = trpc.classes.getAll.useSuspenseQuery({ level: selectedLevel });
  const { data: userEnrollments } = trpc.classes.getEnrolledClassIds.useQuery();

  const subjects = useMemo(() => {
    const unique = Array.from(new Set(classes.map(c => c.subject)));
    return ["All", ...unique];
  }, [classes]);

  const filteredClasses = useMemo(() => {
    return classes.filter(c => {
      const matchesSubject = activeSubject === "All" || c.subject === activeSubject;
      const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSubject && matchesSearch;
    });
  }, [classes, activeSubject, searchQuery]);

  const joinMutation = trpc.classes.joinClass.useMutation({
    onSuccess: (_, variables) => {
      toast.success("Access Granted!");
      utils.classes.getAll.invalidate();
      utils.classes.getEnrolledClassIds.invalidate();
      router.push(`/classes/${variables.classId}`);
    },
    onError: (err) => toast.error(err.message)
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Search Bar */}
      <div className="mb-5 relative lg:mx-47">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-12 pl-14 pr-12 rounded-2xl bg-slate-50 border border-blue-600 lg:w-xl  focus:bg-white focus:border-slate-900 transition-all outline-none font-bold text-slate-800 placeholder:text-slate-400 placeholder:font-medium"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery("")} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-900 transition-colors">
            <X size={20} />
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md py-4 mb-8 border-b border-slate-100 -mx-6 px-6 overflow-x-auto no-scrollbar flex gap-3">
          {subjects.map((subject) => (
            <button
              key={subject}
              onClick={() => setActiveSubject(subject)}
              className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${
                activeSubject === subject 
                ? "bg-slate-900 text-white border-slate-900 shadow-md" 
                : "bg-white text-slate-400 border-slate-100 hover:border-slate-300 hover:text-slate-600"
              }`}
            >
              {subject}
            </button>
          ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
        {filteredClasses.map((c) => {
          const isEnrolled = userEnrollments?.includes(c.id) ?? false;
          const isThisCardLoading = joinMutation.isPending && joinMutation.variables?.classId === c.id;

          return (
            <DirectoryClassCard 
              key={`${selectedLevel}-${c.id}`} 
              c={c as unknown as ClassData} 
              currentTimestamp={ts}
              isEnrolled={isEnrolled}
              onMouseEnter={() => utils.classes.getById.prefetch({ id: c.id })}
              onJoin={(id) => joinMutation.mutate({ classId: id })}
              isPending={isThisCardLoading}
            />
          );
        })}
      </div>
    </div>
  );
};