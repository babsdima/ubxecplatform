/**
 * Block E.1 — Самооценка управленческих компетенций (forced-distribution)
 *
 * 15 компетенций (см. таблицу Competency в БД, сидируется через prisma/seed.ts).
 * Кандидат распределяет их в 3 группы по 5:
 *   - Top 5     — сильнейшие
 *   - Middle 5  — уверенные
 *   - Bottom 5  — зоны развития
 *
 * Опционально: для каждой Top 5 — короткий пример из практики (max 500 chars).
 *
 * Формат не вписывается в стандартный paginated шелл — у E.1 одна страница
 * с drag-and-drop UI. Поэтому здесь нет items[], только экспорт meta-данных
 * для UI.
 */

import type { BlockId } from "../types";

export const BLOCK_E1_META = {
  id: "E1" as BlockId,
  title: "Блок E.1 — Самооценка компетенций",
  description:
    "Распределите 15 управленческих компетенций по трём зонам: ваши сильнейшие (top 5), уверенные (middle 5), и зоны развития (bottom 5). Это поможет точнее матчить вас с ролями.",
  estimatedMinutes: [5, 7] as [number, number],
};

export type E1Distribution = {
  top5: string[]; // массив competency IDs (e.g., ["E1.01", "E1.04", ...])
  middle5: string[];
  bottom5: string[];
};

export type E1Examples = Record<string, string>; // competencyId → example text

export type E1Response = {
  distribution: E1Distribution;
  examples?: E1Examples;
};

export const E1_REQUIRED_COMPETENCIES = 15;
export const E1_GROUP_SIZE = 5;

/**
 * Валидирует, что распределение корректно: ровно 5 в каждой группе,
 * без дубликатов, всего 15.
 */
export function validateE1Distribution(d: E1Distribution): {
  valid: boolean;
  error?: string;
} {
  const all = [...d.top5, ...d.middle5, ...d.bottom5];

  if (d.top5.length !== E1_GROUP_SIZE)
    return { valid: false, error: `В "Сильнейшие" должно быть ровно ${E1_GROUP_SIZE} компетенций (сейчас: ${d.top5.length})` };
  if (d.middle5.length !== E1_GROUP_SIZE)
    return { valid: false, error: `В "Уверенные" должно быть ровно ${E1_GROUP_SIZE} компетенций (сейчас: ${d.middle5.length})` };
  if (d.bottom5.length !== E1_GROUP_SIZE)
    return { valid: false, error: `В "Зоны развития" должно быть ровно ${E1_GROUP_SIZE} компетенций (сейчас: ${d.bottom5.length})` };

  const unique = new Set(all);
  if (unique.size !== E1_REQUIRED_COMPETENCIES)
    return { valid: false, error: "В распределении есть дубликаты или пропущены компетенции" };

  if (all.length !== E1_REQUIRED_COMPETENCIES)
    return { valid: false, error: `Должно быть ровно ${E1_REQUIRED_COMPETENCIES} компетенций` };

  return { valid: true };
}
