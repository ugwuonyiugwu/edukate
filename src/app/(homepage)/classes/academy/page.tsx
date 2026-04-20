import { trpc } from "@/trpc/server"; // Use your server-side TRPC caller
import { HydrateClient } from "@/trpc/server";
import { AcademyDirectoryView } from "@/modules/home/Classes/Classview/AcademyDirectoryView";

interface PageProps {
  searchParams: Promise<{ level?: string }>;
}

export default async function AcademyPage({ searchParams }: PageProps) {
  // 1. Extract the level from searchParams
  const { level } = await searchParams;
  const selectedLevel = level || "Basic";

  void trpc.classes.getAll.prefetch({ level: selectedLevel });

  return (
    <HydrateClient>
      <main className="min-h-screen bg-slate-50">
        <AcademyDirectoryView selectedLevel={selectedLevel} />
      </main>
    </HydrateClient>
  );
}