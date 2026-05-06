/**
 * GradeUp Platform — Seed Script (Phase 1)
 *
 * Сидирует:
 * 1. 15 Competencies (Block E.1)
 * 2. 30 Industries (российский контекст)
 * 3. 6 RoleTemplates (CEO Growth/Turnaround, CFO PE-backed, CTO Product, COO Scaling, CHRO Transformation)
 * 4. Минимальный набор тестовых аккаунтов (admin + 2 кандидата + 2 компании + 2 мандата)
 *
 * НЕ вызывает старый computeMatches — это будет в Phase 4 (новый scoring engine).
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ════════════════════════════════════════════════════════════════════════
//  1. COMPETENCIES (15 штук, 4 домена)
// ════════════════════════════════════════════════════════════════════════

const COMPETENCIES = [
  // Domain 1 — Strategic & Cognitive
  {
    id: "E1.01",
    code: "strategic_vision",
    domain: "strategic",
    nameRu: "Стратегическое видение",
    nameEn: "Strategic Vision",
    description:
      "Способность формировать долгосрочное видение развития бизнеса, видеть возможности за пределами текущей ситуации и транслировать это видение в понятную стратегию.",
    behavioralAnchors: {
      low: "Оперирует в рамках текущей бизнес-модели, реактивен",
      mid: "Видит тренды, формулирует стратегию на 2–3 года",
      high: "Формирует vision на 5+ лет, видит неочевидные возможности, способен пивотнуть бизнес-модель",
    },
    lominger: ["#58 Strategic Agility", "#65 Managing Vision and Purpose"],
    ddiMapping: "Strategic Direction, Business Savvy",
    order: 1,
  },
  {
    id: "E1.02",
    code: "systems_thinking",
    domain: "strategic",
    nameRu: "Системное мышление",
    nameEn: "Systems Thinking",
    description:
      "Способность видеть взаимосвязи между частями бизнеса, понимать последствия второго и третьего порядка, принимать решения с учётом всей системы.",
    behavioralAnchors: {
      low: "Решает проблемы изолированно, не видит побочных эффектов",
      mid: "Учитывает основные взаимосвязи между функциями",
      high: "Моделирует каскадные эффекты решений, оптимизирует на уровне всей системы",
    },
    lominger: ["#32 Learning on the Fly", "#46 Perspective"],
    order: 2,
  },
  {
    id: "E1.03",
    code: "decision_under_ambiguity",
    domain: "strategic",
    nameRu: "Принятие решений в условиях неопределённости",
    nameEn: "Decision-Making Under Ambiguity",
    description:
      "Способность принимать качественные решения при неполной информации, балансировать скорость и обоснованность, нести ответственность за результат.",
    behavioralAnchors: {
      low: "Парализуется при недостатке данных или перекладывает решение",
      mid: "Принимает решения при 70–80% информации, иногда медлит",
      high: "Комфортен с 50–60% информации, быстро корректирует курс, берёт на себя ответственность",
    },
    lominger: ["#16 Timely Decision Making", "#2 Dealing with Ambiguity"],
    ddiMapping: "Judgment, Driving Execution",
    order: 3,
  },
  {
    id: "E1.04",
    code: "financial_acumen",
    domain: "strategic",
    nameRu: "Финансовая грамотность и бизнес-ориентация",
    nameEn: "Financial & Business Acumen",
    description:
      "Понимание финансовых механизмов бизнеса, способность читать и интерпретировать финансовую отчётность, принимать решения с учётом их влияния на P&L, cash flow, unit economics.",
    behavioralAnchors: {
      low: "Слабо ориентируется в финансовых показателях, принимает решения без учёта P&L",
      mid: "Понимает основные финансовые метрики, использует их в принятии решений",
      high: "Свободно управляет P&L, строит финансовые модели, понимает связь между операционными решениями и financial outcomes",
    },
    lominger: ["#5 Business Acumen"],
    ddiMapping: "Business Savvy, Financial Acumen",
    order: 4,
  },

  // Domain 2 — People & Leadership
  {
    id: "E1.05",
    code: "team_building",
    domain: "people",
    nameRu: "Построение и развитие команды",
    nameEn: "Team Building & Talent Development",
    description:
      "Способность привлекать, развивать и удерживать сильных людей. Умение формировать команду, комплементарную по навыкам, и создавать среду для роста.",
    behavioralAnchors: {
      low: "Слабо инвестирует в людей, команда текучая или однородная",
      mid: "Нанимает хорошо, но мало инвестирует в развитие",
      high: "Строит сильные команды, растит преемников, люди из его команд идут на повышение",
    },
    lominger: ["#25 Hiring and Staffing", "#18 Delegation", "#56 Sizing Up People"],
    ddiMapping: "Building Talent, Coaching and Developing Others",
    order: 5,
  },
  {
    id: "E1.06",
    code: "performance_management",
    domain: "people",
    nameRu: "Управление эффективностью",
    nameEn: "Performance Management",
    description:
      "Способность ставить чёткие цели, давать регулярную обратную связь, требовать высоких стандартов и принимать жёсткие кадровые решения, когда это необходимо.",
    behavioralAnchors: {
      low: "Избегает сложных разговоров, терпит underperformance",
      mid: "Ставит цели, даёт обратную связь, но медлит с жёсткими решениями",
      high: "Создаёт culture of accountability, быстро адресует проблемы, справедлив и последователен",
    },
    lominger: [
      "#35 Managing and Measuring Work",
      "#13 Confronting Direct Reports",
      "#57 Standing Alone",
    ],
    order: 6,
  },
  {
    id: "E1.07",
    code: "stakeholder_management",
    domain: "people",
    nameRu: "Влияние и stakeholder management",
    nameEn: "Influence & Stakeholder Management",
    description:
      "Способность убеждать, выстраивать коалиции, управлять отношениями с ключевыми стейкхолдерами (совет директоров, акционеры, регуляторы, партнёры, клиенты).",
    behavioralAnchors: {
      low: "Эффективен в прямом управлении, но теряется в матричных/политических средах",
      mid: "Умеет находить общий язык с разными стейкхолдерами",
      high: "Выстраивает стратегические коалиции, управляет board relationships, эффективен в сложных политических контекстах",
    },
    lominger: [
      "#31 Interpersonal Savvy",
      "#39 Organizing",
      "#37 Negotiating",
      "#42 Peer Relationships",
    ],
    ddiMapping: "Influencing, Executive Disposition",
    order: 7,
  },
  {
    id: "E1.08",
    code: "communication_inspiration",
    domain: "people",
    nameRu: "Коммуникация и вдохновение",
    nameEn: "Communication & Inspiration",
    description:
      "Способность ясно формулировать идеи, доносить сложные концепции простым языком, мотивировать и вдохновлять организацию на изменения.",
    behavioralAnchors: {
      low: "Коммуникация неструктурированная, не умеет «зажечь» аудиторию",
      mid: "Ясно излагает мысли, но не всегда вдохновляет",
      high: "Мощный communicator, способен мобилизовать организацию, одинаково эффективен 1:1 и перед большой аудиторией",
    },
    lominger: ["#65 Managing Vision and Purpose", "#49 Presentation Skills", "#27 Informing"],
    order: 8,
  },

  // Domain 3 — Execution & Delivery
  {
    id: "E1.09",
    code: "change_management",
    domain: "execution",
    nameRu: "Управление изменениями",
    nameEn: "Change Management",
    description:
      "Способность инициировать, проектировать и проводить организационные изменения — от стратегических трансформаций до операционных улучшений.",
    behavioralAnchors: {
      low: "Сопротивляется изменениям или проводит их хаотично",
      mid: "Способен проводить изменения при поддержке, но не всегда инициирует",
      high: "Архитектор крупных трансформаций, умеет преодолевать сопротивление, доводит до результата",
    },
    lominger: ["#52 Process Management", "#40 Dealing with Paradoxes", "#4 Action Oriented"],
    ddiMapping: "Leading Change, Driving Execution",
    order: 9,
  },
  {
    id: "E1.10",
    code: "operational_excellence",
    domain: "execution",
    nameRu: "Операционная эффективность",
    nameEn: "Operational Excellence",
    description:
      "Способность выстраивать процессы, оптимизировать операции, обеспечивать стабильное качество исполнения в масштабе.",
    behavioralAnchors: {
      low: "Слабый в процессах, полагается на ручное управление",
      mid: "Выстраивает базовые процессы, но не системно",
      high: "Создаёт масштабируемые операционные системы, оптимизирует на уровне всей организации",
    },
    lominger: ["#52 Process Management", "#35 Managing and Measuring Work", "#50 Priority Setting"],
    order: 10,
  },
  {
    id: "E1.11",
    code: "customer_focus",
    domain: "execution",
    nameRu: "Ориентация на клиента",
    nameEn: "Customer & Market Focus",
    description:
      "Глубокое понимание клиентов, рынка и конкурентной среды. Способность выстраивать стратегию от потребностей клиента.",
    behavioralAnchors: {
      low: "Решения принимаются из внутренней логики, слабое понимание клиента",
      mid: "Знает своих клиентов, но не всегда ставит их в центр решений",
      high: "Customer-obsessed, строит продукт и стратегию от потребности клиента, предвидит изменения рынка",
    },
    lominger: ["#15 Customer Focus"],
    ddiMapping: "Customer Focus, Market Savvy",
    order: 11,
  },
  {
    id: "E1.12",
    code: "innovation_digital",
    domain: "execution",
    nameRu: "Инновации и цифровая трансформация",
    nameEn: "Innovation & Digital",
    description:
      "Способность внедрять инновации, понимать и использовать технологии (включая AI, data, digital) для трансформации бизнеса.",
    behavioralAnchors: {
      low: "Избегает технологических изменений, не видит возможностей digital",
      mid: "Понимает тренды, внедряет отдельные инновации",
      high: "Digital-native мышление, использует технологии как стратегическое преимущество, трансформирует бизнес-модель",
    },
    lominger: ["#14 Creativity", "#28 Innovation Management", "#32 Learning on the Fly"],
    order: 12,
  },

  // Domain 4 — Personal Effectiveness & Maturity
  {
    id: "E1.13",
    code: "self_awareness",
    domain: "personal",
    nameRu: "Самоосознанность и обучаемость",
    nameEn: "Self-Awareness & Learning Agility",
    description:
      "Точное понимание своих сильных сторон и ограничений. Способность быстро учиться в новых ситуациях, рефлексировать и адаптировать поведение.",
    behavioralAnchors: {
      low: "Blind spots, не принимает обратную связь, повторяет ошибки",
      mid: "Принимает обратную связь, но медленно адаптирует поведение",
      high: "Высокая рефлексия, быстро учится в unfamiliar ситуациях, активно запрашивает feedback",
    },
    lominger: ["#55 Self-Knowledge", "#32 Learning on the Fly", "#54 Self-Development"],
    ddiMapping: "Egon Zehnder → Curiosity + Insight",
    order: 13,
  },
  {
    id: "E1.14",
    code: "resilience",
    domain: "personal",
    nameRu: "Устойчивость и управление энергией",
    nameEn: "Resilience & Energy Management",
    description:
      "Способность выдерживать длительное давление, сохранять продуктивность в стрессовых периодах, восстанавливаться после неудач.",
    behavioralAnchors: {
      low: "Быстро выгорает, теряет эффективность при затяжном стрессе",
      mid: "Справляется с давлением, но нуждается в периодах восстановления",
      high: "Стабильно продуктивен под давлением, recovery time минимален, управляет своей энергией осознанно",
    },
    lominger: ["#11 Composure", "#2 Dealing with Ambiguity"],
    order: 14,
  },
  {
    id: "E1.15",
    code: "ethics_integrity",
    domain: "personal",
    nameRu: "Этика и integrity",
    nameEn: "Ethics & Integrity",
    description:
      "Последовательность слов и действий, прозрачность, честность в сложных ситуациях. Готовность принимать непопулярные решения ради правильного.",
    behavioralAnchors: {
      low: "Double standards, говорит одно — делает другое",
      mid: "Честен в большинстве ситуаций, но избегает конфликта ценностей",
      high: "Неизменен в принципах, прозрачен, готов потерять должность ради integrity",
    },
    lominger: ["#22 Ethics and Values", "#29 Integrity and Trust", "#57 Standing Alone"],
    order: 15,
  },
];

// ════════════════════════════════════════════════════════════════════════
//  2. INDUSTRIES (30 штук, российский контекст)
// ════════════════════════════════════════════════════════════════════════

const INDUSTRIES = [
  { id: "tech", nameRu: "IT / Software / SaaS", nameEn: "Technology / Software / SaaS", category: "tech", order: 1 },
  { id: "fintech", nameRu: "Финтех", nameEn: "Fintech", category: "tech", order: 2 },
  { id: "ecommerce", nameRu: "E-commerce / Маркетплейсы", nameEn: "E-commerce / Marketplaces", category: "tech", order: 3 },
  { id: "ai_data", nameRu: "AI / Data / Аналитика", nameEn: "AI / Data / Analytics", category: "tech", order: 4 },
  { id: "cybersecurity", nameRu: "Кибербезопасность", nameEn: "Cybersecurity", category: "tech", order: 5 },
  { id: "telecom", nameRu: "Телеком", nameEn: "Telecom", category: "tech", order: 6 },
  { id: "media", nameRu: "Медиа и развлечения", nameEn: "Media & Entertainment", category: "tech", order: 7 },
  { id: "edtech", nameRu: "EdTech / Образование", nameEn: "EdTech / Education", category: "tech", order: 8 },
  { id: "banking", nameRu: "Банки и финансовые услуги", nameEn: "Banking & Finance", category: "finance", order: 9 },
  { id: "insurance", nameRu: "Страхование", nameEn: "Insurance", category: "finance", order: 10 },
  { id: "investment", nameRu: "Инвестиции / PE / VC", nameEn: "Investment / PE / VC", category: "finance", order: 11 },
  { id: "retail_food", nameRu: "Ритейл (продуктовый)", nameEn: "Retail (Grocery)", category: "retail", order: 12 },
  { id: "retail_nonfood", nameRu: "Ритейл (непродуктовый)", nameEn: "Retail (Non-food)", category: "retail", order: 13 },
  { id: "fmcg", nameRu: "FMCG / Производство потребтоваров", nameEn: "FMCG", category: "retail", order: 14 },
  { id: "horeca", nameRu: "HoReCa / Туризм", nameEn: "Hospitality / Travel", category: "services", order: 15 },
  { id: "pharma", nameRu: "Фарма", nameEn: "Pharma", category: "healthcare", order: 16 },
  { id: "healthcare", nameRu: "Здравоохранение / Клиники", nameEn: "Healthcare / Clinics", category: "healthcare", order: 17 },
  { id: "medtech", nameRu: "MedTech", nameEn: "MedTech", category: "healthcare", order: 18 },
  { id: "manufacturing", nameRu: "Промышленное производство", nameEn: "Manufacturing", category: "industrial", order: 19 },
  { id: "metallurgy", nameRu: "Металлургия / Горнодобыча", nameEn: "Metallurgy / Mining", category: "industrial", order: 20 },
  { id: "oilgas", nameRu: "Нефть и газ", nameEn: "Oil & Gas", category: "industrial", order: 21 },
  { id: "energy", nameRu: "Энергетика / Renewables", nameEn: "Energy / Renewables", category: "industrial", order: 22 },
  { id: "automotive", nameRu: "Автомобильная отрасль", nameEn: "Automotive", category: "industrial", order: 23 },
  { id: "aerospace", nameRu: "Авиа / Оборона", nameEn: "Aerospace / Defense", category: "industrial", order: 24 },
  { id: "agriculture", nameRu: "Агросектор / AgriTech", nameEn: "Agriculture / AgriTech", category: "industrial", order: 25 },
  { id: "realestate", nameRu: "Недвижимость и стройка", nameEn: "Real Estate / Construction", category: "industrial", order: 26 },
  { id: "logistics", nameRu: "Логистика и транспорт", nameEn: "Logistics & Transportation", category: "services", order: 27 },
  { id: "consulting", nameRu: "Консалтинг / Профессиональные услуги", nameEn: "Consulting / Professional Services", category: "services", order: 28 },
  { id: "legal", nameRu: "Юридические услуги", nameEn: "Legal Services", category: "services", order: 29 },
  { id: "government", nameRu: "Госсектор", nameEn: "Government / Public Sector", category: "services", order: 30 },
];

// ════════════════════════════════════════════════════════════════════════
//  3. ROLE TEMPLATES (6 штук — основные C-level роли × контексты)
// ════════════════════════════════════════════════════════════════════════

const ROLE_TEMPLATES = [
  {
    id: "ceo_growth",
    role: "CEO",
    context: "growth",
    nameRu: "CEO — Growth / Scale-up",
    description:
      "Компания прошла product-market fit, нужно масштабирование. Revenue $5–50M → $50–500M. Часто PE-backed или venture-backed.",
    competencyMustHave: ["E1.01", "E1.07", "E1.05", "E1.08", "E1.04"],
    competencyImportant: ["E1.03", "E1.09", "E1.12", "E1.11", "E1.13"],
    competencyNiceToHave: ["E1.06", "E1.02", "E1.10", "E1.14", "E1.15"],
    personalityPrefs: {
      A1: "high", A2: "high", A3: "high", A4: "moderate", A5: "not_critical",
      A6: "high", A7: "moderate", A8: "moderate", A9: "high", A10: "high",
    },
    riskTolerance: { B1: "zero", B2: "zero", B3: "low", B4: "low", B5: "low", B6: "zero" },
    motivationTop3: ["ACH", "POW", "AUT"],
    motivationMiddle3: ["LRN", "REC", "MIS"],
    motivationBottom2: ["AFF", "STA"],
    cultureProfile: { asIs: { adhocracy: 35, market: 30, clan: 25, hierarchy: 10 }, toBe: { market: 35, adhocracy: 30, hierarchy: 20, clan: 15 } },
    styleDefaults: { pace: 2, structure: 3, risk: 2, focus: 3 },
  },
  {
    id: "ceo_turnaround",
    role: "CEO",
    context: "turnaround",
    nameRu: "CEO — Turnaround / Crisis",
    description:
      "Компания в кризисе — убыточность, потеря рыночной позиции, конфликт акционеров. Нужен жёсткий лидер, который стабилизирует и развернёт.",
    competencyMustHave: ["E1.01", "E1.03", "E1.06", "E1.09", "E1.07"],
    competencyImportant: ["E1.04", "E1.10", "E1.05", "E1.08", "E1.13"],
    competencyNiceToHave: ["E1.02", "E1.11", "E1.12", "E1.14", "E1.15"],
    personalityPrefs: {
      A1: "high", A2: "high", A3: "high", A4: "not_critical", A5: "moderate",
      A6: "high", A7: "moderate", A8: "high", A9: "high", A10: "high",
    },
    riskTolerance: { B1: "zero", B2: "zero", B3: "standard", B4: "standard", B5: "low", B6: "zero" },
    motivationTop3: ["ACH", "POW", "REC"],
    motivationMiddle3: ["LRN", "MIS", "AFF"],
    motivationBottom2: ["AUT", "STA"],
  },
  {
    id: "cfo_pe_backed",
    role: "CFO",
    context: "pe_backed",
    nameRu: "CFO — PE-backed Growth",
    description:
      "PE-фонд приобрёл компанию, нужен CFO для построения финансовой функции, подготовки к exit (M&A или IPO) через 3–5 лет.",
    competencyMustHave: ["E1.04", "E1.01", "E1.07", "E1.09", "E1.10"],
    competencyImportant: ["E1.02", "E1.03", "E1.05", "E1.06", "E1.15"],
    competencyNiceToHave: ["E1.08", "E1.11", "E1.12", "E1.13", "E1.14"],
    personalityPrefs: {
      A1: "high", A2: "high", A3: "moderate", A4: "not_critical", A5: "high",
      A6: "high", A7: "moderate", A8: "high", A9: "moderate", A10: "moderate",
    },
    riskTolerance: { B1: "zero", B2: "low", B3: "low", B4: "zero", B5: "standard", B6: "zero" },
    motivationTop3: ["ACH", "AUT", "POW"],
    motivationMiddle3: ["LRN", "REC", "STA"],
    motivationBottom2: ["MIS", "AFF"],
    cultureProfile: { asIs: { market: 35, hierarchy: 25, adhocracy: 25, clan: 15 }, toBe: { market: 35, hierarchy: 30, adhocracy: 20, clan: 15 } },
    styleDefaults: { pace: 3.5, structure: 5, risk: 4, focus: 4.5 },
  },
  {
    id: "cto_product_tech",
    role: "CTO",
    context: "product_tech",
    nameRu: "CTO — Product Tech Company",
    description:
      "Технологическая компания, где продукт = технология. CTO отвечает за product development, engineering team, tech strategy.",
    competencyMustHave: ["E1.01", "E1.12", "E1.05", "E1.02", "E1.03"],
    competencyImportant: ["E1.08", "E1.11", "E1.06", "E1.13", "E1.09"],
    competencyNiceToHave: ["E1.04", "E1.07", "E1.10", "E1.14", "E1.15"],
    personalityPrefs: {
      A1: "moderate", A2: "high", A3: "not_critical", A4: "moderate", A5: "moderate",
      A6: "high", A7: "high", A8: "not_critical", A9: "moderate", A10: "high",
    },
    riskTolerance: { B1: "low", B2: "standard", B3: "low", B4: "low", B5: "standard", B6: "low" },
    motivationTop3: ["LRN", "AUT", "ACH"],
    motivationMiddle3: ["POW", "MIS", "REC"],
    motivationBottom2: ["AFF", "STA"],
    cultureProfile: { typical: { adhocracy: 40, market: 25, clan: 20, hierarchy: 15 } },
    styleDefaults: { pace: 2, structure: 2.5, risk: 2, focus: 4 },
  },
  {
    id: "coo_scaling",
    role: "COO",
    context: "scaling",
    nameRu: "COO — Scaling Operations",
    description:
      "Компания растёт, CEO фокусируется на стратегии и external. COO нужен для выстраивания internal machine — процессы, эффективность, execution.",
    competencyMustHave: ["E1.10", "E1.06", "E1.05", "E1.09", "E1.02"],
    competencyImportant: ["E1.03", "E1.04", "E1.01", "E1.08", "E1.14"],
    competencyNiceToHave: ["E1.12", "E1.07", "E1.11", "E1.13", "E1.15"],
    personalityPrefs: {
      A1: "high", A2: "high", A3: "moderate", A4: "moderate", A5: "high",
      A6: "moderate", A7: "moderate", A8: "high", A9: "moderate", A10: "moderate",
    },
    riskTolerance: { B1: "zero", B2: "zero", B3: "low", B4: "zero", B5: "low", B6: "low" },
    motivationTop3: ["ACH", "POW", "STA"],
    motivationMiddle3: ["AUT", "REC", "AFF"],
    motivationBottom2: ["LRN", "MIS"],
    cultureProfile: { typical: { market: 30, hierarchy: 30, clan: 25, adhocracy: 15 } },
    styleDefaults: { pace: 3, structure: 5.5, risk: 5, focus: 6 },
  },
  {
    id: "chro_transformation",
    role: "CHRO",
    context: "transformation",
    nameRu: "CHRO — Transformation / Scale-up",
    description:
      "Компания растёт или трансформируется. HR-функция нужна не как support, а как стратегический драйвер. People-agenda на уровне board.",
    competencyMustHave: ["E1.05", "E1.09", "E1.07", "E1.08", "E1.01"],
    competencyImportant: ["E1.06", "E1.13", "E1.04", "E1.02", "E1.15"],
    competencyNiceToHave: ["E1.11", "E1.03", "E1.10", "E1.12", "E1.14"],
    personalityPrefs: {
      A1: "high", A2: "moderate", A3: "high", A4: "high", A5: "moderate",
      A6: "high", A7: "moderate", A8: "moderate", A9: "high", A10: "moderate",
    },
    riskTolerance: { B1: "zero", B2: "zero", B3: "zero", B4: "zero", B5: "standard", B6: "low" },
    motivationTop3: ["AFF", "MIS", "POW"],
    motivationMiddle3: ["ACH", "LRN", "REC"],
    motivationBottom2: ["AUT", "STA"],
    cultureProfile: { typical: { clan: 35, adhocracy: 25, market: 20, hierarchy: 20 } },
    styleDefaults: { pace: 3.5, structure: 4, risk: 4, focus: 5.5 },
  },
];

// ════════════════════════════════════════════════════════════════════════
//  MAIN
// ════════════════════════════════════════════════════════════════════════

async function main() {
  console.log("🌱 GradeUp seed (Phase 1)...\n");

  // ─── 1. Reference: Competencies ─────────────────────────────────
  console.log("→ Competencies (15)...");
  for (const c of COMPETENCIES) {
    await prisma.competency.upsert({
      where: { id: c.id },
      update: c,
      create: c,
    });
  }
  console.log(`  ✓ ${COMPETENCIES.length} competencies seeded`);

  // ─── 2. Reference: Industries ───────────────────────────────────
  console.log("→ Industries (30)...");
  for (const i of INDUSTRIES) {
    await prisma.industry.upsert({
      where: { id: i.id },
      update: i,
      create: i,
    });
  }
  console.log(`  ✓ ${INDUSTRIES.length} industries seeded`);

  // ─── 3. Reference: RoleTemplates ────────────────────────────────
  console.log("→ Role Templates (6)...");
  for (const t of ROLE_TEMPLATES) {
    await prisma.roleTemplate.upsert({
      where: { id: t.id },
      update: t,
      create: t,
    });
  }
  console.log(`  ✓ ${ROLE_TEMPLATES.length} role templates seeded`);

  // ─── 4. Test users ──────────────────────────────────────────────
  console.log("\n→ Test users...");
  const password = await bcrypt.hash("password123", 10);

  // Admin
  await prisma.user.upsert({
    where: { email: "admin@gradeup.ru" },
    update: {},
    create: { email: "admin@gradeup.ru", password, role: "ADMIN" },
  });

  // Кандидат 1 — CFO
  const cand1 = await prisma.user.upsert({
    where: { email: "cfo@example.ru" },
    update: {},
    create: { email: "cfo@example.ru", password, role: "CANDIDATE" },
  });
  await prisma.candidateProfile.upsert({
    where: { userId: cand1.id },
    update: {},
    create: {
      userId: cand1.id,
      firstName: "Иван",
      lastName: "Петров",
      currentCompany: "TechCorp",
      // LEGACY (для существующих UI):
      currentTitle: "CFO",
      industry: "Финтех",
      yearsExperience: 14,
      achievements: "Подготовка компании к IPO; управление бюджетом 5 млрд ₽; команда 350+",
      salaryMin: 15_000_000,
      salaryMax: 25_000_000,
      locationPref: "Москва",
      functionalFocus: "Финансы",
      // NEW:
      currentLevel: "C-level",
      currentFunction: ["finance"],
      companyType: "pe_backed",
      companyRevenue: "1B_5B",
      pnlRange: "2B_10B",
      tenureCurrent: "2_4",
      yearsManagement: 14,
      maxPnl: "2B_10B",
      maxReports: 350,
      industries: ["fintech", "tech"],
      companyTypes: ["pe_backed", "private"],
      experienceContexts: ["scale_up", "ma_buy", "digital_transformation"],
      internationalExp: ["abroad_work"],
      education: [
        { type: "higher", institution: "МГУ", year: 2008, specialty: "Экономика" },
        { type: "mba", institution: "Сколково", year: 2015 },
      ],
      status: "VERIFIED",
    },
  });

  // Кандидат 2 — CTO
  const cand2 = await prisma.user.upsert({
    where: { email: "cto@example.ru" },
    update: {},
    create: { email: "cto@example.ru", password, role: "CANDIDATE" },
  });
  await prisma.candidateProfile.upsert({
    where: { userId: cand2.id },
    update: {},
    create: {
      userId: cand2.id,
      firstName: "Алексей",
      lastName: "Соколов",
      currentCompany: "ProductLabs",
      // LEGACY:
      currentTitle: "CTO",
      industry: "IT / Software",
      yearsExperience: 12,
      achievements:
        "Перестройка архитектуры с монолита на микросервисы; команда 120+ инженеров; запуск AI-направления",
      salaryMin: 12_000_000,
      salaryMax: 20_000_000,
      locationPref: "Москва",
      functionalFocus: "Технологии",
      // NEW:
      currentLevel: "C-level",
      currentFunction: ["technology"],
      companyType: "private",
      companyRevenue: "500M_1B",
      pnlRange: "500M_2B",
      tenureCurrent: "4_7",
      yearsManagement: 12,
      maxReports: 120,
      industries: ["tech", "ai_data"],
      companyTypes: ["private", "startup"],
      experienceContexts: ["scale_up", "digital_transformation", "geo_expansion"],
      education: [{ type: "higher", institution: "МФТИ", year: 2010, specialty: "Прикладная математика" }],
      status: "VERIFIED",
    },
  });

  // Компания 1 — PE Capital
  const co1 = await prisma.user.upsert({
    where: { email: "hr@pecapital.ru" },
    update: {},
    create: { email: "hr@pecapital.ru", password, role: "EMPLOYER" },
  });
  const co1Profile = await prisma.companyProfile.upsert({
    where: { userId: co1.id },
    update: {},
    create: {
      userId: co1.id,
      // LEGACY:
      companyName: "PE Capital Group",
      industry: "PE / Финтех",
      size: "Группа компаний",
      description: "PE-фонд и портфель компаний в финтех/тех. Управление активами 50+ млрд ₽.",
      website: "https://pecapital.ru",
      isVerified: true,
      // NEW (CP.1+):
      name: "PE Capital Group",
      descriptionShort: "PE-фонд и портфель компаний в финтех/тех",
      industryPrimary: "investment",
      industriesSecondary: ["fintech", "tech"],
      companyType: "pe_backed",
      b2bB2c: "B2B",
      revenueRange: "10B_50B",
      employeeCount: "200_1000",
      hqCity: "Москва",
      stage: "scale_up",
      cultureAsIs: { clan: 20, adhocracy: 30, market: 35, hierarchy: 15 },
      cultureToBe: { clan: 15, adhocracy: 35, market: 40, hierarchy: 10 },
      workingStyle: { pace: 2.5, structure: 4, risk: 3, focus: 3 },
      profileCompletion: 65,
    },
  });

  // Компания 2 — TechScale
  const co2 = await prisma.user.upsert({
    where: { email: "hr@techscale.ru" },
    update: {},
    create: { email: "hr@techscale.ru", password, role: "EMPLOYER" },
  });
  const co2Profile = await prisma.companyProfile.upsert({
    where: { userId: co2.id },
    update: {},
    create: {
      userId: co2.id,
      // LEGACY:
      companyName: "TechScale Ventures",
      industry: "IT / SaaS",
      size: "Растущая",
      description: "B2B SaaS платформа для управления маркетинговыми операциями. ARR 1.2 млрд ₽, рост 80% YoY.",
      website: "https://techscale.ru",
      isVerified: true,
      // NEW:
      name: "TechScale Ventures",
      descriptionShort: "B2B SaaS, ARR 1.2 млрд ₽, рост 80% YoY",
      industryPrimary: "tech",
      companyType: "private",
      b2bB2c: "B2B",
      revenueRange: "1B_5B",
      employeeCount: "200_1000",
      hqCity: "Москва",
      stage: "scale_up",
      cultureAsIs: { clan: 25, adhocracy: 40, market: 25, hierarchy: 10 },
      cultureToBe: { clan: 20, adhocracy: 35, market: 35, hierarchy: 10 },
      workingStyle: { pace: 2, structure: 2.5, risk: 2, focus: 3.5 },
      profileCompletion: 70,
    },
  });

  // Мандат 1 — CFO для PE Capital
  await prisma.mandate.create({
    data: {
      companyId: co1Profile.id,
      title: "CFO — PE-портфельная компания финтех",
      // LEGACY:
      industry: "Финтех",
      salaryMin: 15_000_000,
      salaryMax: 25_000_000,
      description:
        "Ищем CFO для портфельной компании. Подготовка к exit через 3 года, управление финансовой функцией с нуля.",
      requirements: "10+ лет на C-level, опыт PE-backed, MBA, опыт IPO/M&A",
      mandateType: "full-time",
      // NEW:
      level: "C-level",
      function: ["finance"],
      isNewRole: false,
      reportsTo: "ceo",
      directReports: 6,
      totalTeam: 45,
      pnlRange: "2B_10B",
      relocationRequired: "no",
      travelPct: "10_30",
      budgetRange: "15_25M",
      mainChallenge: "Вывести компанию на прибыльность и подготовить к M&A exit в горизонте 24 месяцев",
      keyTasks: [
        { task: "Выстроить финансовую функцию", rank: 1 },
        { task: "Подготовка к продаже", rank: 2 },
        { task: "Оптимизация затрат", rank: 3 },
      ],
      hardFilters: { min_years: 10, min_pnl: "1B_5B", required_industries: ["fintech", "tech", "investment"] },
      competencyMustHave: ["E1.04", "E1.01", "E1.07", "E1.09", "E1.10"],
      competencyImportant: ["E1.02", "E1.03", "E1.05", "E1.06", "E1.15"],
      competencyNiceToHave: ["E1.08", "E1.11", "E1.12", "E1.13", "E1.14"],
      personalityPrefs: {
        A1: "high", A2: "high", A3: "moderate", A4: "not_critical", A5: "high",
        A6: "high", A7: "moderate", A8: "high", A9: "moderate", A10: "moderate",
      },
      riskTolerance: { B1: "zero", B2: "low", B3: "low", B4: "zero", B5: "standard", B6: "zero" },
      motivationTop3: ["ACH", "AUT", "POW"],
      motivationMiddle3: ["LRN", "REC", "STA"],
      motivationBottom2: ["MIS", "AFF"],
      status: "ACTIVE",
      templateUsed: "cfo_pe_backed",
    },
  });

  // Мандат 2 — CTO для TechScale
  await prisma.mandate.create({
    data: {
      companyId: co2Profile.id,
      title: "CTO — Product Tech B2B SaaS",
      // LEGACY:
      industry: "IT / SaaS",
      salaryMin: 12_000_000,
      salaryMax: 22_000_000,
      description:
        "Ищем CTO для построения tech-стратегии и масштабирования продуктовой команды. Текущая команда 80 инженеров, цель — 200 за 18 месяцев.",
      requirements:
        "10+ лет в tech на руководящих позициях, опыт product-led companies, AI/ML экспертиза приветствуется",
      mandateType: "full-time",
      // NEW:
      level: "C-level",
      function: ["technology"],
      isNewRole: false,
      reportsTo: "ceo",
      directReports: 5,
      totalTeam: 80,
      relocationRequired: "preferred",
      travelPct: "<10",
      budgetRange: "15_25M",
      mainChallenge: "Масштабировать tech-команду с 80 до 200 инженеров за 18 месяцев и запустить AI-направление",
      keyTasks: [
        { task: "Перестройка архитектуры под scale", rank: 1 },
        { task: "Найм senior leadership команды", rank: 2 },
        { task: "Запуск AI-направления", rank: 3 },
      ],
      hardFilters: { min_years: 10, required_industries: ["tech", "ai_data"], required_contexts: ["scale_up"] },
      competencyMustHave: ["E1.01", "E1.12", "E1.05", "E1.02", "E1.03"],
      competencyImportant: ["E1.08", "E1.11", "E1.06", "E1.13", "E1.09"],
      competencyNiceToHave: ["E1.04", "E1.07", "E1.10", "E1.14", "E1.15"],
      personalityPrefs: {
        A1: "moderate", A2: "high", A3: "not_critical", A4: "moderate", A5: "moderate",
        A6: "high", A7: "high", A8: "not_critical", A9: "moderate", A10: "high",
      },
      riskTolerance: { B1: "low", B2: "standard", B3: "low", B4: "low", B5: "standard", B6: "low" },
      motivationTop3: ["LRN", "AUT", "ACH"],
      motivationMiddle3: ["POW", "MIS", "REC"],
      motivationBottom2: ["AFF", "STA"],
      status: "ACTIVE",
      templateUsed: "cto_product_tech",
    },
  });

  console.log("\n✅ Seed готов\n");
  console.log("Тестовые аккаунты (пароль: password123):");
  console.log("  admin@gradeup.ru     — администратор");
  console.log("  cfo@example.ru       — кандидат CFO (Финтех, 14 лет)");
  console.log("  cto@example.ru       — кандидат CTO (IT, 12 лет)");
  console.log("  hr@pecapital.ru      — компания PE Capital Group (мандат: CFO)");
  console.log("  hr@techscale.ru      — компания TechScale Ventures (мандат: CTO)");
  console.log("\nMatches не сидируются — будут созданы новым scoring engine в Phase 4.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
