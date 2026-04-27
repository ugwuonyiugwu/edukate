"use client";

import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

export const ScholarshipDetailContent = ({ id }: { id: number }) => {
  const [data] = trpc.scholarship.getById.useSuspenseQuery({ id });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto px-4">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 break-words">
            {data.name}
          </h1>
          <p className="text-lg sm:text-xl text-[#28a745] font-bold mt-2">
            Reward: ₦{data.amount.toLocaleString()}
          </p>
        </div>
        
        <div className="shrink-0">
          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
            data.isActive 
              ? 'bg-green-50 text-green-700 border-green-200' 
              : 'bg-red-50 text-red-700 border-red-200'
          }`}>
            {data.isActive ? '• Active' : '• Closed'}
          </span>
        </div>
      </div>

      <div className="space-y-6">
        {/* Description Box with Fix for Distortion */}
        <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
            Scholarship Details
          </h2>
          <p className="text-slate-700 text-sm sm:text-base whitespace-pre-wrap leading-relaxed font-medium break-words">
            {data.description}
          </p>
        </div>

        {/* Always Active Visit Button */}
        <div className="pt-4">
          <Button 
            asChild
            className="w-full h-14 bg-[#28a745] hover:bg-[#218838] text-white font-bold text-lg shadow-lg shadow-green-100 transition-all active:scale-[0.98]"
          >
            <a 
              href={data.scholarshipUrl ?? "#"} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center justify-center gap-2"
            >
              Visit Official Site
              <ExternalLink className="w-5 h-5" />
            </a>
          </Button>
          
          <p className="text-center text-[10px] text-slate-400 mt-4 uppercase tracking-tighter">
            * Link provided by the scholarship board.
          </p>
        </div>
      </div>
    </div>
  );
};