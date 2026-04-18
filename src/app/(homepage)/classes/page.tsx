import { HydrateClient, trpc } from "@/trpc/server";
import { ClassEnrollmentGrid } from "@/modules/home/Classes/Class";


export const dynamic = "force-dynamic";

export default async function AcademyPage() {
  await trpc.classes.getAll.prefetch({});

  return (
    <HydrateClient>
      <main className="min-h-screen bg-[#F8FAFC]">
        <ClassEnrollmentGrid />
      </main>
    </HydrateClient>
  );
}