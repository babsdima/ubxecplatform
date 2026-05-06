/**
 * Hard Filters — Stage 3 scoring pipeline.
 *
 * Бинарная отсечка кандидатов до scoring (Scoring Model §4).
 * Не прошедший фильтр кандидат исключается из matching для этой роли,
 * но не с платформы.
 */

import type { CandidateProfile, CandidatePreferences, Mandate } from "@prisma/client";

// ────────────────────────────────────────────────────────────────────
//  Утилиты для сравнения порядков диапазонов
// ────────────────────────────────────────────────────────────────────

/** Ранг P&L диапазона: больше = крупнее. Используется в hard и в track-record. */
export const PNL_RANK: Record<string, number> = {
  none: 0,
  "<500M": 1,
  "500M_2B": 2,
  "2B_10B": 3,
  "10B+": 4,
};

/** Ранг диапазона выручки компании. */
export const REVENUE_RANK: Record<string, number> = {
  "<100M": 0,
  "100M_500M": 1,
  "500M_1B": 2,
  "1B_5B": 3,
  "5B_10B": 4,
  "10B_50B": 5,
  "50B+": 6,
};

/** Ранг диапазона компенсации (total cash). Числа = средняя точка диапазона в млн ₽. */
export const COMP_MID: Record<string, number> = {
  "5_10M": 7.5,
  "10_15M": 12.5,
  "15_25M": 20,
  "25_40M": 32.5,
  "40_60M": 50,
  "60M+": 75,
};

// ────────────────────────────────────────────────────────────────────
//  Hard filters
// ────────────────────────────────────────────────────────────────────

export type HardFilters = {
  /** Минимальный опыт управления (лет) */
  min_years?: number;
  /** Минимальный P&L (ключ из PNL_RANK) */
  min_pnl?: string;
  /** Обязательные отрасли (ИЛИ) — кандидат должен иметь опыт в одной из */
  required_industries?: string[];
  /** Обязательные контексты (И) — кандидат должен иметь опыт во всех */
  required_contexts?: string[];
  /** International опыт обязателен */
  international_required?: boolean;
  /** MBA обязателен */
  mba_required?: boolean;
  /** Языки */
  languages?: string[];
};

export type HardFilterResult =
  | { passed: true }
  | { passed: false; failedFilter: string; reason: string };

/**
 * Проверяет, проходит ли кандидат hard filters мандата.
 * Возвращает первую неудачу (короткозамкнутый return).
 */
export function passesHardFilters(
  candidate: CandidateProfile,
  preferences: CandidatePreferences | null,
  mandate: Mandate,
): HardFilterResult {
  const hf = (mandate.hardFilters as HardFilters | null) ?? {};

  // ─── 1. Опыт управления ───
  if (hf.min_years && (candidate.yearsManagement ?? 0) < hf.min_years) {
    return {
      passed: false,
      failedFilter: "experience",
      reason: `Минимум ${hf.min_years} лет опыта; у кандидата ${candidate.yearsManagement ?? 0}`,
    };
  }

  // ─── 2. P&L ───
  if (hf.min_pnl && hf.min_pnl !== "none") {
    const required = PNL_RANK[hf.min_pnl] ?? 0;
    const actual = PNL_RANK[candidate.maxPnl ?? "none"] ?? 0;
    if (actual < required) {
      return {
        passed: false,
        failedFilter: "pnl",
        reason: `Требуется P&L ≥ ${hf.min_pnl}; у кандидата ${candidate.maxPnl ?? "n/a"}`,
      };
    }
  }

  // ─── 3. Отрасли (ИЛИ-логика) ───
  if (hf.required_industries && hf.required_industries.length > 0) {
    const candidateIndustries =
      (candidate.industries as string[] | null) ?? [];
    const overlap = hf.required_industries.some((ri) =>
      candidateIndustries.includes(ri),
    );
    if (!overlap) {
      return {
        passed: false,
        failedFilter: "industry",
        reason: `Отрасль не подходит (требуются: ${hf.required_industries.join(", ")})`,
      };
    }
  }

  // ─── 4. Контексты опыта (И-логика, все обязательны) ───
  if (hf.required_contexts && hf.required_contexts.length > 0) {
    const candidateContexts =
      (candidate.experienceContexts as string[] | null) ?? [];
    const missing = hf.required_contexts.filter(
      (rc) => !candidateContexts.includes(rc),
    );
    if (missing.length > 0) {
      return {
        passed: false,
        failedFilter: "contexts",
        reason: `Не хватает опыта в: ${missing.join(", ")}`,
      };
    }
  }

  // ─── 5. International ───
  if (hf.international_required) {
    const intl = (candidate.internationalExp as string[] | null) ?? [];
    if (intl.length === 0) {
      return {
        passed: false,
        failedFilter: "international",
        reason: "Требуется международный опыт",
      };
    }
  }

  // ─── 6. Релокация (mutual fit) ───
  if (mandate.relocationRequired === "yes") {
    if (preferences?.relocation === "not_ready") {
      return {
        passed: false,
        failedFilter: "relocation",
        reason: "Роль требует релокации, кандидат не готов",
      };
    }
  }

  // ─── 7. Компенсация (mutual fit) ───
  if (mandate.budgetRange && preferences?.totalCashRange) {
    const budget = COMP_MID[mandate.budgetRange] ?? 0;
    const expectation = COMP_MID[preferences.totalCashRange] ?? 0;
    // Допускаем расхождение до 50% — за пределами это серьёзный mismatch
    if (expectation > budget * 1.5) {
      return {
        passed: false,
        failedFilter: "compensation",
        reason: `Ожидания компенсации (${preferences.totalCashRange}) значительно выше бюджета роли (${mandate.budgetRange})`,
      };
    }
  }

  // ─── 8. Активность кандидата ───
  if (preferences?.activityStatus === "not_available") {
    return {
      passed: false,
      failedFilter: "availability",
      reason: "Кандидат недоступен",
    };
  }

  // ─── 9. Dealbreakers (mutual) ───
  const dealbreakers = (preferences?.dealbreakers as string[] | null) ?? [];
  if (dealbreakers.includes("government") && mandate.companyId) {
    // Проверка типа компании потребует подгрузки CompanyProfile —
    // выносим в orchestrator (там уже есть company). Здесь skip.
  }

  return { passed: true };
}
