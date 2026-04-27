"use client";

import Link from "next/link";
import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const ScholarshipFeed = () => {
  const [scholarships] = trpc.scholarship.getAllAdmin.useSuspenseQuery();

  return (
    <div className="space-y-2 w-full max-w-4xl mx-auto p-2">
      {scholarships.map((s) => (
        <Link key={s.id} href={`/scholarship/${s.id}`} className="block group">
          <Card className="relative flex flex-row items-center border border-slate-200 shadow-sm overflow-hidden h-16 sm:h-20 transition-all group-hover:border-primary/50 group-hover:shadow-md cursor-pointer">
            
            {/* 1. LEFT: Amount */}
            <div className="flex items-center justify-center px-2 sm:px-4 h-full bg-slate-50/50 min-w-20 sm:min-w-30 border-r border-dashed border-slate-300 relative shrink-0">
              <h2 className="text-xs sm:text-lg font-bold text-slate-800 truncate">
                ₦{s.amount.toLocaleString()}
              </h2>
              
              <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border border-slate-200 rounded-full" />
              <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border border-slate-200 rounded-full" />
            </div>

            {/* 2. MIDDLE: Info */}
            <div className="flex-1 px-3 min-w-0">
              <h3 className="text-[11px] sm:text-sm font-bold text-slate-900 truncate uppercase tracking-tight group-hover:text-primary transition-colors">
                {s.name}
              </h3>
              <p className="text-[9px] sm:text-xs text-slate-400 truncate">
                {s.description}
              </p>
            </div>

            {/* 3. RIGHT: Button */}
            <div className="px-2 sm:px-4 h-full flex items-center shrink-0">
              {s.isActive ? (
                <Button 
                  asChild
                  className="bg-[#28a745] hover:bg-[#218838] text-white font-bold rounded-sm h-7 sm:h-9 px-5 sm:px-6 uppercase text-[8px] sm:text-[10px]"
                >
                  {/* asChild allows the link behavior to stay consistent */}
                  <span>Apply</span>
                </Button>
              ) : (
                <Button 
                  disabled
                  className="bg-red-500 text-white font-bold rounded-sm h-7 sm:h-9 px-2 sm:px-6 uppercase text-[8px] sm:text-[10px] opacity-70"
                >
                  Closed
                </Button>
              )}
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
};