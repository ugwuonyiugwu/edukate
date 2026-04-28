export const dynamic = "force-dynamic"

import { trpc } from "@/trpc/server";
import { HydrateClient } from "@/trpc/server";
import { Suspense } from "react";
import { ScholarshipFeed } from "@/modules/home/Scholarship/scholarshipview";

export default async function Page() {
  void trpc.scholarship.getAllAdmin.prefetch();

  return (
    <HydrateClient>
      <div className="min-h-screen bg-white">
        <Suspense fallback={<p className="text-center mt-10">Loading opportunities...</p>}>
          <ScholarshipFeed />
        </Suspense>
      </div>
    </HydrateClient>
  );
}