import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";

export const metadata: Metadata = {
  title: "Компаниям и агентствам — GradeUp",
  description:
    "Быстрый доступ к верифицированным топ-менеджерам. Найм, консалтинг, advisory — быстрее и дешевле traditional executive search.",
};

const plans = [
  {
    name: "Стартовый",
    price: "30 000",
    period: "руб / мес",
    description: "Для компаний, которые начинают работу с executive-наймом",
    badge: null,
    highlight: false,
    features: [
      "2 активные позиции одновременно",
      "До 10 мэтчей на позицию",
      "Анонимный профиль кандидата",
      "Базовые фильтры (роль, отрасль, зарплата)",
      "Email-уведомления о мэтчах",
      "Поддержка по почте",
    ],
    cta: "Начать",
    href: "/auth/register?role=COMPANY",
  },
  {
    name: "Профессиональный",
    price: "80 000",
    period: "руб / мес",
    description: "Для активного найма — несколько позиций и расширенная аналитика",
    badge: "Популярный",
    highlight: true,
    features: [
      "10 активных позиций",
      "Неограниченные мэтчи",
      "Расширенный профиль кандидата",
      "Расширенные фильтры + опыт в советах директоров",
      "Статистика по позициям и воронке",
      "Приоритетная поддержка",
      "Онбординг с менеджером платформы",
    ],
    cta: "Выбрать тариф",
    href: "/auth/register?role=COMPANY",
  },
  {
    name: "Корпоративный",
    price: "от 200 000",
    period: "руб / мес",
    description: "Для PE-фондов и крупных компаний с потоком найма",
    badge: null,
    highlight: false,
    features: [
      "Неограниченные позиции и мэтчи",
      "Выделенный аккаунт-менеджер",
      "SLA по отклику 4 часа",
      "API-интеграция с вашим ATS",
      "Закрытый пул pre-verified кандидатов",
      "Ежемесячный отчёт по рынку талантов",
      "Белый лейбл (по запросу)",
    ],
    cta: "Обсудить условия",
    href: "mailto:sales@gradeup.ru",
  },
];

const services = [
  {
    icon: "🎯",
    title: "Найм в штат",
    sub: "Full-time C-level",
    desc: "CEO, CFO, CTO, COO, CPO и другие ключевые роли. AI-мэтчинг по базе верифицированных топ-менеджеров с прямым контактом при взаимном интересе.",
    items: ["Shortlist за 24–48 часов", "Анонимный поиск по запросу", "Гарантийный период 3–6 мес."],
  },
  {
    icon: "💡",
    title: "Консалтинг и Advisory",
    sub: "Экспертиза без найма",
    desc: "Быстрое привлечение опытных топ-менеджеров для решения конкретных задач. Разовые или регулярные сессии без долгосрочных обязательств.",
    items: ["Стратегические сессии", "Финансовая и операционная экспертиза", "Трансформационные проекты"],
  },
  {
    icon: "🏛️",
    title: "Советы директоров",
    sub: "Board & Advisory board",
    desc: "Подбор независимых директоров и членов advisory board. Актуально для PE-портфельных компаний, scale-up и pre-IPO стадий.",
    items: ["Независимые директора", "Advisory board", "Governance экспертиза"],
  },
  {
    icon: "📊",
    title: "Оценка команды",
    sub: "Assessment топ-менеджеров",
    desc: "Профессиональная оценка действующей управленческой команды: компетенции, потенциал, gap-анализ и рекомендации по развитию.",
    items: ["HOGAN, DISC, MBTI", "Индивидуальные отчёты", "Командная динамика"],
  },
  {
    icon: "🤝",
    title: "Менторство команды",
    sub: "Leadership development",
    desc: "Программы развития топ-менеджмента через менторство и peer-to-peer обучение от практикующих C-level экспертов платформы.",
    items: ["Индивидуальное менторство", "Групповые сессии", "Измеримые результаты"],
  },
  {
    icon: "🌐",
    title: "Комьюнити и нетворкинг",
    sub: "Для партнёров платформы",
    desc: "Участие в закрытых мероприятиях комьюнити GradeUp. Прямой выход на C-level аудиторию для построения долгосрочных отношений.",
    items: ["CEO/CFO/CPO встречи", "Конференции и воркшопы", "Видимость среди лидеров"],
  },
];

