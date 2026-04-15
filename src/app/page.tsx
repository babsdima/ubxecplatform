import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata: Metadata = {
  title: "UbXec — Анонимный маркетплейс для Executive Search",
  description:
    "Найм топ-менеджеров без посредников: C-level кандидаты и компании встречаются анонимно. Контакт раскрывается только при взаимном интересе.",
  openGraph: {
    title: "UbXec — Анонимный маркетплейс для Executive Search",
    description:
      "Найм топ-менеджеров без посредников. Скрытый профиль до взаимного интереса. Нет холодных звонков. Нет утечек. Прямой контакт.",
  },
};
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
} from "lucide-react";

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
        style={{
          background: "hsl(222 47% 7%)",
          borderColor: "rgba(255,255,255,0.07)",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span
            className="text-xl font-bold tracking-tight"
            style={{
              fontFamily: "var(--font-playfair), Georgia, serif",
              color: "hsl(40 33% 96%)",
            }}
          >
            UbXec
          </span>
          <nav className="flex gap-2 items-center">
            <Link
              href="/pricing"
              className="nav-ghost-link px-4 py-2 text-sm rounded-lg transition-colors"
            >
              Тарифы
            </Link>
            <Link
              href="/auth/login"
              className="nav-ghost-link px-4 py-2 text-sm rounded-lg transition-colors"
            >
              Войти
            </Link>
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-all"
              style={{ background: "hsl(38 52% 48%)", color: "#fff" }}
            >
              Начать бесплатно
              <ChevronRight size={14} />
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">

        {/* ── HERO ──────────────────────────────────────────────────────── */}
        <section
          className="relative overflow-hidden hero-grid"
          style={{
            background: "hsl(222 47% 7%)",
            minHeight: "calc(100vh - 64px)",
            display: "flex",
            alignItems: "center",
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(184,149,90,0.12), transparent)",
            }}
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
                  Executive Search Platform
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
                Топ-менеджеры
                <br />
                находят{" "}
                <span style={{ color: "hsl(38 52% 55%)", fontStyle: "italic" }}>лучшее</span>
                <br />
                молча
              </h1>

              <p
                className="animate-fade-up-delay-2"
                style={{
                  fontSize: "1.125rem",
                  lineHeight: 1.7,
                  color: "rgba(255,255,255,0.5)",
                  maxWidth: "520px",
                  marginBottom: "2.5rem",
                }}
              >
                Анонимный маркетплейс для C-level найма в России.
                Алгоритм подбирает пары по индустрии, роли и компенсации.
                Данные обеих сторон раскрываются только при взаимном интересе.
              </p>

              <div className="flex flex-wrap gap-3 animate-fade-up-delay-3">
                <Link
                  href="/auth/register?role=CANDIDATE"
                  className="group flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold transition-all"
                  style={{ background: "hsl(40 33% 96%)", color: "hsl(222 47% 8%)" }}
                >
                  <UserCircle size={16} />
                  Я ищу позицию
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
                  Ищу кандидата
                </Link>
              </div>

              <p className="mt-5 text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
                Бесплатно для кандидатов · Без публичного резюме · Верификация каждого профиля
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
                { value: "C-level", label: "только топ-роли", icon: <TrendingUp size={16} /> },
                { value: "100%", label: "анонимность до мэтча", icon: <EyeOff size={16} /> },
                { value: "0 ₽", label: "для кандидатов", icon: <BadgeCheck size={16} /> },
                { value: "48ч", label: "до первого мэтча", icon: <Clock size={16} /> },
              ].map(({ value, label, icon }) => (
                <div key={label}>
                  <div
                    className="flex justify-center mb-2"
                    style={{ color: "rgba(255,255,255,0.2)" }}
                  >
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
                  title: "Создайте анонимный профиль",
                  body: "Кандидат описывает опыт и достижения без имени. Компания создаёт позицию с требованиями и вилкой компенсации.",
                  detail: "Профиль проверяет администратор платформы",
                },
                {
                  n: "02",
                  icon: <Sparkles size={28} />,
                  title: "Алгоритм подбирает пары",
                  body: "Система автоматически сопоставляет кандидатов и позиции по индустрии, функциональному фокусу и уровню компенсации.",
                  detail: "Обе стороны видят только профессиональные данные",
                },
                {
                  n: "03",
                  icon: <Handshake size={28} />,
                  title: "Взаимный интерес — раскрытие",
                  body: "Когда обе стороны отметили «Интересует» — контакты открываются и вы выходите на прямой диалог без посредников.",
                  detail: "Уведомление на email в момент раскрытия",
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
                        transition: "color 0.3s",
                      }}
                      className="group-hover:text-stone-300"
                    >
                      {n}
                    </span>
                  </div>
                  <h3
                    style={{
                      fontSize: "1.0625rem",
                      fontWeight: 600,
                      color: "hsl(222 47% 8%)",
                      marginBottom: "0.75rem",
                      lineHeight: 1.3,
                    }}
                  >
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
                Создан для тех, кто ценит конфиденциальность
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Candidates */}
              <div
                className="relative overflow-hidden rounded-2xl p-10"
                style={{ background: "hsl(222 47% 7%)" }}
              >
                <div
                  className="absolute top-0 right-0 w-48 h-48 pointer-events-none"
                  style={{ background: "radial-gradient(circle, rgba(184,149,90,0.15), transparent 70%)" }}
                />
                <div
                  className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase"
                  style={{ background: "rgba(184,149,90,0.12)", color: "hsl(38 60% 62%)" }}
                >
                  <UserCircle size={13} />
                  Для кандидатов
                </div>
                <h3
                  style={{
                    fontFamily: "var(--font-playfair), Georgia, serif",
                    fontSize: "1.75rem",
                    fontWeight: 700,
                    color: "hsl(40 33% 96%)",
                    marginBottom: "1.5rem",
                    lineHeight: 1.2,
                  }}
                >
                  CEO, CFO, CTO, COO
                  <br />и другие C-level роли
                </h3>
                <ul className="space-y-3 mb-8">
                  {[
                    { icon: <Lock size={13} />, text: "Поиск без риска для текущей позиции" },
                    { icon: <Sparkles size={13} />, text: "Только релевантные предложения" },
                    { icon: <ShieldCheck size={13} />, text: "Вы контролируете раскрытие данных" },
                    { icon: <BadgeCheck size={13} />, text: "Верификация открывает лучшие позиции" },
                    { icon: <TrendingUp size={13} />, text: "Бесплатно навсегда" },
                  ].map(({ icon, text }) => (
                    <li key={text} className="flex gap-3 items-start">
                      <span
                        className="mt-0.5 shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background: "rgba(184,149,90,0.15)", color: "hsl(38 60% 62%)" }}
                      >
                        {icon}
                      </span>
                      <span style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>
                        {text}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/auth/register?role=CANDIDATE"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all hover:gap-3"
                  style={{ background: "hsl(38 52% 48%)", color: "#fff" }}
                >
                  Создать профиль →
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
                  Для компаний
                </div>
                <h3
                  style={{
                    fontFamily: "var(--font-playfair), Georgia, serif",
                    fontSize: "1.75rem",
                    fontWeight: 700,
                    color: "hsl(222 47% 8%)",
                    marginBottom: "1.5rem",
                    lineHeight: 1.2,
                  }}
                >
                  Корпорации,
                  <br />PE-фонды, стартапы
                </h3>
                <ul className="space-y-3 mb-8">
                  {[
                    { icon: <Building2 size={13} />, text: "Поиск для портфельных компаний" },
                    { icon: <EyeOff size={13} />, text: "Анонимные позиции — не раскрывайте детали раньше времени" },
                    { icon: <ShieldCheck size={13} />, text: "Верифицированные кандидаты C-level" },
                    { icon: <Users size={13} />, text: "Доступ к пассивным кандидатам с рынка" },
                    { icon: <Zap size={13} />, text: "Мэтчинг без участия рекрутера" },
                    { icon: <TrendingUp size={13} />, text: "Фиксированный абонемент без % от зарплаты" },
                  ].map(({ icon, text }) => (
                    <li key={text} className="flex gap-3 items-start">
                      <span
                        className="mt-0.5 shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background: "hsl(220 14% 94%)", color: "hsl(222 47% 35%)" }}
                      >
                        {icon}
                      </span>
                      <span style={{ fontSize: "0.875rem", color: "hsl(220 9% 46%)", lineHeight: 1.6 }}>
                        {text}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/auth/register?role=COMPANY"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all border hover:bg-stone-50"
                  style={{ borderColor: "hsl(222 47% 8%)", color: "hsl(222 47% 8%)" }}
                >
                  Разместить позицию →
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
              «Лучшие переходы в карьере происходят
              <br className="hidden sm:block" /> тихо и по взаимному выбору»
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
                Не hh.ru и не агентство
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                {
                  icon: <EyeOff size={22} />,
                  title: "Анонимность",
                  body: "Ни компания, ни кандидат не знают друг о друге до взаимного интереса. Это принципиально отличает нас от hh.ru и LinkedIn.",
                },
                {
                  icon: <Sparkles size={22} />,
                  title: "Умный мэтчинг",
                  body: "Алгоритм сопоставляет по десяткам параметров. Вы получаете только те предложения, которые реально соответствуют вашему уровню.",
                },
                {
                  icon: <Users size={22} />,
                  title: "Без посредников",
                  body: "Никаких консультантов и их комиссий. После раскрытия контактов вы общаетесь напрямую. Платформа берёт только абонемент.",
                },
              ].map(({ icon, title, body }) => (
                <div
                  key={title}
                  className="group rounded-2xl p-8 border bg-white transition-all hover:shadow-md hover:-translate-y-0.5 duration-200"
                  style={{ borderColor: "hsl(220 13% 91%)" }}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 transition-colors"
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
        <section
          className="relative overflow-hidden py-28 px-6"
          style={{ background: "hsl(222 47% 7%)" }}
        >
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
              Готовы к следующему шагу?
            </h2>
            <p
              style={{
                fontSize: "1.0625rem",
                color: "rgba(255,255,255,0.45)",
                marginBottom: "2.5rem",
                lineHeight: 1.7,
              }}
            >
              Регистрация занимает две минуты. Мы верифицируем
              <br className="hidden sm:block" /> ваш профиль в течение 24 часов.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link
                href="/auth/register?role=CANDIDATE"
                className="group flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold transition-all"
                style={{ background: "hsl(38 52% 48%)", color: "#fff" }}
              >
                <UserCircle size={16} />
                Я кандидат
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
      <footer
        style={{
          background: "hsl(222 47% 5%)",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span
            style={{
              fontFamily: "var(--font-playfair), Georgia, serif",
              color: "rgba(255,255,255,0.35)",
              fontSize: "0.875rem",
            }}
          >
            UbXec
          </span>
          <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.2)" }}>
            © 2025 · Executive Search Platform · Москва
          </p>
          <div className="flex gap-5">
            <Link href="/auth/login" style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.3)" }}>
              Войти
            </Link>
            <Link href="/auth/register" style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.3)" }}>
              Регистрация
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
