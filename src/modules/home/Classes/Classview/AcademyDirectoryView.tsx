'use client';

import { trpc } from "@/trpc/client";
import { format } from "date-fns";
import { Calendar, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export function AcademyDirectoryView({ selectedLevel }: { selectedLevel: string }) {
  // useSuspenseQuery works perfectly with Server Prefetching
  const [classes] = trpc.classes.getAll.useSuspenseQuery({ level: selectedLevel });
  const utils = trpc.useUtils();

  const joinMutation = trpc.classes.joinClass.useMutation({
    onSuccess: () => {
      toast.success("Enrollment confirmed!");
      utils.users.getOne.invalidate(); 
    },
    onError: (err) => toast.error(err.message)
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter text-slate-900">
          {selectedLevel} Tier
        </h1>
        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.4em]">Academy Sessions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {classes.map((c) => (
          <div key={c.id} className="bg-white p-6 border border-slate-200 hover:border-blue-500 transition-all shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <span className="bg-blue-50 text-blue-700 text-[10px] font-black px-2 py-1 uppercase">{c.subject}</span>
              <span className="font-bold text-slate-900">{c.pointsRequired} 💎</span>
            </div>
            <h3 className="text-xl font-bold mb-4">{c.title}</h3>
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-6">
              <Calendar size={14} />
             <span>{c.createdAt ? format(new Date(c.createdAt), "PPP") : "No Date"}</span>
            </div>
            <button 
              onClick={() => joinMutation.mutate({ classId: c.id })}
              disabled={joinMutation.isPending}
              className="w-full bg-slate-900 text-white py-3 font-bold flex items-center justify-center gap-2 hover:bg-blue-600 transition-all"
            >
              {joinMutation.isPending ? "Processing..." : "Enroll Now"} <ArrowRight size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}