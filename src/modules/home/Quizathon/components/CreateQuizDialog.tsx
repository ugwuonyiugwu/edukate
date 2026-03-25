// @/modules/home/Quizzes/components/CreateQuizDialog.tsx
import React from 'react';
import { Plus, Coins, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { QuizData } from './types';

interface CreateQuizDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  // Use Omit to exclude the ID and DB timestamps during creation
  onSubmit: (data: Omit<QuizData, "id" | "createdAt" | "updatedAt" | "clerkId">) => void;
  isPending: boolean;
}

export function CreateQuizDialog({ isOpen, setIsOpen, onSubmit, isPending }: CreateQuizDialogProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    // Extract values and ensure proper types for tRPC/Drizzle
    const topic = (formData.get('topic') as string) || "";
    const subject = (formData.get('subject') as string) || "";

    const data = {
      title: topic,
      category: subject,
      date: (formData.get('date') as string) || "",
      time: (formData.get('time') as string) || "",
      points: Number(formData.get('points')) || 0,
      description: `Join this ${subject} session on ${topic}.`,
      questions: 0,
      label: topic,
      value: 0,
      color: "text-blue-600"
    };

    onSubmit(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#5D5FEF] hover:bg-[#4a4cd9] rounded-xl px-8 py-6 font-bold gap-2 w-full sm:w-auto shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
          <Plus size={20} /> Create New Quiz
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-112.5 bg-white  border-none p-0 overflow-hidden shadow-2xl">
        {/* Header Section */}
        <div className="bg-[#0B1221] p-6 text-white border-b border-white/10">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-[#FBB03B]">
              New Quiz Session
            </DialogTitle>
          </DialogHeader>
          <p className="text-slate-400 text-xs mt-1">Set the topic, schedule, and entry requirements.</p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 bg-white">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Subject</label>
              <input
                name="subject"
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#5D5FEF] transition-all"
                placeholder="e.g. Mathematics"
              />
            </div>

            <div className="col-span-2 space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Topic</label>
              <input
                name="topic"
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#5D5FEF] transition-all"
                placeholder="e.g. Algebra Fundamentals"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Date</label>
              <input
                name="date"
                type="date"
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Time</label>
              <input
                name="time"
                type="time"
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-medium"
              />
            </div>

            <div className="col-span-2 space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Entry Points Cost</label>
              <div className="relative">
                <input
                  name="points"
                  type="number"
                  min="0"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-[#0B1221]"
                  placeholder="0"
                />
                <Coins size={18} className="absolute left-3 top-3.5 text-orange-500" />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-[#5D5FEF] h-12 rounded-xl font-black text-white hover:bg-[#4a4cd9] shadow-lg shadow-indigo-500/20 transition-all"
          >
            {isPending ? (
              <div className="flex items-center gap-2">
                <Loader2 className="animate-spin" size={18} />
                <span>Launching...</span>
              </div>
            ) : (
              "Launch Quiz Session"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}