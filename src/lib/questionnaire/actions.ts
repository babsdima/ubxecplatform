"use server";

/**
 * Server Actions для прохождения опросника (Блоки A, B; будут расширены).
 *
 * Все actions:
 * - Проверяют auth (session.user.id) — обязательно для security
 * - Работают с Prisma напрямую (db.ts)
 * - Возвращают plain objects (для безопасной сериализации)
 */

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { BlockId, ResponseValue } from "./types";
import { getBlock } from "./blocks";
import {
  validateE1Distribution,
  type E1Distribution,
  type E1Examples,
} from "./blocks/blockE1";
import { calculateRawScores } from "./scoring/raw-scores";
import { computeMvpNorms, normalizeAllScales } from "./scoring/normalize";
import {
  calculateBlockCScores,
  calculateBlockDScores,
} from "./scoring/block-cd";
import { scoreCandidateForAllRoles } from "@/lib/scoring/run-scoring";
import { revalidatePath } from "next/cache";

// ────────────────────────────────────────────────────────────────────
//  Helpers
// ────────────────────────────────────────────────────────────────────

async function requireCandidateProfile() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("UNAUTHENTICATED");
  }
  const profile = await prisma.candidateProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!profile) {
    throw new Error("NO_PROFILE");
  }
  return profile;
}

// ────────────────────────────────────────────────────────────────────
//  saveQuestionResponse — autosave каждый ответ
// ────────────────────────────────────────────────────────────────────

export type SaveResponseResult =
  | { ok: true }
  | { ok: false; error: string };

