// @/modules/home/Quizathon/components/RecentQuizCard.tsx
import React, { useState, useEffect } from 'react';
import { History } from 'lucide-react';
import Link from 'next/link';

interface RecentQuizCardProps {
  id: string;
  category: string;
  title: string;
  points: number;
  date: string; 
  time: string; 
}

export function RecentQuizCard({ category, title, points, date, time, id }: RecentQuizCardProps) {
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const targetDate = new Date(`${date}T${time}:00`).getTime();
    
    const checkStatus = () => {
      const now = new Date().getTime();
      // If now is greater than target, it's expired
      setIsExpired(now > targetDate);
    };

    checkStatus();
    // Check every minute instead of every second since it's already past
    const timer = setInterval(checkStatus, 60000); 
    return () => clearInterval(timer);
  }, [date, time]);

  // --- THE FLIP ---
  // If the quiz is NOT expired yet, don't render it here
  if (!isExpired) return null;

  return (
    <Link href={`/quizathon/${id}`}>
      <div className="rounded-sm border shadow-sm overflow-hidden transition-all bg-slate-50 border-slate-200 opacity-90 hover:opacity-100 group animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="p-3">
          {/* Header Section */}
          <div className="text-center mb-2">
            <div className="flex items-center justify-center gap-1 mb-1">
              <History size={10} className="text-slate-400" />
              <h3 className="font-bold text-slate-500 text-[10px] tracking-tight uppercase">Mission Concluded</h3>
            </div>
            <p className="text-slate-800 font-black text-xs truncate uppercase leading-tight">{title}</p>
            <span className="text-[9px] text-slate-400 font-bold">{category}</span>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-1 border-t border-slate-200 pt-3 mt-1">
            {/* Reward Column */}
            <div className="flex flex-col items-center border-r border-slate-200">
              <span className="text-[7px] font-black text-slate-400 uppercase tracking-tighter mb-0.5">Pool Share</span>
              <div className="text-xs font-black text-slate-700 flex items-center gap-0.5">
                <span className="text-[10px]">💎</span> {points.toLocaleString()}
              </div>
            </div>

            {/* Date Column */}
            <div className="flex flex-col items-center">
              <span className="text-[7px] font-black text-slate-400 uppercase tracking-tighter mb-0.5">Finished On</span>
              <div className="text-[9px] font-bold text-slate-600">
                {new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar replaced with a "Completed" indicator */}
        <div className="h-1 w-full bg-slate-200">
          <div className="h-full bg-slate-400 w-full" />
        </div>
      </div>
    </Link>
  );
}