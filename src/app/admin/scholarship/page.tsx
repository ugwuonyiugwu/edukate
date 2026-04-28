// src/app/admin/scholarship/page.tsx
export const dynamic = "force-dynamic";

import { ScholarshipManager } from "@/modules/Admin/Scholarship/ScholarshipAdminView";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export default function AdminScholarshipPage() {
  return (
    <div className="p-4 sm:p-8">
      <h1 className="text-2xl font-bold mb-6">Scholarship Management</h1>
      <Suspense fallback={
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin h-8 w-8 text-slate-400" />
        </div>
      }>
        <ScholarshipManager />
      </Suspense>
    </div>
  );
}