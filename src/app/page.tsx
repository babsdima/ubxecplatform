import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();
  if (session?.user) {
    if (session.user.role === "CANDIDATE") redirect("/candidate/dashboard");
    if (session.user.role === "COMPANY") redirect("/company/dashboard");
    if (session.user.role === "ADMIN") redirect("/admin");
  }

  return (
    <main className="min-h-screen bg-background text-foreground">

      {/* ─── NAV ─── */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-bold text-xl tracking-tight" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
            Grade<span style={{ color: "var(--accent)" }}>Up</span>
          </span>
          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-400">
            <Link href="/community" className="hover:text-foreground transition-colors">Комьюнити</Link>
            <Link href="/pricing" className="hover:text-foreground transition-colors">Компаниям</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-sm text-slate-400 hover:text-foreground transition-colors">Войти</Link>
            <Link href="/auth/register" className="text-sm px-4 py-2 rounded-lg font-medium" style={{ background: "var(--accent)", color: "#fff" }}>
              Начать
            </Link>
          </div>
        </div>
      </header>

      {/* ─── HERO ─── */}
      <section className="pt-40 pb-16 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 60% at 50% -10%, var(--accent-glow-strong), transparent)" }} />
        <div className="relative max-w-4xl mx-auto">
          <p className="eyebrow mb-4">Экосистема для топ-менеджеров</p>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-none mb-6" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
            Развитие. <span style={{ color: "var(--accent)" }}>Доход.</span>
            <br />Возможности.
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            GradeUp — экосистема карьерного роста для топ-менеджеров и быстрый доступ к управленческому таланту для компаний.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="#managers" className="px-8 py-3.5 rounded-xl font-semibold text-white hover:opacity-90 transition-all" style={{ background: "var(--accent)" }}>
              Я топ-менеджер ↓
            </Link>
            <Link href="#companies" className="px-8 py-3.5 rounded-xl font-semibold transition-all" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "hsl(40 33% 96%)" }}>
              Я компания ↓
            </Link>
          </div>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section className="py-8 border-y border-white/5" style={{ background: "rgba(255,255,255,0.015)" }}>
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { val: "24–48ч", label: "Shortlist для компании" },
            { val: "2–3×", label: "Дешевле executive search" },
            { val: "4 блока", label: "Развития в одном месте" },
            { val: "C-level", label: "Фокус платформы" },
          ].map(({ val, label }) => (
            <div key={label}>
              <div className="text-3xl font-bold mb-1" style={{ color: "var(--accent)" }}>{val}</div>
              <div className="text-sm text-slate-500">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════
          ███  РАЗДЕЛ ДЛЯ РУКОВОДИТЕЛЕЙ  ███
          ════════════════════════════════════════ */}
      <div id="managers" style={{ background: "hsl(222 47% 7%)" }}>

        {/* Раздел-шапка */}
        <section className="pt-20 pb-10 px-6">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4" style={{ background: "rgba(255,255,255,0.06)", color: "var(--accent)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><circle cx="6" cy="6" r="5"/></svg>
                Для топ-менеджеров
              </div>
              <h2 className="text-4xl md:text-5xl font-bold" style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "hsl(40 33% 96%)" }}>
                Карьерный рост<br />и новые источники дохода
              </h2>
            </div>
            <p className="text-slate-400 max-w-sm text-lg">
              От понимания своей стоимости — к монетизации экспертизы и нужным предложениям.
            </p>
          </div>
        </section>

        {/* 4 столпа с иконками */}
        <section className="pb-10 px-6">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                num: "01",
                icon: (
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <rect x="4" y="20" width="4" height="8" rx="1" fill="currentColor" opacity=".3"/>
                    <rect x="10" y="14" width="4" height="14" rx="1" fill="currentColor" opacity=".6"/>
                    <rect x="16" y="8" width="4" height="20" rx="1" fill="currentColor" opacity=".85"/>
                    <rect x="22" y="3" width="4" height="25" rx="1" fill="currentColor"/>
                    <path d="M5 19 L11 13 L17 7 L23 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <circle cx="23" cy="2" r="2" fill="currentColor"/>
                  </svg>
                ),
                title: "Оценка и позиционирование",
                desc: "Assessment, бенчмарки рынка, понимание своей рыночной стоимости и карьерной траектории",
                tags: ["Assessment", "Бенчмарки", "IDP"],
                color: "hsl(215 80% 50%)",
              },
              {
                num: "02",
                icon: (
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="2" opacity=".3"/>
                    <path d="M16 4 A12 12 0 0 1 28 16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                    <path d="M16 8 A8 8 0 0 1 24 16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity=".6"/>
                    <circle cx="16" cy="16" r="3" fill="currentColor"/>
                    <path d="M24 8 L26 5 M26 5 L23 5 M26 5 L26 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ),
                title: "Развитие и карьерный рост",
                desc: "Индивидуальные планы развития, коучинг, подготовка к переходу на C-level и выше",
                tags: ["Коучинг", "IDP", "C-level"],
                color: "hsl(215 80% 55%)",
              },
              {
                num: "03",
                icon: (
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <circle cx="16" cy="16" r="10" stroke="currentColor" strokeWidth="2" opacity=".3"/>
                    <path d="M16 8 L16 10 M16 22 L16 24 M8 16 L10 16 M22 16 L24 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity=".5"/>
                    <path d="M13 13 C13 11.3 14.3 10 16 10 C17.7 10 19 11.3 19 13 C19 14.5 18 15.7 16.6 16 L16 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <circle cx="16" cy="21" r="1" fill="currentColor"/>
                  </svg>
                ),
                title: "Монетизация экспертизы",
                desc: "Консультации, advisory, менторство, проектная работа — превращайте опыт в доход",
                tags: ["Консалтинг", "Advisory", "Менторство"],
                color: "hsl(215 80% 60%)",
              },
              {
                num: "04",
                icon: (
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <rect x="6" y="10" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" opacity=".4"/>
                    <rect x="10" y="6" width="12" height="6" rx="1.5" stroke="currentColor" strokeWidth="2" opacity=".7"/>
                    <path d="M12 17 L15 20 L20 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ),
                title: "Карьерные возможности",
                desc: "Вакансии C-level приходят к вам через match-модель — только релевантные предложения",
                tags: ["Match-модель", "C-level", "Пассивный поиск"],
                color: "hsl(215 80% 65%)",
              },
            ].map(({ num, icon, title, desc, tags, color }) => (
              <div key={num} className="rounded-2xl p-6 flex flex-col gap-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="flex items-start justify-between">
                  <div style={{ color }}>{icon}</div>
                  <span className="text-xs font-mono opacity-40 text-white">{num}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2">{title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-auto">
                  {tags.map(t => (
                    <span key={t} className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)" }}>{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Схема пути менеджера */}
        <section className="py-10 px-6">
          <div className="max-w-6xl mx-auto">
            <p className="eyebrow mb-8 text-center">Путь на платформе</p>
            <div className="flex flex-col md:flex-row items-stretch gap-0">
              {[
                { phase: "Вход", label: "Оценка", items: ["Assessment", "Бенчмарки рынка", "Позиционирование"], bg: "rgba(255,255,255,0.04)" },
                { phase: "Рост", label: "Развитие", items: ["IDP", "Коучинг", "Комьюнити"], bg: "rgba(255,255,255,0.06)" },
                { phase: "Монетизация", label: "Доход", items: ["Консультации", "Менторство", "Advisory"], bg: "rgba(255,255,255,0.08)" },
                { phase: "Карьера", label: "Возможности", items: ["Match-вакансии", "Предложения компаний", "Советы директоров"], bg: "rgba(255,255,255,0.10)" },
              ].map(({ phase, label, items, bg }, i) => (
                <div key={phase} className="flex-1 flex flex-col md:flex-row">
                  <div className="flex-1 p-6 rounded-2xl md:rounded-none first:md:rounded-l-2xl last:md:rounded-r-2xl" style={{ background: bg, border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div className="text-xs font-mono mb-1" style={{ color: "var(--accent)" }}>{String(i + 1).padStart(2, "0")}</div>
                    <div className="text-xs text-slate-500 mb-1">{phase}</div>
                    <div className="font-semibold text-white mb-3">{label}</div>
                    <ul className="space-y-1.5">
                      {items.map(it => (
                        <li key={it} className="flex items-center gap-2 text-xs text-slate-400">
                          <span className="w-1 h-1 rounded-full shrink-0" style={{ background: "var(--accent)" }} />
                          {it}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {i < 3 && (
                    <div className="hidden md:flex items-center justify-center w-6 shrink-0">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 8 L12 8 M9 5 L12 8 L9 11" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Комьюнити */}
        <section className="py-10 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="rounded-3xl overflow-hidden" style={{ background: "linear-gradient(135deg, hsl(222 47% 10%) 0%, hsl(215 60% 14%) 100%)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="p-10 md:p-14 flex flex-col md:flex-row gap-10 items-start">
                <div className="flex-1">
                  <p className="eyebrow mb-3">Комьюнити</p>
                  <h3 className="text-3xl font-bold mb-4" style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "hsl(40 33% 96%)" }}>
                    Доступ к<br /><em>сильному окружению</em>
                  </h3>
                  <p className="text-slate-400 mb-6">
                    Закрытые форматы для обмена опытом, совместного решения задач и нетворкинга на уровне первых лиц.
                  </p>
                  <Link href="/community" className="inline-block px-6 py-3 rounded-xl font-semibold text-white" style={{ background: "var(--accent)" }}>
                    Подробнее о комьюнити
                  </Link>
                </div>
                <div className="flex-1 grid grid-cols-2 gap-3">
                  {[
                    { icon: "👥", label: "CEO-встречи", desc: "Закрытый клуб первых лиц" },
                    { icon: "📊", label: "CFO-сессии", desc: "Финансовое лидерство" },
                    { icon: "🚀", label: "CPO-разборы", desc: "Продуктовые стратегии" },
                    { icon: "🏆", label: "Конференции", desc: "Нетворкинг на уровне C-suite" },
                    { icon: "🧠", label: "Воркшопы", desc: "Практическое развитие" },
                    { icon: "⚽", label: "Неформально", desc: "Спорт и общение" },
                  ].map(({ icon, label, desc }) => (
                    <div key={label} className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <div className="text-xl mb-1">{icon}</div>
                      <div className="text-sm font-medium text-white">{label}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA для руководителей */}
        <section className="py-14 px-6">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 rounded-3xl p-10 md:p-14" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div>
              <h3 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
                Готовы развиваться и зарабатывать?
              </h3>
              <p className="text-slate-400">Создайте профиль и начните получать релевантные предложения</p>
            </div>
            <Link href="/auth/register?role=candidate" className="shrink-0 px-8 py-4 rounded-xl font-semibold text-white whitespace-nowrap" style={{ background: "var(--accent)" }}>
              Создать профиль бесплатно
            </Link>
          </div>
        </section>

      </div>{/* end managers */}

      {/* ════════════════════════════════════════
          ███  РАЗДЕЛ ДЛЯ КОМПАНИЙ  ███
          ════════════════════════════════════════ */}
      <div id="companies" style={{ background: "#f0f4f9", color: "hsl(222 47% 11%)" }}>

        {/* Раздел-шапка */}
        <section className="pt-20 pb-10 px-6">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4" style={{ background: "rgba(37,99,235,0.1)", color: "hsl(215 80% 40%)", border: "1px solid rgba(37,99,235,0.15)" }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><rect x="1" y="4" width="10" height="7" rx="1"/><path d="M4 4V3a2 2 0 0 1 4 0v1"/></svg>
                Для компаний и агентств
              </div>
              <h2 className="text-4xl md:text-5xl font-bold" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
                Быстрый доступ<br />к управленческому таланту
              </h2>
            </div>
            <p className="text-slate-500 max-w-sm text-lg">
              Быстрее, дешевле и с меньшим риском, чем классический executive search.
            </p>
          </div>
        </section>

        {/* Сравнение GradeUp vs. традиционный поиск */}
        <section className="pb-10 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="rounded-3xl overflow-hidden" style={{ border: "1px solid rgba(0,0,0,0.08)" }}>
              <div className="grid md:grid-cols-2">
                {/* Традиционный */}
                <div className="p-8 md:p-10" style={{ background: "#fff" }}>
                  <p className="text-xs font-medium tracking-wider uppercase text-slate-400 mb-6">Традиционный Executive Search</p>
                  <ul className="space-y-4">
                    {[
                      { icon: "⏳", text: "2–4 месяца до первого кандидата" },
                      { icon: "💰", text: "25–30% от годового дохода кандидата" },
                      { icon: "🕵️", text: "Непрозрачный процесс, нет аналитики" },
                      { icon: "⚠️", text: "Кандидата видите только в конце воронки" },
                      { icon: "🔁", text: "При провале — начинаете сначала" },
                    ].map(({ icon, text }) => (
                      <li key={text} className="flex items-start gap-3 text-sm text-slate-500">
                        <span className="text-base">{icon}</span>
                        <span>{text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {/* GradeUp */}
                <div className="p-8 md:p-10" style={{ background: "hsl(215 80% 50%)", color: "#fff" }}>
                  <p className="text-xs font-medium tracking-wider uppercase mb-6" style={{ color: "rgba(255,255,255,0.6)" }}>GradeUp</p>
                  <ul className="space-y-4">
                    {[
                      { icon: "⚡", text: "Shortlist за 24–48 часов" },
                      { icon: "💎", text: "Фиксированная подписка — в 2–3× дешевле" },
                      { icon: "📊", text: "Прозрачный AI-скоринг и аналитика" },
                      { icon: "✅", text: "Взаимодействие с кандидатом до найма" },
                      { icon: "🔄", text: "Гарантийный период и повтор без доплат" },
                    ].map(({ icon, text }) => (
                      <li key={text} className="flex items-start gap-3 text-sm">
                        <span className="text-base">{icon}</span>
                        <span style={{ color: "rgba(255,255,255,0.9)" }}>{text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4 преимущества с числами */}
        <section className="pb-10 px-6">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: (
                  <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                    <circle cx="18" cy="18" r="14" stroke="hsl(215 80% 50%)" strokeWidth="2" opacity=".2"/>
                    <path d="M10 18 A8 8 0 1 1 18 26" stroke="hsl(215 80% 50%)" strokeWidth="2.5" strokeLinecap="round"/>
                    <path d="M14 22 L10 18 L14 14" stroke="hsl(215 80% 50%)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <text x="18" y="22" textAnchor="middle" fontSize="9" fontWeight="700" fill="hsl(215 80% 50%)">24h</text>
                  </svg>
                ),
                stat: "24–48ч",
                label: "Скорость",
                desc: "Shortlist верифицированных кандидатов за первые сутки-двое",
              },
              {
                icon: (
                  <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                    <path d="M8 28 L8 14 L18 8 L28 14 L28 28 Z" stroke="hsl(215 80% 50%)" strokeWidth="2" opacity=".3"/>
                    <path d="M14 28 L14 20 L22 20 L22 28" stroke="hsl(215 80% 50%)" strokeWidth="2"/>
                    <path d="M10 16 L26 16" stroke="hsl(215 80% 50%)" strokeWidth="1.5" strokeDasharray="2 2" opacity=".5"/>
                    <path d="M9 21 L5 21 M27 21 L31 21" stroke="hsl(215 80% 50%)" strokeWidth="1.5" strokeLinecap="round" opacity=".4"/>
                  </svg>
                ),
                stat: "2–3×",
                label: "Стоимость",
                desc: "Дешевле классического executive search. Нет скрытых комиссий при закрытии",
              },
              {
                icon: (
                  <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                    <circle cx="18" cy="14" r="6" stroke="hsl(215 80% 50%)" strokeWidth="2"/>
                    <path d="M8 28 C8 22 28 22 28 28" stroke="hsl(215 80% 50%)" strokeWidth="2" strokeLinecap="round" opacity=".5"/>
                    <path d="M24 12 L26 14 L30 10" stroke="hsl(215 80% 50%)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ),
                stat: "100%",
                label: "Верификация",
                desc: "Каждый кандидат проходит ручную проверку — только реальный C-level опыт",
              },
              {
                icon: (
                  <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                    <path d="M8 8 L28 8 L28 22 L18 28 L8 22 Z" stroke="hsl(215 80% 50%)" strokeWidth="2" opacity=".3"/>
                    <path d="M8 8 L28 8 L28 22 L18 28 L8 22 Z" stroke="hsl(215 80% 50%)" strokeWidth="2"/>
                    <path d="M13 16 L16 19 L23 13" stroke="hsl(215 80% 50%)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ),
                stat: "0%",
                label: "Риск",
                desc: "Знакомьтесь с кандидатом через консультацию или проект до финального оффера",
              },
            ].map(({ icon, stat, label, desc }) => (
              <div key={label} className="rounded-2xl p-6 flex flex-col gap-4" style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.06)" }}>
                {icon}
                <div>
                  <div className="text-3xl font-bold mb-0.5" style={{ color: "hsl(215 80% 50%)" }}>{stat}</div>
                  <div className="font-semibold text-sm mb-2" style={{ color: "hsl(222 47% 11%)" }}>{label}</div>
                  <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Как это работает — схема */}
        <section className="pb-10 px-6">
          <div className="max-w-6xl mx-auto">
            <p className="eyebrow mb-8 text-center" style={{ color: "hsl(215 80% 45%)" }}>Как это работает</p>
            <div className="relative">
              {/* Линия соединения */}
              <div className="hidden md:block absolute top-8 left-[10%] right-[10%] h-0.5" style={{ background: "linear-gradient(90deg, hsl(215 80% 50%), hsl(215 80% 70%))", opacity: 0.2 }} />
              <div className="grid md:grid-cols-5 gap-4">
                {[
                  { n: "1", icon: "📋", label: "Создайте позицию", desc: "Укажите роль, требования и вилку" },
                  { n: "2", icon: "🤖", label: "AI-мэтчинг", desc: "Автоматический скоринг по базе" },
                  { n: "3", icon: "👁️", label: "Shortlist", desc: "Анонимные профили за 24–48ч" },
                  { n: "4", icon: "🤝", label: "Взаимный интерес", desc: "Контакты раскрываются при мэтче" },
                  { n: "5", icon: "✅", label: "Найм", desc: "Прямой контакт без посредников" },
                ].map(({ n, icon, label, desc }) => (
                  <div key={n} className="flex flex-col items-center text-center gap-3">
                    <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shrink-0" style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.08)" }}>
                      {icon}
                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center text-white" style={{ background: "hsl(215 80% 50%)" }}>{n}</span>
                    </div>
                    <div>
                      <div className="font-semibold text-sm mb-1" style={{ color: "hsl(222 47% 11%)" }}>{label}</div>
                      <div className="text-xs text-slate-500">{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Сервисы для компаний */}
        <section className="pb-10 px-6">
          <div className="max-w-6xl mx-auto">
            <p className="text-center text-sm font-medium text-slate-400 mb-6">Доступные форматы взаимодействия</p>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                {
                  icon: "🎯",
                  title: "Найм в штат",
                  sub: "Full-time & Part-time",
                  desc: "CEO, CFO, CTO, COO, CPO и другие ключевые роли. Match-модель + прямой контакт.",
                  tags: ["C-level найм", "Верифицированные кандидаты", "Гарантийный период"],
                },
                {
                  icon: "💡",
                  title: "Экспертиза без найма",
                  sub: "Консалтинг & Advisory",
                  desc: "Разовые или регулярные консультации топ-менеджеров для решения стратегических задач.",
                  tags: ["Проектная работа", "Strategic advisory", "Быстрый старт"],
                },
                {
                  icon: "🏛️",
                  title: "Советы директоров",
                  sub: "Board members",
                  desc: "Подбор независимых директоров и членов advisory board для governance и развития.",
                  tags: ["Независимые директора", "Advisory board", "PE-портфели"],
                },
              ].map(({ icon, title, sub, desc, tags }) => (
                <div key={title} className="rounded-2xl p-7 flex flex-col gap-4" style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.07)" }}>
                  <div className="text-3xl">{icon}</div>
                  <div>
                    <h3 className="font-bold text-base mb-0.5" style={{ color: "hsl(222 47% 11%)" }}>{title}</h3>
                    <p className="text-xs text-slate-400 mb-3">{sub}</p>
                    <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-auto">
                    {tags.map(t => (
                      <span key={t} className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(37,99,235,0.07)", color: "hsl(215 80% 45%)" }}>{t}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA для компаний */}
        <section className="py-14 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="rounded-3xl p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8" style={{ background: "hsl(215 80% 50%)" }}>
              <div className="text-white">
                <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
                  Нужен топ-менеджер или эксперт?
                </h3>
                <p style={{ color: "rgba(255,255,255,0.8)" }}>Зарегистрируйтесь и получите первый shortlist за 24–48 часов</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                <Link href="/auth/register?role=company" className="px-7 py-3.5 rounded-xl font-semibold whitespace-nowrap" style={{ background: "#fff", color: "hsl(215 80% 45%)" }}>
                  Начать поиск
                </Link>
                <Link href="/pricing" className="px-7 py-3.5 rounded-xl font-semibold whitespace-nowrap" style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.25)" }}>
                  Тарифы и услуги →
                </Link>
              </div>
            </div>
          </div>
        </section>

      </div>{/* end companies */}

      {/* ─── QUOTE ─── */}
      <section className="py-20 px-6" style={{ background: "hsl(222 47% 7%)" }}>
        <div className="max-w-3xl mx-auto text-center">
          <blockquote className="text-2xl md:text-3xl font-medium leading-snug mb-6" style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "hsl(40 33% 96%)" }}>
            «GradeUp — это не рекрутинг и не образование. Это экосистема управления карьерой и экспертизой.»
          </blockquote>
          <p className="text-slate-500 text-sm">Для руководителей — рост, доход и возможности. Для компаний — быстрый доступ к таланту и результату.</p>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-white/5 py-8 px-6" style={{ background: "hsl(222 47% 6%)" }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-600">
          <span className="font-bold" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
            Grade<span style={{ color: "var(--accent)" }}>Up</span>
          </span>
          <div className="flex gap-6">
            <Link href="/community" className="hover:text-slate-400 transition-colors">Комьюнити</Link>
            <Link href="/pricing" className="hover:text-slate-400 transition-colors">Компаниям</Link>
            <a href="mailto:hello@gradeup.ru" className="hover:text-slate-400 transition-colors">hello@gradeup.ru</a>
          </div>
        </div>
      </footer>

    </main>
  );
}
