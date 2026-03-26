// @/modules/home/Quizzes/components/PublicQuizCard.tsx
import React from 'react';
import { Calendar, Clock, Key, BookOpen } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Link from 'next/link';

interface PublicQuizCardProps {
  id: string;
  category: string;
  title: string;
  points: number;
  date: string;
  time: string;
}

export const PublicQuizCard = ({ category, title, points, date, time, id }: PublicQuizCardProps) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">
      {/* Top Section: Category and Icon */}
      <div className="flex justify-between items-start">
        <div className="space-y-3">
          <span className="bg-[#2563EB] text-white text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-wider">
            {category}
          </span>
          <h3 className="text-xl font-black text-slate-800 capitalize leading-tight">
            {title}
          </h3>
        </div>
        <div className="bg-slate-50 p-3 rounded-xl">
           <BookOpen className="text-slate-200" size={32} strokeWidth={1.5} />
        </div>
      </div>

      <div className="h-px bg-slate-100 w-full mt-2" />

      {/* Mid Section: Date and Time */}
      <div className="flex items-center gap-6 text-slate-500 font-bold text-[11px]">
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-blue-500" />
          {date}
        </div>
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-blue-500" />
          {time}
        </div>
      </div>

      {/* Entry Points Banner */}
      <div className="bg-[#FFF7ED] border border-[#FFEDD5] rounded-xl p-3 flex items-center gap-3">
        <div className="bg-white p-1.5 rounded-lg shadow-sm">
          <Key size={14} className="text-orange-500" />
        </div>
        <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">
          Entry: {points} Points
        </span>
      </div>

      {/* Action Button */}
      <Link href={`/quizathon/${id}`} className="w-full">
        <Button variant="outline" className="w-full py-6 rounded-xl border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-all">
            View Details
        </Button>
      </Link>
    </div>
  );
}