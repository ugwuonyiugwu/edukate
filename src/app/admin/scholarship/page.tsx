import { trpc } from "@/trpc/server";
import { HydrateClient } from "@/trpc/server";
import { Suspense } from "react";
import { ScholarshipManager } from "@/modules/Admin/Scholarship/ScholarshipAdminView";
import { ScholarshipSkeleton } from "../../../modules/Admin/Scholarship/components/scholarshipSkeleton";

export default async function AdminScholarshipPage() {
  void trpc.scholarship.getAllAdmin.prefetch();

  return (
    // HydrateClient passes the prefetched state to the client-side hooks
    <HydrateClient>
      <main className="max-w-5xl mx-auto py-10 px-6">
        <h1 className="text-2xl font-bold mb-8">Scholarship Management</h1>
        
         <Suspense fallback={<ScholarshipSkeleton />}>
          <ScholarshipManager />
        </Suspense>
      </main>
    </HydrateClient>
  );
}