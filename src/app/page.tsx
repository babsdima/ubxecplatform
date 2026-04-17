import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  UserCircle,
  Sparkles,
  Handshake,
  EyeOff,
  Zap,
  Users,
  ShieldCheck,
  TrendingUp,
  Clock,
  BadgeCheck,
  Building2,
  ChevronRight,
  Lock,
  Brain,
  BarChart3,
  Award,
  Target,
  MessageSquare,
  Briefcase,
} from "lucide-react";

export const metadata: Metadata = {
  title: "UbXec — Premium AI-powered Executive Search",
  description:
    "Премиальная платформа executive search нового поколения. AI-powered мэтчинг, assessment-driven matching, confidential search для топ-менеджеров и компаний.",
  openGraph: {
    title: "UbXec — Premium AI-powered Executive Search",
    description:
      "Confidential executive search. AI-powered matching. Assessment-driven. Для топ-менеджеров и компаний — без компромиссов по качеству.",
  },
};

export default async function Home() {
  const session = await auth();

  if (session) {
    const role = session.user.role;
    if (role === "CANDIDATE") redirect("/candidate/dashboard");
    if (role === "COMPANY") redirect("/company/dashboard");
    if (role === "ADMIN") redirect("/admin");
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}>

      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50 border-b"
        style={{ background: "hsl(222 47% 7%)", borderColor: "rgba(255,255,255,0.07)" }}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span
            className="text-xl font-bold tracking-tight"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "hsl(40 33% 96%)" }}
          >
            UbXec
          </span>
          <nav className="flex gap-2 items-center">
            <Link href="/pricing" className="nav-ghost-link px-4 py-2 text-sm rounded-lg transition-colors">
              Тарифы
            </Link>
            <Link href="/auth/login" className="nav-ghost-link px-4 py-2 text-sm rounded-lg transition-colors">
              Войти
            </Link>
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-all"
              style={{ background: "hsl(38 52% 48%)", color: "#fff" }}
            >
              Начать
              <ChevronRight size={14} />
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">

        {/* ── HERO ──────────────────────────────────────────────────────── */}
        <section
          className="relative overflow-hidden hero-grid"
          style={{ background: "hsl(222 47% 7%)", minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center" }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(184,149,90,0.12), transparent)" }}
          />

          <div className="relative max-w-6xl mx-auto px-6 py-28 w-full">
            <div className="max-w-3xl">
              {/* Eyebrow */}
              <div
                className="inline-flex items-center gap-2 mb-8 animate-fade-up"
                style={{
                  border: "1px solid rgba(184,149,90,0.3)",
                  borderRadius: "100px",
                  padding: "6px 16px",
                  background: "rgba(184,149,90,0.08)",
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: "hsl(38 52% 60%)" }} />
                <span className="text-xs font-medium tracking-widest uppercase" style={{ color: "hsl(38 60% 72%)" }}>
                  Premium AI-powered Executive Search
                </span>
              </div>

              {/* Headline */}
              <h1
                className="animate-fade-up-delay-1"
                style={{
                  fontFamily: "var(--font-playfair), Georgia, serif",
                  fontSize: "clamp(2.8rem, 6vw, 5rem)",
                  fontWeight: 700,
                  lineHeight: 1.1,
                  letterSpacing: "-0.02em",
                  color: "hsl(40 33% 96%)",
                  marginBottom: "1.5rem",
                }}
              >
                Executive Search
                <br />
                <span style={{ color: "hsl(38 52% 55%)", fontStyle: "italic" }}>нового поколения</span>
              </h1>

              <p
                className="animate-fade-up-delay-2"
                style={{
                  fontSize: "1.125rem",
                  lineHeight: 1.7,
                  color: "rgba(255,255,255,0.5)",
                  maxWidth: "560px",
                  marginBottom: "2.5rem",
                }}
              >
                Премиальная платформа для confidential найма топ-менеджеров.
                AI-powered мэтчинг с учётом assessment-профиля. Полная конфиденциальность
                до момента взаимного интереса обеих сторон.
              </p>

              <div className="flex flex-wrap gap-3 animate-fade-up-delay-3">
                <Link
                  href="/auth/register?role=CANDIDATE"
                  className="group flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold transition-all"
                  style={{ background: "hsl(40 33% 96%)", color: "hsl(222 47% 8%)" }}
                >
                  <UserCircle size={16} />
                  Я топ-менеджер
                  <span className="group-hover:translate-x-0.5 transition-transform inline-block">→</span>
                </Link>
                <Link
                  href="/auth/register?role=COMPANY"
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: "rgba(255,255,255,0.75)",
                    background: "rgba(255,255,255,0.04)",
                  }}
                >
                  <Building2 size={16} />
                  Ищу руководителя
                </Link>
              </div>

              <p className="mt-5 text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
                Бесплатно для кандидатов · Confidential search · Верификация каждого профиля
              </p>
            </div>
          </div>

          <div
            className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
            style={{ background: "linear-gradient(to bottom, transparent, hsl(222 47% 7%))" }}
          />
        </section>

        {/* ── STATS STRIP ───────────────────────────────────────────────── */}
        <section
          style={{
            background: "hsl(222 47% 9%)",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div className="max-w-6xl mx-auto px-6 py-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
              {[
                { value: "AI", label: "powered matching", icon: <Brain size={16} /> },
                { value: "100%", label: "confidential search", icon: <EyeOff size={16} /> },
                { value: "Assessed", label: "verified candidates", icon: <BadgeCheck size={16} /> },
                { value: "48ч", label: "до первого мэтча", icon: <Clock size={16} /> },
              ].map(({ value, label, icon }) => (
                <div key={label}>
                  <div className="flex justify-center mb-2" style={{ color: "rgba(255,255,255,0.2)" }}>
                    {icon}
                  </div>
                  <p
                    style={{
                      fontFamily: "var(--font-playfair), Georgia, serif",
                      fontSize: "1.75rem",
                      fontWeight: 700,
                      color: "hsl(38 52% 55%)",
                      lineHeight: 1,
                      marginBottom: "6px",
                    }}
                  >
                    {value}
                  </p>
                  <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.35)", letterSpacing: "0.05em" }}>
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ──────────────────────────────────────────────── */}
        <section className="py-28 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="max-w-xl mb-16">
              <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "hsl(38 52% 48%)" }}>
                Процесс
              </p>
              <h2
                style={{
                  fontFamily: "var(--font-playfair), Georgia, serif",
                  fontSize: "clamp(2rem, 4vw, 2.75rem)",
                  fontWeight: 700,
                  lineHeight: 1.2,
                  letterSpacing: "-0.02em",
                  color: "hsl(222 47% 8%)",
                }}
              >
                От регистрации до предложения — три шага
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-px" style={{ background: "hsl(220 13% 91%)" }}>
              {[
                {
                  n: "01",
                  icon: <UserCircle size={28} />,
                  title: "Confidential профиль",
                  body: "Кандидат описывает опыт, достижения и форматы взаимодействия без раскрытия имени. Компания создаёт запрос с требованиями и вилкой компенсации.",
                  detail: "Каждый профиль верифицируется командой UbXec",
                },
                {
                  n: "02",
                  icon: <Brain size={28} />,
                  title: "AI анализирует совместимость",
                  body: "Алгоритм сопоставляет кандидатов и запросы по опыту, индустрии, компенсации и assessment-профилю. Учитывает формат взаимодействия: найм, ментор, консультант, Advisory Board.",
                  detail: "Обе стороны видят только профессиональные данные",
                },
                {
                  n: "03",
                  icon: <Handshake size={28} />,
                  title: "Взаимный интерес — прямой контакт",
                  body: "Когда обе стороны отметили интерес — контакты раскрываются. Прямой диалог без посредников и агентских комиссий.",
                  detail: "Email-уведомление в момент раскрытия",
                },
              ].map(({ n, icon, title, body, detail }) => (
                <div key={n} className="group p-10 bg-white transition-all duration-300 hover:bg-stone-50">
                  <div className="flex items-center gap-4 mb-6">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors group-hover:bg-stone-100"
                      style={{ background: "hsl(220 14% 95%)", color: "hsl(38 52% 48%)" }}
                    >
                      {icon}
                    </div>
                    <span
                      style={{
                        fontFamily: "var(--font-playfair), Georgia, serif",
                        fontSize: "2.5rem",
                        fontWeight: 700,
                        color: "hsl(220 13% 91%)",
                        lineHeight: 1,
                      }}
                    >
                      {n}
                    </span>
                  </div>
                  <h3 style={{ fontSize: "1.0625rem", fontWeight: 600, color: "hsl(222 47% 8%)", marginBottom: "0.75rem", lineHeight: 1.3 }}>
                    {title}
                  </h3>
                  <p style={{ fontSize: "0.875rem", color: "hsl(220 9% 46%)", lineHeight: 1.7, marginBottom: "1rem" }}>
                    {body}
                  </p>
                  <p style={{ fontSize: "0.75rem", color: "hsl(38 52% 48%)", fontWeight: 500 }}>
                    — {detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── ASSESSMENT SECTION ────────────────────────────────────────── */}
        <section
          className="py-28 px-6"
          style={{ background: "hsl(222 47% 7%)" }}
        >
          <div className="max-w-6xl mx-auto">
            <div
              className="absolute pointer-events-none"
              style={{
                background: "radial-gradient(ellipse 60% 60% at 70% 50%, rgba(184,149,90,0.07), transparent)",
                inset: 0,
              }}
            />
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "hsl(38 60% 62%)" }}>
                  Assessment-driven
                </p>
                <h2
                  style={{
                    fontFamily: "var(--font-playfair), Georgia, serif",
                    fontSize: "clamp(2rem, 4vw, 2.75rem)",
                    fontWeight: 700,
                    lineHeight: 1.2,
                    letterSpacing: "-0.02em",
                    color: "hsl(40 33% 96%)",
                    marginBottom: "1.5rem",
                  }}
                >
                  Не просто профиль —
                  <br />
                  <span style={{ color: "hsl(38 52% 55%)", fontStyle: "italic" }}>оценённый руководитель</span>
                </h2>
                <p style={{ fontSize: "0.9375rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.8, marginBottom: "2rem" }}>
                  Каждый кандидат проходит профессиональный assessment. AI генерирует flash-report
                  с управленческим профилем, сильными сторонами и рисками. Компании видят
                  не только опыт, но и стиль лидерства.
                </p>
                <div className="space-y-3">
                  {[
                    { icon: <Brain size={15} />, text: "DISC, MBTI, Hogan — стандарты мировой практики" },
                    { icon: <Award size={15} />, text: "AI flash-report с интерпретацией для каждого кандидата" },
                    { icon: <Target size={15} />, text: "Совместимость кандидата и CEO по Hogan-профилю" },
                    { icon: <BarChart3 size={15} />, text: "Фильтрация по assessment-параметрам и управленческому стилю" },
                  ].map(({ icon, text }) => (
                    <div key={text} className="flex items-start gap-3">
                      <span
                        className="mt-0.5 shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ background: "rgba(184,149,90,0.15)", color: "hsl(38 60% 62%)" }}
                      >
                        {icon}
                      </span>
                      <span style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.6 }}>{text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Flash-report", desc: "AI-интерпретация assessment за 24 часа", icon: <Zap size={20} /> },
                  { label: "Hogan Compatibility", desc: "Анализ совместимости с CEO компании", icon: <Target size={20} /> },
                  { label: "Management Style", desc: "Стиль лидерства и принятия решений", icon: <Brain size={20} /> },
                  { label: "Deep-dive Session", desc: "Разбор результатов с ассессором", icon: <MessageSquare size={20} /> },
                ].map(({ label, desc, icon }) => (
                  <div
                    key={label}
                    className="rounded-xl p-5"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                      style={{ background: "rgba(184,149,90,0.12)", color: "hsl(38 60% 62%)" }}
                    >
                      {icon}
                    </div>
                    <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "hsl(40 33% 92%)", marginBottom: "0.375rem" }}>
                      {label}
                    </p>
                    <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.35)", lineHeight: 1.5 }}>{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── FOR WHO ───────────────────────────────────────────────────── */}
        <section className="py-28 px-6" style={{ background: "hsl(220 14% 97%)" }}>
          <div className="max-w-6xl mx-auto">
            <div className="max-w-xl mb-16">
              <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "hsl(38 52% 48%)" }}>
                Аудитория
              </p>
              <h2
                style={{
                  fontFamily: "var(--font-playfair), Georgia, serif",
                  fontSize: "clamp(2rem, 4vw, 2.75rem)",
                  fontWeight: 700,
                  lineHeight: 1.2,
                  letterSpacing: "-0.02em",
                  color: "hsl(222 47% 8%)",
                }}
              >
                Создан для лидеров,
                <br />ценящих конфиденциальность
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Candidates */}
              <div className="relative overflow-hidden rounded-2xl p-10" style={{ background: "hsl(222 47% 7%)" }}>
                <div
                  className="absolute top-0 right-0 w-48 h-48 pointer-events-none"
                  style={{ background: "radial-gradient(circle, rgba(184,149,90,0.15), transparent 70%)" }}
                />
                <div
                  className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase"
                  style={{ background: "rgba(184,149,90,0.12)", color: "hsl(38 60% 62%)" }}
                >
                  <UserCircle size={13} />
                  Для топ-менеджеров
                </div>
                <h3
                  style={{
                    fontFamily: "var(--font-playfair), Georgia, serif",
                    fontSize: "1.75rem",
                    fontWeight: 700,
                    color: "hsl(40 33% 96%)",
                    marginBottom: "0.75rem",
                    lineHeight: 1.2,
                  }}
                >
                  CEO, CFO, CTO, COO
                  <br />и другие C-level роли
                </h3>
                <p style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.35)", marginBottom: "1.5rem" }}>
                  Найм в штат · Ментор · Консультант · Advisory Board
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    { icon: <Lock size={13} />, text: "Поиск без риска для текущей позиции" },
                    { icon: <Brain size={13} />, text: "Бесплатный assessment и AI flash-report" },
                    { icon: <ShieldCheck size={13} />, text: "Вы контролируете раскрытие данных" },
                    { icon: <Sparkles size={13} />, text: "Только релевантные предложения" },
                    { icon: <Briefcase size={13} />, text: "Несколько форматов: штат, ментор, advisory" },
                    { icon: <BadgeCheck size={13} />, text: "Бесплатно для кандидатов навсегда" },
                  ].map(({ icon, text }) => (
                    <li key={text} className="flex gap-3 items-start">
                      <span
                        className="mt-0.5 shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background: "rgba(184,149,90,0.15)", color: "hsl(38 60% 62%)" }}
                      >
                        {icon}
                      </span>
                      <span style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>{text}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/auth/register?role=CANDIDATE"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all hover:gap-3"
                  style={{ background: "hsl(38 52% 48%)", color: "#fff" }}
                >
                  Создать confidential профиль →
                </Link>
              </div>

              {/* Companies */}
              <div
                className="relative overflow-hidden rounded-2xl p-10 border"
                style={{ background: "#fff", borderColor: "hsl(220 13% 91%)" }}
              >
                <div
                  className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase"
                  style={{ background: "hsl(220 14% 94%)", color: "hsl(38 52% 42%)" }}
                >
                  <Building2 size={13} />
                  Для компаний и фондов
                </div>
                <h3
                  style={{
                    fontFamily: "var(--font-playfair), Georgia, serif",
                    fontSize: "1.75rem",
                    fontWeight: 700,
                    color: "hsl(222 47% 8%)",
                    marginBottom: "0.75rem",
                    lineHeight: 1.2,
                  }}
                >
                  Корпорации,
                  <br />PE-фонды, стартапы
                </h3>
                <p style={{ fontSize: "0.8125rem", color: "hsl(220 9% 60%)", marginBottom: "1.5rem" }}>
                  Найм в штат · Ментор для CEO · Консультант · Advisory Board
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    { icon: <Building2 size={13} />, text: "Поиск для портфельных и дочерних компаний" },
                    { icon: <EyeOff size={13} />, text: "Скрытый поиск — не раскрывайте позицию публично" },
                    { icon: <Brain size={13} />, text: "Assessment-driven — оценённые кандидаты с профилем" },
                    { icon: <Target size={13} />, text: "Hogan compatibility с профилем CEO" },
                    { icon: <Users size={13} />, text: "Доступ к пассивным C-level кандидатам" },
                    { icon: <Zap size={13} />, text: "Фиксированный абонемент без % от зарплаты" },
                  ].map(({ icon, text }) => (
                    <li key={text} className="flex gap-3 items-start">
                      <span
                        className="mt-0.5 shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background: "hsl(220 14% 94%)", color: "hsl(222 47% 35%)" }}
                      >
                        {icon}
                      </span>
                      <span style={{ fontSize: "0.875rem", color: "hsl(220 9% 46%)", lineHeight: 1.6 }}>{text}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/auth/register?role=COMPANY"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all border hover:bg-stone-50"
                  style={{ borderColor: "hsl(222 47% 8%)", color: "hsl(222 47% 8%)" }}
                >
                  Разместить запрос →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── QUOTE ─────────────────────────────────────────────────────── */}
        <section className="py-28 px-6 bg-white">
          <div className="max-w-3xl mx-auto text-center">
            <p
              style={{
                fontFamily: "var(--font-playfair), Georgia, serif",
                fontSize: "clamp(1.5rem, 3vw, 2.25rem)",
                fontWeight: 600,
                lineHeight: 1.4,
                color: "hsl(222 47% 8%)",
                letterSpacing: "-0.01em",
              }}
            >
              «Лучшие назначения происходят конфиденциально,
              <br className="hidden sm:block" /> по взаимному выбору и на основе реальной оценки»
            </p>
            <div className="w-12 h-px mx-auto mt-8" style={{ background: "hsl(38 52% 48%)" }} />
          </div>
        </section>

        {/* ── DIFFERENTIATORS ───────────────────────────────────────────── */}
        <section className="py-28 px-6" style={{ background: "hsl(220 14% 97%)" }}>
          <div className="max-w-6xl mx-auto">
            <div className="max-w-xl mb-16">
              <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "hsl(38 52% 48%)" }}>
                Отличия
              </p>
              <h2
                style={{
                  fontFamily: "var(--font-playfair), Georgia, serif",
                  fontSize: "clamp(2rem, 4vw, 2.75rem)",
                  fontWeight: 700,
                  lineHeight: 1.2,
                  letterSpacing: "-0.02em",
                  color: "hsl(222 47% 8%)",
                }}
              >
                Почему UbXec — другой уровень
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                {
                  icon: <EyeOff size={22} />,
                  title: "Confidential Search",
                  body: "Двусторонняя конфиденциальность. Кандидат не раскрывает себя публично. Компания ведёт скрытый поиск. Контакты открываются только при взаимном интересе.",
                },
                {
                  icon: <Brain size={22} />,
                  title: "AI-powered & Assessment",
                  body: "Мэтчинг учитывает не только опыт и компенсацию, но и assessment-профиль кандидата: управленческий стиль, DISC, Hogan. Точнее любого ручного подбора.",
                },
                {
                  icon: <Award size={22} />,
                  title: "Premium Community",
                  body: "Только верифицированные C-level специалисты. Ручная проверка каждого профиля командой UbXec. Никаких случайных кандидатов — только реальный топ-уровень.",
                },
              ].map(({ icon, title, body }) => (
                <div
                  key={title}
                  className="group rounded-2xl p-8 border bg-white transition-all hover:shadow-md hover:-translate-y-0.5 duration-200"
                  style={{ borderColor: "hsl(220 13% 91%)" }}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                    style={{ background: "hsl(220 14% 95%)", color: "hsl(38 52% 48%)" }}
                  >
                    {icon}
                  </div>
                  <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "hsl(222 47% 8%)", marginBottom: "0.5rem" }}>
                    {title}
                  </h3>
                  <p style={{ fontSize: "0.875rem", color: "hsl(220 9% 46%)", lineHeight: 1.7 }}>
                    {body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden py-28 px-6" style={{ background: "hsl(222 47% 7%)" }}>
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse 60% 80% at 50% 120%, rgba(184,149,90,0.1), transparent)" }}
          />
          <div className="relative max-w-2xl mx-auto text-center">
            <div
              className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-8"
              style={{ background: "rgba(184,149,90,0.12)", color: "hsl(38 60% 62%)" }}
            >
              <Handshake size={26} />
            </div>
            <h2
              style={{
                fontFamily: "var(--font-playfair), Georgia, serif",
                fontSize: "clamp(2rem, 5vw, 3.5rem)",
                fontWeight: 700,
                lineHeight: 1.15,
                letterSpacing: "-0.02em",
                color: "hsl(40 33% 96%)",
                marginBottom: "1.25rem",
              }}
            >
              Готовы к следующему
              <br />карьерному шагу?
            </h2>
            <p style={{ fontSize: "1.0625rem", color: "rgba(255,255,255,0.45)", marginBottom: "2.5rem", lineHeight: 1.7 }}>
              Регистрация занимает две минуты.
              <br className="hidden sm:block" /> Верификация и assessment — в течение 24 часов.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link
                href="/auth/register?role=CANDIDATE"
                className="group flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold transition-all"
                style={{ background: "hsl(38 52% 48%)", color: "#fff" }}
              >
                <UserCircle size={16} />
                Я топ-менеджер
                <span className="group-hover:translate-x-0.5 transition-transform inline-block">→</span>
              </Link>
              <Link
                href="/auth/register?role=COMPANY"
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold transition-all"
                style={{
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "rgba(255,255,255,0.7)",
                  background: "rgba(255,255,255,0.04)",
                }}
              >
                <Building2 size={16} />
                Я компания
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer style={{ background: "hsl(222 47% 5%)", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "rgba(255,255,255,0.35)", fontSize: "0.875rem" }}>
            UbXec
          </span>
          <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.2)" }}>
            © 2026 · Premium Executive Search Platform · Москва
          </p>
          <div className="flex gap-5">
            <Link href="/pricing" style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.3)" }}>Тарифы</Link>
            <Link href="/auth/login" style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.3)" }}>Войти</Link>
            <Link href="/auth/register" style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.3)" }}>Регистрация</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
