import { HydrateClient, trpc } from "@/trpc/server";
import { ExamSession } from "@/modules/home/Classes/Classview/ExamSession";
import { Suspense } from "react";

export default async function Page(props: { 
  params: Promise<{ id: string; mode: 'practice' | 'exam' }> 
}) {
  const { id, mode } = await props.params;

  await trpc.classes.getById.prefetch({ id });
  await trpc.questions.getByClassId.prefetch({ classId: id });

  return (
    <HydrateClient>
      <Suspense fallback={<div className="h-screen flex items-center justify-center">Loading...</div>}>
        <ExamSession classId={id} mode={mode} />
      </Suspense>
    </HydrateClient>
  );
}