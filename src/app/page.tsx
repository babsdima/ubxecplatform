import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span
            className="font-bold text-xl tracking-tight"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            Grade<span style={{ color: "var(--accent)" }}>Up</span>
          </span>
          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-400">
            <Link href="/community" className="hover:text-foreground transition-colors">Комьюнити</Link>
            <Link href="/pricing" className="hover:text-foreground transition-colors">Тарифы</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="text-sm text-slate-400 hover:text-foreground transition-colors"
            >
              Войти
            </Link>
            <Link
              href="/auth/register"
              className="text-sm px-4 py-2 rounded-lg font-medium"
              style={{ background: "var(--accent)", color: "#fff" }}
            >
              Начать
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-40 pb-24 px-6 text-center relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% -10%, var(--accent-glow-strong), transparent)",
          }}
        />
        <div className="relative max-w-4xl mx-auto">
          <p className="eyebrow mb-4">Экосистема для топ-менеджеров</p>
          <h1
            className="text-5xl md:text-7xl font-bold tracking-tight leading-none mb-6"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            Развитие.{" "}
            <span style={{ color: "var(--accent)" }}>Доход.</span>
            <br />
            Возможности.
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            GradeUp — платформа развития и карьерных возможностей для топ-менеджеров.
            Для компаний — быстрый доступ к управленческому таланту и экспертизе.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/auth/register?role=candidate"
              className="px-8 py-3.5 rounded-xl font-semibold text-white transition-all hover:opacity-90"
              style={{ background: "var(--accent)" }}
            >
              Я топ-менеджер
            </Link>
            <Link
              href="/auth/register?role=company"
              className="px-8 py-3.5 rounded-xl font-semibold transition-all"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "hsl(40 33% 96%)",
              }}
            >
              Я компания
            </Link>
            <Link
              href="/community"
              className="px-8 py-3.5 rounded-xl font-semibold transition-all text-slate-400 hover:text-foreground"
            >
              Комьюнити →
            </Link>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="py-10 border-y border-white/5 bg-white/2">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { val: "24–48ч", label: "до shortlist для компаний" },
            { val: "2–3×", label: "дешевле executive search" },
            { val: "5 блоков", label: "развития в одном месте" },
            { val: "C-level", label: "фокус платформы" },
          ].map(({ val, label }) => (
            <div key={label}>
              <div className="text-3xl font-bold mb-1" style={{ color: "var(--accent)" }}>
                {val}
              </div>
              <div className="text-sm text-slate-500">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Platform tagline */}
      <section className="py-20 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <p className="eyebrow mb-3">Больше, чем рекрутинг</p>
          <h2
            className="text-3xl md:text-4xl font-bold mb-5"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            От роста — к доходу — к сделкам
          </h2>
          <p className="text-slate-400 text-lg">
            GradeUp — это не рекрутинговая платформа и не образовательная.
            Это экосистема управления карьерой и экспертизой в одном месте.
          </p>
        </div>
      </section>

      {/* For managers — 4 pillars */}
      <section className="py-10 px-6">
        <div className="max-w-6xl mx-auto">
          <div
            className="rounded-3xl p-10 md:p-14"
            style={{ background: "hsl(222 47% 8%)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <p className="eyebrow mb-2">Для топ-менеджеров</p>
            <h2
              className="text-3xl md:text-4xl font-bold mb-10"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "hsl(40 33% 96%)" }}
            >
              Карьерный рост и новые источники дохода
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  num: "01",
                  title: "Оценка и позиционирование",
                  desc: "Assessment, бенчмарки рынка, понимание своей стоимости и карьерной траектории",
                },
                {
                  num: "02",
                  title: "Развитие и рост",
                  desc: "Индивидуальные планы развития, коучинг, подготовка к переходу на C-level и выше",
                },
                {
                  num: "03",
                  title: "Монетизация экспертизы",
                  desc: "Консультации, advisory, менторство, проектная работа — новые источники дохода",
                },
                {
                  num: "04",
                  title: "Карьерные возможности",
                  desc: "Вакансии уровня топ-менеджмента приходят к вам — match-модель без лишнего шума",
                },
              ].map(({ num, title, desc }) => (
                <div
                  key={num}
                  className="rounded-2xl p-6"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <div
                    className="text-xs font-mono mb-4"
                    style={{ color: "var(--accent)", opacity: 0.8 }}
                  >
                    {num}
                  </div>
                  <h3 className="font-semibold text-white mb-2">{title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <Link
                href="/auth/register?role=candidate"
                className="inline-block px-7 py-3 rounded-xl font-semibold text-white"
                style={{ background: "var(--accent)" }}
              >
                Создать профиль
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* For companies */}
      <section className="py-10 px-6">
        <div className="max-w-6xl mx-auto">
          <div
            className="rounded-3xl p-10 md:p-14"
            style={{
              background: "#fff",
              border: "1px solid rgba(0,0,0,0.06)",
              color: "hsl(222 47% 11%)",
            }}
          >
            <div
              className="h-1 w-16 rounded mb-6"
              style={{ background: "var(--accent)" }}
            />
            <p className="text-sm font-medium tracking-wider uppercase mb-2" style={{ color: "var(--accent)" }}>
              Для компаний
            </p>
            <h2
              className="text-3xl md:text-4xl font-bold mb-3"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              Быстрый доступ к управленческому таланту
            </h2>
            <p className="text-slate-500 mb-10 text-lg">
              В 2–3 раза дешевле и быстрее, чем классический executive search
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: "Скорость",
                  desc: "Long list за 24–48 часов. Прямой контакт с кандидатами без посредников.",
                },
                {
                  title: "Стоимость",
                  desc: "В 2–3 раза дешевле traditional executive search. Гибкие модели оплаты.",
                },
                {
                  title: "Качество",
                  desc: "Кандидаты уже вовлечены в развитие. Возможность проверки через консультацию до оффера.",
                },
                {
                  title: "Экспертиза без найма",
                  desc: "Менторы и консультанты для быстрого закрытия задач — альтернатива консалтингу.",
                },
              ].map(({ title, desc }) => (
                <div
                  key={title}
                  className="rounded-2xl p-6"
                  style={{ background: "#f8f9fb", border: "1px solid rgba(0,0,0,0.06)" }}
                >
                  <h3 className="font-semibold mb-2" style={{ color: "hsl(222 47% 11%)" }}>
                    {title}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <Link
                href="/auth/register?role=company"
                className="inline-block px-7 py-3 rounded-xl font-semibold text-white"
                style={{ background: "var(--accent)" }}
              >
                Найти топ-менеджера
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Platform architecture */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="eyebrow mb-3">Архитектура платформы</p>
            <h2
              className="text-3xl md:text-4xl font-bold"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              Как устроена экосистема
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                layer: "Core",
                title: "Вход и развитие",
                items: ["Assessment и оценка", "Индивидуальные планы (IDP)", "Коучинг", "Комьюнити"],
              },
              {
                layer: "Growth",
                title: "Активация и монетизация",
                items: ["Менторство", "Консультации и advisory", "Peer-to-peer взаимодействие", "Нетворкинг"],
              },
              {
                layer: "Monetization",
                title: "Сделки и найм",
                items: ["Доступ к вакансиям C-level", "Проекты с компаниями", "Найм через платформу", "Безопасные расчёты"],
              },
            ].map(({ layer, title, items }) => (
              <div
                key={layer}
                className="rounded-2xl p-7"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <div
                  className="text-xs font-mono uppercase tracking-widest mb-3"
                  style={{ color: "var(--accent)" }}
                >
                  {layer}
                </div>
                <h3 className="font-semibold text-lg mb-4">{title}</h3>
                <ul className="space-y-2">
                  {items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-slate-400">
                      <span className="mt-1.5 w-1 h-1 rounded-full shrink-0" style={{ background: "var(--accent)" }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community block */}
      <section className="py-10 px-6">
        <div className="max-w-5xl mx-auto">
          <div
            className="rounded-3xl p-10 md:p-14 text-center"
            style={{
              background: "linear-gradient(135deg, hsl(222 47% 9%) 0%, hsl(215 60% 12%) 100%)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <p className="eyebrow mb-3">Комьюнити</p>
            <h2
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "hsl(40 33% 96%)" }}
            >
              Доступ к сильному окружению
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto mb-8 text-lg">
              Закрытые воркшопы, CEO/CFO/CPO встречи, конференции и неформальный нетворкинг.
              Развитие через практику и опыт других.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {["CEO-встречи", "CFO-сессии", "CPO-разборы", "Воркшопы", "Конференции", "Нетворкинг"].map((tag) => (
                <span
                  key={tag}
                  className="px-4 py-2 rounded-full text-sm font-medium"
                  style={{ background: "rgba(255,255,255,0.06)", color: "hsl(40 33% 96%)" }}
                >
                  {tag}
                </span>
              ))}
            </div>
            <Link
              href="/community"
              className="inline-block px-7 py-3 rounded-xl font-semibold text-white"
              style={{ background: "var(--accent)" }}
            >
              Узнать о комьюнити
            </Link>
          </div>
        </div>
      </section>

      {/* Quote */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <blockquote
            className="text-2xl md:text-3xl font-medium leading-snug mb-6"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "hsl(40 33% 96%)" }}
          >
            «GradeUp — это не рекрутинг и не образование.
            Это экосистема управления карьерой и экспертизой.»
          </blockquote>
          <p className="text-slate-500 text-sm">Для кандидатов — рост, доход и возможности. Для компаний — быстрый доступ к таланту и результату.</p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 text-center border-t border-white/5">
        <div className="max-w-2xl mx-auto">
          <h2
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            Готовы начать?
          </h2>
          <p className="text-slate-400 mb-8">
            Присоединяйтесь к платформе — как топ-менеджер или как компания
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/auth/register?role=candidate"
              className="px-8 py-4 rounded-xl font-semibold text-white"
              style={{ background: "var(--accent)" }}
            >
              Я топ-менеджер
            </Link>
            <Link
              href="/auth/register?role=company"
              className="px-8 py-4 rounded-xl font-semibold"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "hsl(40 33% 96%)",
              }}
            >
              Я компания
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-600">
          <span
            className="font-bold"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            Grade<span style={{ color: "var(--accent)" }}>Up</span>
          </span>
          <div className="flex gap-6">
            <Link href="/community" className="hover:text-slate-400 transition-colors">Комьюнити</Link>
            <Link href="/pricing" className="hover:text-slate-400 transition-colors">Тарифы</Link>
            <a href="mailto:hello@gradeup.ru" className="hover:text-slate-400 transition-colors">hello@gradeup.ru</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
