export const dynamic = "force-dynamic";

import { TeacherView } from "@/modules/home/Teachersview";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export default function TeachersPage() {
  return (
    <main className="min-h-screen bg-slate-50/30">
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
          <p className="mt-4 text-slate-500 font-medium">Loading Directory...</p>
        </div>
      }>
        <TeacherView />
      </Suspense>
    </main>
  );
}