export async function saveQuestionResponse(
  blockId: BlockId,
  questionId: string,
  value: ResponseValue,
): Promise<SaveResponseResult> {
  try {
    const profile = await requireCandidateProfile();

    const block = getBlock(blockId);
    if (!block) {
      return { ok: false, error: "Блок не найден" };
    }

    // Валидация: вопрос принадлежит этому блоку
    const question = block.questions.find((q) => q.id === questionId);
    if (!question) {
      return { ok: false, error: "Вопрос не найден в блоке" };
    }

    // Загружаем существующую запись (если есть) для merge ответов
    const existing = await prisma.questionnaireResponse.findUnique({
      where: {
        candidateProfileId_block: {
          candidateProfileId: profile.id,
          block: blockId,
        },
      },
    });

    const existingResponses =
      (existing?.responses as Record<string, ResponseValue> | null) ?? {};
    const updatedResponses = { ...existingResponses, [questionId]: value };

    await prisma.questionnaireResponse.upsert({
      where: {
        candidateProfileId_block: {
          candidateProfileId: profile.id,
          block: blockId,
        },
      },
      update: {
        responses: updatedResponses,
      },
      create: {
        candidateProfileId: profile.id,
        block: blockId,
        responses: updatedResponses,
      },
    });

    return { ok: true };
  } catch (error) {
    console.error("[saveQuestionResponse]", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ────────────────────────────────────────────────────────────────────
//  completeBlock — финализирует блок: raw → стены → ScaleScore
// ────────────────────────────────────────────────────────────────────

export type CompleteBlockResult =
  | {
      ok: true;
      /** Для блоков A/B — стены; для C/D — varies (см. payload) */
      payload?: Record<string, unknown>;
      missingQuestions: number;
    }
  | { ok: false; error: string };

export async function completeBlock(
  blockId: BlockId,
  completionTimeSec?: number,
): Promise<CompleteBlockResult> {
  try {
    const profile = await requireCandidateProfile();

    const block = getBlock(blockId);
    if (!block) {
      return { ok: false, error: "Блок не найден" };
    }

    // Загружаем сохранённые ответы
    const record = await prisma.questionnaireResponse.findUnique({
      where: {
        candidateProfileId_block: {
          candidateProfileId: profile.id,
          block: blockId,
        },
      },
    });

    if (!record) {
      return { ok: false, error: "Нет сохранённых ответов" };
    }

    const responses =
      (record.responses as Record<string, ResponseValue> | null) ?? {};

    // Подсчёт незавершённости (для предупреждения)
    const answered = Object.keys(responses).length;
    const total = block.questions.length;
    const missingQuestions = total - answered;

    if (answered < Math.ceil(total * 0.8)) {
      // Меньше 80% — не завершаем
      return {
        ok: false,
        error: `Заполните минимум 80% вопросов (${Math.ceil(total * 0.8)} из ${total}). Сейчас: ${answered}.`,
      };
    }

    // Сохраняем completedAt в QuestionnaireResponse
    await prisma.questionnaireResponse.update({
      where: { id: record.id },
      data: {
        completedAt: new Date(),
        completionTimeSec: completionTimeSec ?? null,
      },
    });

    // Block-specific scoring → updateField для ScaleScore
    let updateField: Record<string, unknown> = {};
    let payload: Record<string, unknown> = {};

    if (blockId === "A" || blockId === "B") {
      const rawScores = calculateRawScores(block.questions, responses);
      const norms = computeMvpNorms(block.questions);
      const stens = normalizeAllScales(rawScores, norms);
      updateField = blockId === "A" ? { aStens: stens } : { bStens: stens };
      payload = { stens };
    } else if (blockId === "C") {
      const { ipsative, normative } = calculateBlockCScores(
        block.questions,
        responses,
      );
      updateField = { cIpsative: ipsative, cNormative: normative };
      payload = { ipsative, normative };
    } else if (blockId === "D") {
      const { culturePct, style } = calculateBlockDScores(
        block.questions,
        responses,
      );
      updateField = { dCulturePct: culturePct, dStyle: style };
      payload = { culturePct, style };
    }

    await prisma.scaleScore.upsert({
      where: { candidateProfileId: profile.id },
      update: { ...updateField, scoredAt: new Date() },
      create: {
        candidateProfileId: profile.id,
        ...updateField,
      },
    });

    // Триггер scoring engine — пересчёт matches для этого кандидата
    // (best-effort, не блокируем UI ошибкой scoring)
    try {
      await scoreCandidateForAllRoles(profile.id);
    } catch (e) {
      console.error("[completeBlock] scoring trigger failed:", e);
    }

    revalidatePath("/candidate/assessment");
    revalidatePath("/candidate/dashboard");
    revalidatePath("/candidate/matches");

    return { ok: true, payload, missingQuestions };
  } catch (error) {
    console.error("[completeBlock]", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ────────────────────────────────────────────────────────────────────
//  getBlockProgress — для resume + общий прогресс
// ────────────────────────────────────────────────────────────────────

export type BlockProgress = {
  blockId: BlockId;
  totalQuestions: number;
  answered: number;
  completedAt: Date | null;
};

export async function getAllBlockProgress(): Promise<BlockProgress[]> {
  const profile = await requireCandidateProfile();

  const records = await prisma.questionnaireResponse.findMany({
    where: { candidateProfileId: profile.id },
  });

  const progress: BlockProgress[] = [];
  for (const blockId of ["A", "B", "C", "D"] as BlockId[]) {
    const block = getBlock(blockId);
    if (!block) continue;

    const record = records.find((r) => r.block === blockId);
    const responses =
      (record?.responses as Record<string, ResponseValue> | null) ?? {};
    const answered = Object.keys(responses).length;

    progress.push({
      blockId,
      totalQuestions: block.questions.length,
      answered,
      completedAt: record?.completedAt ?? null,
    });
  }

  return progress;
}

export async function getBlockResponses(
  blockId: BlockId,
): Promise<Record<string, ResponseValue>> {
  const profile = await requireCandidateProfile();

  const record = await prisma.questionnaireResponse.findUnique({
    where: {
      candidateProfileId_block: {
        candidateProfileId: profile.id,
        block: blockId,
      },
    },
  });

  return (record?.responses as Record<string, ResponseValue> | null) ?? {};
}

// ────────────────────────────────────────────────────────────────────
//  Block E.1 — forced-distribution компетенций
// ────────────────────────────────────────────────────────────────────

export type SaveE1Result =
  | { ok: true }
  | { ok: false; error: string };

export async function saveE1Distribution(
  distribution: E1Distribution,
  examples?: E1Examples,
): Promise<SaveE1Result> {
  try {
    const profile = await requireCandidateProfile();

    // Валидация: ровно 5 в каждой группе, нет дубликатов
    const validation = validateE1Distribution(distribution);
    if (!validation.valid) {
      return { ok: false, error: validation.error ?? "Invalid distribution" };
    }

    // Проверим, что все competency IDs существуют
    const allIds = [
      ...distribution.top5,
      ...distribution.middle5,
      ...distribution.bottom5,
    ];
    const existingCompetencies = await prisma.competency.findMany({
      where: { id: { in: allIds } },
      select: { id: true },
    });
    if (existingCompetencies.length !== allIds.length) {
      return { ok: false, error: "Некоторые компетенции не найдены" };
    }

    // Сохраняем в ScaleScore
    await prisma.scaleScore.upsert({
      where: { candidateProfileId: profile.id },
      update: {
        e1Distribution: distribution as unknown as object,
        e1Examples: (examples ?? {}) as unknown as object,
        scoredAt: new Date(),
      },
      create: {
        candidateProfileId: profile.id,
        e1Distribution: distribution as unknown as object,
        e1Examples: (examples ?? {}) as unknown as object,
      },
    });

    // Маркер завершения: запись в QuestionnaireResponse с completedAt
    await prisma.questionnaireResponse.upsert({
      where: {
        candidateProfileId_block: {
          candidateProfileId: profile.id,
          block: "E1",
        },
      },
      update: { completedAt: new Date() },
      create: {
        candidateProfileId: profile.id,
        block: "E1",
        responses: { distribution, examples: examples ?? {} } as unknown as object,
        completedAt: new Date(),
      },
    });

    // Триггер scoring (best-effort)
    try {
      await scoreCandidateForAllRoles(profile.id);
    } catch (e) {
      console.error("[saveE1Distribution] scoring trigger failed:", e);
    }

    revalidatePath("/candidate/assessment");
    revalidatePath("/candidate/dashboard");
    revalidatePath("/candidate/matches");
    return { ok: true };
  } catch (error) {
    console.error("[saveE1Distribution]", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getE1State(): Promise<{
  distribution: E1Distribution | null;
  examples: E1Examples;
  completed: boolean;
}> {
  const profile = await requireCandidateProfile();

  const score = await prisma.scaleScore.findUnique({
    where: { candidateProfileId: profile.id },
    select: { e1Distribution: true, e1Examples: true },
  });

  const record = await prisma.questionnaireResponse.findUnique({
    where: {
      candidateProfileId_block: {
        candidateProfileId: profile.id,
        block: "E1",
      },
    },
    select: { completedAt: true },
  });

  return {
    distribution: (score?.e1Distribution as E1Distribution | null) ?? null,
    examples: (score?.e1Examples as E1Examples | null) ?? {},
    completed: !!record?.completedAt,
  };
}
