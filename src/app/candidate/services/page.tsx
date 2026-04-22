import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CandidateNav } from "@/components/layout/candidate-nav";
import {
  MessageCircle,
  FileText,
  Users,
  TrendingUp,
  ShieldCheck,
  BookOpen,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Дополнительные услуги — UbXec",
};

const services = [
  {
    icon: FileText,
    title: "Ревью профиля",
    description:
      "Эксперт UbXec разберёт ваш профиль, укажет на слабые места и поможет сформулировать достижения в формате, который привлекает внимание компаний.",
    tag: "Разово",
    price: "15 000 ₽",
    benefits: [
      "Анализ достижений и их оцифровка",
      "Корректировка позиционирования",
      "Рекомендации по индустрии и роли",
      "Ответ в течение 48 часов",
    ],
    cta: "Заказать ревью",
  },
  {
    icon: MessageCircle,
    title: "Карьерная консультация",
    description:
      "60-минутная сессия с executive-коучем: разбор вашего карьерного трека, стратегия поиска позиции, работа с нарративом для переговоров с компаниями.",
    tag: "Разово",
    price: "25 000 ₽",
    benefits: [
      "Разбор карьерных целей",
      "Стратегия выхода на рынок",
      "Работа с ожиданиями по компенсации",
      "Запись сессии",
    ],
    cta: "Записаться на сессию",
  },
  {
    icon: BookOpen,
    title: "Подготовка к интервью",
    description:
      "Mock-интервью C-level формата с разбором: случай из практики, вопросы на стратегическое мышление, переговоры по офферу. Два раунда с обратной связью.",
    tag: "2 сессии",
    price: "40 000 ₽",
    benefits: [
      "2 mock-интервью по 60 минут",
      "Разбор кейсов и ситуационных вопросов",
      "Обратная связь после каждой сессии",
      "Шпаргалка по типичным вопросам",
    ],
    cta: "Начать подготовку",
  },
  {
    icon: TrendingUp,
    title: "Персональный бенчмарк",
    description:
      "Детальный отчёт о вашей позиции на рынке: компенсация, конкуренция по ролям, востребованность вашего профиля у компаний. Основан на закрытых данных платформы.",
    tag: "Отчёт",
    price: "20 000 ₽",
    benefits: [
      "Анализ компенсации по рынку",
      "Конкурентный профиль (анонимно)",
      "Тренды по вашей отрасли",
      "PDF-отчёт на 10 страниц",
    ],
    cta: "Заказать отчёт",
  },
  {
    icon: Users,
    title: "Нетворкинг-мероприятия",
    description:
      "Закрытые встречи C-level руководителей: форматы boardroom dinner, roundtable, отраслевые сессии. Анонимность при регистрации сохраняется до очного знакомства.",
    tag: "Подписка",
    price: "10 000 ₽ / мес",
    benefits: [
      "2–4 мероприятия в месяц",
      "Закрытая Telegram-группа участников",
      "Тематические экспертные сессии",
      "Приоритетный доступ к специальным событиям",
    ],
    cta: "Подключиться",
  },
  {
    icon: ShieldCheck,
    title: "Приоритетная верификация",
    description:
      "Ускоренная проверка и верификация профиля в течение 24 часов с персональным разбором от команды UbXec. Подходит, если нужно выйти на рынок быстро.",
    tag: "Разово",
    price: "5 000 ₽",
    benefits: [
      "Верификация за 24 часа",
      "Персональный фидбек по профилю",
      "Рекомендации по заполнению",
      "Прямой контакт с командой",
    ],
    cta: "Ускорить верификацию",
  },
];

export default async function CandidateServicesPage() {
  const session = await auth();
  if (!session) redirect("/auth/login");

  return (
    <div className="dash-bg">
      <CandidateNav active="services" />

      {/* Dark header */}
      <div className="dash-hero">
        <div className="max-w-5xl mx-auto px-5 pt-10 pb-2 relative z-10">
          <p className="text-xs font-bold tracking-widest uppercase mb-2"
            style={{ color: "rgba(255,255,255,0.35)" }}>Кандидат</p>
          <h1
            className="text-3xl font-bold tracking-tight"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "hsl(40 33% 96%)" }}
          >
            Дополнительные услуги
          </h1>
          <p className="text-sm mt-1 leading-relaxed max-w-2xl" style={{ color: "rgba(255,255,255,0.4)" }}>
            Инструменты для тех, кто хочет выйти на рынок подготовленным
          </p>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-5 pt-6 pb-10 space-y-6 -mt-2">

        {/* Service cards */}
        <div className="grid md:grid-cols-2 gap-5">
          {services.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.title} className="pc p-6 flex flex-col group hover:shadow-[0_2px_8px_rgba(0,0,0,0.08),0_8px_24px_rgba(0,0,0,0.06)] transition-all duration-200">
                {/* Card header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-slate-600" />
                  </div>
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-500">
                    {s.tag}
                  </span>
                </div>

                <h3 className="text-base font-semibold text-slate-900 mb-1">{s.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed flex-1">{s.description}</p>

                {/* Benefits */}
                <ul className="mt-4 space-y-1.5">
                  {s.benefits.map((b) => (
                    <li key={b} className="text-sm text-slate-600 flex items-start gap-2">
                      <span className="text-slate-300 mt-0.5 shrink-0">·</span>
                      {b}
                    </li>
                  ))}
                </ul>

                {/* Footer */}
                <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-50">
                  <span className="text-base font-bold text-slate-900">{s.price}</span>
                  <a
                    href="mailto:support@ubxec.ru"
                    className="text-xs font-semibold px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                  >
                    {s.cta}
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Custom package CTA */}
        <div className="pc p-6 flex items-center justify-between gap-6">
          <div>
            <p className="text-sm font-semibold text-slate-800">Нужна индивидуальная программа?</p>
            <p className="text-sm text-slate-500 mt-0.5">
              Свяжитесь с командой UbXec — составим пакет под ваши задачи и временной горизонт.
            </p>
          </div>
          <a
            href="mailto:support@ubxec.ru"
            className="shrink-0 text-sm font-semibold px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors"
          >
            Написать нам
          </a>
        </div>
      </main>
    </div>
  );
}
