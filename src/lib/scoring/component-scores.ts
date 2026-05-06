/**
 * Component Fit Scores — Stage 4 scoring pipeline.
 *
 * 6 функций, каждая возвращает 0-100 (или {score, flags}).
 * Алгоритмы — из Scoring Model §5.
 */

import { PNL_RANK } from "./hard-filters";
import type {
  CandidateProfile,
  CompanyProfile,
  Mandate,
} from "@prisma/client";

// ────────────────────────────────────────────────────────────────────
//  Helpers
// ────────────────────────────────────────────────────────────────────

/** clamp 0..100 */
const clamp = (n: number, min = 0, max = 100) =>
  Math.max(min, Math.min(max, n));

/** normalize: (raw - min) / (max - min) * 100 */
const normalize = (raw: number, min: number, max: number) =>
  clamp(((raw - min) / (max - min)) * 100);

// ────────────────────────────────────────────────────────────────────
//  1. Competency Fit (R.2 vs E.1)
// ────────────────────────────────────────────────────────────────────

export type CompetencyDistribution = {
  top5: string[];
  middle5: string[];
  bottom5: string[];
};

/**
 * Сравнение forced-distribution кандидата с must-have/important/nice мандата.
 * Scoring Model §5.1:
 *   - top5 ∩ must_have:        +3 each
 *   - middle5 ∩ must_have:     +1 each
 *   - bottom5 ∩ must_have:     -2 each (риск!)
 *   - top5 ∩ important:        +1 each (бонус)
 * Max possible = 5*3 + 5*1 = 20; min = 5*(-2) = -10
 * Нормализация в 0-100.
 */
export function competencyFit(
  candidateE1: CompetencyDistribution | null,
  mandate: Pick<
    Mandate,
    "competencyMustHave" | "competencyImportant" | "competencyNiceToHave"
  >,
): number {
  if (!candidateE1) return 50; // нет данных → нейтральный

  const mustHave = (mandate.competencyMustHave as string[] | null) ?? [];
  const important = (mandate.competencyImportant as string[] | null) ?? [];

  if (mustHave.length === 0) return 50; // мандат не специфицирует требования

  let score = 0;
  for (const comp of mustHave) {
    if (candidateE1.top5.includes(comp)) score += 3;
    else if (candidateE1.middle5.includes(comp)) score += 1;
    else score -= 2; // в bottom5 → риск
  }
  for (const comp of important) {
    if (candidateE1.top5.includes(comp)) score += 1;
    // middle/bottom для important не учитываются
  }

  // Max = mustHave.length * 3 + important.length * 1
  // Min = mustHave.length * (-2)
  const maxScore = mustHave.length * 3 + important.length * 1;
  const minScore = mustHave.length * -2;

  return Math.round(normalize(score, minScore, maxScore));
}

// ────────────────────────────────────────────────────────────────────
//  2. Track Record Fit (R.1 vs E.2)
// ────────────────────────────────────────────────────────────────────

/**
 * Композитный score: уровень + P&L + команда + отрасли + тип компании +
 * контексты + international.
 * Веса из Scoring Model §5.2.
 */
