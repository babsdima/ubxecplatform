/**
 * Raw score calculation для Блоков A и B.
 *
 * Алгоритм (из Scoring Model §2.1):
 * - Forced-choice: за каждый выбор → +1 к соответствующей шкале
 * - Likert: значение 1-5 добавляется к шкале; если reverseScored — (6 - raw)
 */

import {
  isForcedChoice,
  isLikert,
  type Question,
  type RawScores,
  type ResponseValue,
  type ResponsesMap,
} from "../types";

/**
 * Преобразует ответы по блоку в raw scores по шкалам.
 *
 * @param questions — все вопросы блока (для определения scale mappings)
 * @param responses — ответы кандидата {questionId: value}
 * @returns RawScores — {scaleId: rawScore}
 */
export function calculateRawScores(
  questions: Question[],
  responses: ResponsesMap,
): RawScores {
  const scores: RawScores = {};

  for (const q of questions) {
    const value = responses[q.id];
    if (value === undefined || value === null) continue;

    if (isForcedChoice(q)) {
      addForcedChoiceScore(scores, q, value);
    } else if (isLikert(q)) {
      addLikertScore(scores, q, value);
    }
  }

  return scores;
}

function addForcedChoiceScore(
  scores: RawScores,
  q: import("../types").ForcedChoiceQuestion,
  value: ResponseValue,
) {
  const choice = String(value).toUpperCase();
  const option =
    choice === "A" ? q.optionA : choice === "B" ? q.optionB : null;
  if (!option) return; // невалидный ответ — пропускаем

  const delta = option.direction === "-" ? -1 : 1;
  scores[option.scale] = (scores[option.scale] ?? 0) + delta;
}

function addLikertScore(
  scores: RawScores,
  q: import("../types").LikertQuestion,
  value: ResponseValue,
) {
  const raw = Number(value);
  if (!Number.isFinite(raw)) return;
  if (raw < 1 || raw > 5) return; // out of range — пропускаем

  const score = q.reverseScored ? 6 - raw : raw;
  scores[q.scale] = (scores[q.scale] ?? 0) + score;
}

/**
 * Подсчитывает количество отвеченных вопросов в блоке.
 */
export function countAnswered(
  questions: Question[],
  responses: ResponsesMap,
): number {
  return questions.filter(
    (q) => responses[q.id] !== undefined && responses[q.id] !== null,
  ).length;
}

/**
 * Возвращает индекс первого неотвеченного вопроса (для resume).
 * -1 если все отвечены.
 */
export function findFirstUnanswered(
  questions: Question[],
  responses: ResponsesMap,
): number {
  return questions.findIndex(
    (q) => responses[q.id] === undefined || responses[q.id] === null,
  );
}
