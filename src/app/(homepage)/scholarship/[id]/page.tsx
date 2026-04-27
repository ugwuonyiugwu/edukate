import { HydrateClient, trpc } from "@/trpc/server"; // Ensure trpc is imported
import { Suspense } from "react";
import { ScholarshipDetailContent } from "@/modules/home/Scholarship/Descriptionview";
import { Loader2 } from "lucide-react";

// 1. Change to async and define Props
export default async function ScholarshipPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  // 2. Await the params
  const { id } = await params;
  const scholarshipId = parseInt(id);

  // 3. Prefetch
  void trpc.scholarship.getById.prefetch({ id: scholarshipId });

  return (
    <HydrateClient>
      <main className="max-w-3xl mx-auto p-6 py-12">
        <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>}>
          <ScholarshipDetailContent id={scholarshipId} />
        </Suspense>
      </main>
    </HydrateClient>
  );
}