export function trackRecordFit(
  candidate: Pick<
    CandidateProfile,
    | "currentLevel"
    | "maxPnl"
    | "maxReports"
    | "industries"
    | "companyTypes"
    | "experienceContexts"
    | "internationalExp"
  >,
  mandate: Pick<
    Mandate,
    "level" | "pnlRange" | "totalTeam" | "industry" | "function" | "hardFilters"
  >,
  candidateIndustries: string[] = [],
): number {
  let score = 0;
  let maxScore = 0;

  // ─── 2.1 Уровень позиции (вес 15) ───
  maxScore += 15;
  const levelDistance = compareLevels(candidate.currentLevel, mandate.level);
  if (levelDistance === 0) score += 15;
  else if (levelDistance === 1) score += 10;
  else if (levelDistance === 2) score += 3;

  // ─── 2.2 P&L (вес 20) ───
  maxScore += 20;
  if (mandate.pnlRange) {
    const candPnl = PNL_RANK[candidate.maxPnl ?? "none"] ?? 0;
    const reqPnl = PNL_RANK[mandate.pnlRange] ?? 0;
    if (reqPnl === 0) {
      score += 20; // мандат не требует — нейтрально+
    } else {
      const ratio = candPnl / reqPnl;
      if (ratio >= 1) score += 20;
      else if (ratio >= 0.5) score += 12;
      else if (ratio >= 0.25) score += 5;
    }
  } else {
    score += 10;
  }

  // ─── 2.3 Команда (вес 10) ───
  maxScore += 10;
  if (mandate.totalTeam && mandate.totalTeam > 0) {
    const teamRatio = (candidate.maxReports ?? 0) / mandate.totalTeam;
    if (teamRatio >= 0.8) score += 10;
    else if (teamRatio >= 0.4) score += 6;
    else score += 2;
  } else {
    score += 5;
  }

  // ─── 2.4 Отрасли (вес 15) ───
  maxScore += 15;
  const candIndustries = candidateIndustries.length
    ? candidateIndustries
    : ((candidate.industries as string[] | null) ?? []);
  const hf = (mandate.hardFilters as { required_industries?: string[] } | null) ?? {};
  const requiredIndustries = hf.required_industries ?? [];
  if (requiredIndustries.length > 0) {
    const overlap = requiredIndustries.filter((ri) =>
      candIndustries.includes(ri),
    ).length;
    if (overlap >= 2) score += 15;
    else if (overlap === 1) score += 10;
    else score += 0;
  } else {
    score += 7; // нет требования → нейтрально+
  }

  // ─── 2.5 Контексты (вес 20) ───
  maxScore += 20;
  const candContexts = (candidate.experienceContexts as string[] | null) ?? [];
  const requiredContexts =
    ((mandate.hardFilters as { required_contexts?: string[] } | null)
      ?.required_contexts) ?? [];
  if (requiredContexts.length > 0) {
    const matched = requiredContexts.filter((c) => candContexts.includes(c)).length;
    score += Math.round(20 * (matched / requiredContexts.length));
  } else {
    // Без явных требований: бонус за разнообразие контекстов (но capped)
    const richness = Math.min(candContexts.length, 5) / 5;
    score += Math.round(15 * richness);
  }

  // ─── 2.6 International (вес 10) ───
  maxScore += 10;
  const candIntl = (candidate.internationalExp as string[] | null) ?? [];
  const intlRequired =
    (mandate.hardFilters as { international_required?: boolean } | null)
      ?.international_required ?? false;
  if (intlRequired) {
    score += candIntl.length > 0 ? 10 : 0;
  } else {
    score += candIntl.length > 0 ? 7 : 5;
  }

  // ─── 2.7 Тип компании (вес 10) ───
  maxScore += 10;
  // (мандаты не имеют поле companyType отдельно от CompanyProfile —
  //  упрощённо считаем по hardFilters если есть)
  const candTypes = (candidate.companyTypes as string[] | null) ?? [];
  if (candTypes.length > 0) score += 10;
  else score += 5;

  return Math.round((score / maxScore) * 100);
}

const LEVEL_RANK: Record<string, number> = {
  CEO: 4,
  "C-level": 3,
  "C-1": 2,
  "C-2": 1,
  board: 4,
};

function compareLevels(a: string | null, b: string | null): number {
  const ra = a ? LEVEL_RANK[a] ?? 2 : 2;
  const rb = b ? LEVEL_RANK[b] ?? 2 : 2;
  return Math.abs(ra - rb);
}

// ────────────────────────────────────────────────────────────────────
//  3. Personality Fit (R.3 vs A)
// ────────────────────────────────────────────────────────────────────

export type PersonalityPrefs = Record<string, "high" | "moderate" | "not_critical">;

/**
 * Range fit по 10 шкалам A1-A10.
 * Scoring Model §5.3:
 *   - "high":         ожидаем sten ≥ 7 → +2 если так, +1 если ≥5, иначе -1
 *   - "moderate":     ожидаем sten 4-7 → +1 если так, +0.5 если ≥8, иначе 0
 *   - "not_critical": не учитывается
 * Нормализация в 0-100; если все шкалы "not_critical" → 50 (нейтральный).
 */
export function personalityFit(
  candidateAStens: Record<string, number> | null,
  rolePersonalityPrefs: PersonalityPrefs | null,
): number {
  if (!candidateAStens || !rolePersonalityPrefs) return 50;

  let score = 0;
  let activeScales = 0;

  for (const scale of Object.keys(rolePersonalityPrefs)) {
    const pref = rolePersonalityPrefs[scale];
    const sten = candidateAStens[scale];
    if (sten === undefined) continue;

    if (pref === "high") {
      activeScales += 1;
      if (sten >= 7) score += 2;
      else if (sten >= 5) score += 1;
      else score -= 1;
    } else if (pref === "moderate") {
      activeScales += 1;
      if (sten >= 4 && sten <= 7) score += 1;
      else if (sten >= 8) score += 0.5;
      // < 4 → 0
    }
    // "not_critical" → skip
  }

  if (activeScales === 0) return 50;

  const max = activeScales * 2;
  const min = -activeScales;
  return Math.round(normalize(score, min, max));
}

