import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CandidateNav } from "@/components/layout/candidate-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    <div className="min-h-screen bg-muted/30">
      <CandidateNav active="services" />

      <main className="max-w-5xl mx-auto px-4 py-10 space-y-10">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Дополнительные услуги</h1>
          <p className="text-muted-foreground text-sm max-w-2xl">
            Инструменты для тех, кто хочет выйти на рынок подготовленным — с правильным профилем,
            ясной стратегией и конкурентным пониманием своей стоимости.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {services.map((s) => {
            const Icon = s.icon;
            return (
              <Card key={s.title} className="flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <Badge variant="secondary" className="text-xs">{s.tag}</Badge>
                  </div>
                  <CardTitle className="text-base mt-3">{s.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{s.description}</p>
                </CardHeader>
                <CardContent className="flex flex-col flex-1 space-y-4">
                  <ul className="space-y-1.5 flex-1">
                    {s.benefits.map((b) => (
                      <li key={b} className="text-sm flex items-start gap-2">
                        <span className="text-primary mt-0.5">·</span>
                        {b}
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="font-semibold text-sm">{s.price}</span>
                    <Button size="sm" variant="outline" asChild>
                      <a href="mailto:support@ubxec.ru">{s.cta}</a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-5 flex items-start justify-between gap-4">
            <div>
              <p className="font-medium">Нужна индивидуальная программа?</p>
              <p className="text-sm text-muted-foreground mt-1">
                Свяжитесь с командой UbXec — составим пакет под ваши задачи и временной горизонт.
              </p>
            </div>
            <Button variant="outline" size="sm" asChild className="shrink-0">
              <a href="mailto:support@ubxec.ru">Написать нам</a>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
