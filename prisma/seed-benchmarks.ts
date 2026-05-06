/**
 * Seed market salary benchmarks (Russian executive market, v1).
 *
 * Источник: агрегированные данные из публичных surveys 2024-2025
 * (Antal, Hays, Korn Ferry, RBK reports). Это **v1 estimates** —
 * требуют калибровки через первичный research перед production-launch
 * с реальными executives.
 *
 * Все цифры — total cash (fixed + bonus), млн ₽/год. Equity отдельно.
 *
 * Roles: CEO, CFO, CTO, COO, CHRO, CMO, CPO
 * Sizes:
 *   - small: revenue < 1 млрд ₽
 *   - mid:   1 – 10 млрд ₽
 *   - large: > 10 млрд ₽
 *
 * Для запуска отдельно от основного seed:
 *   npx tsx prisma/seed-benchmarks.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type Bench = {
  role: string;
  companySize: "small" | "mid" | "large";
  p25: number;
  median: number;
  p75: number;
  p90?: number;
};

const BENCHMARKS: Bench[] = [
  // CEO
  { role: "CEO", companySize: "small", p25: 15, median: 25, p75: 40, p90: 60 },
  { role: "CEO", companySize: "mid", p25: 30, median: 50, p75: 80, p90: 120 },
  { role: "CEO", companySize: "large", p25: 60, median: 100, p75: 180, p90: 300 },

  // CFO
  { role: "CFO", companySize: "small", p25: 8, median: 12, p75: 20, p90: 30 },
  { role: "CFO", companySize: "mid", p25: 15, median: 25, p75: 40, p90: 60 },
  { role: "CFO", companySize: "large", p25: 25, median: 40, p75: 70, p90: 120 },

  // CTO
  { role: "CTO", companySize: "small", p25: 10, median: 15, p75: 25, p90: 40 },
  { role: "CTO", companySize: "mid", p25: 18, median: 30, p75: 50, p90: 80 },
  { role: "CTO", companySize: "large", p25: 30, median: 50, p75: 85, p90: 140 },

  // COO
  { role: "COO", companySize: "small", p25: 8, median: 12, p75: 20, p90: 30 },
  { role: "COO", companySize: "mid", p25: 15, median: 25, p75: 40, p90: 60 },
  { role: "COO", companySize: "large", p25: 25, median: 45, p75: 75, p90: 130 },

  // CHRO
  { role: "CHRO", companySize: "small", p25: 5, median: 8, p75: 15, p90: 25 },
  { role: "CHRO", companySize: "mid", p25: 10, median: 18, p75: 30, p90: 45 },
  { role: "CHRO", companySize: "large", p25: 18, median: 30, p75: 50, p90: 80 },

  // CMO
  { role: "CMO", companySize: "small", p25: 6, median: 10, p75: 18, p90: 28 },
  { role: "CMO", companySize: "mid", p25: 12, median: 22, p75: 38, p90: 55 },
  { role: "CMO", companySize: "large", p25: 22, median: 38, p75: 60, p90: 100 },

  // CPO
  { role: "CPO", companySize: "small", p25: 8, median: 14, p75: 22, p90: 35 },
  { role: "CPO", companySize: "mid", p25: 15, median: 28, p75: 45, p90: 70 },
  { role: "CPO", companySize: "large", p25: 28, median: 48, p75: 80, p90: 130 },
];

const SOURCE = "Aggregated estimates from Antal/Hays/Korn Ferry public surveys 2024-2025";
const METHODOLOGY =
  "v1 reference values. Total cash compensation (fixed + bonus), excluding equity/LTI. " +
  "Numbers should be refined with primary research (annual executive comp surveys, " +
  "internal data from successful placements) before production launch.";

async function main() {
  console.log("🌱 Seeding market salary benchmarks (v1)...\n");

  // Wake up Neon
  await prisma.$queryRaw`SELECT 1`;

  // Prisma compound unique с nullable industry — используем findFirst+create/update.
  for (const b of BENCHMARKS) {
    const existing = await prisma.marketSalaryBenchmark.findFirst({
      where: {
        role: b.role,
        companySize: b.companySize,
        industry: null,
      },
    });

    const data = {
      role: b.role,
      companySize: b.companySize,
      industry: null,
      p25: b.p25,
      median: b.median,
      p75: b.p75,
      p90: b.p90 ?? null,
      source: SOURCE,
      methodology: METHODOLOGY,
      asOfDate: new Date("2026-05-01"),
    };

    if (existing) {
      await prisma.marketSalaryBenchmark.update({
        where: { id: existing.id },
        data,
      });
    } else {
      await prisma.marketSalaryBenchmark.create({ data });
    }
  }

  console.log(`✓ ${BENCHMARKS.length} benchmark records seeded`);

  const count = await prisma.marketSalaryBenchmark.count();
  console.log(`Total in DB: ${count}\n`);

  // Print sample
  const sample = await prisma.marketSalaryBenchmark.findMany({
    where: { role: "CFO" },
    orderBy: { companySize: "asc" },
  });
  console.log("Sample (CFO benchmarks):");
  for (const s of sample) {
    console.log(`  ${s.companySize.padEnd(6)} P25=${s.p25}  Med=${s.median}  P75=${s.p75}  P90=${s.p90}`);
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