// ────────────────────────────────────────────────────────────────────
//  4. Risk Score (R.4 vs B)
// ────────────────────────────────────────────────────────────────────

export type RiskTolerance = Record<string, "zero" | "low" | "standard">;

export type RiskFlag = {
  scale: string;
  severity: "red" | "yellow";
  message: string;
};

/**
 * Threshold check по 6 шкалам B1-B6.
 * Scoring Model §5.4:
 *   - tolerance "zero":     sten ≥ 7 → -3 (red), 4-6 → -1 (yellow)
 *   - tolerance "low":      sten ≥ 8 → -2 (red), 4-7 → ok
 *   - tolerance "standard": не учитывается
 *
 * 0 penalties = 100; max penalty (6 × 3 = 18) = 0.
 */
export function riskScore(
  candidateBStens: Record<string, number> | null,
  roleRiskTolerance: RiskTolerance | null,
  scaleNames: Record<string, string> = {},
): { score: number; flags: RiskFlag[] } {
  if (!candidateBStens || !roleRiskTolerance) {
    return { score: 50, flags: [] };
  }

  let penalty = 0;
  const flags: RiskFlag[] = [];

  for (const scale of Object.keys(roleRiskTolerance)) {
    const tolerance = roleRiskTolerance[scale];
    const sten = candidateBStens[scale];
    if (sten === undefined) continue;
    const niceName = scaleNames[scale] ?? scale;

    if (tolerance === "zero") {
      if (sten >= 7) {
        penalty += 3;
        flags.push({
          scale,
          severity: "red",
          message: `${niceName}: высокий уровень при нулевой толерантности роли`,
        });
      } else if (sten >= 4) {
        penalty += 1;
        flags.push({
          scale,
          severity: "yellow",
          message: `${niceName}: умеренный уровень — рекомендуется обсудить в интервью`,
        });
      }
    } else if (tolerance === "low") {
      if (sten >= 8) {
        penalty += 2;
        flags.push({
          scale,
          severity: "red",
          message: `${niceName}: высокий уровень`,
        });
      }
    }
    // "standard" → ok
  }

  const maxPenalty = 18;
  const score = Math.max(0, Math.round((1 - penalty / maxPenalty) * 100));
  return { score, flags };
}

// ────────────────────────────────────────────────────────────────────
//  5. Motivational Fit (R.5 vs C)
// ────────────────────────────────────────────────────────────────────

/**
 * Сравнение top3/middle3/bottom2 кандидата с top3/middle3 мандата.
 * Scoring Model §5.5:
 *   - top3_role ∩ top3_cand:    +3 each
 *   - top3_role ∩ middle3_cand: +1 each
 *   - top3_role ∩ bottom2_cand: -2 each (motivational misfit risk)
 *   - middle3_role ∩ top3_cand: +1 (бонус)
 * Max = 12 (3*3 + 3*1), min = -6 (3*-2). Нормализация 0-100.
 */
export function motivationalFit(
  candidateIpsative: Record<string, number> | null,
  mandate: Pick<
    Mandate,
    "motivationTop3" | "motivationMiddle3" | "motivationBottom2"
  >,
): number {
  if (!candidateIpsative) return 50;

  // Получаем top3/middle3/bottom2 кандидата по убыванию ипсативного score
  const sorted = Object.entries(candidateIpsative).sort(
    ([, a], [, b]) => b - a,
  );
  const candTop3 = sorted.slice(0, 3).map(([s]) => s);
  const candMiddle3 = sorted.slice(3, 6).map(([s]) => s);
  const candBottom2 = sorted.slice(6, 8).map(([s]) => s);

  const roleTop3 = (mandate.motivationTop3 as string[] | null) ?? [];
  const roleMiddle3 = (mandate.motivationMiddle3 as string[] | null) ?? [];

  if (roleTop3.length === 0) return 50;

  let score = 0;
  for (const driver of roleTop3) {
    if (candTop3.includes(driver)) score += 3;
    else if (candMiddle3.includes(driver)) score += 1;
    else if (candBottom2.includes(driver)) score -= 2;
  }
  for (const driver of roleMiddle3) {
    if (candTop3.includes(driver)) score += 1;
  }

  const max = 3 * 3 + 3 * 1; // 12
  const min = 3 * -2; // -6
  return Math.round(normalize(score, min, max));
}

