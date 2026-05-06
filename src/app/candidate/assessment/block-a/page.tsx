import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { BLOCK_A } from "@/lib/questionnaire/blocks";
import { QuestionnaireShell } from "@/components/questionnaire/questionnaire-shell";
import type { ResponseValue } from "@/lib/questionnaire/types";

export default async function BlockAPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const profile = await prisma.candidateProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!profile) redirect("/candidate/onboarding");

  const record = await prisma.questionnaireResponse.findUnique({
    where: {
      candidateProfileId_block: { candidateProfileId: profile.id, block: "A" },
    },
  });

  const initialResponses =
    (record?.responses as Record<string, ResponseValue> | null) ?? {};

  return (
    <QuestionnaireShell
      blockId="A"
      blockTitle={BLOCK_A.title}
      questions={BLOCK_A.questions}
      initialResponses={initialResponses}
      nextHref="/candidate/assessment"
    />
  );
}
