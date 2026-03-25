import { userRouter } from '@/modules/home/Profile/server/users';
import { createTRPCRouter } from '../init';
import { documentRouter } from '@/modules/Library/server/procedure';
import { quizRouter } from '@/modules/home/Quizathon/server/procedure';


export const appRouter = createTRPCRouter({
 
 users: userRouter,
 documents: documentRouter,
 quiz: quizRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter; 