import { HydrateClient, trpc } from "@/trpc/server";
import { ClassEnrollmentGrid } from "@/modules/home/Classes/Class";

export default async function AcademyPage() {
  // Prefetching "getAll" so data is ready instantly
  void trpc.classes.getAll.prefetch();

  return (
    <HydrateClient>
      <main className="min-h-screen bg-[#F8FAFC]">
        <ClassEnrollmentGrid />
      </main>
    </HydrateClient>
  );
}