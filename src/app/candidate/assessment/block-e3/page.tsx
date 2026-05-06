import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PreferencesForm } from "@/components/questionnaire/preferences-form";
import type { PreferencesInput } from "@/lib/questionnaire/actions-e23";

export default async function BlockE3Page() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const profile = await prisma.candidateProfile.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      preferences: true,
    },
  });
  if (!profile) redirect("/candidate/onboarding");

  const industries = await prisma.industry.findMany({
    orderBy: { order: "asc" },
    select: { id: true, nameRu: true },
  });

  const p = profile.preferences;
  const initial: PreferencesInput = {
    activityStatus: p?.activityStatus ?? undefined,
    readiness: p?.readiness ?? undefined,
    targetRoles: (p?.targetRoles as string[] | null) ?? [],
    targetIndustries: (p?.targetIndustries as string[] | null) ?? [],
    targetCompanyTypes: (p?.targetCompanyTypes as string[] | null) ?? [],
    targetRevenue: (p?.targetRevenue as string[] | null) ?? [],
    geography: (p?.geography as string[] | null) ?? [],
    relocation: p?.relocation ?? undefined,
    totalCashRange: p?.totalCashRange ?? undefined,
    equityImportance: p?.equityImportance ?? undefined,
    minFixedRange: p?.minFixedRange ?? undefined,
    dealbreakers: (p?.dealbreakers as string[] | null) ?? [],
    top3Priorities: (p?.top3Priorities as string[] | null) ?? [],
  };

  return <PreferencesForm industries={industries} initial={initial} />;
}
