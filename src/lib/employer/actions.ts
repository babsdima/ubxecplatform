"use server";

/**
 * Server Actions для employer-side: Company Profile + Mandate (Role Profile).
 * Все используют partial-update паттерн (по секциям wizard).
 */

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import {
  scoreAllCandidatesForRole,
} from "@/lib/scoring/run-scoring";
import { redirect } from "next/navigation";

// ────────────────────────────────────────────────────────────────────
//  Helpers
// ────────────────────────────────────────────────────────────────────

async function requireCompanyProfile() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("UNAUTHENTICATED");
  const profile = await prisma.companyProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!profile) throw new Error("NO_COMPANY_PROFILE");
  return profile;
}

async function ensureCompanyOwnsMandate(mandateId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("UNAUTHENTICATED");
  const mandate = await prisma.mandate.findUnique({
    where: { id: mandateId },
    include: { company: { select: { userId: true } } },
  });
  if (!mandate) throw new Error("MANDATE_NOT_FOUND");
  if (mandate.company.userId !== session.user.id) {
    const u = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });
    if (u?.role !== "ADMIN") throw new Error("FORBIDDEN");
  }
  return mandate;
}

// ────────────────────────────────────────────────────────────────────
//  Company Profile — секционные апдейты
// ────────────────────────────────────────────────────────────────────

export type CompanyProfilePatch = {
  // CP.1 — Identity
  name?: string;
  legalEntity?: string;
  yearFounded?: number | null;
  descriptionShort?: string;
  descriptionFull?: string;
  mainProduct?: string;
  industryPrimary?: string;
  industriesSecondary?: string[];
  companyType?: string;
  b2bB2c?: string;
  revenueRange?: string;
  ebitdaRange?: string;
  employeeCount?: string;
  geography?: string[];
  hqCity?: string;
  ownershipType?: string;
  ownershipDesc?: string;

  // CP.2 — Stage
  stage?: string;
  growthChallenges?: { top3?: string[]; all?: string[] };
  revenueGrowth?: string;
  staffGrowth?: string;
  growthPlan?: string;

  // CP.3 — Culture
  cultureAsIs?: { D1: number; D2: number; D3: number; D4: number };
  cultureToBe?: { D1: number; D2: number; D3: number; D4: number };
  workingStyle?: { pace: number; structure: number; risk: number; focus: number };
  culturalMarkers?: string[];

  // CP.4 — Leadership
  leadershipStyleRanking?: [string, number][];
  leaderExpectationsTop3?: string[];

  // CP.5 — Environment
  workFormat?: string;
  travelFrequency?: string;
  compPositioning?: string;
  hiringDecisionMakers?: string[];
  hiringProcess?: string;
  hiringTimeline?: string;

  // CP.6 — Values
  values?: { name: string; description: string }[];
  evp?: string;
  honestChallenges?: string;

  // CP.7 — Team
  cLevelTeam?: { role: string; filled: boolean; tenure?: string; source?: string }[];
  teamFormation?: string;
  teamTurnover?: string;
  teamDynamics?: string[];

  // CP.8 — Confidentiality
  showName?: boolean;
  codename?: string;
  showLogo?: boolean;
  notifyRejected?: boolean;
};

