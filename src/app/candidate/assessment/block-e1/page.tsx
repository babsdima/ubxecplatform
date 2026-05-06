import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ForcedDistribution } from "@/components/questionnaire/forced-distribution";
import { getE1State } from "@/lib/questionnaire/actions";

export default async function BlockE1Page() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const profile = await prisma.candidateProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!profile) redirect("/candidate/onboarding");

  const competencies = await prisma.competency.findMany({
    orderBy: { order: "asc" },
    select: {
      id: true,
      nameRu: true,
      description: true,
      domain: true,
    },
  });

  const { distribution, examples } = await getE1State();

  return (
    <ForcedDistribution
      competencies={competencies}
      initialDistribution={distribution}
      initialExamples={examples}
    />
  );
}
