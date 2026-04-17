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

        <Card>
          <CardHeader>
            <CardTitle>Параметры позиции</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={create} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Должность *</Label>
                  <Input id="title" name="title" placeholder="CFO, CTO, COO..." required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Отрасль *</Label>
                  <Input id="industry" name="industry" placeholder="Финансы, Технологии..." required />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Вилка компенсации (руб/год) *</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="salaryMin" className="text-xs text-muted-foreground">От</Label>
                    <Input id="salaryMin" name="salaryMin" type="number" placeholder="10000000" required />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="salaryMax" className="text-xs text-muted-foreground">До</Label>
                    <Input id="salaryMax" name="salaryMax" type="number" placeholder="20000000" required />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Описание позиции *</Label>
                <Textarea
                  id="description"
                  name="description"
                  rows={4}
                  placeholder="Задачи, контекст, что важно..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="requirements">Требования *</Label>
                <Textarea
                  id="requirements"
                  name="requirements"
                  rows={3}
                  placeholder="Обязательный опыт, навыки, образование..."
                  required
                />
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
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="isAnonymous" name="isAnonymous" className="h-4 w-4" />
                <Label htmlFor="isAnonymous" className="cursor-pointer">
                  Конфиденциальный поиск (компания скрыта до взаимного интереса)
                </Label>
              </div>

              <Button type="submit" className="w-full" size="lg">
                Опубликовать позицию и запустить мэтчинг
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
