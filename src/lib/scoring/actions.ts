"use server";

/**
 * Server Actions для триггера scoring engine.
 *
 * Используются:
 * - При завершении блоков опросника (questionnaire/actions.ts → triggerScoringForCandidate)
 * - При создании/обновлении мандата (employer-side, Phase 6)
 * - Из admin-инструмента или ручных ревью
 */

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  scoreCandidateForRole,
  scoreCandidateForAllRoles,
  scoreAllCandidatesForRole,
} from "./run-scoring";
import { revalidatePath } from "next/cache";

// ────────────────────────────────────────────────────────────────────
//  triggerScoringForCandidate — пересчёт всех matches для кандидата
// ────────────────────────────────────────────────────────────────────

export async function triggerScoringForCandidate(
  candidateProfileId?: string,
): Promise<{ ok: true; scored: number; filtered: number; failed: number } | { ok: false; error: string }> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { ok: false, error: "UNAUTHENTICATED" };
    }

    let targetId = candidateProfileId;
    if (!targetId) {
      // По умолчанию — текущий кандидат
      const profile = await prisma.candidateProfile.findUnique({
        where: { userId: session.user.id },
        select: { id: true },
      });
      if (!profile) return { ok: false, error: "Профиль не найден" };
      targetId = profile.id;
    } else {
      // Если ID передан явно — это admin operation (или сам кандидат)
      const profile = await prisma.candidateProfile.findUnique({
        where: { id: targetId },
        select: { userId: true },
      });
      if (!profile) return { ok: false, error: "Профиль не найден" };

      if (profile.userId !== session.user.id) {
        // Не свой профиль — нужны admin права
        const user = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { role: true },
        });
        if (user?.role !== "ADMIN") {
          return { ok: false, error: "FORBIDDEN" };
        }
      }
    }

    const result = await scoreCandidateForAllRoles(targetId);
    revalidatePath("/candidate/matches");
    revalidatePath("/candidate/dashboard");
    return { ok: true, ...result };
  } catch (error) {
    console.error("[triggerScoringForCandidate]", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ────────────────────────────────────────────────────────────────────
//  triggerScoringForMandate — пересчёт всех matches для мандата
// ────────────────────────────────────────────────────────────────────

export async function triggerScoringForMandate(
  mandateId: string,
): Promise<{ ok: true; scored: number; filtered: number; failed: number } | { ok: false; error: string }> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { ok: false, error: "UNAUTHENTICATED" };
    }

    // Проверка авторизации: только владелец компании или admin
    const mandate = await prisma.mandate.findUnique({
      where: { id: mandateId },
      include: { company: { select: { userId: true } } },
    });
    if (!mandate) return { ok: false, error: "Мандат не найден" };

    if (mandate.company.userId !== session.user.id) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
      });
      if (user?.role !== "ADMIN") {
        return { ok: false, error: "FORBIDDEN" };
      }
    }

    const result = await scoreAllCandidatesForRole(mandateId);
    revalidatePath(`/company/mandates/${mandateId}`);
    return { ok: true, ...result };
  } catch (error) {
    console.error("[triggerScoringForMandate]", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ────────────────────────────────────────────────────────────────────
//  rescoreSingle — admin tool, пересчитать одну пару
// ────────────────────────────────────────────────────────────────────

export async function rescoreSingleMatch(
  candidateProfileId: string,
  mandateId: string,
): Promise<{ ok: true; score: number } | { ok: false; error: string }> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { ok: false, error: "UNAUTHENTICATED" };

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });
    if (user?.role !== "ADMIN") return { ok: false, error: "FORBIDDEN" };

    const result = await scoreCandidateForRole(candidateProfileId, mandateId);
    if (!result.ok) {
      return { ok: false, error: result.reason };
    }
    return { ok: true, score: result.overallScore };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
