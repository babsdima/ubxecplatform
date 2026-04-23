import type { Metadata } from "next";
import Link from "next/link";
import {
  Users,
  Mic2,
  CalendarDays,
  Star,
  Network,
  Coffee,
  TrendingUp,
  ChevronRight,
  UserCircle,
  Building2,
  Handshake,
  ArrowRight,
  BadgeCheck,
  MessageSquare,
  Sparkles,
  Globe,
  EyeOff,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Комьюнити лидеров — UbXec",
  description:
    "Закрытое сообщество топ-менеджеров: нетворк, мероприятия, обмен опытом и новые возможности.",
};

const formats = [
  {
    icon: <Mic2 size={22} />,
    label: "Конференции",
    desc: "Тематические leadership-конференции с ведущими спикерами и практиками",
  },
  {
    icon: <CalendarDays size={22} />,
    label: "Митапы",
    desc: "Регулярные встречи в малых группах по отраслям и форматам взаимодействия",
  },
  {
    icon: <Star size={22} />,
    label: "Закрытые ужины",
    desc: "Private events для узкого круга — доверительная атмосфера и глубокий диалог",
  },
  {
    icon: <Network size={22} />,
    label: "Peer-to-peer нетворк",
    desc: "Прямые связи между лидерами без посредников и формальных структур",
  },
  {
    icon: <TrendingUp size={22} />,
    label: "Leadership Talks",
    desc: "Дискуссии об управленческом опыте, стратегиях и вызовах лидерства",
  },
  {
    icon: <MessageSquare size={22} />,
    label: "Peer Groups",
    desc: "Тематические группы по ролям — CFO, CTO, COO — для обмена опытом",
  },
  {
    icon: <Coffee size={22} />,
    label: "Неформальные форматы",
    desc: "Padel, games, клубные встречи — связи строятся не только на конференциях",
  },
  {
    icon: <Globe size={22} />,
    label: "Тематические встречи",
    desc: "Отраслевые и функциональные сессии: технологии, финансы, операции, маркетинг",
  },
];

const forManagers = [
  "Расширение профессионального нетворка",
  "Доступ к опыту коллег из других отраслей",
  "Новые карьерные возможности через связи",
  "Партнёрства и совместные проекты",
  "Обратная связь от равных по уровню",
  "Среда для профессионального роста",
];

const forCompanies = [
  "Близость к сильной executive-аудитории",
  "Усиление employer brand среди топ-талантов",
  "Ранний доступ к будущим лидерам",
  "Участие в профессиональной среде C-level",
  "Партнёрство и sponsorship мероприятий",
  "Прямой диалог с рынком top-level talent",
];

