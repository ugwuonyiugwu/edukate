import { HydrateClient, trpc } from "@/trpc/server";
import { Suspense } from "react";
import { CurriculumManagerClient } from "@/modules/Admin/Class/Questions";

export const dynamic = "force-dynamic";

// Next.js params should be treated as a Promise in recent versions
export default async function CurriculumPage({ 
  params 
}: { 
  params: Promise<{ classId: string }> | { classId: string } 
}) {
  // 1. AWAIT the params to ensure classId is actually a string
  const resolvedParams = await params;
  const { classId } = resolvedParams;

  // 2. Now classId is guaranteed to be a string, not undefined
  void trpc.classes.getById.prefetch({ id: classId });

  return (
    <HydrateClient>
      <div className="min-h-screen bg-slate-50">
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Verifying Admin Registry...
            </p>
          </div>
        }>
          <CurriculumManagerClient classId={classId} />
        </Suspense>
      </div>
    </HydrateClient>
  );
}