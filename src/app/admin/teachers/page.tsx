export const dynamic = "force-dynamic";

import { TeacherManager } from "@/modules/Admin/Teachers/TeacherManager";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export default function AdminTeachersPage() {
  return (
    <main className="p-4 sm:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Teacher Directory</h1>
        <p className="text-sm text-slate-500">Manage and add academic instructors to the platform.</p>
      </div>

      <Suspense fallback={
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin h-8 w-8 text-slate-300" />
        </div>
      }>
        <TeacherManager />
      </Suspense>
    </main>
  );
}