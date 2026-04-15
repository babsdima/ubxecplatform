import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Заполнение базы тестовыми данными...");

  const password = await bcrypt.hash("password123", 10);

  // Admin
  await prisma.user.upsert({
    where: { email: "admin@ubxec.ru" },
    update: {},
    create: { email: "admin@ubxec.ru", password, role: "ADMIN" },
  });

  // Кандидат 1 — CFO
  const cand1User = await prisma.user.upsert({
    where: { email: "cfo@example.ru" },
    update: {},
    create: { email: "cfo@example.ru", password, role: "CANDIDATE" },
  });
  await prisma.candidateProfile.upsert({
    where: { userId: cand1User.id },
    update: {},
    create: {
      userId: cand1User.id,
      currentTitle: "CFO",
      industry: "Финансы",
      yearsExperience: 12,
      achievements:
        "Вывел компанию на IPO, оптимизировал операционные расходы на 30%, управлял P&L >5 млрд руб.",
      salaryMin: 10000000,
      salaryMax: 18000000,
      locationPref: "Москва",
      functionalFocus: "Финансы",
      firstName: "Алексей",
      lastName: "Иванов",
      currentCompany: "ООО ФинТех",
      status: "VERIFIED",
    },
  });

  // Кандидат 2 — CTO
  const cand2User = await prisma.user.upsert({
    where: { email: "cto@example.ru" },
    update: {},
    create: { email: "cto@example.ru", password, role: "CANDIDATE" },
  });
  await prisma.candidateProfile.upsert({
    where: { userId: cand2User.id },
    update: {},
    create: {
      userId: cand2User.id,
      currentTitle: "CTO",
      industry: "Технологии",
      yearsExperience: 10,
      achievements:
        "Масштабировал команду с 20 до 150 инженеров, внедрил микросервисную архитектуру, запустил 3 B2B-продукта.",
      salaryMin: 12000000,
      salaryMax: 20000000,
      locationPref: "Москва / Удалённо",
      functionalFocus: "Технологии",
      firstName: "Дмитрий",
      lastName: "Петров",
      currentCompany: "TechScale",
      status: "PENDING",
    },
  });

  // Кандидат 3 — COO
  const cand3User = await prisma.user.upsert({
    where: { email: "coo@example.ru" },
    update: {},
    create: { email: "coo@example.ru", password, role: "CANDIDATE" },
  });
  await prisma.candidateProfile.upsert({
    where: { userId: cand3User.id },
    update: {},
    create: {
      userId: cand3User.id,
      currentTitle: "COO",
      industry: "Ритейл",
      yearsExperience: 15,
      achievements:
        "Управлял операциями сети 200+ магазинов, снизил логистические издержки на 22%, внедрил OKR в компании 3000 чел.",
      salaryMin: 14000000,
      salaryMax: 22000000,
      locationPref: "Москва",
      functionalFocus: "Операции",
      firstName: "Елена",
      lastName: "Смирнова",
      currentCompany: "RetailGroup",
      status: "VERIFIED",
    },
  });

  // Кандидат 4 — CFO #2 (для бенчмарка в отрасли Финансы)
  const cand4User = await prisma.user.upsert({
    where: { email: "cfo2@example.ru" },
    update: {},
    create: { email: "cfo2@example.ru", password, role: "CANDIDATE" },
  });
  await prisma.candidateProfile.upsert({
    where: { userId: cand4User.id },
    update: {},
    create: {
      userId: cand4User.id,
      currentTitle: "CFO",
      industry: "Финансы",
      yearsExperience: 8,
      achievements:
        "Построил финансовую модель для M&A сделки на $200 млн, внедрил управленческий учёт в холдинге 5 компаний.",
      salaryMin: 7000000,
      salaryMax: 12000000,
      locationPref: "Москва",
      functionalFocus: "Финансы",
      firstName: "Игорь",
      lastName: "Волков",
      currentCompany: "CapitalGroup",
      status: "VERIFIED",
    },
  });

  // Кандидат 5 — VP Finance (для бенчмарка в отрасли Финансы)
  const cand5User = await prisma.user.upsert({
    where: { email: "vpf@example.ru" },
    update: {},
    create: { email: "vpf@example.ru", password, role: "CANDIDATE" },
  });
  await prisma.candidateProfile.upsert({
    where: { userId: cand5User.id },
    update: {},
    create: {
      userId: cand5User.id,
      currentTitle: "VP Finance",
      industry: "Финансы",
      yearsExperience: 14,
      achievements:
        "Руководил казначейством банка топ-20, снизил стоимость фондирования на 1.2 п.п., команда 40 человек.",
      salaryMin: 15000000,
      salaryMax: 24000000,
      locationPref: "Москва / Санкт-Петербург",
      functionalFocus: "Финансы",
      firstName: "Ольга",
      lastName: "Крылова",
      currentCompany: "FinanceBank",
      status: "VERIFIED",
    },
  });

  // Компания 1 — PE фонд
  const comp1User = await prisma.user.upsert({
    where: { email: "hr@pegroup.ru" },
    update: {},
    create: { email: "hr@pegroup.ru", password, role: "COMPANY" },
  });
  const comp1 = await prisma.companyProfile.upsert({
    where: { userId: comp1User.id },
    update: {},
    create: {
      userId: comp1User.id,
      companyName: "PE Capital Group",
      industry: "Инвестиции",
      size: "MEDIUM",
      description:
        "PE-фонд с портфелем 12 компаний в секторах финтех, ритейл и промышленность.",
      website: "https://pecapital.ru",
      isVerified: true,
    },
  });

  // Компания 2 — Tech startup
  const comp2User = await prisma.user.upsert({
    where: { email: "hr@techscale.ru" },
    update: {},
    create: { email: "hr@techscale.ru", password, role: "COMPANY" },
  });
  const comp2 = await prisma.companyProfile.upsert({
    where: { userId: comp2User.id },
    update: {},
    create: {
      userId: comp2User.id,
      companyName: "TechScale Ventures",
      industry: "Технологии",
      size: "SMALL",
      description: "B2B SaaS платформа для автоматизации закупок, 80+ сотрудников.",
      isVerified: true,
    },
  });

  // Мандаты
  const mandate1 = await prisma.mandate.create({
    data: {
      companyId: comp1.id,
      title: "CFO",
      industry: "Финансы",
      salaryMin: 12000000,
      salaryMax: 20000000,
      description:
        "Ищем финансового директора для управления портфельной компанией в финтех-секторе. Задача — подготовка к раунду Series B.",
      requirements:
        "10+ лет в финансах, опыт работы с PE или в стартапах, знание МСФО, опыт привлечения инвестиций.",
      status: "ACTIVE",
    },
  });

  const mandate2 = await prisma.mandate.create({
    data: {
      companyId: comp2.id,
      title: "CTO",
      industry: "Технологии",
      salaryMin: 15000000,
      salaryMax: 22000000,
      description:
        "Ищем технического директора для масштабирования продукта. Команда 25 инженеров, планируем рост до 60.",
      requirements:
        "8+ лет в разработке, опыт масштабирования команд, знание cloud-архитектур, опыт в B2B SaaS.",
      status: "ACTIVE",
    },
  });

  // Мэтчи
  const cand1Profile = await prisma.candidateProfile.findUnique({ where: { userId: cand1User.id } });
  const cand2Profile = await prisma.candidateProfile.findUnique({ where: { userId: cand2User.id } });
  const cand3Profile = await prisma.candidateProfile.findUnique({ where: { userId: cand3User.id } });

  if (cand1Profile) {
    await prisma.match.create({
      data: { mandateId: mandate1.id, candidateProfileId: cand1Profile.id, score: 92, status: "PENDING" },
    });
  }
  if (cand3Profile) {
    await prisma.match.create({
      data: { mandateId: mandate1.id, candidateProfileId: cand3Profile.id, score: 74, status: "PENDING" },
    });
  }
  if (cand2Profile) {
    await prisma.match.create({
      data: {
        mandateId: mandate2.id,
        candidateProfileId: cand2Profile.id,
        score: 88,
        status: "MUTUAL",
        candidateInterest: true,
        companyInterest: true,
        revealedAt: new Date(),
      },
    });
  }

  console.log("✅ Готово! Аккаунты (пароль: password123):");
  console.log("  admin@ubxec.ru      — администратор");
  console.log("  cfo@example.ru      — кандидат CFO (верифицирован, Финансы)");
  console.log("  cto@example.ru      — кандидат CTO (на верификации, Технологии)");
  console.log("  coo@example.ru      — кандидат COO (верифицирован, Ритейл)");
  console.log("  cfo2@example.ru     — кандидат CFO #2 (верифицирован, Финансы)");
  console.log("  vpf@example.ru      — кандидат VP Finance (верифицирован, Финансы)");
  console.log("  hr@pegroup.ru       — компания PE Capital Group");
  console.log("  hr@techscale.ru     — компания TechScale Ventures");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
