"use client";

import Link from "next/link";
import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Image from "next/image";

export const ScholarshipFeed = () => {
  const [scholarships] = trpc.scholarship.getAllAdmin.useSuspenseQuery();

  return (
    <div className="space-y-3 w-full max-w-4xl mx-auto p-2">
      {/* 1. HEADER BANNER */}
      <div className="relative w-full overflow-hidden mb-6 rounded-xl shadow-sm border border-slate-200 
        aspect-[3/1] sm:aspect-[4/1] lg:aspect-[7/2] min-h-[120px] sm:min-h-[160px]">
        <Image
          src="/backgroud-images/scholarship-header.png" 
          fill
          alt="Scholarship Banner"           
          priority           
          sizes="(max-width: 768px) 100vw, 1200px"
          className="object-cover" 
        />
      </div>

      {/* 2. SCHOLARSHIP CARDS */}
      {scholarships.map((s) => (
        <Link key={s.id} href={`/scholarship/${s.id}`} className="block group">
          <Card className="relative flex flex-row items-center border border-slate-100 shadow-sm overflow-hidden h-16 sm:h-20 transition-all group-hover:border-primary/40 group-hover:shadow-md cursor-pointer flex-nowrap">
            
            {/* LEFT: Amount Section with Perforation */}
            <div className="flex items-center justify-center px-3 sm:px-6 h-full bg-slate-50/40 min-w-[95px] sm:min-w-[140px] border-r border-dashed border-slate-200 relative shrink-0">
              <h2 className="text-[13px] sm:text-lg font-black text-slate-800 tracking-tighter">
                ₦{s.amount.toLocaleString()}
              </h2>
              
              {/* Decorative Perforation Circles */}
              <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border border-slate-100 rounded-full" />
              <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border border-slate-100 rounded-full" />
            </div>

            {/* MIDDLE: Info (Ensures text wraps/truncates correctly) */}
            <div className="flex-1 px-3 sm:px-5 min-w-0 overflow-hidden">
              <h3 className="text-[12px] sm:text-[15px] font-bold text-slate-900 truncate uppercase">
                {s.name}
              </h3>
              <p className="text-[10px] sm:text-xs text-slate-400 truncate mt-0.5">
                {s.description}
              </p>
            </div>

            {/* RIGHT: Apply Button (Always visible on same line) */}
            <div className="px-2 sm:px-6 h-full flex items-center shrink-0">
              <Button 
                asChild
                className="bg-[#28a745] hover:bg-[#218838] text-white font-bold rounded-sm h-7 sm:h-9 px-3 sm:px-8 uppercase text-[9px] sm:text-[10px] tracking-widest shadow-sm border-none"
              >
                <span>Apply</span>
              </Button>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
};