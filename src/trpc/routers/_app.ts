import { userRouter } from '@/modules/home/Profile/server/users';
import { createTRPCRouter } from '../init';
import { documentRouter } from '@/modules/Library/server/procedure';
import { quizRouter } from '@/modules/home/Quizathon/server/procedure';
import { classRouter } from '@/modules/home/Classes/server/procedure';
import { curriculumRouter } from '@/modules/Admin/Class/server/procedure';

export const appRouter = createTRPCRouter({
 
 users: userRouter,
 documents: documentRouter,
 quiz: quizRouter,
 classes: classRouter,
 questions: curriculumRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter; 