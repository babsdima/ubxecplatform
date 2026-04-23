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
  CalendarDays,
  Layers,
  TrendingUp,
  Star,
  Network,
  Coffee,
  Mic2,
  DollarSign,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "UbXec — Платформа для топ-менеджеров и компаний",
  description:
    "Премиальная платформа: executive search нового поколения, confidential hiring, assessment, развитие и сильное leadership-комьюнити в одном месте.",
  openGraph: {
    title: "UbXec — Платформа для топ-менеджеров и компаний",
    description:
      "Executive search, confidential hiring, AI-powered matching, assessment и leadership-комьюнити для топ-менеджеров и компаний.",
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
          <span style={{ fontFamily: "var(--font-display)", fontSize: 21, fontWeight: 700, color: "hsl(var(--warm-white))", letterSpacing: "-0.01em" }}>
            Ub<span style={{ color: "var(--accent)" }}>X</span>ec
          </span>
          <nav className="hidden md:flex gap-0.5 items-center">
            <Link href="/community" className="text-sm px-3.5 py-2 rounded-lg transition-colors" style={{ color: "rgba(255,255,255,0.45)" }}>Комьюнити</Link>
            <Link href="/pricing"   className="text-sm px-3.5 py-2 rounded-lg transition-colors" style={{ color: "rgba(255,255,255,0.45)" }}>Тарифы</Link>
            <Link href="/auth/login" className="text-sm px-3.5 py-2 rounded-lg transition-colors" style={{ color: "rgba(255,255,255,0.45)" }}>Войти</Link>
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
          <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(ellipse 80% 50% at 50% -10%, var(--accent-glow), transparent)" }} />
          <div className="absolute pointer-events-none" style={{ right: "-10%", top: "10%", width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, var(--accent-glow-strong) 0%, transparent 65%)" }} />

          <div className="relative max-w-6xl mx-auto px-7 py-20 w-full">
            <div style={{ maxWidth: 720 }}>

              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 mb-8 animate-fade-up" style={{ border: "1px solid rgba(255,255,255,0.10)", borderRadius: "100px", padding: "6px 16px 6px 10px", background: "rgba(255,255,255,0.04)" }}>
                <span className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.08)" }}>
                  <Sparkles size={11} color="rgba(255,255,255,0.5)" />
                </span>
                <span className="text-[10px] font-bold tracking-[0.10em] uppercase" style={{ color: "rgba(255,255,255,0.45)" }}>
                  Premium AI-powered Executive Platform
                </span>
              </div>

              {/* Headline */}
              <h1
                className="animate-fade-up-delay-1"
                style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.8rem, 6.5vw, 5rem)", fontWeight: 700, lineHeight: 1.08, letterSpacing: "-0.03em", color: "hsl(var(--warm-white))", marginBottom: "1.75rem" }}
              >
                Платформа для<br />топ-менеджеров<br />
                <span style={{ color: "var(--accent)", fontStyle: "italic", display: "inline-block", paddingBottom: "0.35em" }}>и компаний</span>
              </h1>

              <p className="animate-fade-up-delay-2" style={{ fontSize: "1.0625rem", lineHeight: 1.78, color: "rgba(255,255,255,0.42)", maxWidth: 560, marginBottom: "2.25rem" }}>
                Executive Search нового поколения, confidential hiring, карьерные возможности, assessment и сильное leadership-комьюнити — в одном месте.
              </p>

              <div className="flex flex-wrap gap-3 mb-8 animate-fade-up-delay-3">
                <Link href="/auth/register?role=CANDIDATE" className="inline-flex items-center gap-2 rounded-xl text-sm font-bold transition-all" style={{ padding: "14px 26px", background: "var(--accent)", color: "#fff" }}>
                  <UserCircle size={16} />Топ-менеджеру
                </Link>
                <Link href="/auth/register?role=COMPANY" className="inline-flex items-center gap-2 rounded-xl text-sm font-semibold transition-all" style={{ padding: "14px 22px", background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.72)", border: "1px solid rgba(255,255,255,0.12)" }}>
                  <Building2 size={16} color="rgba(255,255,255,0.55)" />Компании
                </Link>
                <Link href="/community" className="inline-flex items-center gap-2 rounded-xl text-sm font-semibold transition-all" style={{ padding: "14px 22px", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.55)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <Users size={16} color="rgba(255,255,255,0.4)" />Вступить в комьюнити
                </Link>
              </div>

              <div className="flex items-center gap-5 flex-wrap">
                {[
                  { icon: <ShieldCheck size={13} />, label: "Бесплатно для кандидатов" },
                  { icon: <EyeOff size={13} />,      label: "Confidential search" },
                  { icon: <BadgeCheck size={13} />,  label: "Верификация профиля" },
                ].map(({ icon, label }) => (
                  <div key={label} className="flex items-center gap-1.5" style={{ color: "rgba(255,255,255,0.22)" }}>
                    {icon}
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.28)" }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── STATS STRIP ───────────────────────────────────────────────── */}
        <section style={{ background: "hsl(var(--ink-700))", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="max-w-6xl mx-auto px-7 py-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-0">
              {[
                { icon: <Brain size={15} />,      v: "AI",       l: "powered matching" },
                { icon: <EyeOff size={15} />,     v: "100%",     l: "confidential search" },
                { icon: <BadgeCheck size={15} />, v: "Assessed", l: "verified candidates" },
                { icon: <Users size={15} />,      v: "Community",l: "leadership network" },
              ].map(({ icon, v, l }, i) => (
                <div key={l} className="text-center px-4 py-1" style={{ borderRight: i < 3 ? "1px solid rgba(255,255,255,0.05)" : "none", color: "rgba(255,255,255,0.35)" }}>
                  <div className="flex justify-center mb-2.5">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,255,255,0.05)" }}>{icon}</div>
                  </div>
                  <p style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 700, color: "var(--accent)", lineHeight: 1, marginBottom: 5 }}>{v}</p>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.28)", letterSpacing: "0.04em" }}>{l}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── ПЛАТФОРМА — КРАТКОЕ ОПИСАНИЕ ──────────────────────────────── */}
        <section className="py-24 px-7 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <p className="text-[10px] font-bold tracking-[0.12em] uppercase mb-4" style={{ color: "#94a3b8" }}>О платформе</p>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-0.025em", color: "hsl(var(--ink-800))", marginBottom: 24 }}>
                  Больше, чем<br />executive search
                </h2>
                <p style={{ fontSize: 15, color: "hsl(var(--neutral-500))", lineHeight: 1.8, marginBottom: 20 }}>
                  Мы создаём премиальную платформу для топ-менеджеров и компаний, где сочетаются executive search, развитие, нетворк и современные AI-инструменты для подбора и оценки лидеров.
                </p>
                <p style={{ fontSize: 15, color: "hsl(var(--neutral-500))", lineHeight: 1.8 }}>
                  Для топ-менеджеров это пространство новых возможностей, роста и сильного профессионального окружения. Для компаний — современный канал поиска, оценки и привлечения executive-талантов.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: <Target size={20} color="#475569" />,    title: "Executive Search",    desc: "AI-powered matching с учётом assessment-профиля" },
                  { icon: <EyeOff size={20} color="#475569" />,    title: "Confidential Hiring",  desc: "Анонимность до взаимного интереса обеих сторон" },
                  { icon: <Brain size={20} color="#475569" />,     title: "Assessment",           desc: "DISC, MBTI, Hogan и AI flash-report" },
                  { icon: <Users size={20} color="#475569" />,     title: "Комьюнити",            desc: "Закрытое leadership-сообщество топ-менеджеров" },
                  { icon: <Handshake size={20} color="#475569" />, title: "Mentoring & Advisory", desc: "Ментор, консультант, Advisory Board" },
                  { icon: <Layers size={20} color="#475569" />,    title: "Executive Services",   desc: "Salary benchmarking, CEO compatibility и другие" },
                ].map(({ icon, title, desc }) => (
                  <div key={title} className="rounded-xl p-4" style={{ background: "hsl(var(--neutral-50))", border: "1px solid hsl(var(--neutral-200))" }}>
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ background: "hsl(var(--neutral-100))" }}>{icon}</div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "hsl(var(--ink-800))", marginBottom: 4 }}>{title}</p>
                    <p style={{ fontSize: 11, color: "hsl(var(--neutral-500))", lineHeight: 1.5 }}>{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── ДЛЯ ТОП-МЕНЕДЖЕРОВ ───────────────────────────────────────── */}
        <section className="py-28 px-7" style={{ background: "hsl(var(--neutral-50))" }}>
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-16 items-start">
              <div>
                <p className="text-[10px] font-bold tracking-[0.12em] uppercase mb-4" style={{ color: "#94a3b8" }}>Для топ-менеджеров</p>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-0.025em", color: "hsl(var(--ink-800))", marginBottom: 20 }}>
                  Новые возможности,<br />развитие и сильное<br />окружение
                </h2>
                <p style={{ fontSize: 15, color: "hsl(var(--neutral-500))", lineHeight: 1.8, marginBottom: 32 }}>
                  Платформа помогает не только находить новые роли, но и усиливать профессиональный капитал.
                </p>
                <div className="space-y-3 mb-8">
                  {[
                    { icon: <Briefcase size={14} />,   text: "Доступ к новым карьерным возможностям" },
                    { icon: <EyeOff size={14} />,      text: "Confidential search при необходимости" },
                    { icon: <Brain size={14} />,       text: "Assessment и AI-интерпретация профиля" },
                    { icon: <Handshake size={14} />,   text: "Mentoring, consulting и Advisory Board" },
                    { icon: <Users size={14} />,       text: "Сильное leadership-комьюнити" },
                    { icon: <CalendarDays size={14} />,text: "Мероприятия, нетворк и профессиональная среда" },
                  ].map(({ icon, text }) => (
                    <div key={text} className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: "hsl(var(--neutral-100))", color: "#64748b" }}>{icon}</div>
                      <span style={{ fontSize: 14, color: "hsl(var(--neutral-600))" }}>{text}</span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link href="/auth/register?role=CANDIDATE" className="inline-flex items-center gap-2 rounded-xl text-sm font-bold" style={{ padding: "12px 22px", background: "var(--accent)", color: "#fff" }}>
                    Создать профиль <ArrowRight size={14} />
                  </Link>
                  <Link href="/auth/register?role=CANDIDATE" className="inline-flex items-center gap-2 rounded-xl text-sm font-medium border" style={{ padding: "12px 18px", borderColor: "hsl(var(--neutral-200))", color: "hsl(var(--neutral-600))" }}>
                    Пройти assessment
                  </Link>
                </div>
              </div>

              {/* ── ДЛЯ КОМПАНИЙ ────────────────────────────────────────── */}
              <div>
                <p className="text-[10px] font-bold tracking-[0.12em] uppercase mb-4" style={{ color: "#94a3b8" }}>Для компаний</p>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-0.025em", color: "hsl(var(--ink-800))", marginBottom: 20 }}>
                  Доступ к сильным<br />executive-лидерам<br />в любом формате
                </h2>
                <p style={{ fontSize: 15, color: "hsl(var(--neutral-500))", lineHeight: 1.8, marginBottom: 32 }}>
                  Находите и привлекайте топ-менеджеров для найма, mentoring, consulting и Advisory Board.
                </p>
                <div className="space-y-3 mb-8">
                  {[
                    { icon: <Users size={14} />,      text: "Доступ к качественному пулу executive-талантов" },
                    { icon: <EyeOff size={14} />,     text: "Confidential search" },
                    { icon: <Brain size={14} />,      text: "Assessment-driven matching" },
                    { icon: <Handshake size={14} />,  text: "Подбор менторов, консультантов и Advisory Board" },
                    { icon: <DollarSign size={14} />, text: "Salary benchmarking" },
                    { icon: <Target size={14} />,     text: "CEO-candidate compatibility analysis" },
                  ].map(({ icon, text }) => (
                    <div key={text} className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: "hsl(var(--neutral-100))", color: "#64748b" }}>{icon}</div>
                      <span style={{ fontSize: 14, color: "hsl(var(--neutral-600))" }}>{text}</span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link href="/auth/register?role=COMPANY" className="inline-flex items-center gap-2 rounded-xl text-sm font-bold border" style={{ padding: "12px 22px", borderColor: "hsl(var(--ink-800))", color: "hsl(var(--ink-800))" }}>
                    Разместить запрос <ArrowRight size={14} />
                  </Link>
                  <Link href="/pricing" className="inline-flex items-center gap-2 rounded-xl text-sm font-medium border" style={{ padding: "12px 18px", borderColor: "hsl(var(--neutral-200))", color: "hsl(var(--neutral-600))" }}>
                    Узнать про услуги
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── КОМЬЮНИТИ ─────────────────────────────────────────────────── */}
        <section className="py-28 px-7 relative overflow-hidden" style={{ background: "hsl(var(--ink-800))" }}>
          <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(ellipse 80% 60% at 50% -20%, var(--accent-glow), transparent)" }} />
          <div className="max-w-6xl mx-auto relative">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <p className="text-[10px] font-bold tracking-[0.12em] uppercase mb-4" style={{ color: "rgba(255,255,255,0.3)" }}>Leadership-комьюнити</p>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-0.025em", color: "hsl(var(--warm-white))", marginBottom: 20 }}>
                Закрытая среда для<br />
                <span style={{ color: "var(--accent)", fontStyle: "italic", display: "inline-block", paddingBottom: "0.35em" }}>сильных лидеров</span>
              </h2>
              <p style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", lineHeight: 1.8 }}>
                Профессиональные встречи, митапы, конференции, private events и сильный нетворк. Комьюнити помогает находить идеи, связи, партнёрства и новые карьерные возможности.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-12">
              {[
                { icon: <Mic2 size={18} />,        label: "Конференции",         desc: "Тематические leadership-конференции" },
                { icon: <CalendarDays size={18} />, label: "Митапы",              desc: "Регулярные встречи сообщества" },
                { icon: <Star size={18} />,         label: "Закрытые ужины",      desc: "Private events в малых группах" },
                { icon: <Network size={18} />,      label: "Peer-to-peer нетворк",desc: "Прямые связи между лидерами" },
                { icon: <Coffee size={18} />,       label: "Неформальные форматы",desc: "Padel, games, клубные встречи" },
                { icon: <TrendingUp size={18} />,   label: "Leadership Talks",    desc: "Дискуссии об опыте и практиках" },
              ].map(({ icon, label, desc }) => (
                <div key={label} className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div className="w-9 h-9 rounded-[10px] flex items-center justify-center mb-3" style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.5)" }}>{icon}</div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "hsl(40 33% 92%)", marginBottom: 4 }}>{label}</p>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", lineHeight: 1.5 }}>{desc}</p>
                </div>
              ))}
            </div>

            <div className="text-center">
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", marginBottom: 20 }}>
                Для компаний комьюнити — это способ быть ближе к сильной executive-аудитории и усиливать employer brand.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link href="/community" className="inline-flex items-center gap-2 rounded-xl text-sm font-bold" style={{ padding: "12px 22px", background: "var(--accent)", color: "#fff" }}>
                  <Users size={15} />Вступить в комьюнити
                </Link>
                <Link href="/community" className="inline-flex items-center gap-2 rounded-xl text-sm font-medium" style={{ padding: "12px 20px", background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.10)" }}>
                  Ближайшие события
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── ASSESSMENT ────────────────────────────────────────────────── */}
        <section className="py-28 px-7 bg-white">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.12em] uppercase mb-4" style={{ color: "#94a3b8" }}>
                <ClipboardList size={11} color="#94a3b8" />Assessment и развитие
              </p>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700, lineHeight: 1.22, letterSpacing: "-0.025em", color: "hsl(var(--ink-800))", marginBottom: 20 }}>
                Не просто профиль —<br />
                <span style={{ color: "var(--accent)", fontStyle: "italic", display: "inline-block", paddingBottom: "0.35em" }}>оценённый руководитель</span>
              </h2>
              <p style={{ fontSize: 15, color: "hsl(var(--neutral-500))", lineHeight: 1.8, marginBottom: 28 }}>
                Каждый топ-менеджер может получить глубокое понимание своего профессионального профиля. Платформа соединяет карьерные возможности с assessment-подходом — от AI-интерпретации до development plan.
              </p>
              <div className="space-y-3 mb-8">
                {[
                  { icon: <Brain size={14} />,    text: "DISC, MBTI, Hogan — стандарты мировой практики" },
                  { icon: <FileText size={14} />, text: "AI flash-report с интерпретацией профиля" },
                  { icon: <Target size={14} />,   text: "Совместимость кандидата и CEO по Hogan" },
                  { icon: <BarChart3 size={14} />,text: "Фильтрация по management style" },
                ].map(({ icon, text }) => (
                  <div key={text} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: "hsl(var(--neutral-100))", color: "#64748b" }}>{icon}</div>
                    <span style={{ fontSize: 14, color: "hsl(var(--neutral-600))" }}>{text}</span>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 13, color: "hsl(var(--neutral-400))", lineHeight: 1.7 }}>
                Assessment помогает компаниям смотреть на кандидатов глубже, чем через CV и опыт — особенно важно для C-level hiring, mentoring и Advisory Board.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: <Zap size={20} color="#475569" />,           label: "Flash-report",        desc: "AI-интерпретация за 24 часа" },
                { icon: <Target size={20} color="#475569" />,        label: "Hogan Compatibility",  desc: "Совместимость с CEO компании" },
                { icon: <Brain size={20} color="#475569" />,         label: "Management Style",     desc: "Стиль лидерства и решений" },
                { icon: <MessageSquare size={20} color="#475569" />, label: "Deep-dive Session",    desc: "Разбор с ассессором" },
                { icon: <TrendingUp size={20} color="#475569" />,    label: "Development Plan",     desc: "Персональный план развития" },
                { icon: <Award size={20} color="#475569" />,         label: "Positioning Support",  desc: "Карьерное позиционирование" },
              ].map(({ icon, label, desc }) => (
                <div key={label} className="rounded-xl p-4" style={{ background: "hsl(var(--neutral-50))", border: "1px solid hsl(var(--neutral-200))" }}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ background: "hsl(var(--neutral-100))" }}>{icon}</div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "hsl(var(--ink-800))", marginBottom: 4 }}>{label}</p>
                  <p style={{ fontSize: 11, color: "hsl(var(--neutral-500))", lineHeight: 1.5 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── КАК ЭТО РАБОТАЕТ ──────────────────────────────────────────── */}
        <section className="py-28 px-7" style={{ background: "hsl(var(--neutral-50))" }}>
          <div className="max-w-6xl mx-auto">
            <div style={{ maxWidth: 580, marginBottom: 56 }}>
              <p className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.12em] uppercase mb-4" style={{ color: "#94a3b8" }}>
                <Route size={11} color="#94a3b8" />Как это работает
              </p>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-0.025em", color: "hsl(var(--ink-800))" }}>
                От регистрации до нового шага — пять простых этапов
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-px" style={{ background: "hsl(var(--neutral-200))" }}>
              {[
                { n: "01", icon: <UserCircle size={22} color="#475569" />,   title: "Создайте профиль",               body: "Опишите опыт без раскрытия имени. Каждый профиль верифицируется командой UbXec." },
                { n: "02", icon: <Briefcase size={22} color="#475569" />,    title: "Укажите форматы",                body: "Full-time, mentoring, consulting или Advisory Board — выберите то, что подходит вам." },
                { n: "03", icon: <Brain size={22} color="#475569" />,        title: "Пройдите assessment",            body: "Усильте профиль профессиональной оценкой и получите AI flash-report." },
                { n: "04", icon: <Sparkles size={22} color="#475569" />,     title: "Получайте мэтчи",               body: "AI-алгоритм находит релевантные возможности. Просматривайте предложения анонимно." },
                { n: "05", icon: <Handshake size={22} color="#475569" />,    title: "Раскройте контакты",            body: "После взаимного интереса — прямой диалог без посредников и комиссий." },
              ].map(({ n, icon, title, body }) => (
                <div key={n} className="bg-white p-7 flex flex-col">
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "hsl(var(--neutral-100))" }}>{icon}</div>
                    <span style={{ fontFamily: "var(--font-display)", fontSize: "2.5rem", fontWeight: 700, color: "hsl(var(--neutral-200))", lineHeight: 1 }}>{n}</span>
                  </div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: "hsl(var(--ink-800))", marginBottom: 8, lineHeight: 1.3 }}>{title}</h3>
                  <p style={{ fontSize: 12, color: "hsl(var(--neutral-500))", lineHeight: 1.7 }}>{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── ДОПОЛНИТЕЛЬНЫЕ УСЛУГИ ─────────────────────────────────────── */}
        <section className="py-28 px-7 bg-white">
          <div className="max-w-6xl mx-auto">
            <div style={{ maxWidth: 560, marginBottom: 56 }}>
              <p className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.12em] uppercase mb-4" style={{ color: "#94a3b8" }}>
                <Award size={11} color="#94a3b8" />Дополнительные услуги
              </p>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-0.025em", color: "hsl(var(--ink-800))" }}>
                Полный набор executive-сервисов
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: "Для топ-менеджеров",
                  accent: false,
                  items: [
                    "Базовый assessment",
                    "AI-интерпретация профиля",
                    "Deep-dive assessment с экспертом",
                    "Development plan",
                    "Career positioning support",
                    "Доступ к mentoring, consulting и board opportunities",
                  ],
                },
                {
                  title: "Для компаний",
                  accent: true,
                  items: [
                    "Executive search",
                    "Confidential search",
                    "Salary benchmarking",
                    "Executive assessment",
                    "CEO-candidate compatibility analysis",
                    "Advisory Board formation",
                    "Company positioning",
                    "Подбор менторов и консультантов",
                  ],
                },
                {
                  title: "Комьюнити",
                  accent: false,
                  items: [
                    "Доступ ко всем мероприятиям",
                    "Peer networking",
                    "Leadership talks и дискуссии",
                    "Закрытые встречи и ужины",
                    "Для компаний — employer brand",
                    "Партнёрство и sponsorship",
                  ],
                },
              ].map(({ title, accent, items }) => (
                <div key={title} className="rounded-[18px] p-8 border" style={{ borderColor: accent ? "var(--accent)" : "hsl(var(--neutral-200))", background: accent ? "hsl(var(--accent-dim))" : "#fff" }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: "hsl(var(--ink-800))", marginBottom: 20 }}>{title}</h3>
                  <ul className="space-y-2.5">
                    {items.map((item) => (
                      <li key={item} className="flex items-start gap-2.5">
                        <BadgeCheck size={14} style={{ color: accent ? "var(--accent)" : "#94a3b8", marginTop: 1, flexShrink: 0 }} />
                        <span style={{ fontSize: 13, color: "hsl(var(--neutral-600))", lineHeight: 1.5 }}>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── QUOTE ─────────────────────────────────────────────────────── */}
        <section className="py-20 px-7 text-center" style={{ background: "hsl(var(--neutral-50))" }}>
          <div className="max-w-3xl mx-auto">
            <p style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 600, lineHeight: 1.45, color: "hsl(var(--ink-800))", letterSpacing: "-0.02em" }}>
              «Лучшие карьерные решения рождаются не только через вакансии,<br className="hidden sm:block" />
              но и через доверие, нетворк и качественную профессиональную среду»
            </p>
            <div className="w-10 h-0.5 mx-auto mt-7 rounded-full" style={{ background: "hsl(var(--neutral-200))" }} />
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden py-28 px-7 text-center" style={{ background: "hsl(var(--ink-800))" }}>
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 80% at 50% 120%, var(--accent-glow), transparent)" }} />
          <div className="relative max-w-[640px] mx-auto">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-[18px] mb-7" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }}>
              <Handshake size={26} color="rgba(255,255,255,0.5)" />
            </div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 700, lineHeight: 1.12, letterSpacing: "-0.025em", color: "hsl(var(--warm-white))", marginBottom: 16 }}>
              Присоединяйтесь к новому<br />поколению executive search
            </h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.38)", marginBottom: 36, lineHeight: 1.78 }}>
              Создайте профиль, присоединяйтесь к leadership-комьюнити и получайте доступ к новым возможностям, сильным людям и современным инструментам развития.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link href="/auth/register?role=CANDIDATE" className="inline-flex items-center gap-2 rounded-xl text-sm font-bold" style={{ padding: "14px 26px", background: "var(--accent)", color: "#fff" }}>
                <UserCircle size={16} />Создать профиль
              </Link>
              <Link href="/auth/register?role=COMPANY" className="inline-flex items-center gap-2 rounded-xl text-sm font-semibold" style={{ padding: "14px 22px", background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.65)", border: "1px solid rgba(255,255,255,0.12)" }}>
                <Building2 size={16} color="rgba(255,255,255,0.5)" />Разместить запрос
              </Link>
              <Link href="/community" className="inline-flex items-center gap-2 rounded-xl text-sm font-semibold" style={{ padding: "14px 22px", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <Users size={16} color="rgba(255,255,255,0.4)" />Узнать про комьюнити
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer style={{ background: "hsl(var(--ink-900))", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="max-w-6xl mx-auto px-7 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 flex-wrap">
          <span style={{ fontFamily: "var(--font-display)", color: "rgba(255,255,255,0.25)", fontSize: 14 }}>UbXec</span>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.15)" }}>© 2026 · Premium Executive Platform · Москва</p>
          <div className="flex gap-5 flex-wrap justify-center">
            {[
              { label: "Комьюнити",   href: "/community" },
              { label: "Тарифы",      href: "/pricing" },
              { label: "Войти",       href: "/auth/login" },
              { label: "Регистрация", href: "/auth/register" },
              { label: "Для агентств",href: "/agencies" },
            ].map(({ label, href }) => (
              <Link key={label} href={href} style={{ fontSize: 11, color: "rgba(255,255,255,0.22)" }}>{label}</Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
