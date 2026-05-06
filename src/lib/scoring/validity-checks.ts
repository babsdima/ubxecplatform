/**
 * Validity / consistency checks (Scoring Model §8).
 *
 * Анализирует ответы кандидата по всем блокам и flags:
 * - timeFlag         — слишком быстрое заполнение (<15 мин общее)
 * - straightlineFlag — все Likert одинаковые (низкая variance)
 * - crossBlockFlags  — противоречия между A/B и E.1
 * - socialDesirabilityFlag — средний Likert > 4.2 (возможный faking)
 *
 * Confidence Index:
 *   0-1 flags  → "high"
 *   2-3 flags  → "moderate"
 *   4+ flags   → "low"
 */

import type { QuestionnaireResponse } from "@prisma/client";

export type ValidityCheckResult = {
  timeFlag: boolean;
  straightlineFlag: boolean;
  crossBlockFlags: string[];
  socialDesirabilityFlag: boolean;
  confidenceIndex: "high" | "moderate" | "low";
  totalFlags: number;
};

const MIN_REASONABLE_TIME_SEC = 15 * 60; // 15 минут — нижний порог честного заполнения
const SOCIAL_DESIRABILITY_THRESHOLD = 4.2;
const STRAIGHTLINE_VARIANCE_THRESHOLD = 0.5;

export function checkConsistency(
  responses: QuestionnaireResponse[],
  e1Distribution: { top5: string[]; middle5: string[]; bottom5: string[] } | null,
  aStens: Record<string, number> | null,
  bStens: Record<string, number> | null,
): ValidityCheckResult {
  // ─── 1. Time flag ───
  const totalTime = responses
    .filter((r) => r.completedAt && r.completionTimeSec)
    .reduce((s, r) => s + (r.completionTimeSec ?? 0), 0);
  const timeFlag =
    totalTime > 0 && totalTime < MIN_REASONABLE_TIME_SEC;

  // ─── 2. Straightlining (Likert variance по A+B) ───
  const likertValues: number[] = [];
  for (const r of responses) {
    if (r.block !== "A" && r.block !== "B") continue;
    const data = (r.responses as Record<string, unknown> | null) ?? {};
    for (const v of Object.values(data)) {
      if (typeof v === "number" && v >= 1 && v <= 5) {
        likertValues.push(v);
      }
    }
  }
  const variance = computeVariance(likertValues);
  const straightlineFlag =
    likertValues.length >= 5 && variance < STRAIGHTLINE_VARIANCE_THRESHOLD;

  // ─── 3. Social desirability (mean Likert > threshold) ───
  const meanLikert =
    likertValues.length > 0
      ? likertValues.reduce((s, v) => s + v, 0) / likertValues.length
      : 0;
  const socialDesirabilityFlag = meanLikert > SOCIAL_DESIRABILITY_THRESHOLD;

  // ─── 4. Cross-block flags (A vs E.1) ───
  const crossBlockFlags: string[] = [];
  if (e1Distribution && aStens) {
    // A6 high (Openness/Curiosity) ↔ E1.01 (Strategic Vision) в top 5 — должны коррелировать
    const a6 = aStens.A6 ?? 5;
    if (a6 < 4 && e1Distribution.top5.includes("E1.01")) {
      crossBlockFlags.push(
        "Низкое любопытство (A6) при заявленном Strategic Vision в top 5 — возможный blind spot",
      );
    }
    // A4 high (Empathy) ↔ E1.05 (Team Building)
    const a4 = aStens.A4 ?? 5;
    if (a4 < 4 && e1Distribution.top5.includes("E1.05")) {
      crossBlockFlags.push(
        "Низкая эмпатия (A4) при заявленном Team Building в top 5 — проверить стиль управления",
      );
    }
    // A8 high (Tough-mindedness) ↔ E1.06 (Performance Mgmt)
    const a8 = aStens.A8 ?? 5;
    if (a8 < 4 && e1Distribution.top5.includes("E1.06")) {
      crossBlockFlags.push(
        "Низкая жёсткость (A8) при заявленном Performance Management в top 5 — может быть compliance-стиль вместо настоящего accountability",
      );
    }
    // A10 high (Adaptability) ↔ E1.09 (Change Management)
    const a10 = aStens.A10 ?? 5;
    if (a10 < 4 && e1Distribution.top5.includes("E1.09")) {
      crossBlockFlags.push(
        "Низкая адаптивность (A10) при заявленном Change Management — проверить готовность к неопределённости",
      );
    }
  }

  // ─── 5. Cross-block: B5 (Perfectionism) ↔ E1.10 (Operational Excellence) ───
  if (e1Distribution && bStens) {
    const b5 = bStens.B5 ?? 5;
    if (b5 >= 8 && e1Distribution.top5.includes("E1.10")) {
      crossBlockFlags.push(
        "Очень высокий перфекционизм (B5) + Operational Excellence в top 5 — риск микроменеджмента",
      );
    }
  }

  // ─── 6. Cross-block: B6 (Conformity) ↔ E1.07 (Stakeholder Mgmt) ───
  if (e1Distribution && bStens) {
    const b6 = bStens.B6 ?? 5;
    if (b6 >= 7 && e1Distribution.top5.includes("E1.07")) {
      crossBlockFlags.push(
        "Высокая конформность (B6) + Stakeholder Management в top 5 — скорее compliance, чем настоящее влияние",
      );
    }
  }

  // ─── Confidence Index ───
  const totalFlags =
    Number(timeFlag) +
    Number(straightlineFlag) +
    Number(socialDesirabilityFlag) +
    crossBlockFlags.length;

  const confidenceIndex: "high" | "moderate" | "low" =
    totalFlags <= 1 ? "high" : totalFlags <= 3 ? "moderate" : "low";

  return {
    timeFlag,
    straightlineFlag,
    crossBlockFlags,
    socialDesirabilityFlag,
    confidenceIndex,
    totalFlags,
  };
}

function computeVariance(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((s, v) => s + v, 0) / values.length;
  const variance =
    values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
  return variance;
}
