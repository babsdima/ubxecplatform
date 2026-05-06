/**
 * Sten нормализация (Scoring Model §3.1)
 *
 * Sten — стандартная психометрическая шкала 1-10:
 *   sten = round(5.5 + 2 × z), where z = (raw - μ) / σ
 *   clamped to [1, 10]
 *
 * MVP-v1 нормы: вычисляются из теоретического диапазона шкалы
 * (mean = midpoint, std = range / 4). Калибровка по реальным данным —
 * Phase 4+ когда накопится 100+ executive профилей.
 */

import { isForcedChoice, isLikert, type Question } from "../types";

export type ScaleNorm = { mean: number; std: number };
export type ScaleNorms = Record<string, ScaleNorm>;

/**
 * Преобразует raw score в стен (sten 1-10) с использованием нормы шкалы.
 */
export function rawToSten(raw: number, norm: ScaleNorm): number {
  if (norm.std <= 0) return 5; // защита от division by zero

  const z = (raw - norm.mean) / norm.std;
  const sten = Math.round(5.5 + 2 * z);
  return Math.max(1, Math.min(10, sten));
}

/**
 * Применяет sten-нормализацию ко всем шкалам блока.
 */
export function normalizeAllScales(
  rawScores: Record<string, number>,
  norms: ScaleNorms,
): Record<string, number> {
  const result: Record<string, number> = {};
  for (const [scale, raw] of Object.entries(rawScores)) {
    const norm = norms[scale];
    if (norm) {
      result[scale] = rawToSten(raw, norm);
    }
  }
  return result;
}

/**
 * Вычисляет MVP-v1 нормы из теоретического диапазона каждой шкалы.
 *
 * Логика:
 * - Для каждой шкалы определяем min/max raw на основе items
 * - mean = (min + max) / 2 (midpoint)
 * - std = (max - min) / 4 (~1 std covers ~25% of theoretical range)
 *
 * @param questions — все вопросы блока (определяют, какие шкалы есть)
 * @returns Map шкал на нормы для использования в rawToSten
 */
export function computeMvpNorms(questions: Question[]): ScaleNorms {
  // 1. Считаем item-level: в скольких FC-items шкала встречается (хотя бы
  //    в одной опции), плюс кол-во Likert items для этой шкалы.
  const counts: Record<string, { fcItems: number; likert: number }> = {};

  for (const q of questions) {
    if (isForcedChoice(q)) {
      const scalesInItem = new Set([q.optionA.scale, q.optionB.scale]);
      for (const scale of scalesInItem) {
        counts[scale] ??= { fcItems: 0, likert: 0 };
        counts[scale].fcItems += 1;
      }
    } else if (isLikert(q)) {
      counts[q.scale] ??= { fcItems: 0, likert: 0 };
      counts[q.scale].likert += 1;
    }
  }

  // 2. Теоретический диапазон per scale:
  //    - FC item может дать -1, 0 или +1 к шкале (в зависимости от выбора и
  //      direction опций). Worst-case диапазон = ±fcItems.
  //    - Likert: каждый item даёт 1-5 (или 6-raw для reverse, что то же 1-5).
  //    minRaw = -fcItems + likert*1
  //    maxRaw = +fcItems + likert*5
  //    mean = (min + max) / 2 = likert * 3 (центр Likert при нулевом FC)
  //    std = (max - min) / 4
  const norms: ScaleNorms = {};

  for (const [scale, { fcItems, likert }] of Object.entries(counts)) {
    const minRaw = -fcItems + likert * 1;
    const maxRaw = fcItems + likert * 5;

    const range = maxRaw - minRaw;
    norms[scale] = {
      mean: (minRaw + maxRaw) / 2,
      std: Math.max(range / 4, 0.5),
    };
  }

  return norms;
}
