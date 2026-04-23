import { HydrateClient, trpc } from "@/trpc/server"; 
import { ClassroomView } from "@/modules/home/Classes/Classview/classroom";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

// Ensure params is treated as a Promise
export default async function Page(props: { params: Promise<{ id: string }> }) {
  // 1. Await the params first
  const { id } = await props.params;

  // 2. Prefetch using the plural keys from your root.ts
  // If id is missing here, it will throw a clear error before hitting the client
  if (!id) {
    return <div>Invalid Class ID</div>;
  }

  try {
    await trpc.classes.getById.prefetch({ id });
    await trpc.questions.getByClassId.prefetch({ classId: id });
  } catch (error) {
    console.error("Prefetch error:", error);
  }

  return (
    <HydrateClient>
      <Suspense fallback={
        <div className="h-screen w-full flex flex-col items-center justify-center bg-white">
          <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
            Loading Session...
          </p>
        </div>
      }>
        {/* Now 'id' is guaranteed to be a string */}
        <ClassroomView classId={id} />
      </Suspense>
    </HydrateClient>
  );
}