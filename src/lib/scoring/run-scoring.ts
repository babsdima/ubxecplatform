/**
 * Scoring Orchestrator.
 *
 * scoreCandidateForRole(candidateProfileId, mandateId):
 *   1. Загружает CandidateProfile + Preferences + ScaleScore
 *   2. Загружает Mandate + CompanyProfile
 *   3. Hard filters → fail fast
 *   4. 6 component scores
 *   5. Overall match
 *   6. Upsert Match с component breakdown + flags
 *
 * Используется:
 *   - При завершении блока кандидатом (триггер пересчёт matches кандидата)
 *   - При создании / изменении мандата (триггер пересчёт по всем active кандидатам)
 *   - Из admin-инструмента
 */

import { prisma } from "@/lib/db";
import {
  passesHardFilters,
  type HardFilterResult,
} from "./hard-filters";
import {
  competencyFit,
  trackRecordFit,
  personalityFit,
  riskScore,
  motivationalFit,
  culturalScores,
  type CompetencyDistribution,
  type PersonalityPrefs,
  type RiskTolerance,
  type RiskFlag,
  type CulturePct,
  type StyleProfile,
} from "./component-scores";
import {
  calculateOverallMatch,
  getMatchLabel,
  type ComponentScores,
} from "./overall-match";
import { SCALES_B } from "@/lib/questionnaire/blocks/scales";

export type ScoringResult = {
  ok: true;
  matchId: string;
  overallScore: number;
  components: ComponentScores;
  flags: RiskFlag[];
  label: string;
};

export type ScoringFailure = {
  ok: false;
  reason: string;
  failedFilter?: string;
};

/**
 * Считает scoring одной пары (candidate × mandate) и сохраняет в Match.
 */
export async function scoreCandidateForRole(
  candidateProfileId: string,
  mandateId: string,
): Promise<ScoringResult | ScoringFailure> {
  // ─── 1. Загрузка данных ───
  const candidate = await prisma.candidateProfile.findUnique({
    where: { id: candidateProfileId },
    include: {
      preferences: true,
      scaleScore: true,
    },
  });
  if (!candidate) return { ok: false, reason: "Кандидат не найден" };

  const mandate = await prisma.mandate.findUnique({
    where: { id: mandateId },
    include: { company: true },
  });
  if (!mandate) return { ok: false, reason: "Мандат не найден" };

  // ─── 2. Hard filters ───
  const filterResult: HardFilterResult = passesHardFilters(
    candidate,
    candidate.preferences,
    mandate,
  );
  if (!filterResult.passed) {
    // Удаляем существующий match (если был) — он больше не валиден
    await prisma.match.deleteMany({
      where: { mandateId, candidateProfileId },
    });
    return {
      ok: false,
      reason: filterResult.reason,
      failedFilter: filterResult.failedFilter,
    };
  }

  // ─── 3. Component scores ───
  const ss = candidate.scaleScore;

  // 3.1 Competency
  const e1Dist = ss?.e1Distribution as CompetencyDistribution | null;
  const compFit = competencyFit(e1Dist, mandate);

  // 3.2 Track Record
  const trFit = trackRecordFit(candidate, mandate);

  // 3.3 Personality
  const aStens = (ss?.aStens as Record<string, number> | null) ?? null;
  const personalityPrefs =
    (mandate.personalityPrefs as PersonalityPrefs | null) ?? null;
  const personFit = personalityFit(aStens, personalityPrefs);

  // 3.4 Risk
  const bStens = (ss?.bStens as Record<string, number> | null) ?? null;
  const riskTolerance =
    (mandate.riskTolerance as RiskTolerance | null) ?? null;
  const scaleNamesB: Record<string, string> = Object.fromEntries(
    SCALES_B.map((s) => [s.id, s.nameRu]),
  );
  const { score: riskScoreValue, flags: riskFlags } = riskScore(
    bStens,
    riskTolerance,
    scaleNamesB,
  );

  // 3.5 Motivational
  const cIpsative = (ss?.cIpsative as Record<string, number> | null) ?? null;
  const motivFit = motivationalFit(cIpsative, mandate);

  // 3.6 Cultural
  const candidateD = {
    culturePct: (ss?.dCulturePct as CulturePct | null) ?? null,
    style: (ss?.dStyle as StyleProfile | null) ?? null,
  };
  const cultural = culturalScores(candidateD, mandate.company, mandate);

  // ─── 4. Overall ───
  const components: ComponentScores = {
    competency: compFit,
    trackRecord: trFit,
    personality: personFit,
    risk: riskScoreValue,
    motivational: motivFit,
    cultural: cultural.combined,
  };
  const overall = calculateOverallMatch(components);
  const label = getMatchLabel(overall);

  // ─── 5. Upsert Match ───
  const match = await prisma.match.upsert({
    where: {
      mandateId_candidateProfileId: {
        mandateId,
        candidateProfileId,
      },
    },
    update: {
      score: overall,
      componentScores: components,
      flags: riskFlags as unknown as object,
      matchLabel: label,
      scoredAt: new Date(),
    },
    create: {
      mandateId,
      candidateProfileId,
      score: overall,
      componentScores: components,
      flags: riskFlags as unknown as object,
      matchLabel: label,
      scoredAt: new Date(),
      status: "PENDING",
    },
  });

  return {
    ok: true,
    matchId: match.id,
    overallScore: overall,
    components,
    flags: riskFlags,
    label,
  };
}

/**
 * Считает scoring всех кандидатов против мандата.
 * Возвращает кол-во созданных/обновлённых matches.
 */
export async function scoreAllCandidatesForRole(
  mandateId: string,
): Promise<{ scored: number; filtered: number; failed: number }> {
  const candidates = await prisma.candidateProfile.findMany({
    where: { status: "VERIFIED" },
    select: { id: true },
  });

  let scored = 0;
  let filtered = 0;
  let failed = 0;

  for (const c of candidates) {
    const result = await scoreCandidateForRole(c.id, mandateId);
    if (result.ok) {
      scored += 1;
    } else if (result.failedFilter) {
      filtered += 1;
    } else {
      failed += 1;
    }
  }

  return { scored, filtered, failed };
}

/**
 * Считает matches для одного кандидата против всех ACTIVE мандатов.
 */
export async function scoreCandidateForAllRoles(
  candidateProfileId: string,
): Promise<{ scored: number; filtered: number; failed: number }> {
  const mandates = await prisma.mandate.findMany({
    where: { status: "ACTIVE" },
    select: { id: true },
  });

  let scored = 0;
  let filtered = 0;
  let failed = 0;

  for (const m of mandates) {
    const result = await scoreCandidateForRole(candidateProfileId, m.id);
    if (result.ok) {
      scored += 1;
    } else if (result.failedFilter) {
      filtered += 1;
    } else {
      failed += 1;
    }
  }

  return { scored, filtered, failed };
}
