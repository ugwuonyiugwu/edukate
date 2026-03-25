import { Calendar, Clock, BookOpen, Coins, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { QuizData } from './types';

interface UserQuizCardProps extends QuizData {
  onDelete: (id: string) => void;
}

export function UserQuizCard({ id, title, description, category, date, time, points, onDelete }: UserQuizCardProps) {
  return (
    <Card className="overflow-hidden border-slate-200 shadow-sm bg-white group hover:border-blue-400 transition-all duration-300 flex flex-col h-full hover:shadow-xl relative">
      <div className="h-36 bg-slate-50 border-b border-slate-100 relative p-6 flex flex-col justify-center overflow-hidden">
        <div className="bg-blue-600 text-white text-[9px] font-black px-2.5 py-1 rounded-full inline-block w-fit mb-3 z-10 tracking-widest uppercase">
          {category}
        </div>
        <h3 className="text-slate-800 text-xl font-black leading-tight z-10 group-hover:text-blue-700 transition-colors">{title}</h3>
        <BookOpen className="absolute right-3.75 bottom-3.75 text-slate-200/40 group-hover:text-blue-500/10 group-hover:rotate-12 transition-all duration-500" size={100} />
      </div>

      <div className="p-5 flex flex-col flex-1 space-y-5">
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed flex-1 font-medium italic">
          {description}
        </p>

        <div className="grid grid-cols-2 gap-3 border-t border-slate-50 pt-4">
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-wider">
             <Calendar size={14} className="text-blue-500"/> {date}
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-wider">
             <Clock size={14} className="text-blue-500"/> {time}
          </div>
          <div className="flex items-center gap-2 text-[11px] font-black text-slate-700 uppercase col-span-2 bg-orange-50 p-2 rounded-lg border border-orange-100">
             <Coins size={14} className="text-orange-500"/> Entry: {points} Points
          </div>
        </div>

        <div className="flex gap-2">
            <Button variant="outline" className="flex-3 border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600 text-xs font-black h-10 rounded-xl transition-all">
                View Details
            </Button>
            <Button 
                onClick={() => onDelete(id)}
                variant="outline" 
                className="flex-1 border-red-100 text-red-400 hover:bg-red-50 hover:text-red-600 h-10 rounded-xl transition-all"
            >
                <Trash2 size={16} />
            </Button>
        </div>
      </div>
    </Card>
  );
}