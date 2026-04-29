import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { createMandate } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default async function NewMandatePage() {
  const session = await auth();
  if (!session) redirect("/auth/login");

  const company = await prisma.companyProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!company) redirect("/company/onboarding");

  async function create(formData: FormData) {
    "use server";
    if (!company) redirect("/company/onboarding");
    await createMandate(formData, company.id);
  }

  return (
    <div className="min-h-screen bg-muted/30 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <Link href="/company/mandates" className="text-sm text-muted-foreground hover:text-foreground">
            ← Назад
          </Link>
          <h1 className="text-2xl font-bold">Новая позиция</h1>
        </div>

        {/* What happens after */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { icon: "🤖", label: "AI-мэтчинг", desc: "Запускается сразу после публикации" },
            { icon: "🔒", label: "Анонимность", desc: "Компания скрыта до взаимного интереса" },
            { icon: "⚡", label: "Первые мэтчи", desc: "Появятся в течение нескольких минут" },
          ].map(({ icon, label, desc }) => (
            <div key={label} className="bg-background border rounded-lg p-3 text-center">
              <div className="text-xl mb-1">{icon}</div>
              <p className="font-medium text-sm">{label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
            </div>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Параметры позиции</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={create} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Должность *</Label>
                  <Input id="title" name="title" placeholder="CFO, CTO, COO, CEO..." required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Отрасль *</Label>
                  <Input id="industry" name="industry" placeholder="Финансы, Технологии..." required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mandateType">Тип взаимодействия *</Label>
                <select
                  id="mandateType"
                  name="mandateType"
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="full-time">Найм в штат (full-time)</option>
                  <option value="mentor">Ментор для команды / CEO</option>
                  <option value="consultant">Консультант / Part-time advisor</option>
                  <option value="board">Advisory Board</option>
                </select>
                <p className="text-xs text-muted-foreground">
                  Влияет на мэтчинг — кандидаты видят только релевантные для своих форматов позиции
                </p>
              </div>

              <div className="space-y-2">
                <Label>Вилка компенсации (руб/год) *</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="salaryMin" className="text-xs text-muted-foreground">От</Label>
                    <Input id="salaryMin" name="salaryMin" type="number" placeholder="10 000 000" required />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="salaryMax" className="text-xs text-muted-foreground">До</Label>
                    <Input id="salaryMax" name="salaryMax" type="number" placeholder="20 000 000" required />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Описание позиции *</Label>
                <Textarea
                  id="description"
                  name="description"
                  rows={4}
                  placeholder="Задачи, контекст, команда, стадия компании..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="requirements">Требования к кандидату *</Label>
                <Textarea
                  id="requirements"
                  name="requirements"
                  rows={3}
                  placeholder="Обязательный опыт, отраслевая экспертиза, навыки..."
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Чем конкретнее требования — тем выше качество мэтчей
                </p>
              </div>

              <div className="space-y-3">
                <Label>Статус вакансии *</Label>
                <p className="text-xs text-muted-foreground">
                  Определяет, как вакансия отображается кандидатам
                </p>
                <div className="grid grid-cols-1 gap-2">
                  <label className="flex items-start gap-3 p-4 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors">
                    <input
                      type="radio"
                      name="isAnonymous"
                      value="false"
                      defaultChecked
                      className="h-4 w-4 mt-0.5"
                    />
                    <div>
                      <span className="text-sm font-medium">🌐 Открытая вакансия</span>
                      <p className="text-xs text-muted-foreground mt-1">
                        Название компании видно всем подходящим кандидатам. Вакансия появляется в общем доступе в рамках платформы.
                      </p>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 p-4 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors">
                    <input
                      type="radio"
                      name="isAnonymous"
                      value="true"
                      className="h-4 w-4 mt-0.5"
                    />
                    <div>
                      <span className="text-sm font-medium">🔒 Закрытая вакансия</span>
                      <p className="text-xs text-muted-foreground mt-1">
                        Кандидаты видят только отрасль и описание — без названия компании. Контакты и название раскрываются только при взаимном мэтче.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg">
                Опубликовать и запустить AI-мэтчинг
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
