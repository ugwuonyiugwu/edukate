import { DashboardView } from "@/modules/home/Dashboard";
import { trpc, HydrateClient } from "@/trpc/server";

export const dynamic = 'force-dynamic';

const Page = async () => {
  void trpc.users.getOne.prefetch();
  void trpc.documents.getLibrary.prefetch();
  void trpc.documents.getMyDocuments.prefetch();

  return (
    <HydrateClient>
      <DashboardView />
    </HydrateClient>
  );
};

export default Page;