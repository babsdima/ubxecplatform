import { prisma } from "./db";

// ─── Role keyword dictionary ────────────────────────────────────────────────
// Maps canonical role keys to lists of lower-case tokens.
// A match is detected when ANY token from the candidate's combined text
// intersects with ANY token from the mandate's combined text for the same key.

const ROLE_KEYWORDS: Record<string, string[]> = {
  cfo:        ["cfo", "финансов", "finance", "cфо", "финдир", "treasury", "казначей", "финансовый директор"],
  cto:        ["cto", "технолог", "technology", "техдир", "разработ", "engineering", "it director", "технический директор"],
  coo:        ["coo", "операцион", "operation", "опердир", "операционный директор"],
  ceo:        ["ceo", "генеральн", "general director", "управлен", "strategy", "стратег", "гендиректор"],
  chro:       ["chro", "hrd", "hr", "кадров", "персонал", "human resources", "talent", "людей"],
  cpo:        ["cpo", "продукт", "product manager", "продуктов"],
  cmo:        ["cmo", "маркетинг", "marketing", "brand", "бренд"],
  commercial: ["cco", "commercial", "коммерч", "продаж", "sales", "revenue", "ревеню"],
  gm:         ["gm", "general manager", "country manager", "country", "управляющий"],
};

// ─── Format compatibility ────────────────────────────────────────────────────
// Returns true if mandateType appears in candidate's engagementFormats list.
// If candidate has default "full-time" only, we allow all types with a soft
// penalty rather than a hard block (candidate may not have customised yet).
function isFormatCompatible(
  candidateFormats: string, // comma-separated
  mandateType: string
): { compatible: boolean; exact: boolean } {
  const formats = candidateFormats
    ? candidateFormats.split(",").map((f) => f.trim())
    : ["full-time"];
  const exact = formats.includes(mandateType);
  // "full-time" default is the only value → candidate probably hasn't thought about it
  const isDefault = formats.length === 1 && formats[0] === "full-time";
  // Consider compatible if: exact match, OR candidate only has the default value
  const compatible = exact || isDefault;
  return { compatible, exact };
}

// ─── Score breakdown type ─────────────────────────────────────────────────
export type ScoreBreakdown = {
  industry: number;     // 0 | 20 | 35
  role: number;         // 0 | 10 | 20 | 30
  salary: number;       // 0–20
  experience: number;   // 0 | 4 | 7 | 10
  location: number;     // 0 | 5
  format: number;       // 0 | 8 | 12
  assessment: number;   // 0–9  (+3 per completed assessment, max 3 × 3 = 9)
  total: number;        // capped at 100
};

