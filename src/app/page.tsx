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
  Route,
  ClipboardList,
  FileText,
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
    <div className="min-h-screen flex flex-col" style={{ fontFamily: "var(--font-sans)" }}>

      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50"
        style={{ background: "hsl(var(--ink-800))", borderBottom: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div className="max-w-6xl mx-auto px-7 h-16 flex items-center justify-between">
          <span
            style={{ fontFamily: "var(--font-display)", fontSize: 21, fontWeight: 700, color: "hsl(var(--warm-white))", letterSpacing: "-0.01em" }}
          >
            Ub<span style={{ color: "var(--accent)" }}>X</span>ec
          </span>
          <nav className="flex gap-0.5 items-center">
            <Link
              href="/pricing"
              className="flex items-center gap-1.5 text-sm px-3.5 py-2 rounded-lg transition-colors"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              Тарифы
            </Link>
            <Link
              href="/auth/login"
              className="flex items-center gap-1.5 text-sm px-3.5 py-2 rounded-lg transition-colors"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              Войти
            </Link>
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2.5 rounded-lg transition-all"
              style={{ background: "var(--accent)", color: "#fff" }}
            >
              Начать <ChevronRight size={14} />
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">

        {/* ── HERO ──────────────────────────────────────────────────────── */}
        <section
          className="relative overflow-hidden hero-grid"
          style={{ background: "hsl(var(--ink-800))", minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center" }}
        >
          {/* Accent glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ backgroundImage: "radial-gradient(ellipse 80% 50% at 50% -10%, var(--accent-glow), transparent)" }}
          />
          {/* Ambient glow right */}
          <div
            className="absolute pointer-events-none"
            style={{ right: "-10%", top: "10%", width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, var(--accent-glow-strong) 0%, transparent 65%)" }}
          />

          <div className="relative max-w-6xl mx-auto px-7 py-20 w-full">
            <div style={{ maxWidth: 680 }}>

              {/* Eyebrow — neutral, not accent */}
              <div
                className="inline-flex items-center gap-2 mb-8 animate-fade-up"
                style={{
                  border: "1px solid rgba(255,255,255,0.10)",
                  borderRadius: "100px",
                  padding: "6px 16px 6px 10px",
                  background: "rgba(255,255,255,0.04)",
                }}
              >
                <span className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.08)" }}>
                  <Sparkles size={11} color="rgba(255,255,255,0.5)" />
                </span>
                <span className="text-[10px] font-bold tracking-[0.10em] uppercase" style={{ color: "rgba(255,255,255,0.45)" }}>
                  Premium AI-powered Executive Search
                </span>
              </div>

              {/* Headline */}
              <h1
                className="animate-fade-up-delay-1"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(3rem, 7vw, 5.5rem)",
                  fontWeight: 700,
                  lineHeight: 1.08,
                  letterSpacing: "-0.03em",
                  color: "hsl(var(--warm-white))",
                  marginBottom: "3.5rem",
                }}
              >
                Executive<br />
                Search<br />
                <span style={{ color: "var(--accent)", fontStyle: "italic", display: "inline-block", paddingBottom: "0.35em" }}>
                  нового&thinsp;поколения
                </span>
              </h1>

              <p
                className="animate-fade-up-delay-2"
                style={{
                  fontSize: "1.0625rem",
                  lineHeight: 1.78,
                  color: "rgba(255,255,255,0.42)",
                  maxWidth: 480,
                  marginBottom: "2.25rem",
                }}
              >
                Премиальная платформа для confidential найма топ-менеджеров.
                AI-powered мэтчинг с учётом assessment-профиля.
              </p>

              <div className="flex flex-wrap gap-3 mb-8 animate-fade-up-delay-3">
                {/* Primary CTA — accent */}
                <Link
                  href="/auth/register?role=CANDIDATE"
                  className="inline-flex items-center gap-2 rounded-xl text-sm font-bold transition-all"
                  style={{ padding: "14px 26px", background: "var(--accent)", color: "#fff" }}
                >
                  <UserCircle size={16} />
                  Я топ-менеджер
                </Link>
                {/* Secondary CTA — ghost */}
                <Link
                  href="/auth/register?role=COMPANY"
                  className="inline-flex items-center gap-2 rounded-xl text-sm font-semibold transition-all"
                  style={{ padding: "14px 22px", background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.72)", border: "1px solid rgba(255,255,255,0.12)" }}
                >
                  <Building2 size={16} color="rgba(255,255,255,0.55)" />
                  Ищу руководителя
                </Link>
              </div>

              {/* Trust signals — neutral */}
              <div className="flex items-center gap-5 flex-wrap">
                {[
                  { icon: <ShieldCheck size={13} color="rgba(255,255,255,0.22)" />, label: "Бесплатно для кандидатов" },
                  { icon: <EyeOff size={13} color="rgba(255,255,255,0.22)" />,      label: "Confidential search" },
                  { icon: <BadgeCheck size={13} color="rgba(255,255,255,0.22)" />,  label: "Верификация профиля" },
                ].map(({ icon, label }) => (
                  <div key={label} className="flex items-center gap-1.5">
                    {icon}
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.28)" }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── STATS STRIP ───────────────────────────────────────────────── */}
        <section
          style={{
            background: "hsl(var(--ink-700))",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div className="max-w-6xl mx-auto px-7 py-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-0">
              {[
                { icon: <Brain size={15} color="rgba(255,255,255,0.35)" />,      v: "AI",       l: "powered matching" },
                { icon: <EyeOff size={15} color="rgba(255,255,255,0.35)" />,     v: "100%",     l: "confidential search" },
                { icon: <BadgeCheck size={15} color="rgba(255,255,255,0.35)" />, v: "Assessed", l: "verified candidates" },
                { icon: <Clock size={15} color="rgba(255,255,255,0.35)" />,      v: "48ч",      l: "до первого мэтча" },
              ].map(({ icon, v, l }, i) => (
                <div key={l} className="text-center px-4 py-1" style={{ borderRight: i < 3 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                  <div className="flex justify-center mb-2.5">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,255,255,0.05)" }}>
                      {icon}
                    </div>
                  </div>
                  {/* Stat value — accent (brand expression) */}
                  <p style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 700, color: "var(--accent)", lineHeight: 1, marginBottom: 5 }}>{v}</p>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.28)", letterSpacing: "0.04em" }}>{l}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ──────────────────────────────────────────────── */}
        <section className="py-28 px-7 bg-white">
          <div className="max-w-6xl mx-auto">
            <div style={{ maxWidth: 580, marginBottom: 56 }}>
              {/* Eyebrow — slate */}
              <p className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.12em] uppercase mb-3.5" style={{ color: "#94a3b8" }}>
                <Route size={11} color="#94a3b8" />Процесс
              </p>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(2rem, 4vw, 3rem)",
                  fontWeight: 700,
                  lineHeight: 1.15,
                  letterSpacing: "-0.025em",
                  color: "hsl(var(--ink-800))",
                }}
              >
                От регистрации до предложения — три шага
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-px" style={{ background: "hsl(var(--neutral-200))" }}>
              {[
                { icon: <UserCircle size={22} color="#475569" />, n: "01", title: "Confidential профиль",           body: "Опишите опыт без раскрытия имени. Компания создаёт запрос с требованиями. Каждый профиль верифицируется командой UbXec.",                              detail: "Верификация в течение 24 часов" },
                { icon: <Brain size={22} color="#475569" />,      n: "02", title: "AI анализирует совместимость",   body: "Алгоритм сопоставляет по опыту, индустрии, assessment-профилю и формату. Обе стороны видят только профессиональные данные.",                          detail: "DISC · MBTI · Hogan" },
                { icon: <Handshake size={22} color="#475569" />,  n: "03", title: "Взаимный интерес — прямой контакт", body: "Когда обе стороны отметили интерес — контакты раскрываются. Прямой диалог без посредников и комиссий.", detail: "Email-уведомление мгновенно" },
              ].map(({ icon, n, title, body, detail }) => (
                <div key={n} className="bg-white p-11 flex flex-col">
                  <div className="flex items-start justify-between mb-6">
                    {/* Icon box — neutral */}
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: "hsl(var(--neutral-100))" }}>
                      {icon}
                    </div>
                    <span style={{ fontFamily: "var(--font-display)", fontSize: "3rem", fontWeight: 700, color: "hsl(var(--neutral-200))", lineHeight: 1, letterSpacing: "-0.03em" }}>{n}</span>
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "hsl(var(--ink-800))", marginBottom: 10, lineHeight: 1.3 }}>{title}</h3>
                  <p style={{ fontSize: 13, color: "hsl(var(--neutral-500))", lineHeight: 1.78, flex: 1 }}>{body}</p>
                  <div className="flex items-center gap-1.5 mt-5">
                    <BadgeCheck size={12} color="#94a3b8" />
                    <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>{detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── ASSESSMENT ────────────────────────────────────────────────── */}
        <section className="py-28 px-7 relative overflow-hidden" style={{ background: "hsl(var(--ink-800))" }}>
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse 50% 70% at 75% 50%, rgba(255,255,255,0.025), transparent)" }}
          />
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-[72px] items-center relative">
            <div>
              {/* Eyebrow — neutral on dark */}
              <p className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.12em] uppercase mb-4" style={{ color: "rgba(255,255,255,0.3)" }}>
                <ClipboardList size={11} color="rgba(255,255,255,0.3)" />Assessment-driven
              </p>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(2rem, 4vw, 3rem)",
                  fontWeight: 700,
                  lineHeight: 1.22,
                  letterSpacing: "-0.025em",
                  color: "hsl(var(--warm-white))",
                  marginBottom: 48,
                }}
              >
                Не просто профиль —<br />
                <span style={{ color: "var(--accent)", fontStyle: "italic", display: "inline-block", paddingBottom: "0.5em" }}>оценённый руководитель</span>
              </h2>
              <p style={{ fontSize: 15, color: "rgba(255,255,255,0.40)", lineHeight: 1.8, marginBottom: 32 }}>
                Каждый кандидат проходит профессиональный assessment. AI генерирует flash-report
                с управленческим профилем, сильными сторонами и рисками.
              </p>
              <div className="flex flex-col gap-3.5">
                {[
                  { icon: <Brain size={14} color="rgba(255,255,255,0.4)" />,    text: "DISC, MBTI, Hogan — стандарты мировой практики" },
                  { icon: <FileText size={14} color="rgba(255,255,255,0.4)" />, text: "AI flash-report с интерпретацией профиля" },
                  { icon: <Target size={14} color="rgba(255,255,255,0.4)" />,   text: "Совместимость кандидата и CEO по Hogan" },
                  { icon: <BarChart3 size={14} color="rgba(255,255,255,0.4)" />,text: "Фильтрация по management style" },
                ].map(({ icon, text }) => (
                  <div key={text} className="flex items-center gap-3">
                    {/* Icon box — muted, neutral */}
                    <div className="w-[30px] h-[30px] rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,0.06)" }}>
                      {icon}
                    </div>
                    <span style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>{text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3.5">
              {[
                { icon: <Zap size={18} color="rgba(255,255,255,0.5)" />,           label: "Flash-report",       desc: "AI-интерпретация за 24 часа" },
                { icon: <Target size={18} color="rgba(255,255,255,0.5)" />,        label: "Hogan Compatibility", desc: "Совместимость с CEO" },
                { icon: <Brain size={18} color="rgba(255,255,255,0.5)" />,         label: "Management Style",   desc: "Стиль лидерства и решений" },
                { icon: <MessageSquare size={18} color="rgba(255,255,255,0.5)" />, label: "Deep-dive Session",  desc: "Разбор с ассессором" },
              ].map(({ icon, label, desc }) => (
                <div key={label} className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div className="w-[38px] h-[38px] rounded-[10px] flex items-center justify-center mb-4" style={{ background: "rgba(255,255,255,0.07)" }}>
                    {icon}
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "hsl(40 33% 92%)", marginBottom: 5 }}>{label}</p>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.28)", lineHeight: 1.55 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FOR WHO ───────────────────────────────────────────────────── */}
        <section className="py-28 px-7" style={{ background: "hsl(var(--neutral-50))" }}>
          <div className="max-w-6xl mx-auto">
            <div style={{ maxWidth: 560, marginBottom: 56 }}>
              <p className="text-[10px] font-bold tracking-[0.12em] uppercase mb-3.5" style={{ color: "#94a3b8" }}>
                Аудитория
              </p>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(2rem, 4vw, 3rem)",
                  fontWeight: 700,
                  lineHeight: 1.15,
                  letterSpacing: "-0.025em",
                  color: "hsl(var(--ink-800))",
                }}
              >
                Создан для лидеров,<br />ценящих конфиденциальность
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Candidates */}
              <div className="relative overflow-hidden rounded-2xl p-10" style={{ background: "hsl(var(--ink-800))" }}>
                <div
                  className="absolute top-0 right-0 w-48 h-48 pointer-events-none"
                  style={{ background: "radial-gradient(circle, var(--accent-glow-strong), transparent 70%)" }}
                />
                <div
                  className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-[0.10em] uppercase"
                  style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.10)" }}
                >
                  <UserCircle size={13} color="rgba(255,255,255,0.45)" />
                  Для топ-менеджеров
                </div>
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.75rem",
                    fontWeight: 700,
                    color: "hsl(var(--warm-white))",
                    marginBottom: "0.75rem",
                    lineHeight: 1.2,
                  }}
                >
                  CEO, CFO, CTO, COO<br />и другие C-level роли
                </h3>
                <p style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.35)", marginBottom: "1.5rem" }}>
                  Найм в штат · Ментор · Консультант · Advisory Board
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    { icon: <Lock size={13} />,       text: "Поиск без риска для текущей позиции" },
                    { icon: <Brain size={13} />,      text: "Бесплатный assessment и AI flash-report" },
                    { icon: <ShieldCheck size={13} />,text: "Вы контролируете раскрытие данных" },
                    { icon: <Sparkles size={13} />,   text: "Только релевантные предложения" },
                    { icon: <Briefcase size={13} />,  text: "Несколько форматов: штат, ментор, advisory" },
                    { icon: <BadgeCheck size={13} />, text: "Бесплатно для кандидатов навсегда" },
                  ].map(({ icon, text }) => (
                    <li key={text} className="flex gap-3 items-start">
                      <span
                        className="mt-0.5 shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.5)" }}
                      >
                        {icon}
                      </span>
                      <span style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>{text}</span>
                    </li>
                  ))}
                </ul>
                {/* CTA — accent */}
                <Link
                  href="/auth/register?role=CANDIDATE"
                  className="inline-flex items-center gap-2 rounded-xl text-sm font-semibold transition-all hover:gap-3"
                  style={{ padding: "12px 22px", background: "var(--accent)", color: "#fff" }}
                >
                  Создать confidential профиль →
                </Link>
              </div>

              {/* Companies */}
              <div
                className="relative overflow-hidden rounded-2xl p-10 border"
                style={{ background: "#fff", borderColor: "hsl(var(--neutral-200))" }}
              >
                <div
                  className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-[0.10em] uppercase"
                  style={{ background: "hsl(var(--neutral-100))", color: "#64748b" }}
                >
                  <Building2 size={13} color="#64748b" />
                  Для компаний и фондов
                </div>
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.75rem",
                    fontWeight: 700,
                    color: "hsl(var(--ink-800))",
                    marginBottom: "0.75rem",
                    lineHeight: 1.2,
                  }}
                >
                  Корпорации,<br />PE-фонды, стартапы
                </h3>
                <p style={{ fontSize: "0.8125rem", color: "hsl(var(--neutral-500))", marginBottom: "1.5rem" }}>
                  Найм в штат · Ментор для CEO · Консультант · Advisory Board
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    { icon: <Building2 size={13} />, text: "Поиск для портфельных и дочерних компаний" },
                    { icon: <EyeOff size={13} />,    text: "Скрытый поиск — не раскрывайте позицию публично" },
                    { icon: <Brain size={13} />,     text: "Assessment-driven — оценённые кандидаты с профилем" },
                    { icon: <Target size={13} />,    text: "Hogan compatibility с профилем CEO" },
                    { icon: <Users size={13} />,     text: "Доступ к пассивным C-level кандидатам" },
                    { icon: <Zap size={13} />,       text: "Фиксированный абонемент без % от зарплаты" },
                  ].map(({ icon, text }) => (
                    <li key={text} className="flex gap-3 items-start">
                      <span
                        className="mt-0.5 shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background: "hsl(var(--neutral-100))", color: "#64748b" }}
                      >
                        {icon}
                      </span>
                      <span style={{ fontSize: "0.875rem", color: "hsl(var(--neutral-500))", lineHeight: 1.6 }}>{text}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/auth/register?role=COMPANY"
                  className="inline-flex items-center gap-2 rounded-xl text-sm font-semibold transition-all border hover:bg-slate-50"
                  style={{ padding: "12px 22px", borderColor: "hsl(var(--ink-800))", color: "hsl(var(--ink-800))" }}
                >
                  Разместить запрос →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── DIFFERENTIATORS ───────────────────────────────────────────── */}
        <section className="py-28 px-7" style={{ background: "hsl(var(--neutral-50))" }}>
          <div className="max-w-6xl mx-auto">
            <div style={{ maxWidth: 560, marginBottom: 56 }}>
              <p className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.12em] uppercase mb-3.5" style={{ color: "#94a3b8" }}>
                <Award size={11} color="#94a3b8" />Отличия
              </p>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(2rem, 4vw, 3rem)",
                  fontWeight: 700,
                  lineHeight: 1.15,
                  letterSpacing: "-0.025em",
                  color: "hsl(var(--ink-800))",
                }}
              >
                Почему UbXec — другой уровень
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { icon: <EyeOff size={22} color="#475569" />,    title: "Confidential Search",    body: "Двусторонняя анонимность. Контакты открываются только при взаимном интересе обеих сторон." },
                { icon: <Brain size={22} color="#475569" />,     title: "AI-powered & Assessment", body: "Мэтчинг учитывает опыт, компенсацию и assessment-профиль. Точнее любого ручного подбора." },
                { icon: <BadgeCheck size={22} color="#475569" />,title: "Premium Community",       body: "Только верифицированные C-level специалисты. Ручная проверка каждого профиля командой UbXec." },
              ].map(({ icon, title, body }) => (
                <div
                  key={title}
                  className="rounded-[18px] p-8 border bg-white transition-all hover:shadow-md hover:-translate-y-0.5 duration-200"
                  style={{ borderColor: "hsl(var(--neutral-200))" }}
                >
                  {/* Icon box — neutral */}
                  <div className="w-[46px] h-[46px] rounded-[13px] flex items-center justify-center mb-5" style={{ background: "hsl(var(--neutral-100))" }}>
                    {icon}
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: "hsl(var(--ink-800))", marginBottom: 10 }}>{title}</h3>
                  <p style={{ fontSize: 13, color: "hsl(var(--neutral-500))", lineHeight: 1.78 }}>{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── QUOTE ─────────────────────────────────────────────────────── */}
        <section className="py-20 px-7 bg-white text-center">
          <div className="max-w-3xl mx-auto">
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.4rem, 3vw, 2rem)",
                fontWeight: 600,
                lineHeight: 1.45,
                color: "hsl(var(--ink-800))",
                letterSpacing: "-0.02em",
              }}
            >
              «Лучшие назначения происходят конфиденциально,<br className="hidden sm:block" />
              по взаимному выбору и на основе реальной оценки»
            </p>
            {/* Divider — neutral */}
            <div className="w-10 h-0.5 mx-auto mt-7 rounded-full" style={{ background: "hsl(var(--neutral-200))" }} />
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden py-28 px-7 text-center" style={{ background: "hsl(var(--ink-800))" }}>
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse 60% 80% at 50% 120%, var(--accent-glow), transparent)" }}
          />
          <div className="relative max-w-[560px] mx-auto">
            {/* Icon box — neutral */}
            <div
              className="inline-flex items-center justify-center w-14 h-14 rounded-[18px] mb-7"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }}
            >
              <Handshake size={26} color="rgba(255,255,255,0.5)" />
            </div>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2rem, 5vw, 3.5rem)",
                fontWeight: 700,
                lineHeight: 1.12,
                letterSpacing: "-0.025em",
                color: "hsl(var(--warm-white))",
                marginBottom: 16,
              }}
            >
              Готовы к следующему<br />карьерному шагу?
            </h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.38)", marginBottom: 36, lineHeight: 1.78 }}>
              Регистрация — две минуты. Верификация и assessment — 24 часа.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              {/* Primary CTA — accent */}
              <Link
                href="/auth/register?role=CANDIDATE"
                className="inline-flex items-center gap-2 rounded-xl text-sm font-bold transition-all"
                style={{ padding: "14px 26px", background: "var(--accent)", color: "#fff" }}
              >
                <UserCircle size={16} />Я топ-менеджер
              </Link>
              <Link
                href="/auth/register?role=COMPANY"
                className="inline-flex items-center gap-2 rounded-xl text-sm font-semibold transition-all"
                style={{ padding: "14px 22px", background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.65)", border: "1px solid rgba(255,255,255,0.12)" }}
              >
                <Building2 size={16} color="rgba(255,255,255,0.5)" />Я компания
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer style={{ background: "hsl(var(--ink-900))", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="max-w-6xl mx-auto px-7 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 flex-wrap">
          <span style={{ fontFamily: "var(--font-display)", color: "rgba(255,255,255,0.25)", fontSize: 14 }}>UbXec</span>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.15)" }}>© 2026 · Premium Executive Search Platform · Москва</p>
          <div className="flex gap-5">
            {["Тарифы", "Войти", "Регистрация", "Для агентств"].map((l) => (
              <Link key={l} href={l === "Тарифы" ? "/pricing" : l === "Войти" ? "/auth/login" : l === "Регистрация" ? "/auth/register" : "/agencies"}
                style={{ fontSize: 11, color: "rgba(255,255,255,0.22)" }}>
                {l}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
