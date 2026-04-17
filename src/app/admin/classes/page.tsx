import { HydrateClient, trpc } from "@/trpc/server";
import { AdminClassListView } from "@/modules/Admin/Class/ClassListView";

export default async function AdminAcademyPage() {
  // Prefetching all classes (no level filter) for admin view
  void trpc.classes.getAll.prefetch({});

  return (
    <HydrateClient>
      <div className="p-8">
         <h1 className="text-2xl font-black uppercase italic mb-8">Studio Management</h1>
         <AdminClassListView />
      </div>
    </HydrateClient>
  );
}