export async function saveCompanyProfileSection(
  patch: CompanyProfilePatch,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const profile = await requireCompanyProfile();

    // Sanitize patch — undefined skipped, null cleared, JSON converted
    const data: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(patch)) {
      if (v === undefined) continue;
      data[k] = v;
    }

    if (Object.keys(data).length === 0) return { ok: true };

    // Recompute completion %
    const completion = await computeProfileCompletion(profile.id, patch);
    data.profileCompletion = completion;

    await prisma.companyProfile.update({
      where: { id: profile.id },
      data,
    });

    revalidatePath("/company/profile");
    revalidatePath("/company/dashboard");
    return { ok: true };
  } catch (error) {
    console.error("[saveCompanyProfileSection]", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Простая модель completion: 8 секций × 12.5% каждая.
 * Считаем секцию заполненной если есть хотя бы 1 ключевое поле.
 */
async function computeProfileCompletion(
  companyProfileId: string,
  patch: CompanyProfilePatch,
): Promise<number> {
  const current = await prisma.companyProfile.findUnique({
    where: { id: companyProfileId },
  });
  if (!current) return 0;

  // Merge current + patch
  const m = { ...current, ...patch } as Record<string, unknown>;

  const sections: { weight: number; check: () => boolean }[] = [
    {
      weight: 15,
      check: () =>
        !!(m.name || m.companyName) &&
        !!m.industryPrimary &&
        !!m.companyType &&
        !!m.revenueRange,
    }, // CP.1
    { weight: 15, check: () => !!m.stage }, // CP.2
    {
      weight: 25,
      check: () => {
        const c = m.cultureAsIs as { D1: number } | null;
        return !!c && !!m.workingStyle;
      },
    }, // CP.3
    {
      weight: 10,
      check: () => Array.isArray(m.leadershipStyleRanking) && (m.leadershipStyleRanking as unknown[]).length > 0,
    }, // CP.4
    { weight: 10, check: () => !!m.workFormat }, // CP.5
    {
      weight: 15,
      check: () => Array.isArray(m.values) && (m.values as unknown[]).length > 0 && !!m.evp,
    }, // CP.6
    {
      weight: 5,
      check: () => Array.isArray(m.cLevelTeam) && (m.cLevelTeam as unknown[]).length > 0,
    }, // CP.7
    { weight: 5, check: () => true }, // CP.8 (always considered ok — defaults exist)
  ];

  return sections
    .filter((s) => s.check())
    .reduce((sum, s) => sum + s.weight, 0);
}

// ────────────────────────────────────────────────────────────────────
//  Mandate — создание из шаблона
// ────────────────────────────────────────────────────────────────────

export async function createMandateFromTemplate(args: {
  templateId?: string;
  title: string;
}): Promise<{ ok: true; mandateId: string } | { ok: false; error: string }> {
  try {
    const company = await requireCompanyProfile();

    const tpl = args.templateId
      ? await prisma.roleTemplate.findUnique({ where: { id: args.templateId } })
      : null;

    const mandate = await prisma.mandate.create({
      data: {
        companyId: company.id,
        title: args.title,
        status: "DRAFT",
        templateUsed: args.templateId ?? null,
        // Pre-fill из template (если есть)
        level: tpl ? tpl.role.startsWith("CEO") ? "CEO" : "C-level" : null,
        function: tpl ? mapRoleToFunction(tpl.role) : [],
        competencyMustHave: tpl?.competencyMustHave ?? [],
        competencyImportant: tpl?.competencyImportant ?? [],
        competencyNiceToHave: tpl?.competencyNiceToHave ?? [],
        personalityPrefs: tpl?.personalityPrefs ?? {},
        riskTolerance: tpl?.riskTolerance ?? {},
        motivationTop3: tpl?.motivationTop3 ?? [],
        motivationMiddle3: tpl?.motivationMiddle3 ?? [],
        motivationBottom2: tpl?.motivationBottom2 ?? [],
      },
    });

    revalidatePath("/company/mandates");
    return { ok: true, mandateId: mandate.id };
  } catch (error) {
    console.error("[createMandateFromTemplate]", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

function mapRoleToFunction(role: string): string[] {
  switch (role) {
    case "CEO": return ["general_management"];
    case "CFO": return ["finance"];
    case "CTO": return ["technology"];
    case "COO": return ["operations"];
    case "CHRO": return ["hr"];
    case "CMO": return ["marketing"];
    default: return [];
  }
}

// ────────────────────────────────────────────────────────────────────
//  Mandate — секционные апдейты
// ────────────────────────────────────────────────────────────────────

export type MandatePatch = {
  // R.1
  title?: string;
  level?: string;
  function?: string[];
  isNewRole?: boolean;
  reportsTo?: string;
  directReports?: number | null;
  totalTeam?: number | null;
  pnlRange?: string;
  geographyResponsibility?: string[];
  relocationRequired?: string;
  travelPct?: string;

  budgetRange?: string;
  budgetStructure?: string;
  equityAvailable?: string;
  compFlexibility?: string;

  mainChallenge?: string;
  keyTasks?: { task: string; rank: number }[];
  openingReason?: string;

  hardFilters?: {
    min_years?: number;
    min_pnl?: string;
    required_industries?: string[];
    required_contexts?: string[];
    international_required?: boolean;
    mba_required?: boolean;
  };

  // R.2
  competencyMustHave?: string[];
  competencyImportant?: string[];
  competencyNiceToHave?: string[];
  competencyContexts?: Record<string, string>;

  // R.3
  personalityPrefs?: Record<string, "high" | "moderate" | "not_critical">;

  // R.4
  riskTolerance?: Record<string, "zero" | "low" | "standard">;

  // R.5
  motivationTop3?: string[];
  motivationMiddle3?: string[];
  motivationBottom2?: string[];

  // R.6
  cultureToBeOverride?: { D1: number; D2: number; D3: number; D4: number } | null;
  styleOverride?: { pace: number; structure: number; risk: number; focus: number } | null;

  // R.7
  idealCandidateText?: string;
  antiProfileText?: string;
};

export async function saveMandateSection(
  mandateId: string,
  patch: MandatePatch,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await ensureCompanyOwnsMandate(mandateId);

    const data: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(patch)) {
      if (v === undefined) continue;
      data[k] = v;
    }

    if (Object.keys(data).length === 0) return { ok: true };

    await prisma.mandate.update({
      where: { id: mandateId },
      data,
    });

    revalidatePath(`/company/mandates/${mandateId}`);
    return { ok: true };
  } catch (error) {
    console.error("[saveMandateSection]", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ────────────────────────────────────────────────────────────────────
//  Mandate — активация (DRAFT → ACTIVE) + scoring trigger
// ────────────────────────────────────────────────────────────────────

export async function activateMandate(
  mandateId: string,
): Promise<{ ok: true; scored: number } | { ok: false; error: string }> {
  try {
    await ensureCompanyOwnsMandate(mandateId);

    await prisma.mandate.update({
      where: { id: mandateId },
      data: { status: "ACTIVE" },
    });

    // Прогон scoring engine
    let scored = 0;
    try {
      const result = await scoreAllCandidatesForRole(mandateId);
      scored = result.scored;
    } catch (e) {
      console.error("[activateMandate] scoring trigger failed:", e);
    }

    revalidatePath(`/company/mandates/${mandateId}`);
    revalidatePath(`/company/mandates/${mandateId}/candidates`);
    revalidatePath("/company/mandates");
    return { ok: true, scored };
  } catch (error) {
    console.error("[activateMandate]", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ────────────────────────────────────────────────────────────────────
//  Form-style server action для wizard "Сохранить и продолжить"
// ────────────────────────────────────────────────────────────────────

/**
 * Сохраняет секцию Company Profile и редиректит на следующий шаг.
 * Используется в Server Form wizard'е.
 */
export async function saveCompanySectionAndContinue(
  section: string,
  patch: CompanyProfilePatch,
  nextStep: number,
) {
  const result = await saveCompanyProfileSection(patch);
  if (!result.ok) {
    throw new Error(result.error);
  }
  redirect(`/company/profile?step=${nextStep}`);
}
