import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { saveCompanyProfile } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

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
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Профиль компании</h1>
          <p className="text-muted-foreground mt-2">
            Расскажите о себе — это поможет нам подобрать подходящих кандидатов
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Информация о компании</CardTitle>
            <CardDescription>Все поля обязательны</CardDescription>
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
                  <Input id="industry" name="industry" placeholder="Финтех, Ритейл..." required />
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
                  <option value="STARTUP">Стартап (до 50 чел)</option>
                  <option value="SMALL">Малый бизнес (50–200)</option>
                  <option value="MEDIUM">Средний бизнес (200–1000)</option>
                  <option value="LARGE">Крупный (1000+)</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Описание *</Label>
                <Textarea
                  id="description"
                  name="description"
                  rows={4}
                  placeholder="Кратко о компании, продукте, миссии..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Сайт</Label>
                <Input id="website" name="website" type="url" placeholder="https://example.ru" />
              </div>

              <Button type="submit" className="w-full" size="lg">
                Создать профиль
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