// ────────────────────────────────────────────────────────────────────
//  6. Cultural Scores (R.6 vs D)
// ────────────────────────────────────────────────────────────────────

export type CulturePct = { D1: number; D2: number; D3: number; D4: number };
export type StyleProfile = {
  pace: number;
  structure: number;
  risk: number;
  focus: number;
};

/**
 * Cosine similarity для cultural fit (As-Is) и cultural add (delta To-Be).
 * Style fit — average absolute distance per scale, normalize.
 *
 * Combined = 0.40 fit + 0.30 add + 0.30 style (Scoring Model §5.6).
 */
export function culturalScores(
  candidateD: { culturePct: CulturePct | null; style: StyleProfile | null },
  company: Pick<CompanyProfile, "cultureAsIs" | "cultureToBe" | "workingStyle">,
  mandate: Pick<Mandate, "cultureToBeOverride" | "styleOverride">,
): { fit: number; add: number; style: number; combined: number } {
  if (!candidateD.culturePct || !candidateD.style) {
    return { fit: 50, add: 50, style: 50, combined: 50 };
  }

  // ─── Cultural Fit (As-Is) ───
  const asIs = (company.cultureAsIs as Record<string, number> | null) ?? null;
  const fit = asIs
    ? cosineSimilarity(toCultureVec(candidateD.culturePct), toCultureVec(asIs))
    : 50;

  // ─── Cultural Add (delta To-Be vs As-Is) ───
  const toBe =
    (mandate.cultureToBeOverride as Record<string, number> | null) ??
    (company.cultureToBe as Record<string, number> | null) ??
    null;
  let add = 50;
  if (asIs && toBe) {
    const delta = subtractVec(toCultureVec(toBe), toCultureVec(asIs));
    const norm = vectorNorm(delta);
    if (norm < 1) {
      add = 50; // компания не хочет существенно меняться
    } else {
      const cos = cosineSimilarityRaw(toCultureVec(candidateD.culturePct), delta);
      add = Math.round(((cos + 1) / 2) * 100);
    }
  }

  // ─── Style Fit ───
  const targetStyle =
    (mandate.styleOverride as Record<string, number> | null) ??
    (company.workingStyle as Record<string, number> | null) ??
    null;
  let style = 50;
  if (targetStyle) {
    const deltas: number[] = [];
    for (const dim of ["pace", "structure", "risk", "focus"] as const) {
      const cand = candidateD.style[dim];
      const target = targetStyle[dim];
      if (cand === undefined || target === undefined) continue;
      deltas.push(Math.abs(cand - target));
    }
    if (deltas.length > 0) {
      const avgDelta = deltas.reduce((s, v) => s + v, 0) / deltas.length;
      // Max delta = 6 (1 vs 7); 0 = perfect fit
      style = Math.round((1 - avgDelta / 6) * 100);
    }
  }

  const combined = Math.round(0.4 * fit + 0.3 * add + 0.3 * style);
  return { fit, add, style, combined };
}

// ────────────────────────────────────────────────────────────────────
//  Cosine similarity helpers
// ────────────────────────────────────────────────────────────────────

function toCultureVec(c: Record<string, number>): number[] {
  return [c.D1 ?? 0, c.D2 ?? 0, c.D3 ?? 0, c.D4 ?? 0];
}

function dotProduct(a: number[], b: number[]) {
  return a.reduce((s, v, i) => s + v * (b[i] ?? 0), 0);
}

function vectorNorm(a: number[]) {
  return Math.sqrt(a.reduce((s, v) => s + v * v, 0));
}

function subtractVec(a: number[], b: number[]) {
  return a.map((v, i) => v - (b[i] ?? 0));
}

/** Cosine similarity, normalized to 0-100 (для positive vectors). */
function cosineSimilarity(a: number[], b: number[]): number {
  const denom = vectorNorm(a) * vectorNorm(b);
  if (denom === 0) return 50;
  const cos = dotProduct(a, b) / denom;
  // Для positive vectors cos в [0, 1]. Mapping [0,1] → [0,100].
  return Math.round(clamp(cos * 100));
}

/** Raw cosine similarity, returning [-1, 1]. Используется для cultural add. */
function cosineSimilarityRaw(a: number[], b: number[]): number {
  const denom = vectorNorm(a) * vectorNorm(b);
  if (denom === 0) return 0;
  return dotProduct(a, b) / denom;
}

