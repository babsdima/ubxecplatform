/**
 * Scoring helpers для Блоков C и D.
 *
 * Block C — Motivational Drivers (8 шкал):
 *   - Ipsative (из триад): rank 1 → +3, rank 2 → +2, rank 3 → +1
 *   - Normative (из Likert): сумма value (с reverse если есть)
 *   - Ipsative нормализуется в 0-10 относительно max в рамках кандидата
 *
 * Block D — Culture (4 типа) + Working Style (4 шкалы):
 *   - Culture: scenario_pair → +1 winner; scenario_quad → 4/3/2/1; Likert → value
 *     Нормализуется в проценты (сумма D1+D2+D3+D4 = 100)
 *   - Style: semantic_differential → mean of values 1-7
 */

import {
  isForcedRankingTriad,
  isLikert,
  isScenarioPair,
  isScenarioQuad,
  isSemanticDifferential,
  type Question,
  type ResponsesMap,
} from "../types";

// ────────────────────────────────────────────────────────────────────
//  Block C
// ────────────────────────────────────────────────────────────────────

export type BlockCScores = {
  ipsative: Record<string, number>; // 0-10 relative
  normative: Record<string, number>; // raw Likert sum
};

/**
 * Вычисляет ipsative + normative scores для Блока C.
 *
 * Формат ответов:
 * - триада: number[] длины 3, индексы options после ranking
 *   [1, 2, 3] = первая опция получила ранг 1 (=+3 points)
 * - Likert: 1-5
 */
export function calculateBlockCScores(
  questions: Question[],
  responses: ResponsesMap,
): BlockCScores {
  const ipsativeRaw: Record<string, number> = {};
  const normative: Record<string, number> = {};

  for (const q of questions) {
    const value = responses[q.id];
    if (value === undefined || value === null) continue;

    if (isForcedRankingTriad(q)) {
      const ranks = value as number[];
      if (!Array.isArray(ranks) || ranks.length !== 3) continue;
      // ranks[i] — это ранг (1, 2 или 3) для options[i].
      // points: rank 1 → 3, rank 2 → 2, rank 3 → 1
      for (let i = 0; i < 3; i++) {
        const rank = ranks[i];
        if (![1, 2, 3].includes(rank)) continue;
        const points = 4 - rank; // rank 1 → 3, rank 2 → 2, rank 3 → 1
        const scale = q.options[i].scale;
        ipsativeRaw[scale] = (ipsativeRaw[scale] ?? 0) + points;
      }
    } else if (isLikert(q)) {
      const raw = Number(value);
      if (!Number.isFinite(raw) || raw < 1 || raw > 5) continue;
      const score = q.reverseScored ? 6 - raw : raw;
      normative[q.scale] = (normative[q.scale] ?? 0) + score;
    }
  }

  // Ипсативная нормализация: max → 10, остальное пропорционально
  const ipsativeNormalized: Record<string, number> = {};
  const maxRaw = Math.max(...Object.values(ipsativeRaw), 1);
  for (const [scale, raw] of Object.entries(ipsativeRaw)) {
    ipsativeNormalized[scale] = Number(((raw / maxRaw) * 10).toFixed(2));
  }

  return {
    ipsative: ipsativeNormalized,
    normative,
  };
}

/**
 * Возвращает top-N драйверов из ипсативного профиля (для R.5 matching).
 */
export function getTopDrivers(
  ipsative: Record<string, number>,
  n: number,
): string[] {
  return Object.entries(ipsative)
    .sort(([, a], [, b]) => b - a)
    .slice(0, n)
    .map(([scale]) => scale);
}

// ────────────────────────────────────────────────────────────────────
//  Block D
// ────────────────────────────────────────────────────────────────────

export type BlockDScores = {
  /** Culture % (D1-D4, сумма = 100) */
  culturePct: Record<string, number>;
  /** Style 1-7 (pace, structure, risk, focus) */
  style: Record<string, number>;
};

/**
 * Вычисляет culture % + style mean для Блока D.
 *
 * Culture:
 * - scenario_pair: победившая шкала +1
 * - scenario_quad: ранг 1 → +4, 2 → +3, 3 → +2, 4 → +1
 * - Likert на D1-D4: value (1-5) добавляется к шкале
 * - Нормализация: сумма D1+D2+D3+D4 → 100%
 *
 * Style:
 * - semantic_differential: значение 1-7 (collected per scale)
 * - Mean of values per scale
 */
export function calculateBlockDScores(
  questions: Question[],
  responses: ResponsesMap,
): BlockDScores {
  const cultureRaw: Record<string, number> = { D1: 0, D2: 0, D3: 0, D4: 0 };
  const styleValues: Record<string, number[]> = {
    pace: [],
    structure: [],
    risk: [],
    focus: [],
  };

  for (const q of questions) {
    const value = responses[q.id];
    if (value === undefined || value === null) continue;

    if (isScenarioPair(q)) {
      const choice = String(value).toUpperCase();
      const winner = choice === "A" ? q.optionA : choice === "B" ? q.optionB : null;
      if (winner) cultureRaw[winner.scale] = (cultureRaw[winner.scale] ?? 0) + 1;
    } else if (isScenarioQuad(q)) {
      const ranks = value as number[];
      if (!Array.isArray(ranks) || ranks.length !== 4) continue;
      // points: rank 1 → 4, 2 → 3, 3 → 2, 4 → 1
      for (let i = 0; i < 4; i++) {
        const rank = ranks[i];
        if (![1, 2, 3, 4].includes(rank)) continue;
        const points = 5 - rank;
        const scale = q.options[i].scale;
        cultureRaw[scale] = (cultureRaw[scale] ?? 0) + points;
      }
    } else if (isLikert(q)) {
      const raw = Number(value);
      if (!Number.isFinite(raw) || raw < 1 || raw > 5) continue;
      const score = q.reverseScored ? 6 - raw : raw;
      // Likert на D1-D4 идёт в culture; на pace/structure/risk/focus — в style mean
      if (["D1", "D2", "D3", "D4"].includes(q.scale)) {
        cultureRaw[q.scale] = (cultureRaw[q.scale] ?? 0) + score;
      } else if (q.scale in styleValues) {
        styleValues[q.scale].push(score);
      }
    } else if (isSemanticDifferential(q)) {
      const raw = Number(value);
      if (!Number.isFinite(raw) || raw < 1 || raw > 7) continue;
      if (q.scale in styleValues) {
        styleValues[q.scale].push(raw);
      }
    }
  }

  // Culture: нормализация в проценты
  const cultureSum =
    cultureRaw.D1 + cultureRaw.D2 + cultureRaw.D3 + cultureRaw.D4;
  const culturePct: Record<string, number> = {};
  if (cultureSum > 0) {
    for (const t of ["D1", "D2", "D3", "D4"] as const) {
      culturePct[t] = Math.round((cultureRaw[t] / cultureSum) * 100);
    }
    // фиксируем округление до 100 (берём остаток с D1)
    const sum = culturePct.D1 + culturePct.D2 + culturePct.D3 + culturePct.D4;
    if (sum !== 100) culturePct.D1 += 100 - sum;
  } else {
    culturePct.D1 = culturePct.D2 = culturePct.D3 = culturePct.D4 = 25;
  }

  // Style: mean
  const style: Record<string, number> = {};
  for (const [scale, values] of Object.entries(styleValues)) {
    if (values.length === 0) {
      style[scale] = 4; // нейтральный middle (defaults to "neutral" position)
    } else {
      const mean = values.reduce((s, v) => s + v, 0) / values.length;
      style[scale] = Number(mean.toFixed(2));
    }
  }

  return { culturePct, style };
}
