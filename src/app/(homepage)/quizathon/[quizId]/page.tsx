// @/app/(homepage)/quizathon/[quizId]/page.tsx
import { auth } from "@clerk/nextjs/server";
import { trpc } from "@/trpc/server";
import { HydrateClient } from "@/trpc/server";
import { QuizDetailsView } from "@/modules/home/Quizathon/Quizviews/QuizDetailsView";
import { redirect } from "next/navigation";

export default async function QuizDetailsPage({
  params,
}: {
  params: Promise<{ quizId: string }>;
}) {
  const { userId } = await auth();
  const { quizId } = await params;

  if (!userId) {
    redirect("/sign-in");
  }
  try {
    await Promise.all([
      trpc.quiz.getOne.prefetch({ id: quizId }),
      trpc.users.getOne.prefetch(),
    ]);
  } catch (error) {
    console.error("Prefetch failed:", error);
  }

  return (
    <HydrateClient>
      <QuizDetailsView quizId={quizId} />
    </HydrateClient>
  );
}