const benefits = [
  { stat: "24–48ч", label: "Shortlist верифицированных кандидатов" },
  { stat: "2–3×", label: "Дешевле классического executive search" },
  { stat: "100%", label: "Верифицированный C-level опыт" },
  { stat: "0 %", label: "Комиссии за успешное закрытие" },
];

const faq = [
  {
    q: "Есть ли процент от зарплаты или success fee?",
    a: "Нет. GradeUp работает на фиксированной подписке — никаких скрытых платежей и комиссий при закрытии позиции.",
  },
  {
    q: "Как быстро появятся первые кандидаты?",
    a: "AI-мэтчинг запускается сразу после публикации позиции. Первый shortlist формируется за 24–48 часов в зависимости от специфики роли.",
  },
  {
    q: "Можно ли работать с кандидатом до найма?",
    a: "Да. Вы можете запросить консультацию или проектную работу у любого кандидата из базы — это позволяет проверить fit до оффера.",
  },
  {
    q: "Как проверяются кандидаты?",
    a: "Каждый кандидат проходит ручную верификацию командой GradeUp: проверка опыта, достижений и соответствия C-level уровню.",
  },
  {
    q: "Что такое анонимный / закрытый поиск?",
    a: "При закрытой вакансии кандидаты видят только отрасль и описание роли. Название компании раскрывается только при взаимном интересе обеих сторон.",
  },
  {
    q: "Как работают рекрутинговые агентства с GradeUp?",
    a: "Агентства могут использовать платформу как источник верифицированных кандидатов на корпоративном тарифе. Свяжитесь с нами для обсуждения партнёрских условий.",
  },
];

