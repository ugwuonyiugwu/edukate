// @/modules/home/Quizathon/components/RecentQuizCard.tsx
import React, { useState, useEffect } from 'react';

interface RecentQuizCardProps {
serverOffset: number;
  category: string;
  title: string;
  points: number;
  date: string; // Expected: "YYYY-MM-DD"
  time: string; // Expected: "HH:mm"
}

export function RecentQuizCard({ category, title, points, date, time }: RecentQuizCardProps) {
  const [timeLeft, setTimeLeft] = useState("00:00:00");
  const [isExpired, setIsExpired] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    // Combine date and time (e.g., "2024-05-20T14:30:00")
    const targetDate = new Date(`${date}T${time}:00`);
    const startTime = new Date().getTime(); // Used to calculate progress percentage
    const totalDuration = targetDate.getTime() - startTime;

    const calculateTime = () => {
      const now = new Date().getTime();
      const difference = targetDate.getTime() - now;

      if (difference <= 0) {
        setTimeLeft("00:00:00");
        setIsExpired(true);
        setProgress(0);
        return;
      }

      // Calculate HH:MM:SS
      const hours = Math.floor(difference / (1000 * 60 * 60));
      const mins = Math.floor((difference / (1000 * 60)) % 60);
      const secs = Math.floor((difference / 1000) % 60);

      const formatted = [
        hours.toString().padStart(2, '0'),
        mins.toString().padStart(2, '0'),
        secs.toString().padStart(2, '0')
      ].join(':');

      setTimeLeft(formatted);
      setIsExpired(false);

      // Simple progress calculation (optional)
      // If you want a fixed start, replace 'startTime' with the 'createdAt' timestamp from DB
      const currentProgress = Math.max(0, (difference / totalDuration) * 100);
      setProgress(currentProgress);
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);

    return () => clearInterval(timer);
  }, [date, time]);

  return (
    <div className={`rounded-sm border shadow-sm overflow-hidden transition-all ${isExpired ? 'bg-slate-50 border-slate-200 opacity-75' : 'bg-[#E3F2FD] border-blue-100'}`}>
      <div className="p-3">
        {/* Header Section */}
        <div className="text-center mb-2">
          <h3 className="font-bold text-slate-800 text-sm tracking-tight">{category}</h3>
          <p className="text-slate-500 font-semibold text-[10px] truncate uppercase">{title}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-1 border-t border-blue-200/50 pt-3">
          {/* Status Column */}
          <div className="flex flex-col items-center border-r border-blue-200/50">
            <span className="text-[7px] font-black text-slate-400 uppercase tracking-tighter mb-0.5">Status</span>
            <div className={`text-[10px] font-bold flex items-center gap-1 ${isExpired ? 'text-slate-500' : 'text-green-600'}`}>
              {isExpired ? 'EXPIRED' : 'ACTIVE'}
              {!isExpired && <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />}
            </div>
          </div>

          {/* Points Column */}
          <div className="flex flex-col items-center border-r border-blue-200/50">
            <span className="text-[7px] font-black text-slate-400 uppercase tracking-tighter mb-0.5">Reward</span>
            <div className="text-xs font-black text-slate-800 flex items-center gap-0.5">
              <span className="text-[10px]">💎</span> {points.toLocaleString()}
            </div>
          </div>

          {/* Countdown Column */}
          <div className="flex flex-col items-center">
            <span className="text-[7px] font-black text-slate-400 uppercase tracking-tighter mb-0.5">Closing</span>
            <div className={`text-[11px] font-black tabular-nums ${isExpired ? 'text-red-400' : 'text-slate-800'}`}>
              {timeLeft}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar Footer (Similar to your uploaded UI) */}
      {!isExpired && (
        <div className="h-1 w-full bg-blue-200/30">
          <div 
            className="h-full bg-green-500 transition-all duration-1000 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}