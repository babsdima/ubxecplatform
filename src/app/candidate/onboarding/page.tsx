import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { saveCandidateProfile } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default async function CandidateOnboarding() {
  const session = await auth();
  if (!session) redirect("/auth/login");

  const existing = await prisma.candidateProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (existing) redirect("/candidate/dashboard");

  async function save(formData: FormData) {
    "use server";
    const s = await auth();
    if (!s) redirect("/auth/login");
    await saveCandidateProfile(formData, s.user.id);
  }

  return (
    <div className="min-h-screen bg-muted/30 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Создайте свой профиль</h1>
          <p className="text-muted-foreground mt-2">
            Ваши контактные данные остаются скрытыми — компании видят только профессиональную информацию
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Профессиональная информация</CardTitle>
            <CardDescription>
              Эти данные используются для подбора релевантных позиций
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={save} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currentTitle">Текущая должность *</Label>
                  <Input id="currentTitle" name="currentTitle" placeholder="CFO, CTO, COO..." required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="functionalFocus">Функциональный фокус *</Label>
                  <Input id="functionalFocus" name="functionalFocus" placeholder="Финансы, Технологии..." required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="industry">Отрасль *</Label>
                  <Input id="industry" name="industry" placeholder="Финтех, Ритейл..." required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="yearsExperience">Лет опыта *</Label>
                  <Input id="yearsExperience" name="yearsExperience" type="number" min={1} max={50} placeholder="10" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="achievements">Ключевые достижения *</Label>
                <Textarea
                  id="achievements"
                  name="achievements"
                  rows={4}
                  placeholder="Вывел компанию на IPO, управлял P&L > 5 млрд руб., масштабировал команду с 20 до 150..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Ожидания по компенсации (руб/год) *</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="salaryMin" className="text-xs text-muted-foreground">От</Label>
                    <Input id="salaryMin" name="salaryMin" type="number" placeholder="10000000" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salaryMax" className="text-xs text-muted-foreground">До</Label>
                    <Input id="salaryMax" name="salaryMax" type="number" placeholder="20000000" required />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="locationPref">Предпочтения по локации *</Label>
                <Input id="locationPref" name="locationPref" placeholder="Москва, Удалённо..." required />
              </div>

              <Button type="submit" className="w-full" size="lg">
                Создать профиль и перейти к мэтчам
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