export default function ForCompaniesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* Nav */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl tracking-tight" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
            Grade<span style={{ color: "var(--accent)" }}>Up</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-400">
            <Link href="/community" className="hover:text-foreground transition-colors">Комьюнити</Link>
            <Link href="/#managers" className="hover:text-foreground transition-colors">Руководителям</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-sm text-slate-400 hover:text-foreground transition-colors">Войти</Link>
            <Link href="/auth/register?role=COMPANY" className="text-sm px-4 py-2 rounded-lg font-medium" style={{ background: "var(--accent)", color: "#fff" }}>
              Начать поиск
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-36 pb-16 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 60% at 50% -10%, var(--accent-glow-strong), transparent)" }} />
        <div className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6" style={{ background: "rgba(255,255,255,0.06)", color: "var(--accent)", border: "1px solid rgba(255,255,255,0.08)" }}>
            Для компаний и агентств
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-6" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
            Компаниям<br />и агентствам
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Быстрый доступ к верифицированным топ-менеджерам. Найм, консалтинг, advisory и оценка команды —
            быстрее и дешевле, чем классический executive search.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/auth/register?role=COMPANY" className="px-8 py-3.5 rounded-xl font-semibold text-white" style={{ background: "var(--accent)" }}>
              Зарегистрироваться
            </Link>
            <a href="mailto:sales@gradeup.ru" className="px-8 py-3.5 rounded-xl font-semibold" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "hsl(40 33% 96%)" }}>
              Обсудить с менеджером
            </a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-10 border-y border-white/5" style={{ background: "rgba(255,255,255,0.015)" }}>
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {benefits.map(({ stat, label }) => (
            <div key={label}>
              <div className="text-3xl font-bold mb-1" style={{ color: "var(--accent)" }}>{stat}</div>
              <div className="text-sm text-slate-500">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Сравнение */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="eyebrow mb-3">Почему GradeUp</p>
            <h2 className="text-3xl font-bold" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
              GradeUp vs. Traditional Search
            </h2>
          </div>
          <div className="rounded-3xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="grid md:grid-cols-2">
              <div className="p-8" style={{ background: "rgba(255,255,255,0.03)" }}>
                <p className="text-xs font-medium tracking-wider uppercase text-slate-500 mb-6">Традиционный Executive Search</p>
                <ul className="space-y-4">
                  {[
                    ["⏳", "2–4 месяца до первого кандидата"],
                    ["💸", "25–30% от годового дохода = 2–5 млн руб."],
                    ["🕵️", "Непрозрачный процесс без аналитики"],
                    ["⚠️", "Кандидата оцениваете только в конце воронки"],
                    ["🔁", "Провал → начинаете сначала с нуля"],
                  ].map(([icon, text]) => (
                    <li key={String(text)} className="flex items-start gap-3 text-sm text-slate-400">
                      <span>{icon}</span><span>{text}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-8" style={{ background: "hsl(215 80% 50%)" }}>
                <p className="text-xs font-medium tracking-wider uppercase mb-6" style={{ color: "rgba(255,255,255,0.6)" }}>GradeUp</p>
                <ul className="space-y-4">
                  {[
                    ["⚡", "Shortlist за 24–48 часов"],
                    ["💎", "Фиксированная подписка — в 2–3× дешевле"],
                    ["📊", "AI-скоринг, прозрачная аналитика"],
                    ["✅", "Взаимодействие с кандидатом до найма"],
                    ["🔄", "Гарантийный период без доплат"],
                  ].map(([icon, text]) => (
                    <li key={String(text)} className="flex items-start gap-3 text-sm" style={{ color: "rgba(255,255,255,0.9)" }}>
                      <span>{icon}</span><span>{text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Услуги */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <p className="eyebrow mb-3">Услуги</p>
            <h2 className="text-3xl font-bold" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
              Форматы работы с платформой
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map(({ icon, title, sub, desc, items }) => (
              <div key={title} className="rounded-2xl p-7 flex flex-col gap-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="text-3xl">{icon}</div>
                <div>
                  <h3 className="font-bold mb-0.5">{title}</h3>
                  <p className="text-xs text-slate-500 mb-3">{sub}</p>
                  <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
                </div>
                <ul className="space-y-1.5 mt-auto">
                  {items.map(it => (
                    <li key={it} className="flex items-center gap-2 text-xs text-slate-400">
                      <Check className="w-3 h-3 shrink-0" style={{ color: "var(--accent)" }} />
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Как работает — шаги */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="eyebrow mb-3">Процесс</p>
            <h2 className="text-3xl font-bold" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
              Как это работает
            </h2>
          </div>
          <div className="space-y-3">
            {[
              { n: "01", title: "Создайте позицию", desc: "Укажите роль, требования, вилку компенсации и статус вакансии (открытая или закрытая). Выберите формат: найм, консалтинг, advisory или оценка." },
              { n: "02", title: "AI-мэтчинг запускается автоматически", desc: "Алгоритм скорит всю базу верифицированных кандидатов по отрасли, функции, опыту, компенсации и формату взаимодействия." },
              { n: "03", title: "Получите shortlist за 24–48 часов", desc: "Анонимные профили топ-менеджеров с AI-скором. Вы видите экспертизу, достижения и траекторию — без имени и контактов." },
              { n: "04", title: "Взаимный интерес → раскрытие контактов", desc: "Когда вы и кандидат подтверждаете интерес, контакты раскрываются автоматически. Общение и переговоры — напрямую, без посредников." },
              { n: "05", title: "Найм или начало сотрудничества", desc: "Закройте оффер, запустите консультационный проект или оформите advisory contract внутри платформы." },
            ].map(({ n, title, desc }) => (
              <div key={n} className="flex gap-5 items-start p-6 rounded-2xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="text-2xl font-bold font-mono shrink-0 w-10 text-right" style={{ color: "var(--accent)", opacity: 0.6 }}>{n}</div>
                <div>
                  <h3 className="font-semibold mb-1">{title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Тарифы */}
      <section className="py-16 px-6" id="pricing">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-4">
            <p className="eyebrow mb-3">Тарифы</p>
            <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
              Фиксированная подписка без success fee
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Стандартное агентство берёт 15–25% годового дохода кандидата — при зарплате 15 млн это 2–4 млн за одно закрытие.
              GradeUp — фиксированная подписка.
            </p>
          </div>
          <div className="flex justify-center mb-10">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm" style={{ background: "rgba(37,199,100,0.1)", color: "rgb(37,199,100)", border: "1px solid rgba(37,199,100,0.2)" }}>
              <Check className="w-4 h-4" />
              Экономия до 90% по сравнению с агентским гонораром
            </span>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className="relative flex flex-col rounded-2xl p-7"
                style={{
                  background: plan.highlight ? "hsl(215 80% 50%)" : "rgba(255,255,255,0.04)",
                  border: plan.highlight ? "none" : "1px solid rgba(255,255,255,0.07)",
                }}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold" style={{ background: "hsl(40 33% 96%)", color: "hsl(215 80% 40%)" }}>
                    {plan.badge}
                  </div>
                )}
                <div className="mb-4">
                  <h3 className="font-bold text-lg mb-1" style={{ color: plan.highlight ? "#fff" : "hsl(40 33% 96%)" }}>{plan.name}</h3>
                  <p className="text-xs mb-4" style={{ color: plan.highlight ? "rgba(255,255,255,0.7)" : "#94a3b8" }}>{plan.description}</p>
                  <div>
                    <span className="text-3xl font-bold" style={{ color: plan.highlight ? "#fff" : "hsl(40 33% 96%)" }}>{plan.price}</span>
                    <span className="text-sm ml-1" style={{ color: plan.highlight ? "rgba(255,255,255,0.6)" : "#64748b" }}>{plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-2.5 flex-1 mb-6">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: plan.highlight ? "rgba(255,255,255,0.8)" : "var(--accent)" }} />
                      <span style={{ color: plan.highlight ? "rgba(255,255,255,0.85)" : "#94a3b8" }}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className="block text-center py-3 rounded-xl font-semibold text-sm"
                  style={
                    plan.highlight
                      ? { background: "#fff", color: "hsl(215 80% 45%)" }
                      : { background: "var(--accent)", color: "#fff" }
                  }
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>Частые вопросы</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {faq.map(({ q, a }) => (
              <div key={q} className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <p className="font-medium text-sm mb-2">{q}</p>
                <p className="text-sm text-slate-400">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="rounded-3xl p-12" style={{ background: "hsl(215 80% 50%)" }}>
            <h2 className="text-3xl font-bold text-white mb-3" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
              Готовы начать?
            </h2>
            <p className="mb-8" style={{ color: "rgba(255,255,255,0.8)" }}>
              Создайте аккаунт и получите первый shortlist за 24–48 часов.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/auth/register?role=COMPANY" className="px-8 py-4 rounded-xl font-semibold" style={{ background: "#fff", color: "hsl(215 80% 45%)" }}>
                Зарегистрироваться
              </Link>
              <a href="mailto:sales@gradeup.ru" className="px-8 py-4 rounded-xl font-semibold" style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.25)" }}>
                Написать в продажи
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-600">
          <Link href="/" className="font-bold" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
            Grade<span style={{ color: "var(--accent)" }}>Up</span>
          </Link>
          <div className="flex gap-6">
            <Link href="/community" className="hover:text-slate-400 transition-colors">Комьюнити</Link>
            <Link href="/" className="hover:text-slate-400 transition-colors">Руководителям</Link>
            <a href="mailto:hello@gradeup.ru" className="hover:text-slate-400 transition-colors">hello@gradeup.ru</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
