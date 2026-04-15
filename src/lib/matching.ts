import { prisma } from "./db";

function scoreMatch(
  candidate: {
    industry: string;
    functionalFocus: string;
    yearsExperience: number;
    salaryMin: number;
    salaryMax: number;
  },
  mandate: {
    industry: string;
    title: string;
    salaryMin: number;
    salaryMax: number;
  }
): number {
  let score = 0;

  // Industry match: 40 points
  if (candidate.industry === mandate.industry) {
    score += 40;
  } else if (
    candidate.industry.toLowerCase().includes(mandate.industry.toLowerCase()) ||
    mandate.industry.toLowerCase().includes(candidate.industry.toLowerCase())
  ) {
    score += 20;
  }

  // Functional focus / title match: 30 points
  const titleLower = mandate.title.toLowerCase();
  const focusLower = candidate.functionalFocus.toLowerCase();
  if (
    focusLower.includes(titleLower) ||
    titleLower.includes(focusLower) ||
    candidate.industry.toLowerCase().includes(titleLower)
  ) {
    score += 30;
  } else if (
    titleLower.includes("cfo") && focusLower.includes("финанс") ||
    titleLower.includes("cto") && focusLower.includes("технолог") ||
    titleLower.includes("coo") && focusLower.includes("операц") ||
    titleLower.includes("ceo") && focusLower.includes("управлен")
  ) {
    score += 30;
  } else {
    score += 10;
  }

  // Salary overlap: 20 points
  const overlapMin = Math.max(candidate.salaryMin, mandate.salaryMin);
  const overlapMax = Math.min(candidate.salaryMax, mandate.salaryMax);
  if (overlapMax >= overlapMin) {
    score += 20;
  } else {
    const gap = overlapMin - overlapMax;
    const scale = Math.max(candidate.salaryMax, mandate.salaryMax);
    const penalty = Math.round((gap / scale) * 20);
    score += Math.max(0, 20 - penalty);
  }

  // Experience bonus: up to 10 points
  if (candidate.yearsExperience >= 10) score += 10;
  else if (candidate.yearsExperience >= 7) score += 7;
  else if (candidate.yearsExperience >= 5) score += 4;

  return Math.min(100, score);
}

export async function computeMatches(mandateId: string) {
  const mandate = await prisma.mandate.findUnique({ where: { id: mandateId } });
  if (!mandate || mandate.status !== "ACTIVE") return;

  const candidates = await prisma.candidateProfile.findMany({
    where: { status: "VERIFIED" },
  });

  for (const candidate of candidates) {
    const score = scoreMatch(candidate, mandate);
    if (score < 50) continue; // не создаём слабые мэтчи

    await prisma.match.upsert({
      where: {
        mandateId_candidateProfileId: {
          mandateId,
          candidateProfileId: candidate.id,
        },
      },
      update: { score },
      create: {
        mandateId,
        candidateProfileId: candidate.id,
        score,
        status: "PENDING",
      },
    });
  }
}
