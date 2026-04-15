import type { Metadata } from "next";
import Link from "next/link";
import { Check, Zap, Building2, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Тарифы для компаний — UbXec",
  description:
    "Фиксированная подписка без процентов от зарплаты. Выберите тариф под размер вашей задачи.",
};

const plans = [
  {
    icon: Zap,
    name: "Стартовый",
    price: "30 000",
    period: "руб / мес",
    description: "Для компаний, которые начинают работу с executive-наймом",
    badge: null,
    features: [
      "2 активные позиции одновременно",
      "До 10 мэтчей на позицию",
      "Анонимный профиль кандидата",
      "Базовые фильтры",
      "Email-уведомления",
      "Поддержка по почте",
    ],
    cta: "Начать",
    href: "/auth/register?role=COMPANY",
    variant: "outline" as const,
  },
  {
    icon: Building2,
    name: "Профессиональный",
    price: "80 000",
    period: "руб / мес",
    description: "Для активного найма — несколько позиций и расширенная аналитика",
    badge: "Популярный",
    features: [
      "10 активных позиций",
      "Неограниченные мэтчи",
      "Расширенный профиль кандидата",
      "Фильтры по индустрии, опыту, роли",
      "Статистика по позициям",
      "Приоритетная поддержка",
      "Онбординг с менеджером",
    ],
    cta: "Выбрать тариф",
    href: "/auth/register?role=COMPANY",
    variant: "default" as const,
  },
  {
    icon: BadgeCheck,
    name: "Корпоративный",
    price: "от 200 000",
    period: "руб / мес",
    description: "Для PE-фондов и крупных компаний с потоком найма",
    badge: null,
    features: [
      "Неограниченные позиции",
      "Неограниченные мэтчи",
      "Выделенный аккаунт-менеджер",
      "SLA по отклику 4 часа",
      "API-интеграция",
      "Закрытый пул pre-verified кандидатов",
      "Ежемесячный отчёт по рынку",
      "Белый лейбл (по запросу)",
    ],
    cta: "Обсудить условия",
    href: "mailto:sales@ubxec.ru",
    variant: "outline" as const,
  },
];

const faq = [
  {
    q: "Есть ли процент от зарплаты или success fee?",
    a: "Нет. UbXec работает только на фиксированной подписке — никаких скрытых платежей и комиссий при закрытии позиции.",
  },
  {
    q: "Можно ли сменить тариф в процессе?",
    a: "Да, в любой момент. При повышении тарифа доступ расширяется сразу, при понижении — с конца расчётного периода.",
  },
  {
    q: "Что происходит с контактами при взаимном интересе?",
    a: "Контакты кандидата раскрываются автоматически при взаимном интересе — на любом тарифе. Количество мэтчей влияет только на число параллельных позиций.",
  },
  {
    q: "Как проверяются кандидаты?",
    a: "Каждый кандидат проходит верификацию администратором UbXec: проверка опыта, достижений и соответствия C-level уровню.",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-muted/30">
      {/* Nav */}
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-bold text-lg">UbXec</Link>
          <div className="flex gap-4 items-center">
            <Link href="/auth/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Войти
            </Link>
            <Button size="sm" asChild>
              <Link href="/auth/register">Регистрация</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-16 space-y-16">
        {/* Hero */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Тарифы для компаний</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Фиксированная подписка без процентов от зарплаты. Для сравнения: стандартное агентство
            берёт 15–25% годового дохода кандидата — при зарплате 15 млн это&nbsp;2–4 млн за одно закрытие.
          </p>
          <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 text-sm px-4 py-2 rounded-full">
            <Check className="w-4 h-4" />
            Экономия до 90% по сравнению с агентским гонораром
          </div>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <Card
                key={plan.name}
                className={`relative flex flex-col ${plan.badge ? "border-primary shadow-md" : ""}`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="px-3">{plan.badge}</Badge>
                  </div>
                )}
                <CardHeader className="pb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <p className="text-muted-foreground text-sm">{plan.description}</p>
                </CardHeader>
                <CardContent className="flex flex-col flex-1 space-y-6">
                  <div>
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground text-sm ml-1">{plan.period}</span>
                  </div>

                  <ul className="space-y-2.5 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Button variant={plan.variant} className="w-full" asChild>
                    <Link href={plan.href}>{plan.cta}</Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* FAQ */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-center">Частые вопросы</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {faq.map(({ q, a }) => (
              <Card key={q}>
                <CardContent className="pt-5 space-y-2">
                  <p className="font-medium text-sm">{q}</p>
                  <p className="text-sm text-muted-foreground">{a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA bottom */}
        <div className="text-center space-y-4 py-8 border-t">
          <h2 className="text-2xl font-bold">Готовы начать?</h2>
          <p className="text-muted-foreground">
            Создайте аккаунт и разместите первую позицию бесплатно в течение 14 дней.
          </p>
          <Button size="lg" asChild>
            <Link href="/auth/register?role=COMPANY">Зарегистрироваться как компания</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
