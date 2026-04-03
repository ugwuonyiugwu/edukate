import React, { useEffect, useState } from 'react';
import { Trash2, ArrowRight, UserCheck, Crown } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { QuizData } from './types';
import Link from 'next/link';

interface UserQuizCardProps extends QuizData {
  onDelete: (id: string) => void;
  isJoined?: boolean; // New prop to differentiate status
  isCreator?: boolean; // New prop to show 'Host' badge
}

export function UserQuizCard({ 
  id, 
  title, 
  category, 
  points, 
  date, 
  time, 
  onDelete, 
  isJoined, 
  isCreator 
}: UserQuizCardProps) {

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
    <Card className={`relative overflow-hidden border-blue rounded-sm transition-all hover:shadow-md max-w-2xl w-full
      ${isCreator ? 'border-blue-200 bg-white' : 'bg-slate-100'}`}>
      
      {/* Role Badge (Top Right) */}
      <div className="absolute top-2 right-2">
        {isCreator ? (
          <div className="flex items-center gap-1 bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full border border-indigo-100">
            <Crown size={10} />
            <span className="text-[8px] font-black uppercase tracking-tighter">Host</span>
          </div>
        ) : isJoined ? (
          <div className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-100">
            <UserCheck size={10} />
            <span className="text-[8px] font-black uppercase tracking-tighter">Joined</span>
          </div>
        ) : null}
      </div>

      <div className="px-4 flex flex-col gap-4">
        {/* Header: Title & Category */}
        <div className="flex flex-col">
          <h3 className="text-slate-800 text-sm font-black uppercase tracking-tight truncate">
            {category}
          </h3>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-0.5">
            {title}
          </p>
        </div>

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

            {/* Only show Delete if the user is the creator */}
            {isCreator && (
              <Button 
                onClick={(e) => { 
                  e.preventDefault();
                  if(confirm("Permanently delete this mission?")) onDelete(id); 
                }}
                variant="outline" 
                className="h-9 w-9 p-0 border-red-100 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all"
              >
                <Trash2 size={15} />
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}