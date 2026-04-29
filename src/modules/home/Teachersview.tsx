"use client";

import { useState, useMemo } from "react";
import { trpc } from "@/trpc/client";
import { Search, BookOpen, GraduationCap, MessageCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Utility to format Naira (adjust currency code as needed, e.g. NGN)
const formatNaira = (amount: number) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const TeacherView = () => {
  // Using publicProcedure from our previous fixes
  const [teachers] = trpc.teacher.getAll.useSuspenseQuery();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTeachers = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return teachers;

    return teachers.filter((t) => 
      t.name.toLowerCase().includes(query) ||
      t.subjects.toLowerCase().includes(query) ||
      t.topics.toLowerCase().includes(query)
    );
  }, [searchQuery, teachers]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* SEARCH HEADER */}
      <div className="mb-14 text-center">
        <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight uppercase">
          Instructor Directory
        </h1>
        <p>meet with qualified instructors </p>
        <div className="relative max-w-xl mx-auto mt-10">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input 
            placeholder="Search by name, subject, or focus area..."
            className="pl-12 h-14 rounded-2xl border-slate-200 shadow-lg shadow-slate-200/30 focus:ring-primary/10 transition-all text-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredTeachers.map((teacher) => (
          <Card key={teacher.id} className="border border-slate-100 shadow-sm hover:shadow-lg transition-shadow duration-300 rounded-3xl bg-white overflow-hidden">
            <div className="flex flex-row items-center">

              <div className="flex-1 px-8 space-y-2">
                <h3 className="text-2xl font-black text-[#1d2d50] uppercase tracking-tight line-clamp-1">
                  {teacher.name}
                </h3>
                
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8 pt-1">
                  <div className="flex items-center gap-2 max-w-xs">
                    <div>
                      <p className="text-sm text-slate-700 font-semibold line-clamp-1">{teacher.subjects}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 max-w-sm">
                    <div>
                      <p className="text-sm text-slate-500 italic line-clamp-1">{teacher.topics}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT SECTION: Apply Button (Matches image) */}
              <div className="px-10 shrink-0">
                <Button 
                  className="bg-blue-700 hover:bg-blue-600 text-white rounded-sm font-bold px-8 py-3 h-auto uppercase tracking-wider text-sm shadow-md transition-all active:scale-95"
                  asChild
                >
                  <a 
                    href={`https://wa.me/${teacher.whatsappNumber.replace(/\D/g, '')}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-2"
                  >
                    <MessageCircle className="w-5 h-5 fill-current" />
                    Apply
                  </a>
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* EMPTY STATE */}
      {filteredTeachers.length === 0 && (
        <div className="py-32 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4 text-slate-200">
            <Search className="w-8 h-8" />
          </div>
          <p className="text-slate-400 font-medium">
            No instructors found matching &ldquo;{searchQuery}&rdquo;
          </p>
          <Button 
            variant="link" 
            onClick={() => setSearchQuery("")}
            className="text-primary mt-2 font-bold uppercase text-xs tracking-widest"
          >
            Show All Teachers
          </Button>
        </div>
      )}
    </div>
  );
};