// ─── Core scoring function ────────────────────────────────────────────────
export function scoreMatch(
  candidate: {
    industry: string;
    functionalFocus: string;
    currentTitle: string;
    yearsExperience: number;
    salaryMin: number;
    salaryMax: number;
    locationPref: string;
    engagementFormats: string;
    assessmentCount?: number; // number of completed assessments
  },
  mandate: {
    industry: string;
    title: string;
    salaryMin: number;
    salaryMax: number;
    mandateType: string;
    requirements?: string;
  }
): ScoreBreakdown {
  // ── 1. Industry (35 pts) ───────────────────────────────────────────────
  const candIndustry = candidate.industry.toLowerCase();
  const mandIndustry = mandate.industry.toLowerCase();
  let industry = 0;
  if (candIndustry === mandIndustry) {
    industry = 35;
  } else if (
    candIndustry.includes(mandIndustry) ||
    mandIndustry.includes(candIndustry)
  ) {
    industry = 20;
  } else {
    // Check for semantic synonyms
    const synonymGroups = [
      ["финанс", "банк", "finance", "banking", "финтех", "fintech"],
      ["технолог", "it", "software", "tech", "разработ", "цифров"],
      ["ритейл", "retail", "торговл", "fmcg", "потребит"],
      ["промышлен", "industrial", "производ", "manufacturing", "машиностроен"],
      ["телеком", "telecom", "связь", "media", "медиа"],
      ["недвижим", "real estate", "строительств", "construction"],
      ["фарм", "pharma", "медицин", "health", "здравоохр"],
    ];
    const inSameGroup = synonymGroups.some(
      (g) => g.some((t) => candIndustry.includes(t)) && g.some((t) => mandIndustry.includes(t))
    );
    if (inSameGroup) industry = 15;
  }

  // ── 2. Role / Functional focus (30 pts) ───────────────────────────────
  const candidateText = [
    candidate.functionalFocus,
    candidate.currentTitle,
  ].join(" ").toLowerCase();

  const mandateText = [
    mandate.title,
    mandate.requirements ?? "",
  ].join(" ").toLowerCase();

  let role = 0;

  // Check each role category
  for (const tokens of Object.values(ROLE_KEYWORDS)) {
    const candHas = tokens.some((t) => candidateText.includes(t));
    const mandHas = tokens.some((t) => mandateText.includes(t));
    if (candHas && mandHas) {
      role = 30; // Strong role match
      break;
    }
    if (candHas || mandHas) {
      role = Math.max(role, 10); // Partial overlap
    }
  }

  // Direct text overlap fallback
  if (role < 20) {
    const candWords = candidateText.split(/\s+/).filter((w) => w.length > 3);
    const mandWords = mandateText.split(/\s+/).filter((w) => w.length > 3);
    const overlap = candWords.filter((w) => mandWords.includes(w)).length;
    if (overlap >= 2) role = Math.max(role, 20);
    else if (overlap === 1) role = Math.max(role, 10);
  }

  // All C-level mandates get minimum role score — both sides are senior
  if (role === 0) role = 5;

  // ── 3. Salary overlap (20 pts) ────────────────────────────────────────
  const overlapMin = Math.max(candidate.salaryMin, mandate.salaryMin);
  const overlapMax = Math.min(candidate.salaryMax, mandate.salaryMax);
  let salary = 0;
  if (overlapMax >= overlapMin) {
    // Full or partial overlap
    const overlapRange = overlapMax - overlapMin;
    const mandateRange = mandate.salaryMax - mandate.salaryMin || 1;
    const overlapPct = Math.min(1, overlapRange / mandateRange);
    salary = Math.round(10 + overlapPct * 10); // 10–20 pts
  } else {
    // Gap — penalise proportionally
    const gap = overlapMin - overlapMax;
    const scale = Math.max(candidate.salaryMax, mandate.salaryMax);
    const penaltyFactor = Math.min(1, gap / (scale * 0.3)); // full penalty at 30% gap
    salary = Math.round(Math.max(0, 10 - penaltyFactor * 10));
  }

  // ── 4. Experience (10 pts) ────────────────────────────────────────────
  let experience = 0;
  if (candidate.yearsExperience >= 12) experience = 10;
  else if (candidate.yearsExperience >= 8)  experience = 8;
  else if (candidate.yearsExperience >= 5)  experience = 5;
  else if (candidate.yearsExperience >= 3)  experience = 3;

  // ── 5. Location (5 pts) ──────────────────────────────────────────────
  const locCand = candidate.locationPref.toLowerCase();
  const locMand = mandate.requirements?.toLowerCase() ?? "";
  let location = 0;
  if (
    locCand.includes("удалённо") ||
    locCand.includes("remote") ||
    locCand.includes("любой") ||
    locMand.includes("удалённо") ||
    locMand.includes("remote")
  ) {
    location = 5; // Remote-friendly on either side
  } else {
    // Check city overlap
    const cities = ["москва", "moscow", "санкт-петербург", "питер", "spb", "новосибирск", "екатеринбург"];
    const sameCities = cities.filter(
      (c) => locCand.includes(c) && locMand.includes(c)
    );
    if (sameCities.length > 0) location = 5;
    else if (locCand.length > 0) location = 2; // At least candidate has preference
  }

  // ── 6. Format compatibility (12 pts) ─────────────────────────────────
  const { compatible, exact } = isFormatCompatible(
    candidate.engagementFormats,
    mandate.mandateType
  );
  let format = 0;
  if (exact) format = 12;
  else if (compatible) format = 5; // Default "full-time" gets partial credit

  // ── 7. Assessment bonus (up to 9 pts) ────────────────────────────────
  const assessmentCount = Math.min(candidate.assessmentCount ?? 0, 3);
  const assessment = assessmentCount * 3;

  // ── Total ────────────────────────────────────────────────────────────
  const raw = industry + role + salary + experience + location + format + assessment;
  const total = Math.min(100, raw);

  return { industry, role, salary, experience, location, format, assessment, total };
}

// ─── Compute matches for a mandate (called on mandate activation) ─────────
export async function computeMatches(mandateId: string) {
  const mandate = await prisma.mandate.findUnique({ where: { id: mandateId } });
  if (!mandate || mandate.status !== "ACTIVE") return;

  const candidates = await prisma.candidateProfile.findMany({
    where: { status: "VERIFIED" },
    include: { assessments: { where: { status: "COMPLETED" } } },
  });

  for (const candidate of candidates) {
    const breakdown = scoreMatch(
      { ...candidate, assessmentCount: candidate.assessments.length },
      mandate
    );
    if (breakdown.total < 40) continue;

    await prisma.match.upsert({
      where: {
        mandateId_candidateProfileId: { mandateId, candidateProfileId: candidate.id },
      },
      update: {
        score: breakdown.total,
        scoreBreakdown: JSON.stringify(breakdown),
      },
      create: {
        mandateId,
        candidateProfileId: candidate.id,
        score: breakdown.total,
        scoreBreakdown: JSON.stringify(breakdown),
        status: "PENDING",
      },
    });
  }
}

// ─── Compute matches for a newly-verified candidate ───────────────────────
// Called after admin verifies a candidate — creates matches with all
// active mandates they would have matched with.
export async function computeMatchesForCandidate(candidateProfileId: string) {
  const candidate = await prisma.candidateProfile.findUnique({
    where: { id: candidateProfileId },
    include: { assessments: { where: { status: "COMPLETED" } } },
  });
  if (!candidate || candidate.status !== "VERIFIED") return;

  const mandates = await prisma.mandate.findMany({
    where: { status: "ACTIVE" },
  });

  for (const mandate of mandates) {
    const breakdown = scoreMatch(
      { ...candidate, assessmentCount: candidate.assessments.length },
      mandate
    );
    if (breakdown.total < 40) continue;

    await prisma.match.upsert({
      where: {
        mandateId_candidateProfileId: {
          mandateId: mandate.id,
          candidateProfileId: candidate.id,
        },
      },
      update: {
        score: breakdown.total,
        scoreBreakdown: JSON.stringify(breakdown),
      },
      create: {
        mandateId: mandate.id,
        candidateProfileId: candidate.id,
        score: breakdown.total,
        scoreBreakdown: JSON.stringify(breakdown),
        status: "PENDING",
      },
    });
  }
}
