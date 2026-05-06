"use server";

/**
 * Server Actions для Блоков E.2 (Track Record) и E.3 (Preferences).
 * Это структурированные формы, не психометрика — поэтому отдельный модуль.
 */

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { scoreCandidateForAllRoles } from "@/lib/scoring/run-scoring";
import { revalidatePath } from "next/cache";

async function requireProfile() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("UNAUTHENTICATED");
  const profile = await prisma.candidateProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!profile) throw new Error("NO_PROFILE");
  return profile;
}

// ────────────────────────────────────────────────────────────────────
//  E.2 — Track Record (структурированные факты карьеры)
// ────────────────────────────────────────────────────────────────────

export type TrackRecordInput = {
  currentLevel?: string;
  currentFunction?: string[];
  companyType?: string;
  companyRevenue?: string;
  companyEmployees?: string;
  directReports?: number | null;
  totalReports?: number | null;
  pnlRange?: string;
  tenureCurrent?: string;
  reasonSeeking?: string;

  yearsManagement?: number | null;
  maxPnl?: string;
  maxReports?: number | null;
  industries?: string[];
  companyTypes?: string[];
  experienceContexts?: string[];
  internationalExp?: string[];
};

export async function saveTrackRecord(
  input: TrackRecordInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const profile = await requireProfile();

    await prisma.candidateProfile.update({
      where: { id: profile.id },
      data: {
        currentLevel: input.currentLevel ?? null,
        currentFunction: input.currentFunction ?? [],
        companyType: input.companyType ?? null,
        companyRevenue: input.companyRevenue ?? null,
        companyEmployees: input.companyEmployees ?? null,
        directReports: input.directReports,
        totalReports: input.totalReports,
        pnlRange: input.pnlRange ?? null,
        tenureCurrent: input.tenureCurrent ?? null,
        reasonSeeking: input.reasonSeeking ?? null,

        yearsManagement: input.yearsManagement,
        maxPnl: input.maxPnl ?? null,
        maxReports: input.maxReports,
        industries: input.industries ?? [],
        companyTypes: input.companyTypes ?? [],
        experienceContexts: input.experienceContexts ?? [],
        internationalExp: input.internationalExp ?? [],
      },
    });

    // Маркер completion в QuestionnaireResponse
    const isComplete =
      !!input.currentLevel &&
      !!input.companyRevenue &&
      !!input.yearsManagement &&
      (input.industries?.length ?? 0) > 0;

    if (isComplete) {
      await prisma.questionnaireResponse.upsert({
        where: {
          candidateProfileId_block: {
            candidateProfileId: profile.id,
            block: "E2" as const,
          },
        },
        update: { completedAt: new Date() },
        create: {
          candidateProfileId: profile.id,
          block: "E2",
          responses: {} as object,
          completedAt: new Date(),
        },
      });
    }

    // Триггер scoring (best-effort) — особенно важно после E.2/E.3 поскольку
    // они влияют на hard filters
    try {
      await scoreCandidateForAllRoles(profile.id);
    } catch (e) {
      console.error("[E.2/E.3] scoring trigger failed:", e);
    }

    revalidatePath("/candidate/assessment");
    revalidatePath("/candidate/profile");
    revalidatePath("/candidate/matches");
    return { ok: true };
  } catch (error) {
    console.error("[saveTrackRecord]", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ────────────────────────────────────────────────────────────────────
//  E.3 — Preferences (карьерные предпочтения)
// ────────────────────────────────────────────────────────────────────

export type PreferencesInput = {
  activityStatus?: string;
  readiness?: string;
  targetRoles?: string[];
  targetIndustries?: string[];
  targetCompanyTypes?: string[];
  targetRevenue?: string[];
  geography?: string[];
  relocation?: string;
  totalCashRange?: string;
  equityImportance?: string;
  minFixedRange?: string;
  dealbreakers?: string[];
  top3Priorities?: string[];
};

export async function savePreferences(
  input: PreferencesInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const profile = await requireProfile();

    await prisma.candidatePreferences.upsert({
      where: { candidateProfileId: profile.id },
      update: {
        activityStatus: input.activityStatus ?? null,
        readiness: input.readiness ?? null,
        targetRoles: input.targetRoles ?? [],
        targetIndustries: input.targetIndustries ?? [],
        targetCompanyTypes: input.targetCompanyTypes ?? [],
        targetRevenue: input.targetRevenue ?? [],
        geography: input.geography ?? [],
        relocation: input.relocation ?? null,
        totalCashRange: input.totalCashRange ?? null,
        equityImportance: input.equityImportance ?? null,
        minFixedRange: input.minFixedRange ?? null,
        dealbreakers: input.dealbreakers ?? [],
        top3Priorities: input.top3Priorities ?? [],
      },
      create: {
        candidateProfileId: profile.id,
        activityStatus: input.activityStatus ?? null,
        readiness: input.readiness ?? null,
        targetRoles: input.targetRoles ?? [],
        targetIndustries: input.targetIndustries ?? [],
        targetCompanyTypes: input.targetCompanyTypes ?? [],
        targetRevenue: input.targetRevenue ?? [],
        geography: input.geography ?? [],
        relocation: input.relocation ?? null,
        totalCashRange: input.totalCashRange ?? null,
        equityImportance: input.equityImportance ?? null,
        minFixedRange: input.minFixedRange ?? null,
        dealbreakers: input.dealbreakers ?? [],
        top3Priorities: input.top3Priorities ?? [],
      },
    });

    // Маркер completion
    const isComplete =
      !!input.activityStatus &&
      (input.targetRoles?.length ?? 0) > 0 &&
      (input.top3Priorities?.length ?? 0) === 3;

    if (isComplete) {
      await prisma.questionnaireResponse.upsert({
        where: {
          candidateProfileId_block: {
            candidateProfileId: profile.id,
            block: "E3" as const,
          },
        },
        update: { completedAt: new Date() },
        create: {
          candidateProfileId: profile.id,
          block: "E3",
          responses: {} as object,
          completedAt: new Date(),
        },
      });
    }

    // Триггер scoring (best-effort) — особенно важно после E.2/E.3 поскольку
    // они влияют на hard filters
    try {
      await scoreCandidateForAllRoles(profile.id);
    } catch (e) {
      console.error("[E.2/E.3] scoring trigger failed:", e);
    }

    revalidatePath("/candidate/assessment");
    revalidatePath("/candidate/profile");
    revalidatePath("/candidate/matches");
    return { ok: true };
  } catch (error) {
    console.error("[savePreferences]", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
