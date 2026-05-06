/**
 * Overall Match — Stage 5 scoring pipeline.
 *
 * Взвешенная сумма 6 component scores. Веса — default из Scoring Model §6.
 * После accumulation outcome data (Phase 2+ продукта) — пересчитываются
 * через logistic regression (Scoring Model §6.3, не реализовано в MVP).
 */

export type ComponentScores = {
  competency: number; // 0-100
  trackRecord: number;
  personality: number;
  risk: number;
  motivational: number;
  cultural: number;
};

export const DEFAULT_WEIGHTS: Record<keyof ComponentScores, number> = {
  competency: 0.25,
  trackRecord: 0.2,
  personality: 0.15,
  risk: 0.1,
  motivational: 0.15,
  cultural: 0.15,
};

export function calculateOverallMatch(
  scores: ComponentScores,
  weights: Record<keyof ComponentScores, number> = DEFAULT_WEIGHTS,
): number {
  let overall = 0;
  for (const key of Object.keys(weights) as (keyof ComponentScores)[]) {
    overall += scores[key] * weights[key];
  }
  return Math.round(overall);
}

export type MatchLabel =
  | "strong"
  | "good"
  | "conditional"
  | "weak"
  | "mismatch";

export function getMatchLabel(score: number): MatchLabel {
  if (score >= 80) return "strong";
  if (score >= 65) return "good";
  if (score >= 50) return "conditional";
  if (score >= 35) return "weak";
  return "mismatch";
}

export const MATCH_LABEL_LABEL: Record<MatchLabel, string> = {
  strong: "Strong Match",
  good: "Good Match",
  conditional: "Conditional",
  weak: "Weak Match",
  mismatch: "Mismatch",
};

export const MATCH_LABEL_COLOR: Record<MatchLabel, string> = {
  strong: "#16a34a", // green
  good: "#65a30d", // light-green
  conditional: "#d97706", // amber
  weak: "#ea580c", // orange
  mismatch: "#dc2626", // red
};
