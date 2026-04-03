// @/modules/home/Quizzes/components/CreateQuizDialog.tsx
import React from 'react';
import { Plus, Coins, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { QuizData } from './types';
import { toast } from "sonner";

interface CreateQuizDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  // This now expects the full Omit type including serverOffset
  onSubmit: (data: Omit<QuizData, "id" | "createdAt" | "updatedAt" | "clerkId">) => void;
  isPending: boolean;
  userPoints: number;
  serverOffset: number;
}

export function CreateQuizDialog({ 
  isOpen, 
  setIsOpen, 
  onSubmit, 
  isPending, 
  userPoints, 
  serverOffset 
}: CreateQuizDialogProps) {
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const pointsToSpend = Number(formData.get('points')) || 0;

    // 1. Validation: Insufficient Points
    if (userPoints < pointsToSpend) {
      toast.error(`Insufficient points! You have ${userPoints} but need ${pointsToSpend}.`, {
        style: { background: '#0B1221', color: '#FBB03B', border: '1px solid #FBB03B' }
      });
      return;
    }

    const topic = (formData.get('topic') as string) || "";
    const subject = (formData.get('subject') as string) || "";
    const description = (formData.get('description') as string) || `Join this ${subject} session on ${topic}.`;

    // 2. Prepare data for tRPC
    // Added 'serverOffset' here to match the required Type
    const data = {
      title: topic,
      category: subject,
      date: (formData.get('date') as string) || "",
      time: (formData.get('time') as string) || "",
      points: pointsToSpend,
      description: description,
      questions: 0,
      label: topic,
      value: 0,
      color: "text-blue-600",
      serverOffset: serverOffset // <--- Fix: Added the missing property
    };

    onSubmit(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#5D5FEF] hover:bg-[#4a4cd9] rounded-sm px-8 py-6 font-bold gap-2 w-full sm:w-auto shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
          <Plus size={20} /> Create New Quiz
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[450px] bg-white rounded-xl border-none p-0 overflow-hidden shadow-2xl">
        {/* Header Section */}
        <div className="bg-[#0B1221] p-6 text-white border-b border-white/10">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-[#FBB03B] flex justify-between items-center">
              New Quiz Session
            </DialogTitle>
          </DialogHeader>
          <p className="text-slate-400 text-xs mt-1 font-medium">Configure your session entry requirements.</p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-white">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Subject Area</label>
              <input
                name="subject"
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#5D5FEF] transition-all text-sm"
                placeholder="e.g. Physics"
              />
            </div>

            <div className="col-span-2 space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Quiz Topic</label>
              <input
                name="topic"
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#5D5FEF] transition-all text-sm"
                placeholder="e.g. Quantum Mechanics"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Date</label>
              <input
                name="date"
                type="date"
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none text-xs font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Start Time</label>
              <input
                name="time"
                type="time"
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none text-xs font-bold"
              />
            </div>

            <div className="col-span-2 space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Entry Cost (Points)</label>
              <div className="relative">
                <input
                  name="points"
                  type="number"
                  min="0"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none font-black text-[#0B1221]"
                  placeholder="100"
                />
                <Coins size={18} className="absolute left-3 top-2.5 text-orange-500" />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-[#5D5FEF] h-12 rounded-xl font-black text-white hover:bg-[#4a4cd9] shadow-lg shadow-indigo-500/20 transition-all mt-2"
          >
            {isPending ? (
              <div className="flex items-center gap-2">
                <Loader2 className="animate-spin" size={18} />
                <span>Creating Session...</span>
              </div>
            ) : (
              "Deploy Quiz"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}