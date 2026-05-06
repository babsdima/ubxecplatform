import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { CompanyNav } from "@/components/layout/company-nav";
import { CompanyProfileWizard } from "@/components/employer/company-profile-wizard";
import type { CompanyProfilePatch } from "@/lib/employer/actions";

type SearchParams = { step?: string };

export default async function CompanyProfilePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const { step } = await searchParams;
  const initialStep = step ? Math.max(1, Math.min(8, Number(step))) : 1;

  const company = await prisma.companyProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!company) redirect("/company/onboarding");

  const industries = await prisma.industry.findMany({
    orderBy: { order: "asc" },
    select: { id: true, nameRu: true },
  });

  const initial: CompanyProfilePatch = {
    name: company.name ?? company.companyName ?? "",
    legalEntity: company.legalEntity ?? "",
    yearFounded: company.yearFounded,
    descriptionShort: company.descriptionShort ?? "",
    descriptionFull: company.descriptionFull ?? "",
    mainProduct: company.mainProduct ?? "",
    industryPrimary: company.industryPrimary ?? "",
    industriesSecondary: (company.industriesSecondary as string[] | null) ?? [],
    companyType: company.companyType ?? "",
    b2bB2c: company.b2bB2c ?? "",
    revenueRange: company.revenueRange ?? "",
    employeeCount: company.employeeCount ?? "",
    geography: (company.geography as string[] | null) ?? [],
    hqCity: company.hqCity ?? "",
    stage: company.stage ?? "",
    growthChallenges:
      (company.growthChallenges as { top3?: string[]; all?: string[] } | null) ?? {},
    revenueGrowth: company.revenueGrowth ?? "",
    growthPlan: company.growthPlan ?? "",
    cultureAsIs:
      (company.cultureAsIs as { D1: number; D2: number; D3: number; D4: number } | null) ??
      undefined,
    cultureToBe:
      (company.cultureToBe as { D1: number; D2: number; D3: number; D4: number } | null) ??
      undefined,
    workingStyle:
      (company.workingStyle as { pace: number; structure: number; risk: number; focus: number } | null) ??
      undefined,
    culturalMarkers: (company.culturalMarkers as string[] | null) ?? [],
    leadershipStyleRanking:
      (company.leadershipStyleRanking as [string, number][] | null) ?? [],
    leaderExpectationsTop3: (company.leaderExpectationsTop3 as string[] | null) ?? [],
    workFormat: company.workFormat ?? "",
    travelFrequency: company.travelFrequency ?? "",
    compPositioning: company.compPositioning ?? "",
    hiringDecisionMakers: (company.hiringDecisionMakers as string[] | null) ?? [],
    values:
      (company.values as { name: string; description: string }[] | null) ?? [],
    evp: company.evp ?? "",
    honestChallenges: company.honestChallenges ?? "",
    cLevelTeam:
      (company.cLevelTeam as { role: string; filled: boolean; tenure?: string; source?: string }[] | null) ??
      [],
    teamDynamics: (company.teamDynamics as string[] | null) ?? [],
    showName: company.showName,
    codename: company.codename ?? "",
    showLogo: company.showLogo,
    notifyRejected: company.notifyRejected,
  };

  return (
    <div className="dash-bg">
      <CompanyNav active="profile" />
      <CompanyProfileWizard
        industries={industries}
        initial={initial}
        initialStep={initialStep}
        initialCompletion={company.profileCompletion}
      />
    </div>
  );
}
