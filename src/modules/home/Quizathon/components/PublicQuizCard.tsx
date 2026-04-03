// @/modules/home/Quizzes/components/PublicQuizCard.tsx
import React, { useEffect, useState } from 'react';
import { ArrowRight, Globe } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from 'next/link';

interface PublicQuizCardProps {
  id: string;
  category: string;
  title: string;
  points: number;
  date: string;
  time: string;
  serverOffset: number;
}

export function PublicQuizCard({ id, title, category, points, date, time }: PublicQuizCardProps) {
  const [timeLeft, setTimeLeft] = useState<string>("00:00:00");

  useEffect(() => {
    const targetDate = new Date(`${date}T${time}`).getTime();
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance <= 0) {
        clearInterval(timer);
        setTimeLeft("00:00:00");
        return;
      }

      const h = Math.floor((distance / (1000 * 60 * 60)));
      const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((distance % (1000 * 60)) / 1000);
      setTimeLeft(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(timer);
  }, [date, time]);

  return (
    <Card className="bg-blue-200 border-blue-600 rounded-sm overflow-hidden shadow-sm w-full transition-all hover:border-indigo-400 group">
      <div className="px-4 flex flex-col gap-4">
        
        {/* Header: Title & Category */}
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <h3 className="text-slate-700 text-sm font-black uppercase tracking-tight group-hover:text-indigo-600 transition-colors">
              {category}
            </h3>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">
              {title}
            </p>
          </div>
          <div className="p-2 bg-slate-50 rounded-lg">
            <Globe size={16} className="text-slate-300" />
          </div>
        </div>

        {/* Stats Bar (Matching UserQuizCard exactly) */}
         <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Center: Stats Bar */}
            <div className="flex items-center bg-white rounded-lg px-4 py-2 border border-slate-100 space-x-5 shadow-sm">
              <div className="text-center min-w-12.5">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Status</p>
                <p className={`text-[10px] font-bold uppercase ${timeLeft === "00:00:00" ? "text-slate-400" : "text-indigo-500"}`}>
                  {timeLeft === "00:00:00" ? "Expired" : "Active"}
                </p>
              </div>
              
              <div className="w-1 h-6 bg-slate-100" />
              
              <div className="text-center">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Reward</p>
                <div className="flex items-center gap-1 justify-center">
                  <span className="text-[10px]">💎</span>
                  <span className="text-slate-700 text-xs font-bold">{points}</span>
                </div>
              </div>
  
              <div className="w-1 h-6 bg-slate-100" />
  
              <div className="text-center">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">T-Minus</p>
                <p className={`text-xs font-bold font-mono ${timeLeft === "00:00:00" ? 'text-slate-300' : 'text-red-500'}`}>
                  {timeLeft}
                </p>
              </div>
            </div>
  
            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              <Link href={`/quizathon/${id}`} className="flex-1">
                <Button variant="outline" className="h-9 px-4 border-slate-200 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 text-[11px] font-black uppercase rounded-lg transition-all gap-2">
                  View <ArrowRight size={14} />
                </Button>
              </Link>
            </div>
          </div>
      </div>
    </Card>
  );
}