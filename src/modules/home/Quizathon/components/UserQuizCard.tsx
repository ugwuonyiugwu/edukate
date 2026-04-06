import React, { useEffect, useState, useRef } from 'react';
import { Trash2, ArrowRight, UserCheck, Crown, Lock, Clock } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { QuizData } from './types';
import Link from 'next/link';

interface UserQuizCardProps extends QuizData {
  onDelete: (id: string) => void;
  isJoined?: boolean;
  isCreator?: boolean;
  participants?: { clerkId: string }[]; 
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
  isCreator,
  participants = []
}: UserQuizCardProps) {
  const [timeLeft, setTimeLeft] = useState<string>("00:00:00");
  const [isExpired, setIsExpired] = useState(false);
  
  // Ref to prevent multiple deletion calls during re-renders
  const hasAutoDeleted = useRef(false);

  // RULE 1: Deactivate delete if anyone has joined
  const hasParticipants = participants.length > 1;

  useEffect(() => {
    const targetDate = new Date(`${date}T${time}:00`).getTime();
    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;

    const calculate = () => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      // 1. Auto-delete check: Exhausted + 7 days
      if (now > (targetDate + sevenDaysInMs)) {
        if (!hasAutoDeleted.current) {
          hasAutoDeleted.current = true;
          onDelete(id);
        }
        return;
      }

      // 2. Expiration Guard
      if (distance <= 0) {
        setTimeLeft((prev) => prev !== "00:00:00" ? "00:00:00" : prev);
        setIsExpired((prev) => prev !== true ? true : prev);
        return;
      }

      // 3. Active Countdown
      const h = Math.floor((distance / (1000 * 60 * 60)));
      const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((distance % (1000 * 60)) / 1000);
      
      const newTime = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
      
      setTimeLeft((prev) => prev !== newTime ? newTime : prev);
      setIsExpired((prev) => prev !== false ? false : prev);
    };

    calculate();
    const timer = setInterval(calculate, 1000);
    return () => clearInterval(timer);
  }, [date, time, id, onDelete]);

  return (
    <Card className={`relative overflow-hidden border-blue rounded-sm transition-all hover:shadow-md max-w-2xl w-full py-4
      ${isCreator ? 'border-blue-200 bg-white' : 'bg-slate-50 border-slate-100 opacity-90'}`}>
      
      {/* Status Badges */}
      <div className="absolute top-2 right-2 flex gap-2">
        {isExpired && (
          <div className="flex items-center gap-1 bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full border border-slate-200">
            <Clock size={10} />
            <span className="text-[8px] font-black uppercase tracking-tighter">Archiving Soon</span>
          </div>
        )}
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
        <div className="flex flex-col">
          <h3 className="text-slate-800 text-sm font-black uppercase tracking-tight truncate">{category}</h3>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-0.5">{title}</p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center bg-white rounded-lg px-4 py-2 border border-slate-100 space-x-5 shadow-sm">
            <div className="text-center min-w-12.5">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Status</p>
              <p className={`text-[10px] font-bold uppercase ${isExpired ? "text-slate-400" : "text-green-500"}`}>
                {isExpired ? "Exhausted" : "Active"}
              </p>
            </div>
            
            <div className="w-px h-6 bg-slate-100" />
            
            <div className="text-center">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Pool</p>
              <div className="flex items-center gap-1 justify-center">
                <span className="text-[10px]">💎</span>
                <span className="text-slate-700 text-xs font-bold">{points}</span>
              </div>
            </div>

            <div className="w-px h-6 bg-slate-100" />

            <div className="text-center">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Countdown</p>
              <p className={`text-xs font-bold font-mono ${isExpired ? 'text-slate-300' : 'text-slate-700'}`}>
                {timeLeft}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/quizathon/${id}`} className="flex-1">
              <Button variant="outline" className="h-9 px-4 border-slate-200 text-slate-600 hover:bg-indigo-50 text-[11px] font-black uppercase rounded-lg transition-all gap-2">
                View <ArrowRight size={14} />
              </Button>
            </Link>

            {isCreator && (
              <Button 
                disabled={hasParticipants}
                onClick={(e) => { 
                  e.preventDefault();
                  if(confirm("Delete this mission manually?")) onDelete(id); 
                }}
                variant="outline" 
                className={`h-9 w-9 p-0 rounded-lg transition-all ${
                  hasParticipants 
                  ? 'border-slate-100 text-slate-300 bg-slate-50 cursor-not-allowed' 
                  : 'border-red-100 text-red-400 hover:bg-red-50 hover:text-red-600'
                }`}
              >
                {hasParticipants ? <Lock size={15} /> : <Trash2 size={15} />}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}