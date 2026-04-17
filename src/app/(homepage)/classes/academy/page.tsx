import { HydrateClient, trpc } from "@/trpc/server";
import { AcademyDirectoryView } from "@/modules/home/Classes/Classview/AcademyDirectoryView";

interface Props {
  searchParams: Promise<{ level?: string }>;
}

export default async function AcademyPage({ searchParams }: Props) {
  const { level } = await searchParams;
  const selectedLevel = level ?? "Basic";

  /** * PREFETCH: This fetches the data on the server.
   * The client component will find this data already in the cache.
   */
  void trpc.classes.getAll.prefetch({ level: selectedLevel });

  return (
    <HydrateClient>
      <main className="min-h-screen bg-[#F8FAFC]">
        <AcademyDirectoryView selectedLevel={selectedLevel} />
      </main>
    </HydrateClient>
  );
}