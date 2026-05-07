/**
 * Additive seed: синтетические ScaleScore + CandidatePreferences для
 * тестовых кандидатов, чтобы scoring engine давал не нейтральные 50,
 * а реалистичные scores с разбросом.
 *
 * Архетипы:
 *   strategic_cfo   — Анна (high vision, board, IPO experience)
 *   ecommerce_cfo   — Дмитрий (scaling, unit economics)
 *   integrator_cfo  — Ольга (M&A, process, conservative)
 *   startup_cfo     — Михаил (adaptive, learning, autonomy)
 *   retail_cfo      — Елена (process, accountability, stable)
 *   marketplace_cto — Сергей (scaling, ML, e-commerce)
 *   ai_cto          — Андрей (visionary, learning, autonomy)
 *   bank_cto        — Никита (process + transformation, large team)
 *   saas_cto        — Павел (startup builder, adaptive)
 *   retail_tech_cto — Кирилл (scale operator, large org)
 *
 * Запуск:  npx tsx prisma/seed-synthetic-scores.ts
 * Prod:    PROD_URL="..." DATABASE_URL="$PROD_URL" npx tsx prisma/seed-synthetic-scores.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type Archetype = {
  // A: bright side personality (sten 1-10)
  // A1 устойчивость, A2 драйв, A3 социальность, A4 эмпатия, A5 системность,
  // A6 любопытство, A7 обучаемость, A8 жёсткость, A9 влияние, A10 адаптивность
  aStens: Record<string, number>;
  // B: dark side risks (sten 1-10, низкие = хорошо)
  // B1 реактивность, B2 замкнутость, B3 конфронтация, B4 самопродвижение, B5 перфекционизм, B6 конформность
  bStens: Record<string, number>;
  // C: motivation ipsative (0-10)
  // ACH достижение, POW власть, AFF принадлежность, STA стабильность,
  // AUT автономия, LRN обучение, REC признание, MIS миссия
  cIpsative: Record<string, number>;
  cNormative: Record<string, number>;
  // D: culture % (sum 100), style (1-7)
  dCulturePct: { D1: number; D2: number; D3: number; D4: number };
  dStyle: { pace: number; structure: number; risk: number; focus: number };
  // E.1: top 5 / middle 5 / bottom 5 competency IDs
  e1Distribution: { top5: string[]; middle5: string[]; bottom5: string[] };
  // Preferences
  prefs: {
    activityStatus: string;
    readiness: string;
    targetRoles: string[];
    targetIndustries: string[];
    targetCompanyTypes: string[];
    targetRevenue: string[];
    geography: string[];
    relocation: string;
    totalCashRange: string;
    equityImportance: string;
    dealbreakers: string[];
    top3Priorities: string[];
  };
};

// ─── Архетипы ──────────────────────────────────────────────────────

const ARCHETYPES: Record<string, Archetype> = {
  strategic_cfo: {
    aStens: { A1: 8, A2: 9, A3: 7, A4: 5, A5: 8, A6: 8, A7: 7, A8: 8, A9: 9, A10: 7 },
    bStens: { B1: 3, B2: 3, B3: 4, B4: 4, B5: 5, B6: 2 },
    cIpsative: { ACH: 9, POW: 8, AUT: 7, LRN: 6, REC: 6, STA: 4, MIS: 3, AFF: 2 },
    cNormative: { ACH: 9, POW: 8, AUT: 7, LRN: 7, REC: 6, STA: 5, MIS: 4, AFF: 3 },
    dCulturePct: { D1: 15, D2: 35, D3: 30, D4: 20 },
    dStyle: { pace: 3, structure: 5, risk: 3, focus: 4 },
    e1Distribution: {
      top5: ["E1.04", "E1.01", "E1.07", "E1.09", "E1.02"],
      middle5: ["E1.03", "E1.05", "E1.06", "E1.10", "E1.15"],
      bottom5: ["E1.08", "E1.11", "E1.12", "E1.13", "E1.14"],
    },
    prefs: {
      activityStatus: "open",
      readiness: "1_month",
      targetRoles: ["CFO"],
      targetIndustries: ["banking", "fintech", "investment"],
      targetCompanyTypes: ["public", "pe_backed", "private"],
      targetRevenue: ["10B_50B", "50B+"],
      geography: ["moscow"],
      relocation: "discuss",
      totalCashRange: "40_60M",
      equityImportance: "desirable",
      dealbreakers: [],
      top3Priorities: ["scale_pnl", "compensation", "status"],
    },
  },

  ecommerce_cfo: {
    aStens: { A1: 7, A2: 8, A3: 6, A4: 6, A5: 7, A6: 8, A7: 8, A8: 6, A9: 7, A10: 9 },
    bStens: { B1: 4, B2: 4, B3: 4, B4: 4, B5: 6, B6: 3 },
    cIpsative: { ACH: 8, AUT: 8, LRN: 7, POW: 6, REC: 5, STA: 4, MIS: 4, AFF: 3 },
    cNormative: { ACH: 8, AUT: 8, LRN: 8, POW: 6, REC: 6, STA: 5, MIS: 5, AFF: 4 },
    dCulturePct: { D1: 20, D2: 30, D3: 35, D4: 15 },
    dStyle: { pace: 2, structure: 3, risk: 2, focus: 3 },
    e1Distribution: {
      top5: ["E1.04", "E1.03", "E1.10", "E1.09", "E1.12"],
      middle5: ["E1.01", "E1.02", "E1.05", "E1.07", "E1.11"],
      bottom5: ["E1.06", "E1.08", "E1.13", "E1.14", "E1.15"],
    },
    prefs: {
      activityStatus: "open",
      readiness: "2_3_months",
      targetRoles: ["CFO", "COO"],
      targetIndustries: ["ecommerce", "tech", "fintech"],
      targetCompanyTypes: ["pe_backed", "private", "startup"],
      targetRevenue: ["1B_5B", "5B_10B"],
      geography: ["moscow", "remote"],
      relocation: "discuss",
      totalCashRange: "25_40M",
      equityImportance: "critical",
      dealbreakers: ["government", "sanctioned"],
      top3Priorities: ["autonomy", "scale_pnl", "compensation"],
    },
  },

  integrator_cfo: {
    aStens: { A1: 9, A2: 7, A3: 5, A4: 6, A5: 9, A6: 6, A7: 7, A8: 7, A9: 7, A10: 5 },
    bStens: { B1: 2, B2: 4, B3: 3, B4: 3, B5: 6, B6: 4 },
    cIpsative: { ACH: 7, STA: 7, AUT: 6, POW: 6, LRN: 5, REC: 5, MIS: 4, AFF: 5 },
    cNormative: { ACH: 7, STA: 8, AUT: 6, POW: 6, LRN: 5, REC: 6, MIS: 5, AFF: 5 },
    dCulturePct: { D1: 20, D2: 25, D3: 15, D4: 40 },
    dStyle: { pace: 5, structure: 6, risk: 5, focus: 5 },
    e1Distribution: {
      top5: ["E1.04", "E1.10", "E1.02", "E1.09", "E1.15"],
      middle5: ["E1.01", "E1.03", "E1.05", "E1.06", "E1.07"],
      bottom5: ["E1.08", "E1.11", "E1.12", "E1.13", "E1.14"],
    },
    prefs: {
      activityStatus: "passive",
      readiness: "3_6_months",
      targetRoles: ["CFO"],
      targetIndustries: ["insurance", "banking", "investment"],
      targetCompanyTypes: ["public", "private"],
      targetRevenue: ["10B_50B", "50B+"],
      geography: ["moscow"],
      relocation: "not_ready",
      totalCashRange: "25_40M",
      equityImportance: "not_important",
      dealbreakers: ["startup"],
      top3Priorities: ["status", "team_culture", "compensation"],
    },
  },

  startup_cfo: {
    aStens: { A1: 7, A2: 8, A3: 7, A4: 6, A5: 6, A6: 9, A7: 9, A8: 6, A9: 7, A10: 9 },
    bStens: { B1: 4, B2: 3, B3: 3, B4: 4, B5: 4, B6: 2 },
    cIpsative: { LRN: 9, AUT: 9, ACH: 7, POW: 5, MIS: 5, REC: 4, STA: 3, AFF: 4 },
    cNormative: { LRN: 9, AUT: 9, ACH: 8, POW: 6, MIS: 6, REC: 5, STA: 4, AFF: 5 },
    dCulturePct: { D1: 25, D2: 25, D3: 40, D4: 10 },
    dStyle: { pace: 2, structure: 2, risk: 2, focus: 3 },
    e1Distribution: {
      top5: ["E1.04", "E1.01", "E1.03", "E1.12", "E1.13"],
      middle5: ["E1.05", "E1.06", "E1.07", "E1.09", "E1.10"],
      bottom5: ["E1.02", "E1.08", "E1.11", "E1.14", "E1.15"],
    },
    prefs: {
      activityStatus: "active",
      readiness: "1_month",
      targetRoles: ["CFO"],
      targetIndustries: ["fintech", "tech", "ai_data"],
      targetCompanyTypes: ["startup", "pe_backed"],
      targetRevenue: ["100M_500M", "500M_1B", "1B_5B"],
      geography: ["moscow", "remote"],
      relocation: "ready",
      totalCashRange: "15_25M",
      equityImportance: "critical",
      dealbreakers: ["government"],
      top3Priorities: ["autonomy", "learning", "mission"],
    },
  },

  retail_cfo: {
    aStens: { A1: 8, A2: 9, A3: 6, A4: 6, A5: 9, A6: 6, A7: 6, A8: 9, A9: 8, A10: 5 },
    bStens: { B1: 3, B2: 3, B3: 5, B4: 5, B5: 7, B6: 3 },
    cIpsative: { ACH: 9, STA: 8, POW: 7, REC: 6, AUT: 5, LRN: 4, MIS: 3, AFF: 4 },
    cNormative: { ACH: 9, STA: 9, POW: 7, REC: 7, AUT: 6, LRN: 5, MIS: 4, AFF: 5 },
    dCulturePct: { D1: 15, D2: 40, D3: 10, D4: 35 },
    dStyle: { pace: 4, structure: 6, risk: 5, focus: 5 },
    e1Distribution: {
      top5: ["E1.04", "E1.06", "E1.10", "E1.09", "E1.11"],
      middle5: ["E1.01", "E1.02", "E1.03", "E1.07", "E1.15"],
      bottom5: ["E1.05", "E1.08", "E1.12", "E1.13", "E1.14"],
    },
    prefs: {
      activityStatus: "passive",
      readiness: "6_plus",
      targetRoles: ["CFO"],
      targetIndustries: ["retail_food", "fmcg", "retail_nonfood"],
      targetCompanyTypes: ["public", "private"],
      targetRevenue: ["50B+"],
      geography: ["moscow"],
      relocation: "not_ready",
      totalCashRange: "60M+",
      equityImportance: "desirable",
      dealbreakers: ["sanctioned"],
      top3Priorities: ["compensation", "scale_pnl", "status"],
    },
  },

  marketplace_cto: {
    aStens: { A1: 7, A2: 9, A3: 6, A4: 6, A5: 7, A6: 9, A7: 8, A8: 6, A9: 7, A10: 9 },
    bStens: { B1: 3, B2: 4, B3: 4, B4: 4, B5: 5, B6: 3 },
    cIpsative: { ACH: 9, AUT: 8, LRN: 7, POW: 6, REC: 5, MIS: 4, STA: 3, AFF: 4 },
    cNormative: { ACH: 9, AUT: 8, LRN: 8, POW: 6, REC: 6, MIS: 5, STA: 4, AFF: 5 },
    dCulturePct: { D1: 15, D2: 30, D3: 40, D4: 15 },
    dStyle: { pace: 2, structure: 3, risk: 2, focus: 4 },
    e1Distribution: {
      top5: ["E1.01", "E1.12", "E1.05", "E1.02", "E1.03"],
      middle5: ["E1.06", "E1.08", "E1.09", "E1.10", "E1.11"],
      bottom5: ["E1.04", "E1.07", "E1.13", "E1.14", "E1.15"],
    },
    prefs: {
      activityStatus: "open",
      readiness: "2_3_months",
      targetRoles: ["CTO", "CDTO"],
      targetIndustries: ["ecommerce", "tech", "ai_data"],
      targetCompanyTypes: ["pe_backed", "private"],
      targetRevenue: ["1B_5B", "5B_10B", "10B_50B"],
      geography: ["moscow", "remote"],
      relocation: "discuss",
      totalCashRange: "25_40M",
      equityImportance: "critical",
      dealbreakers: ["government"],
      top3Priorities: ["scale_pnl", "autonomy", "team_culture"],
    },
  },

  ai_cto: {
    aStens: { A1: 6, A2: 8, A3: 4, A4: 5, A5: 5, A6: 10, A7: 10, A8: 5, A9: 6, A10: 9 },
    bStens: { B1: 4, B2: 6, B3: 4, B4: 5, B5: 5, B6: 2 },
    cIpsative: { LRN: 10, AUT: 9, MIS: 7, ACH: 6, POW: 5, REC: 4, STA: 2, AFF: 3 },
    cNormative: { LRN: 10, AUT: 9, MIS: 7, ACH: 7, POW: 5, REC: 5, STA: 3, AFF: 4 },
    dCulturePct: { D1: 20, D2: 20, D3: 50, D4: 10 },
    dStyle: { pace: 1, structure: 2, risk: 1, focus: 4 },
    e1Distribution: {
      top5: ["E1.12", "E1.01", "E1.13", "E1.02", "E1.06"],
      middle5: ["E1.03", "E1.05", "E1.08", "E1.09", "E1.11"],
      bottom5: ["E1.04", "E1.07", "E1.10", "E1.14", "E1.15"],
    },
    prefs: {
      activityStatus: "active",
      readiness: "immediate",
      targetRoles: ["CTO"],
      targetIndustries: ["ai_data", "tech", "fintech"],
      targetCompanyTypes: ["startup", "private"],
      targetRevenue: ["100M_500M", "500M_1B"],
      geography: ["moscow", "international", "remote"],
      relocation: "ready",
      totalCashRange: "25_40M",
      equityImportance: "critical",
      dealbreakers: ["government", "sanctioned"],
      top3Priorities: ["autonomy", "learning", "mission"],
    },
  },

  bank_cto: {
    aStens: { A1: 8, A2: 7, A3: 6, A4: 6, A5: 8, A6: 7, A7: 7, A8: 7, A9: 8, A10: 6 },
    bStens: { B1: 3, B2: 4, B3: 5, B4: 5, B5: 7, B6: 5 },
    cIpsative: { POW: 8, ACH: 8, STA: 7, REC: 6, LRN: 5, AUT: 5, MIS: 4, AFF: 3 },
    cNormative: { POW: 8, ACH: 8, STA: 8, REC: 7, LRN: 6, AUT: 5, MIS: 4, AFF: 4 },
    dCulturePct: { D1: 20, D2: 25, D3: 20, D4: 35 },
    dStyle: { pace: 4, structure: 5, risk: 5, focus: 5 },
    e1Distribution: {
      top5: ["E1.09", "E1.05", "E1.10", "E1.12", "E1.06"],
      middle5: ["E1.01", "E1.02", "E1.03", "E1.07", "E1.15"],
      bottom5: ["E1.04", "E1.08", "E1.11", "E1.13", "E1.14"],
    },
    prefs: {
      activityStatus: "passive",
      readiness: "3_6_months",
      targetRoles: ["CTO", "CDTO"],
      targetIndustries: ["banking", "fintech", "tech"],
      targetCompanyTypes: ["public", "private"],
      targetRevenue: ["10B_50B", "50B+"],
      geography: ["moscow"],
      relocation: "not_ready",
      totalCashRange: "40_60M",
      equityImportance: "desirable",
      dealbreakers: [],
      top3Priorities: ["compensation", "scale_pnl", "status"],
    },
  },

  saas_cto: {
    aStens: { A1: 7, A2: 8, A3: 6, A4: 6, A5: 6, A6: 9, A7: 9, A8: 6, A9: 7, A10: 9 },
    bStens: { B1: 4, B2: 4, B3: 3, B4: 4, B5: 5, B6: 2 },
    cIpsative: { AUT: 9, LRN: 8, ACH: 8, POW: 5, MIS: 5, REC: 4, STA: 3, AFF: 4 },
    cNormative: { AUT: 9, LRN: 8, ACH: 8, POW: 6, MIS: 6, REC: 5, STA: 4, AFF: 5 },
    dCulturePct: { D1: 25, D2: 25, D3: 40, D4: 10 },
    dStyle: { pace: 2, structure: 2, risk: 2, focus: 4 },
    e1Distribution: {
      top5: ["E1.01", "E1.12", "E1.05", "E1.02", "E1.03"],
      middle5: ["E1.06", "E1.08", "E1.09", "E1.13", "E1.11"],
      bottom5: ["E1.04", "E1.07", "E1.10", "E1.14", "E1.15"],
    },
    prefs: {
      activityStatus: "open",
      readiness: "1_month",
      targetRoles: ["CTO"],
      targetIndustries: ["tech", "ai_data"],
      targetCompanyTypes: ["startup", "private", "pe_backed"],
      targetRevenue: ["100M_500M", "500M_1B", "1B_5B"],
      geography: ["moscow", "remote"],
      relocation: "discuss",
      totalCashRange: "15_25M",
      equityImportance: "critical",
      dealbreakers: ["government"],
      top3Priorities: ["autonomy", "learning", "compensation"],
    },
  },

  retail_tech_cto: {
    aStens: { A1: 8, A2: 9, A3: 6, A4: 6, A5: 8, A6: 8, A7: 7, A8: 7, A9: 8, A10: 7 },
    bStens: { B1: 3, B2: 3, B3: 4, B4: 5, B5: 6, B6: 3 },
    cIpsative: { ACH: 9, POW: 8, AUT: 6, REC: 5, LRN: 6, STA: 4, MIS: 4, AFF: 4 },
    cNormative: { ACH: 9, POW: 8, AUT: 6, REC: 6, LRN: 7, STA: 5, MIS: 5, AFF: 5 },
    dCulturePct: { D1: 15, D2: 35, D3: 30, D4: 20 },
    dStyle: { pace: 3, structure: 4, risk: 3, focus: 4 },
    e1Distribution: {
      top5: ["E1.01", "E1.05", "E1.10", "E1.12", "E1.02"],
      middle5: ["E1.03", "E1.06", "E1.07", "E1.09", "E1.11"],
      bottom5: ["E1.04", "E1.08", "E1.13", "E1.14", "E1.15"],
    },
    prefs: {
      activityStatus: "passive",
      readiness: "3_6_months",
      targetRoles: ["CTO", "CDTO"],
      targetIndustries: ["ecommerce", "retail_nonfood", "tech"],
      targetCompanyTypes: ["public", "pe_backed", "private"],
      targetRevenue: ["10B_50B", "50B+"],
      geography: ["moscow"],
      relocation: "not_ready",
      totalCashRange: "40_60M",
      equityImportance: "desirable",
      dealbreakers: [],
      top3Priorities: ["scale_pnl", "compensation", "status"],
    },
  },
};

// ─── Назначение архетипов кандидатам ────────────────────────────────

const ASSIGNMENTS: { email: string; archetype: keyof typeof ARCHETYPES }[] = [
  { email: "anna.cfo@example.ru", archetype: "strategic_cfo" },
  { email: "dmitry.cfo@example.ru", archetype: "ecommerce_cfo" },
  { email: "olga.cfo@example.ru", archetype: "integrator_cfo" },
  { email: "mikhail.cfo@example.ru", archetype: "startup_cfo" },
  { email: "elena.cfo@example.ru", archetype: "retail_cfo" },
  { email: "sergey.cto@example.ru", archetype: "marketplace_cto" },
  { email: "andrey.cto@example.ru", archetype: "ai_cto" },
  { email: "nikita.cto@example.ru", archetype: "bank_cto" },
  { email: "pavel.cto@example.ru", archetype: "saas_cto" },
  { email: "kirill.cto@example.ru", archetype: "retail_tech_cto" },
];

async function main() {
  console.log("🌱 Seeding synthetic ScaleScores + Preferences...\n");
  await prisma.$queryRaw`SELECT 1`;

  let processed = 0;
  for (const { email, archetype } of ASSIGNMENTS) {
    const arch = ARCHETYPES[archetype];

    const user = await prisma.user.findUnique({
      where: { email },
      include: { candidateProfile: { select: { id: true } } },
    });
    if (!user?.candidateProfile) {
      console.log(`  ⚠️  ${email} — кандидата нет в БД, skip`);
      continue;
    }
    const cpId = user.candidateProfile.id;

    // ScaleScore upsert
    await prisma.scaleScore.upsert({
      where: { candidateProfileId: cpId },
      update: {
        aStens: arch.aStens,
        bStens: arch.bStens,
        cIpsative: arch.cIpsative,
        cNormative: arch.cNormative,
        dCulturePct: arch.dCulturePct,
        dStyle: arch.dStyle,
        e1Distribution: arch.e1Distribution,
        scoredAt: new Date(),
      },
      create: {
        candidateProfileId: cpId,
        aStens: arch.aStens,
        bStens: arch.bStens,
        cIpsative: arch.cIpsative,
        cNormative: arch.cNormative,
        dCulturePct: arch.dCulturePct,
        dStyle: arch.dStyle,
        e1Distribution: arch.e1Distribution,
      },
    });

    // Preferences upsert
    await prisma.candidatePreferences.upsert({
      where: { candidateProfileId: cpId },
      update: arch.prefs,
      create: { candidateProfileId: cpId, ...arch.prefs },
    });

    processed++;
    console.log(`  ✓ ${email.padEnd(28)} archetype=${archetype}`);
  }

  console.log(`\n✓ ${processed} candidates updated\n`);

  console.log(`Total ScaleScores in DB: ${await prisma.scaleScore.count()}`);
  console.log(`Total CandidatePreferences in DB: ${await prisma.candidatePreferences.count()}`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
