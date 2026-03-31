import { Timer } from 'lucide-react';

interface HeaderProps {
  currentIndex: number;
  total: number;
  timeLeft: number;
  score: number;
}

export const QuizHeader = ({ currentIndex, total, timeLeft, score }: HeaderProps) => (
  <header className="bg-[#00a884] p-4 text-white flex justify-between items-center shadow-xl z-10">
    <div className="flex flex-col">
      <span className="text-[10px] font-black uppercase tracking-widest opacity-70">Mission Active</span>
      <span className="text-lg font-bold">
        Question {currentIndex + 1} <span className="opacity-50 text-sm">/ {total}</span>
      </span>
    </div>
    
    <div className={`flex items-center gap-3 px-5 py-2 rounded-full font-mono font-bold border-2 transition-all duration-500
      ${timeLeft < 60 ? 'bg-red-600 border-white animate-pulse scale-110' : 'bg-black/20 border-transparent'}`}>
      <Timer size={20} />
      <span className="text-xl">
        {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
      </span>
    </div>

    <div className="bg-white/10 px-4 py-2 rounded-lg text-sm font-black tracking-tight">
      SCORE: {score}
    </div>
  </header>
);