import DiscoveryPage from '@/modules/home/Libraries/library'
import { trpc, HydrateClient } from '@/trpc/server'


export const dynamic = 'force-dynamic';

export default async function LibrariesPage () { 
  
  void trpc.documents.getAllLibraries.prefetch();
  void trpc.users.getOne.prefetch();

  return (
    <HydrateClient>
      <DiscoveryPage/>
    </HydrateClient>
  )
};
