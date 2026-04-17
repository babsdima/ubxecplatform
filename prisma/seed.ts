import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { computeMatches } from "../src/lib/matching";

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

  // Кандидат 6 — CEO (Технологии, ментор + full-time)
  const cand6User = await prisma.user.upsert({
    where: { email: "ceo@example.ru" },
    update: {},
    create: { email: "ceo@example.ru", password, role: "CANDIDATE" },
  });
  await prisma.candidateProfile.upsert({
    where: { userId: cand6User.id },
    update: {},
    create: {
      userId: cand6User.id,
      currentTitle: "CEO",
      industry: "Технологии",
      yearsExperience: 18,
      achievements: "Вывел SaaS-компанию с $2M до $40M ARR, провёл Series C на $60M, построил команду 300+ человек в 5 странах.",
      salaryMin: 20000000,
      salaryMax: 40000000,
      locationPref: "Москва / Удалённо",
      functionalFocus: "Стратегия",
      firstName: "Андрей",
      lastName: "Соколов",
      currentCompany: "SaaSGrowth",
      status: "VERIFIED",
      engagementFormats: "full-time,mentor,board",
    },
  });

  // Кандидат 7 — CHRO/HRD (открыт к ментору и консультанту)
  const cand7User = await prisma.user.upsert({
    where: { email: "hrd@example.ru" },
    update: {},
    create: { email: "hrd@example.ru", password, role: "CANDIDATE" },
  });
  await prisma.candidateProfile.upsert({
    where: { userId: cand7User.id },
    update: {},
    create: {
      userId: cand7User.id,
      currentTitle: "CHRO",
      industry: "Технологии",
      yearsExperience: 13,
      achievements: "Трансформировал HR-функцию в компании 2000 чел., снизил текучесть топ-менеджмента до 8%, построил систему succession planning.",
      salaryMin: 8000000,
      salaryMax: 15000000,
      locationPref: "Москва",
      functionalFocus: "HR / People",
      firstName: "Наталья",
      lastName: "Орлова",
      currentCompany: "TechHolding",
      status: "VERIFIED",
      engagementFormats: "full-time,consultant",
    },
  });

  // Кандидат 8 — CPO (Технологии)
  const cand8User = await prisma.user.upsert({
    where: { email: "cpo@example.ru" },
    update: {},
    create: { email: "cpo@example.ru", password, role: "CANDIDATE" },
  });
  await prisma.candidateProfile.upsert({
    where: { userId: cand8User.id },
    update: {},
    create: {
      userId: cand8User.id,
      currentTitle: "CPO",
      industry: "Технологии",
      yearsExperience: 11,
      achievements: "Запустил 4 B2C продукта с DAU 1M+, внедрил product-led growth стратегию, рост retention с 30% до 68% за 2 года.",
      salaryMin: 13000000,
      salaryMax: 22000000,
      locationPref: "Москва / Удалённо",
      functionalFocus: "Продукт",
      firstName: "Максим",
      lastName: "Белов",
      currentCompany: "ProductLab",
      status: "VERIFIED",
      engagementFormats: "full-time,consultant",
    },
  });

  // Кандидат 9 — Commercial Director (FMCG)
  const cand9User = await prisma.user.upsert({
    where: { email: "crd@example.ru" },
    update: {},
    create: { email: "crd@example.ru", password, role: "CANDIDATE" },
  });
  await prisma.candidateProfile.upsert({
    where: { userId: cand9User.id },
    update: {},
    create: {
      userId: cand9User.id,
      currentTitle: "Commercial Director",
      industry: "FMCG",
      yearsExperience: 16,
      achievements: "Управлял продажами P&L 25 млрд руб., открыл 3 новых региональных рынка, вырастил дистрибуторскую сеть с 80 до 250 партнёров.",
      salaryMin: 12000000,
      salaryMax: 20000000,
      locationPref: "Москва",
      functionalFocus: "Продажи / Коммерция",
      firstName: "Сергей",
      lastName: "Козлов",
      currentCompany: "FMCGLeader",
      status: "VERIFIED",
      engagementFormats: "full-time",
    },
  });

  // Кандидат 10 — GM / Country Manager (Ритейл, Advisory Board)
  const cand10User = await prisma.user.upsert({
    where: { email: "gm@example.ru" },
    update: {},
    create: { email: "gm@example.ru", password, role: "CANDIDATE" },
  });
  await prisma.candidateProfile.upsert({
    where: { userId: cand10User.id },
    update: {},
    create: {
      userId: cand10User.id,
      currentTitle: "General Manager",
      industry: "Ритейл",
      yearsExperience: 20,
      achievements: "Руководил 5 розничными сетями суммарно 1200 магазинов, P&L $800M, запустил омниканальную трансформацию.",
      salaryMin: 18000000,
      salaryMax: 30000000,
      locationPref: "Москва",
      functionalFocus: "Операции / P&L",
      firstName: "Виктор",
      lastName: "Морозов",
      currentCompany: "RetailHolding",
      status: "VERIFIED",
      engagementFormats: "full-time,board,mentor",
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

  // Компания 3 — Крупный ритейл
  const comp3User = await prisma.user.upsert({
    where: { email: "hr@retailcorp.ru" },
    update: {},
    create: { email: "hr@retailcorp.ru", password, role: "COMPANY" },
  });
  const comp3 = await prisma.companyProfile.upsert({
    where: { userId: comp3User.id },
    update: {},
    create: {
      userId: comp3User.id,
      companyName: "RetailCorp",
      industry: "Ритейл",
      size: "LARGE",
      description: "Федеральная розничная сеть 800+ магазинов, выручка 120 млрд руб/год. Активная цифровая трансформация.",
      isVerified: true,
    },
  });

  // Компания 4 — FinTech стартап
  const comp4User = await prisma.user.upsert({
    where: { email: "hr@fintechup.ru" },
    update: {},
    create: { email: "hr@fintechup.ru", password, role: "COMPANY" },
  });
  const comp4 = await prisma.companyProfile.upsert({
    where: { userId: comp4User.id },
    update: {},
    create: {
      userId: comp4User.id,
      companyName: "FinTechUp",
      industry: "Финансы",
      size: "SMALL",
      description: "Финтех-стартап в сфере embedded finance, Series A $15M. Команда 60 человек, планируем рост до 150.",
      isVerified: true,
    },
  });

  // Компания 5 — Industrial холдинг
  const comp5User = await prisma.user.upsert({
    where: { email: "hr@indholding.ru" },
    update: {},
    create: { email: "hr@indholding.ru", password, role: "COMPANY" },
  });
  const comp5 = await prisma.companyProfile.upsert({
    where: { userId: comp5User.id },
    update: {},
    create: {
      userId: comp5User.id,
      companyName: "Industrial Holdings",
      industry: "Промышленность",
      size: "LARGE",
      description: "Промышленный холдинг: 3 завода, 4000 сотрудников, выручка 18 млрд руб. Ищем ментора для CEO по теме digital transformation.",
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

  // Дополнительные мандаты
  const mandate3 = await prisma.mandate.create({
    data: {
      companyId: comp3.id,
      title: "COO",
      industry: "Ритейл",
      salaryMin: 16000000,
      salaryMax: 28000000,
      description: "Ищем операционного директора для управления сетью 800+ магазинов в период цифровой трансформации. Приоритет — построение омниканала и оптимизация supply chain.",
      requirements: "15+ лет в ритейле, опыт управления крупной розничной сетью, P&L от $200M, опыт трансформационных проектов.",
      mandateType: "full-time",
      status: "ACTIVE",
    },
  });

  const mandate4 = await prisma.mandate.create({
    data: {
      companyId: comp4.id,
      title: "CFO",
      industry: "Финансы",
      salaryMin: 8000000,
      salaryMax: 14000000,
      description: "Финтех-стартап ищет финансового директора для подготовки к Series B. Задачи: financial modeling, investor relations, построение FP&A функции.",
      requirements: "Опыт в финтех или стартапах, знание МСФО, опыт с инвесторами, стартап-менталитет.",
      mandateType: "full-time",
      status: "ACTIVE",
      isAnonymous: true,
    },
  });

  const mandate5 = await prisma.mandate.create({
    data: {
      companyId: comp5.id,
      title: "Ментор для CEO по digital transformation",
      industry: "Промышленность",
      salaryMin: 3000000,
      salaryMax: 6000000,
      description: "Промышленный холдинг ищет ментора для CEO по теме цифровой трансформации. Формат: 2–4 сессии в месяц, горизонт 12 месяцев. CEO — сильный операционист без digital-бэкграунда.",
      requirements: "Опыт успешной digital transformation в крупной компании, умение работать с собственниками, знание промышленного сектора будет плюсом.",
      mandateType: "mentor",
      status: "ACTIVE",
    },
  });

  const mandate6 = await prisma.mandate.create({
    data: {
      companyId: comp1.id,
      title: "Advisory Board — эксперт по ритейлу",
      industry: "Ритейл",
      salaryMin: 2000000,
      salaryMax: 4000000,
      description: "PE-фонд формирует Advisory Board для портфельной компании в ритейле. Ищем независимого директора с опытом в федеральной рознице.",
      requirements: "10+ лет в ритейле на уровне C-suite, опыт работы в Advisory Board или Board of Directors, независимость суждений.",
      mandateType: "board",
      status: "ACTIVE",
    },
  });

  // Получаем профили кандидатов для демо-mutual мэтчей
  const cand2Profile = await prisma.candidateProfile.findUnique({ where: { userId: cand2User.id } });
  const cand6Profile = await prisma.candidateProfile.findUnique({ where: { userId: cand6User.id } });
  const cand10Profile = await prisma.candidateProfile.findUnique({ where: { userId: cand10User.id } });

  // Сначала удаляем все существующие мэтчи, чтобы пересчитать
  await prisma.match.deleteMany({});

  // Создаём демо-мэтчи с взаимным интересом (особое состояние — контакты открыты)
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
  if (cand6Profile) {
    await prisma.match.create({
      data: {
        mandateId: mandate5.id,
        candidateProfileId: cand6Profile.id,
        score: 81,
        status: "MUTUAL",
        candidateInterest: true,
        companyInterest: true,
        revealedAt: new Date(),
      },
    });
  }

  // Запускаем движок мэтчинга для всех активных мандатов
  // (создаёт PENDING-мэтчи с реальными score + scoreBreakdown через upsert,
  //  не затрагивая уже созданные MUTUAL)
  console.log("Запуск AI-мэтчинга для всех активных мандатов...");
  const activeMandates = [mandate1, mandate2, mandate3, mandate4, mandate5, mandate6];
  for (const mandate of activeMandates) {
    await computeMatches(mandate.id);
  }

  // Добавляем candidateInterest для демо (после compute — не перезапишет)
  const cand10MatchM3 = await prisma.match.findFirst({
    where: { mandateId: mandate3.id, candidate: { userId: cand10User.id } },
  });
  if (cand10MatchM3) {
    await prisma.match.update({
      where: { id: cand10MatchM3.id },
      data: { candidateInterest: true },
    });
  }
  const cand10MatchM6 = await prisma.match.findFirst({
    where: { mandateId: mandate6.id, candidate: { userId: cand10User.id } },
  });
  if (cand10MatchM6) {
    await prisma.match.update({
      where: { id: cand10MatchM6.id },
      data: { candidateInterest: true },
    });
  }

  // Assessments для демо-кандидатов
  const cfo1Profile = await prisma.candidateProfile.findUnique({ where: { userId: cand1User.id } });
  const cto1Profile = await prisma.candidateProfile.findUnique({ where: { userId: cand2User.id } });

  if (cfo1Profile) {
    await prisma.assessment.upsert({
      where: { candidateProfileId_type: { candidateProfileId: cfo1Profile.id, type: "HOGAN" } },
      update: {},
      create: {
        candidateProfileId: cfo1Profile.id,
        type: "HOGAN",
        status: "COMPLETED",
        completedAt: new Date("2025-11-15"),
        summary: "Высокий потенциал лидерства. Ориентирован на результат, устойчив в стрессовых ситуациях. Хорошо работает в условиях неопределённости.",
        strengths: "Стратегическое мышление, высокая устойчивость, ориентация на достижения, способность вдохновлять команду",
        risks: "Возможная нетерпимость к медленным исполнителям, склонность к микроменеджменту в кризис",
        leadershipStyle: "Трансформационный. Ставит амбициозные цели, требователен к себе и команде, открыт к инновациям.",
      },
    });
    await prisma.assessment.upsert({
      where: { candidateProfileId_type: { candidateProfileId: cfo1Profile.id, type: "DISC" } },
      update: {},
      create: {
        candidateProfileId: cfo1Profile.id,
        type: "DISC",
        status: "COMPLETED",
        completedAt: new Date("2025-11-20"),
        summary: "Доминирующий профиль DC. Решителен, результатоориентирован, компетентен в решении сложных задач.",
        strengths: "Быстрое принятие решений, прямая коммуникация, высокая продуктивность под давлением",
        risks: "Может восприниматься как резкий, недооценивает эмоциональный фактор в коммуникации",
        leadershipStyle: "Директивный с элементами анализа. D/C профиль (79/68).",
      },
    });
  }

  if (cto1Profile) {
    await prisma.assessment.upsert({
      where: { candidateProfileId_type: { candidateProfileId: cto1Profile.id, type: "MBTI" } },
      update: {},
      create: {
        candidateProfileId: cto1Profile.id,
        type: "MBTI",
        status: "COMPLETED",
        completedAt: new Date("2025-12-01"),
        summary: "INTJ — «Архитектор». Стратегический мыслитель с высокими стандартами. Прекрасно подходит для роли технологического лидера.",
        strengths: "Системное мышление, независимость суждений, долгосрочное планирование, высокие стандарты качества",
        risks: "Может быть непреклонным, сложно идёт на компромисс, высокие ожидания от команды",
        leadershipStyle: "Визионерский. Строит системы и процессы, делегирует тактику, сохраняет контроль над стратегией.",
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
  console.log("  ceo@example.ru      — кандидат CEO (верифицирован, Технологии, ментор+board)");
  console.log("  hrd@example.ru      — кандидат CHRO (верифицирован, Технологии)");
  console.log("  cpo@example.ru      — кандидат CPO (верифицирован, Технологии)");
  console.log("  crd@example.ru      — кандидат Commercial Director (верифицирован, FMCG)");
  console.log("  gm@example.ru       — кандидат GM (верифицирован, Ритейл, ментор+board)");
  console.log("  hr@pegroup.ru       — компания PE Capital Group");
  console.log("  hr@techscale.ru     — компания TechScale Ventures");
  console.log("  hr@retailcorp.ru    — компания RetailCorp");
  console.log("  hr@fintechup.ru     — компания FinTechUp");
  console.log("  hr@indholding.ru    — компания Industrial Holdings");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
