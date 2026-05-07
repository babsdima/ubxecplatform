/**
 * Additive seed: 5 CFO + 5 CTO кандидатов с разными профилями.
 * Mix VERIFIED + PENDING для тестирования admin verification flow.
 *
 * Запуск локально:    npx tsx prisma/seed-test-candidates.ts
 * Запуск на проде:    PROD_URL="..." DATABASE_URL="$PROD_URL" npx tsx prisma/seed-test-candidates.ts
 *
 * Скрипт идемпотентный — upsert по email.
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

type CandSpec = {
  email: string;
  firstName: string;
  lastName: string;
  currentTitle: string;
  currentCompany: string;
  industry: string; // legacy field
  industries: string[]; // new structured
  yearsManagement: number;
  yearsExperience: number; // legacy alias
  companyRevenue: string;
  pnlRange: string;
  maxPnl: string;
  maxReports: number;
  directReports: number;
  totalReports: number;
  salaryMin: number;
  salaryMax: number;
  achievements: string;
  experienceContexts: string[];
  status: "VERIFIED" | "PENDING";
  // function для derive role в benchmark
  currentFunction: string[];
  currentLevel: string;
  companyType: string;
  tenureCurrent: string;
};

const CANDIDATES: CandSpec[] = [
  // ───────── CFO (5) ─────────
  {
    email: "anna.cfo@example.ru",
    firstName: "Анна",
    lastName: "Морозова",
    currentTitle: "CFO",
    currentCompany: "Альфа-Капитал",
    industry: "Банки",
    industries: ["banking", "investment"],
    yearsManagement: 15,
    yearsExperience: 15,
    companyRevenue: "10B_50B",
    pnlRange: "10B+",
    maxPnl: "10B+",
    maxReports: 480,
    directReports: 9,
    totalReports: 480,
    salaryMin: 30_000_000,
    salaryMax: 50_000_000,
    achievements: "Реструктуризация capital allocation; запуск IPO в 2024; команда 480; вывод EBITDA с 12% до 25%",
    experienceContexts: ["scale_up", "ipo_pre", "ma_buy", "board_work"],
    status: "VERIFIED",
    currentFunction: ["finance"],
    currentLevel: "C-level",
    companyType: "public",
    tenureCurrent: "4_7",
  },
  {
    email: "dmitry.cfo@example.ru",
    firstName: "Дмитрий",
    lastName: "Волков",
    currentTitle: "CFO",
    currentCompany: "ShopOnline",
    industry: "E-commerce",
    industries: ["ecommerce", "tech"],
    yearsManagement: 10,
    yearsExperience: 10,
    companyRevenue: "1B_5B",
    pnlRange: "2B_10B",
    maxPnl: "2B_10B",
    maxReports: 180,
    directReports: 6,
    totalReports: 180,
    salaryMin: 18_000_000,
    salaryMax: 28_000_000,
    achievements: "Подготовка marketplace к Series C; внедрение unit economics framework; снижение CAC на 30%",
    experienceContexts: ["scale_up", "digital_transformation", "geo_expansion"],
    status: "PENDING",
    currentFunction: ["finance"],
    currentLevel: "C-level",
    companyType: "private",
    tenureCurrent: "2_4",
  },
  {
    email: "olga.cfo@example.ru",
    firstName: "Ольга",
    lastName: "Кузнецова",
    currentTitle: "CFO",
    currentCompany: "СтраховойХолдинг",
    industry: "Страхование",
    industries: ["insurance", "banking"],
    yearsManagement: 18,
    yearsExperience: 18,
    companyRevenue: "5B_10B",
    pnlRange: "2B_10B",
    maxPnl: "10B+",
    maxReports: 320,
    directReports: 8,
    totalReports: 320,
    salaryMin: 22_000_000,
    salaryMax: 35_000_000,
    achievements: "M&A интеграция 3 страховых компаний; ALM на портфеле 60 млрд; команда 320",
    experienceContexts: ["ma_buy", "pe_integration", "restructuring", "board_work"],
    status: "VERIFIED",
    currentFunction: ["finance"],
    currentLevel: "C-level",
    companyType: "private",
    tenureCurrent: "7+",
  },
  {
    email: "mikhail.cfo@example.ru",
    firstName: "Михаил",
    lastName: "Новиков",
    currentTitle: "CFO",
    currentCompany: "PayFlow Tech",
    industry: "Финтех",
    industries: ["fintech", "tech"],
    yearsManagement: 8,
    yearsExperience: 8,
    companyRevenue: "500M_1B",
    pnlRange: "500M_2B",
    maxPnl: "500M_2B",
    maxReports: 65,
    directReports: 4,
    totalReports: 65,
    salaryMin: 12_000_000,
    salaryMax: 20_000_000,
    achievements: "Первый CFO стартапа; Series B raised $30M; финансовая функция с нуля",
    experienceContexts: ["startup", "scale_up", "digital_transformation"],
    status: "PENDING",
    currentFunction: ["finance"],
    currentLevel: "C-level",
    companyType: "startup",
    tenureCurrent: "2_4",
  },
  {
    email: "elena.cfo@example.ru",
    firstName: "Елена",
    lastName: "Соколова",
    currentTitle: "CFO",
    currentCompany: "Магнит-сервис",
    industry: "Ритейл",
    industries: ["retail_food", "fmcg"],
    yearsManagement: 20,
    yearsExperience: 22,
    companyRevenue: "50B+",
    pnlRange: "10B+",
    maxPnl: "10B+",
    maxReports: 850,
    directReports: 12,
    totalReports: 850,
    salaryMin: 35_000_000,
    salaryMax: 55_000_000,
    achievements: "CFO retail-сети 850+ магазинов; cost optimization на 18%; 2 успешных IPO в карьере",
    experienceContexts: ["ipo_pre", "scale_up", "restructuring", "board_work", "geo_expansion"],
    status: "VERIFIED",
    currentFunction: ["finance"],
    currentLevel: "C-level",
    companyType: "public",
    tenureCurrent: "4_7",
  },

  // ───────── CTO (5) ─────────
  {
    email: "sergey.cto@example.ru",
    firstName: "Сергей",
    lastName: "Попов",
    currentTitle: "CTO",
    currentCompany: "MarketBuy",
    industry: "E-commerce",
    industries: ["ecommerce", "tech"],
    yearsManagement: 12,
    yearsExperience: 14,
    companyRevenue: "1B_5B",
    pnlRange: "500M_2B",
    maxPnl: "500M_2B",
    maxReports: 220,
    directReports: 7,
    totalReports: 220,
    salaryMin: 18_000_000,
    salaryMax: 30_000_000,
    achievements: "Marketplace платформа: 220 инженеров, миграция на cloud-native; запуск ML рекомендаций",
    experienceContexts: ["scale_up", "digital_transformation"],
    status: "VERIFIED",
    currentFunction: ["technology"],
    currentLevel: "C-level",
    companyType: "private",
    tenureCurrent: "4_7",
  },
  {
    email: "andrey.cto@example.ru",
    firstName: "Андрей",
    lastName: "Лебедев",
    currentTitle: "CTO",
    currentCompany: "AI Labs",
    industry: "AI / Data",
    industries: ["ai_data", "tech"],
    yearsManagement: 10,
    yearsExperience: 12,
    companyRevenue: "500M_1B",
    pnlRange: "500M_2B",
    maxPnl: "500M_2B",
    maxReports: 80,
    directReports: 5,
    totalReports: 80,
    salaryMin: 20_000_000,
    salaryMax: 32_000_000,
    achievements: "AI/ML platform с нуля; собственный foundation model; Series A raised $15M",
    experienceContexts: ["startup", "scale_up", "digital_transformation"],
    status: "PENDING",
    currentFunction: ["technology"],
    currentLevel: "C-level",
    companyType: "startup",
    tenureCurrent: "2_4",
  },
  {
    email: "nikita.cto@example.ru",
    firstName: "Никита",
    lastName: "Захаров",
    currentTitle: "CTO",
    currentCompany: "ДигиталБанк",
    industry: "Банки",
    industries: ["banking", "fintech"],
    yearsManagement: 14,
    yearsExperience: 17,
    companyRevenue: "10B_50B",
    pnlRange: "2B_10B",
    maxPnl: "10B+",
    maxReports: 480,
    directReports: 9,
    totalReports: 480,
    salaryMin: 25_000_000,
    salaryMax: 40_000_000,
    achievements: "Digital трансформация банка-top10; 480 инженеров; запуск open banking API",
    experienceContexts: ["digital_transformation", "scale_up", "board_work"],
    status: "VERIFIED",
    currentFunction: ["technology"],
    currentLevel: "C-level",
    companyType: "public",
    tenureCurrent: "4_7",
  },
  {
    email: "pavel.cto@example.ru",
    firstName: "Павел",
    lastName: "Жуков",
    currentTitle: "CTO",
    currentCompany: "B2B SaaS Pro",
    industry: "IT / SaaS",
    industries: ["tech"],
    yearsManagement: 9,
    yearsExperience: 11,
    companyRevenue: "100M_500M",
    pnlRange: "<500M",
    maxPnl: "500M_2B",
    maxReports: 55,
    directReports: 4,
    totalReports: 55,
    salaryMin: 15_000_000,
    salaryMax: 25_000_000,
    achievements: "B2B SaaS компания: монолит → микросервисы; команда 55 инженеров; ARR x3 за 2 года",
    experienceContexts: ["startup", "scale_up", "digital_transformation"],
    status: "PENDING",
    currentFunction: ["technology"],
    currentLevel: "C-level",
    companyType: "private",
    tenureCurrent: "2_4",
  },
  {
    email: "kirill.cto@example.ru",
    firstName: "Кирилл",
    lastName: "Васильев",
    currentTitle: "CTO",
    currentCompany: "RetailTech Group",
    industry: "E-commerce",
    industries: ["ecommerce", "retail_nonfood", "tech"],
    yearsManagement: 16,
    yearsExperience: 19,
    companyRevenue: "10B_50B",
    pnlRange: "2B_10B",
    maxPnl: "10B+",
    maxReports: 620,
    directReports: 10,
    totalReports: 620,
    salaryMin: 30_000_000,
    salaryMax: 45_000_000,
    achievements: "CTO retail-tech лидера; миграция на cloud, 620 инженеров; собственная logistics-платформа; ~$200M tech budget",
    experienceContexts: ["scale_up", "digital_transformation", "geo_expansion", "ma_buy"],
    status: "VERIFIED",
    currentFunction: ["technology"],
    currentLevel: "C-level",
    companyType: "public",
    tenureCurrent: "7+",
  },
];

async function main() {
  console.log("🌱 Seeding test candidates (5 CFO + 5 CTO)...\n");

  // Wake up Neon
  await prisma.$queryRaw`SELECT 1`;

  const password = await bcrypt.hash("password123", 10);

  let created = 0;
  let updated = 0;

  for (const c of CANDIDATES) {
    const userExists = await prisma.user.findUnique({
      where: { email: c.email },
      select: { id: true },
    });

    const user = await prisma.user.upsert({
      where: { email: c.email },
      update: {}, // не перезаписываем пароль
      create: { email: c.email, password, role: "CANDIDATE" },
    });

    await prisma.candidateProfile.upsert({
      where: { userId: user.id },
      update: {
        firstName: c.firstName,
        lastName: c.lastName,
        currentCompany: c.currentCompany,
        currentTitle: c.currentTitle,
        industry: c.industry,
        yearsExperience: c.yearsExperience,
        achievements: c.achievements,
        salaryMin: c.salaryMin,
        salaryMax: c.salaryMax,
        currentLevel: c.currentLevel,
        currentFunction: c.currentFunction,
        companyType: c.companyType,
        companyRevenue: c.companyRevenue,
        pnlRange: c.pnlRange,
        tenureCurrent: c.tenureCurrent,
        directReports: c.directReports,
        totalReports: c.totalReports,
        yearsManagement: c.yearsManagement,
        maxPnl: c.maxPnl,
        maxReports: c.maxReports,
        industries: c.industries,
        experienceContexts: c.experienceContexts,
        status: c.status,
      },
      create: {
        userId: user.id,
        firstName: c.firstName,
        lastName: c.lastName,
        currentCompany: c.currentCompany,
        currentTitle: c.currentTitle,
        industry: c.industry,
        yearsExperience: c.yearsExperience,
        achievements: c.achievements,
        salaryMin: c.salaryMin,
        salaryMax: c.salaryMax,
        locationPref: "Москва",
        functionalFocus: c.currentFunction[0] === "finance" ? "Финансы" : "Технологии",
        currentLevel: c.currentLevel,
        currentFunction: c.currentFunction,
        companyType: c.companyType,
        companyRevenue: c.companyRevenue,
        pnlRange: c.pnlRange,
        tenureCurrent: c.tenureCurrent,
        directReports: c.directReports,
        totalReports: c.totalReports,
        yearsManagement: c.yearsManagement,
        maxPnl: c.maxPnl,
        maxReports: c.maxReports,
        industries: c.industries,
        experienceContexts: c.experienceContexts,
        status: c.status,
      },
    });

    if (userExists) updated++;
    else created++;
    console.log(`  ${userExists ? "↻" : "+"} ${c.email.padEnd(28)} ${c.currentTitle.padEnd(4)} ${c.industry.padEnd(15)} status=${c.status}`);
  }

  console.log(`\n✓ ${created} created, ${updated} updated`);
  console.log(`Total candidates in DB: ${await prisma.candidateProfile.count()}`);
  console.log(`  PENDING: ${await prisma.candidateProfile.count({ where: { status: "PENDING" } })}`);
  console.log(`  VERIFIED: ${await prisma.candidateProfile.count({ where: { status: "VERIFIED" } })}`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