export default function CommunityPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: "var(--font-sans)" }}>

      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50"
        style={{ background: "hsl(var(--ink-800))", borderBottom: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div className="max-w-6xl mx-auto px-7 h-16 flex items-center justify-between">
          <Link
            href="/"
            style={{ fontFamily: "var(--font-display)", fontSize: 21, fontWeight: 700, color: "hsl(var(--warm-white))", letterSpacing: "-0.01em", textDecoration: "none" }}
          >
            Ub<span style={{ color: "var(--accent)" }}>X</span>ec
          </Link>
          <nav className="hidden md:flex gap-0.5 items-center">
            <Link href="/community" className="text-sm px-3.5 py-2 rounded-lg" style={{ color: "#fff", background: "rgba(255,255,255,0.10)" }}>Комьюнити</Link>
            <Link href="/pricing"    className="text-sm px-3.5 py-2 rounded-lg transition-colors" style={{ color: "rgba(255,255,255,0.45)" }}>Тарифы</Link>
            <Link href="/auth/login" className="text-sm px-3.5 py-2 rounded-lg transition-colors" style={{ color: "rgba(255,255,255,0.45)" }}>Войти</Link>
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2.5 rounded-lg"
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
          style={{ background: "hsl(var(--ink-800))", minHeight: "72vh", display: "flex", alignItems: "center" }}
        >
          <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(ellipse 80% 50% at 50% -10%, var(--accent-glow), transparent)" }} />
          <div className="absolute pointer-events-none" style={{ right: "-5%", top: "5%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, var(--accent-glow-strong) 0%, transparent 65%)" }} />

          <div className="relative max-w-6xl mx-auto px-7 py-20 w-full">
            <div style={{ maxWidth: 680 }}>
              <div className="inline-flex items-center gap-2 mb-8" style={{ border: "1px solid rgba(255,255,255,0.10)", borderRadius: "100px", padding: "6px 16px 6px 10px", background: "rgba(255,255,255,0.04)" }}>
                <span className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.08)" }}>
                  <Users size={11} color="rgba(255,255,255,0.5)" />
                </span>
                <span className="text-[10px] font-bold tracking-[0.10em] uppercase" style={{ color: "rgba(255,255,255,0.45)" }}>
                  Leadership Community
                </span>
              </div>

              <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.8rem, 6vw, 5rem)", fontWeight: 700, lineHeight: 1.08, letterSpacing: "-0.03em", color: "hsl(var(--warm-white))", marginBottom: "1.5rem" }}>
                Комьюнити<br />
                <span style={{ color: "var(--accent)", fontStyle: "italic", display: "inline-block", paddingBottom: "0.35em" }}>лидеров</span>
              </h1>

              <p style={{ fontSize: "1.0625rem", lineHeight: 1.78, color: "rgba(255,255,255,0.42)", maxWidth: 520, marginBottom: "2.25rem" }}>
                Закрытая среда для топ-менеджеров: нетворк, мероприятия, обмен опытом и новые возможности. Сильные карьерные решения рождаются через доверие и качественное окружение.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link href="/auth/register" className="inline-flex items-center gap-2 rounded-xl text-sm font-bold" style={{ padding: "14px 26px", background: "var(--accent)", color: "#fff" }}>
                  <Users size={16} />Вступить в комьюнити
                </Link>
                <a href="#events" className="inline-flex items-center gap-2 rounded-xl text-sm font-semibold" style={{ padding: "14px 22px", background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.72)", border: "1px solid rgba(255,255,255,0.12)" }}>
                  Ближайшие события <ArrowRight size={14} />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── ОПИСАНИЕ ──────────────────────────────────────────────────── */}
        <section className="py-24 px-7 bg-white">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-[10px] font-bold tracking-[0.12em] uppercase mb-4" style={{ color: "#94a3b8" }}>О комьюнити</p>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-0.025em", color: "hsl(var(--ink-800))", marginBottom: 24 }}>
                Мы строим не просто платформу
              </h2>
              <p style={{ fontSize: 15, color: "hsl(var(--neutral-500))", lineHeight: 1.8, marginBottom: 20 }}>
                Это пространство, где топ-менеджеры знакомятся, обмениваются опытом, расширяют круг общения, находят идеи, партнёрства и новые карьерные возможности.
              </p>
              <p style={{ fontSize: 15, color: "hsl(var(--neutral-500))", lineHeight: 1.8 }}>
                Сильные карьерные возможности часто рождаются не только через вакансии, но и через связи, доверие и среду. Комьюнити создаёт причину возвращаться на платформу регулярно и помогает формировать настоящее профессиональное окружение.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[
                { v: "C-level", l: "только верифицированные" },
                { v: "Закрытый", l: "формат по инвайту" },
                { v: "8+",       l: "форматов событий" },
              ].map(({ v, l }) => (
                <div key={l} className="rounded-2xl p-5 text-center" style={{ background: "hsl(var(--neutral-50))", border: "1px solid hsl(var(--neutral-200))" }}>
                  <p style={{ fontFamily: "var(--font-display)", fontSize: "1.75rem", fontWeight: 700, color: "var(--accent)", lineHeight: 1, marginBottom: 8 }}>{v}</p>
                  <p style={{ fontSize: 11, color: "hsl(var(--neutral-500))", lineHeight: 1.4 }}>{l}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── ФОРМАТЫ ───────────────────────────────────────────────────── */}
        <section id="events" className="py-28 px-7 relative overflow-hidden" style={{ background: "hsl(var(--ink-800))" }}>
          <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(ellipse 80% 60% at 50% -20%, var(--accent-glow), transparent)" }} />
          <div className="max-w-6xl mx-auto relative">
            <div className="max-w-xl mb-16">
              <p className="text-[10px] font-bold tracking-[0.12em] uppercase mb-4" style={{ color: "rgba(255,255,255,0.3)" }}>Форматы</p>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-0.025em", color: "hsl(var(--warm-white))" }}>
                Что входит в комьюнити
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {formats.map(({ icon, label, desc }) => (
                <div key={label} className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div className="w-10 h-10 rounded-[10px] flex items-center justify-center mb-4" style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.5)" }}>
                    {icon}
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "hsl(40 33% 92%)", marginBottom: 8 }}>{label}</p>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", lineHeight: 1.6 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── ДЛЯ МЕНЕДЖЕРОВ И КОМПАНИЙ ─────────────────────────────────── */}
        <section className="py-28 px-7" style={{ background: "hsl(var(--neutral-50))" }}>
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6">

              {/* Топ-менеджеры */}
              <div className="relative overflow-hidden rounded-3xl p-10" style={{ background: "hsl(var(--ink-800))" }}>
                <div className="absolute top-0 right-0 w-64 h-64 pointer-events-none" style={{ background: "radial-gradient(circle, var(--accent-glow-strong), transparent 70%)" }} />
                <div className="relative">
                  <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-[0.10em] uppercase" style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.10)" }}>
                    <UserCircle size={12} color="rgba(255,255,255,0.45)" />Для топ-менеджеров
                  </div>
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.875rem", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-0.02em", color: "hsl(var(--warm-white))", marginBottom: 12 }}>
                    Профессиональное<br />окружение сильных лидеров
                  </h3>
                  <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", lineHeight: 1.75, marginBottom: 24 }}>
                    Комьюнити помогает расширять нетворк, находить партнёров и быть в среде, которая стимулирует развитие.
                  </p>
                  <ul className="space-y-2.5 mb-8">
                    {forManagers.map((item) => (
                      <li key={item} className="flex items-center gap-3">
                        <BadgeCheck size={14} style={{ color: "var(--accent)", flexShrink: 0 }} />
                        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/auth/register" className="inline-flex items-center gap-2 rounded-xl text-sm font-bold" style={{ padding: "12px 22px", background: "var(--accent)", color: "#fff" }}>
                    Вступить в комьюнити <ArrowRight size={14} />
                  </Link>
                </div>
              </div>

              {/* Компании */}
              <div className="relative overflow-hidden rounded-3xl p-10 border" style={{ background: "#fff", borderColor: "hsl(var(--neutral-200))" }}>
                <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: "linear-gradient(90deg, var(--accent), var(--accent-light))" }} />
                <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-[0.10em] uppercase" style={{ background: "hsl(var(--neutral-100))", color: "#64748b" }}>
                  <Building2 size={12} color="#64748b" />Для компаний
                </div>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.875rem", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-0.02em", color: "hsl(var(--ink-800))", marginBottom: 12 }}>
                  Ближе к сильной<br />executive-аудитории
                </h3>
                <p style={{ fontSize: 14, color: "hsl(var(--neutral-500))", lineHeight: 1.75, marginBottom: 24 }}>
                  Комьюнити — это способ усиливать employer brand, находить будущих лидеров и участвовать в профессиональной среде top-level talent.
                </p>
                <ul className="space-y-2.5 mb-8">
                  {forCompanies.map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <BadgeCheck size={14} style={{ color: "hsl(var(--neutral-400))", flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: "hsl(var(--neutral-600))" }}>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-3">
                  <Link href="/auth/register?role=COMPANY" className="inline-flex items-center gap-2 rounded-xl text-sm font-bold border" style={{ padding: "12px 22px", borderColor: "hsl(var(--ink-800))", color: "hsl(var(--ink-800))" }}>
                    Стать партнёром <ArrowRight size={14} />
                  </Link>
                  <a href="mailto:hello@ubxec.ru" className="inline-flex items-center gap-2 rounded-xl text-sm font-medium border" style={{ padding: "12px 18px", borderColor: "hsl(var(--neutral-200))", color: "hsl(var(--neutral-600))" }}>
                    Обсудить условия
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── ПОЧЕМУ ЭТО ВАЖНО ──────────────────────────────────────────── */}
        <section className="py-24 px-7 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: <EyeOff size={22} color="#475569" />,
                  title: "Закрытый формат",
                  body: "Только верифицированные C-level специалисты. Ручная проверка каждого участника командой UbXec гарантирует качество аудитории.",
                },
                {
                  icon: <Sparkles size={22} color="#475569" />,
                  title: "Среда для возможностей",
                  body: "Лучшие карьерные и партнёрские возможности рождаются через доверие и живые связи. Комьюнити создаёт для этого правильный контекст.",
                },
                {
                  icon: <Handshake size={22} color="#475569" />,
                  title: "Долгосрочная ценность",
                  body: "Профессиональное окружение — это инвестиция в карьеру. Связи, сделанные сегодня, открывают возможности через год и через пять лет.",
                },
              ].map(({ icon, title, body }) => (
                <div key={title} className="rounded-[18px] p-8 border" style={{ borderColor: "hsl(var(--neutral-200))" }}>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5" style={{ background: "hsl(var(--neutral-100))" }}>
                    {icon}
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: "hsl(var(--ink-800))", marginBottom: 10 }}>{title}</h3>
                  <p style={{ fontSize: 13, color: "hsl(var(--neutral-500))", lineHeight: 1.78 }}>{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden py-28 px-7 text-center" style={{ background: "hsl(var(--ink-800))" }}>
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 80% at 50% 120%, var(--accent-glow), transparent)" }} />
          <div className="relative max-w-[580px] mx-auto">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-[18px] mb-7" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }}>
              <Users size={26} color="rgba(255,255,255,0.5)" />
            </div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 700, lineHeight: 1.12, letterSpacing: "-0.025em", color: "hsl(var(--warm-white))", marginBottom: 16 }}>
              Присоединяйтесь к<br />сообществу лидеров
            </h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.38)", marginBottom: 36, lineHeight: 1.78 }}>
              Вступите в комьюнити, участвуйте в событиях и стройте профессиональные связи, которые открывают новые возможности.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link href="/auth/register" className="inline-flex items-center gap-2 rounded-xl text-sm font-bold" style={{ padding: "14px 26px", background: "var(--accent)", color: "#fff" }}>
                <Users size={16} />Вступить в комьюнити
              </Link>
              <a href="mailto:hello@ubxec.ru" className="inline-flex items-center gap-2 rounded-xl text-sm font-semibold" style={{ padding: "14px 22px", background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.65)", border: "1px solid rgba(255,255,255,0.12)" }}>
                Написать организаторам
              </a>
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
              { label: "Главная",     href: "/" },
              { label: "Тарифы",     href: "/pricing" },
              { label: "Войти",      href: "/auth/login" },
              { label: "Регистрация",href: "/auth/register" },
            ].map(({ label, href }) => (
              <Link key={label} href={href} style={{ fontSize: 11, color: "rgba(255,255,255,0.22)" }}>{label}</Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
