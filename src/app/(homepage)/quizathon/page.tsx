import QuizathonPage from '@/modules/home/Quizathon';
import { trpc, HydrateClient } from '@/trpc/server'


export const dynamic = 'force-dynamic';

export default async function LibrariesPage () { 
  
  void trpc.documents.getAllLibraries.prefetch();
  void trpc.users.getOne.prefetch();

  return (
    <HydrateClient>
      <QuizathonPage/>
    </HydrateClient>
  )
};
