// @/app/(homepage)/quizathon/page.tsx
import { auth } from "@clerk/nextjs/server";
import { trpc } from "@/trpc/server";
import { QuizDashboardView } from "@/modules/home/Quizathon";
import { HydrateClient } from "@/trpc/server";
import { redirect } from "next/navigation";

export default async function QuizathonPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }
  try {
    await Promise.all([
      trpc.users.getOne.prefetch(),
      trpc.quiz.getMyQuizzes.prefetch(),
      trpc.quiz.getAllQuizzes.prefetch(),
    ]);
  } catch (e) {
    console.warn("Prefetch ignored due to rate limit");
  }

  return (
    <HydrateClient>
      <QuizDashboardView />
    </HydrateClient>
  );
}