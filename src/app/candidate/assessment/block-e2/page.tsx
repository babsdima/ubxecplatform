import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { TrackRecordForm } from "@/components/questionnaire/track-record-form";
import type { TrackRecordInput } from "@/lib/questionnaire/actions-e23";

export default async function BlockE2Page() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const profile = await prisma.candidateProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!profile) redirect("/candidate/onboarding");

  const industries = await prisma.industry.findMany({
    orderBy: { order: "asc" },
    select: { id: true, nameRu: true, category: true },
  });

  const initial: TrackRecordInput = {
    currentLevel: profile.currentLevel ?? undefined,
    currentFunction: (profile.currentFunction as string[] | null) ?? [],
    companyType: profile.companyType ?? undefined,
    companyRevenue: profile.companyRevenue ?? undefined,
    companyEmployees: profile.companyEmployees ?? undefined,
    directReports: profile.directReports,
    totalReports: profile.totalReports,
    pnlRange: profile.pnlRange ?? undefined,
    tenureCurrent: profile.tenureCurrent ?? undefined,
    reasonSeeking: profile.reasonSeeking ?? undefined,

    yearsManagement: profile.yearsManagement,
    maxPnl: profile.maxPnl ?? undefined,
    maxReports: profile.maxReports,
    industries: (profile.industries as string[] | null) ?? [],
    companyTypes: (profile.companyTypes as string[] | null) ?? [],
    experienceContexts: (profile.experienceContexts as string[] | null) ?? [],
    internationalExp: (profile.internationalExp as string[] | null) ?? [],
  };

  return <TrackRecordForm industries={industries} initial={initial} />;
}
