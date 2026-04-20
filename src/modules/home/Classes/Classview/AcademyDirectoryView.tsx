'use client';

import { useEffect, useState, useMemo } from 'react';
import { trpc } from "@/trpc/client";
import { ArrowRight, Gem, Play, Timer } from "lucide-react";
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
  clerkId: string;
  description: string | null;
  pdfUrl: string | null;
  youtubeUrl: string | null;
}

interface DirectoryClassCardProps {
  c: ClassData;
  onJoin: (id: string) => void;
  isPending: boolean;
  mounted: boolean;
  currentTimestamp: number; // Renamed for clarity
}

const DirectoryClassCard = ({ c, onJoin, isPending, mounted, currentTimestamp }: DirectoryClassCardProps) => {
  const countdownText = useMemo(() => {
    // We use currentTimestamp (passed from parent) instead of calling Date.now() here
    if (!mounted || !c.createdAt || currentTimestamp === 0) return `${c.examDelayDays} DAY DELAY`;

    const start = new Date(c.createdAt).getTime();
    const delayInMs = (c.examDelayDays || 0) * 24 * 60 * 60 * 1000;
    const unlockTime = start + delayInMs;
    const diff = unlockTime - currentTimestamp;

    if (diff <= 0) return "READY TO UNLOCK";

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);

    return `${d}d ${h}h ${m}m ${s}s`;
  }, [mounted, c.createdAt, c.examDelayDays, currentTimestamp]); 

  return (
    <div className="group cursor-pointer">
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-slate-200 mb-4 shadow-sm group-hover:shadow-xl transition-all duration-300 border border-slate-100">
        {c.thumbnailUrl ? (
          <Image 
            src={c.thumbnailUrl} 
            alt={c.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-900">
            <Play className="text-white/20" size={48} />
          </div>
        )}
        
        <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 tabular-nums">
          <Timer size={12} className="text-blue-400" />
          {countdownText}
        </div>
      </div>

      <div className="flex gap-4">
        

        <div className="flex-1 min-w-0">
          <h3 className="text-base font-black text-slate-900 leading-tight mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {c.title}
          </h3>
          
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                {c.subject}
              </p>
              <span className="text-slate-300">•</span>
              <div className="flex items-center gap-1 text-blue-600">
                <Gem size={10} />
                <span className="text-[11px] font-black">{c.pointsRequired}</span>
              </div>
            </div>
          </div>

          <button 
            onClick={() => onJoin(c.id)}
            disabled={isPending}
            className="mt-5 w-full py-3 bg-white hover:bg-slate-900 hover:text-white text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all border-2 border-slate-900/5 hover:border-slate-900 disabled:opacity-50 shadow-sm"
          >
            {isPending ? "Validating..." : "Unlock Session"} 
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export const AcademyDirectoryView = ({ selectedLevel }: { selectedLevel: string }) => {
  const [mounted, setMounted] = useState(false);
  const [ts, setTs] = useState(0);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setMounted(true);
    });

    const timer = setInterval(() => {
      setTs(Date.now());
    }, 1000);

    return () => {
      cancelAnimationFrame(frame);
      clearInterval(timer);
    };
  }, []);

  const [classes] = trpc.classes.getAll.useSuspenseQuery({ level: selectedLevel });
  const utils = trpc.useUtils();

  const joinMutation = trpc.classes.joinClass.useMutation({
    onSuccess: () => {
      toast.success("Enrollment confirmed!");
      utils.users.getOne.invalidate(); 
    },
    onError: (err) => toast.error(err.message)
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-12">
        <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mb-2">
          {selectedLevel} Registry
        </p>
        <h1 className="text-5xl font-black italic uppercase tracking-tighter text-slate-900">
          Available <span className="text-blue-600">Sessions</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
        {classes.map((c) => (
          <DirectoryClassCard 
            key={c.id} 
            c={c as unknown as ClassData} 
            mounted={mounted}
            currentTimestamp={ts}
            onJoin={(id) => joinMutation.mutate({ classId: id })}
            isPending={joinMutation.isPending}
          />
        ))}
      </div>
    </div>
  );
};