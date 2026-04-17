import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { saveCompanyProfile } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const SIZE_OPTIONS = [
  { value: "STARTUP", label: "Стартап (до 50 чел)" },
  { value: "SMALL", label: "Малый бизнес (50–200)" },
  { value: "MEDIUM", label: "Средний бизнес (200–1000)" },
  { value: "LARGE", label: "Крупный (1000+)" },
];

export default async function CompanyOnboarding() {
  const session = await auth();
  if (!session) redirect("/auth/login");

  const existing = await prisma.companyProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (existing) redirect("/company/dashboard");

  async function save(formData: FormData) {
    "use server";
    const s = await auth();
    if (!s) redirect("/auth/login");
    await saveCompanyProfile(formData, s.user.id);
  }

  return (
    <div className="min-h-screen bg-muted/30 py-10 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-8 text-center space-y-3">
          <div className="inline-flex items-center gap-2 text-xs text-muted-foreground bg-background border rounded-full px-3 py-1">
            <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">1</span>
            Шаг 1 из 2 — Профиль компании
          </div>
          <h1 className="text-3xl font-bold">Создайте профиль компании</h1>
          <p className="text-muted-foreground">
            После заполнения вы сможете создавать позиции и получать анонимные мэтчи
            с верифицированными C-level кандидатами.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {[
            { step: "1", label: "Профиль компании", desc: "Сейчас", active: true },
            { step: "2", label: "Создайте позицию", desc: "После регистрации", active: false },
          ].map(({ step, label, desc, active }) => (
            <div
              key={step}
              className={`text-center p-3 rounded-lg border text-sm ${active ? "bg-primary/5 border-primary/30" : "bg-background"}`}
            >
              <div className={`w-6 h-6 rounded-full font-bold text-xs flex items-center justify-center mx-auto mb-1.5 ${active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                {step}
              </div>
              <p className={`font-medium text-sm ${active ? "text-primary" : ""}`}>{label}</p>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>

        {/* Why use UbXec */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { icon: "🎯", title: "Только C-level", desc: "Верифицированные CFO, CTO, COO, CEO" },
            { icon: "🔒", title: "Анонимный поиск", desc: "Компания скрыта до взаимного интереса" },
            { icon: "🤖", title: "AI-мэтчинг", desc: "Скоринг по отрасли, роли, компенсации" },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="bg-background border rounded-lg p-3 text-center">
              <div className="text-2xl mb-1">{icon}</div>
              <p className="font-medium text-sm">{title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
            </div>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Информация о компании</CardTitle>
            <CardDescription>
              Компания остаётся анонимной для кандидатов до взаимного интереса — можно указать реальное название.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={save} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Название компании *</Label>
                  <Input id="companyName" name="companyName" placeholder="ООО Пример" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Отрасль *</Label>
                  <Input id="industry" name="industry" placeholder="Финтех, Ритейл, Промышленность..." required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="size">Размер компании *</Label>
                <select
                  id="size"
                  name="size"
                  required
                  className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Выберите...</option>
                  {SIZE_OPTIONS.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">О компании *</Label>
                <Textarea
                  id="description"
                  name="description"
                  rows={4}
                  placeholder="Кратко о компании, продукте, стадии, миссии — кандидаты увидят это после взаимного интереса"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Сайт</Label>
                <Input id="website" name="website" type="url" placeholder="https://example.ru" />
                <p className="text-xs text-muted-foreground">Показывается кандидатам только при взаимном мэтче</p>
              </div>

              <div className="pt-2 space-y-3">
                <Button type="submit" className="w-full" size="lg">
                  Создать профиль и перейти к позициям
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  Следующий шаг — создание позиции и запуск AI-мэтчинга
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
