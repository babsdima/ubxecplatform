import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { saveCandidateProfile } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const ENGAGEMENT_OPTIONS = [
  { value: "full-time", label: "Найм в штат (full-time)" },
  { value: "mentor", label: "Ментор для CEO / команды" },
  { value: "consultant", label: "Консультант / Part-time advisor" },
  { value: "board", label: "Advisory Board" },
];

const CAREER_STATUS_OPTIONS = [
  { value: "active_search", label: "В активном поиске", desc: "Открыт к предложениям прямо сейчас" },
  { value: "open_consulting", label: "Готов к консалтингу", desc: "Проектная работа, advisory" },
  { value: "open_mentoring", label: "Готов к менторству", desc: "Развитие команд и руководителей" },
  { value: "open_board", label: "Готов к участию в советах директоров", desc: "Board member, независимый директор" },
];

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

        {/* Header */}
        <div className="mb-8 text-center space-y-3">
          <div className="inline-flex items-center gap-2 text-xs text-muted-foreground bg-background border rounded-full px-3 py-1">
            <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">1</span>
            Шаг 1 из 1 — Профессиональный профиль
          </div>
          <h1 className="text-3xl font-bold">Создайте профиль кандидата</h1>
          <p className="text-muted-foreground">
            Ваши контактные данные остаются скрытыми — компании видят только профессиональную информацию.
            После верификации вы начнёте получать мэтчи с релевантными позициями.
          </p>
        </div>

        {/* What happens next */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { step: "1", label: "Заполните профиль", desc: "Сейчас" },
            { step: "2", label: "Верификация", desc: "До 24 часов" },
            { step: "3", label: "Получайте мэтчи", desc: "После верификации" },
          ].map(({ step, label, desc }) => (
            <div key={step} className="text-center p-3 rounded-lg bg-background border text-sm">
              <div className="w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center mx-auto mb-1.5">
                {step}
              </div>
              <p className="font-medium text-sm">{label}</p>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Профессиональная информация</CardTitle>
            <CardDescription>
              Эти данные используются AI для подбора релевантных позиций. Контакты добавляются отдельно в профиле.
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
                  <Input id="industry" name="industry" placeholder="Финтех, Ритейл, Промышленность..." required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="yearsExperience">Лет опыта на C-level *</Label>
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
                <p className="text-xs text-muted-foreground">
                  Используйте конкретные цифры и результаты — это повышает качество мэтчинга
                </p>
              </div>

              <div className="space-y-2">
                <Label>Ожидания по компенсации (руб/год) *</Label>
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
                <Label htmlFor="locationPref">Предпочтения по локации *</Label>
                <Input id="locationPref" name="locationPref" placeholder="Москва, Удалённо, Москва / Удалённо..." required />
              </div>

              <div className="space-y-3">
                <Label>Форматы взаимодействия *</Label>
                <p className="text-xs text-muted-foreground">
                  Выберите один или несколько форматов — это влияет на то, какие позиции вы будете видеть
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {ENGAGEMENT_OPTIONS.map(({ value, label }) => (
                    <label
                      key={value}
                      className="flex items-center gap-2 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        name="engagementFormats"
                        value={value}
                        defaultChecked={value === "full-time"}
                        className="h-4 w-4"
                      />
                      <span className="text-sm">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label>Карьерный статус *</Label>
                <p className="text-xs text-muted-foreground">
                  Выберите один или несколько — это показывает компаниям, к чему вы открыты прямо сейчас
                </p>
                <div className="space-y-2">
                  {CAREER_STATUS_OPTIONS.map(({ value, label, desc }) => (
                    <label
                      key={value}
                      className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        name="careerStatuses"
                        value={value}
                        className="h-4 w-4 mt-0.5"
                      />
                      <div>
                        <span className="text-sm font-medium">{label}</span>
                        <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label>Видимость профиля *</Label>
                <p className="text-xs text-muted-foreground">
                  Определяет, кто и когда видит вашу личность
                </p>
                <div className="grid grid-cols-1 gap-2">
                  <label className="flex items-start gap-3 p-4 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors">
                    <input
                      type="radio"
                      name="profileVisibility"
                      value="anonymous"
                      defaultChecked
                      className="h-4 w-4 mt-0.5"
                    />
                    <div>
                      <span className="text-sm font-medium flex items-center gap-2">
                        🔒 Анонимный профиль
                      </span>
                      <p className="text-xs text-muted-foreground mt-1">
                        Имя, компания и контакты скрыты. Раскрываются только при взаимном интересе — когда и вы, и компания подтвердили мэтч.
                      </p>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 p-4 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors">
                    <input
                      type="radio"
                      name="profileVisibility"
                      value="open"
                      className="h-4 w-4 mt-0.5"
                    />
                    <div>
                      <span className="text-sm font-medium flex items-center gap-2">
                        🌐 Открытый профиль
                      </span>
                      <p className="text-xs text-muted-foreground mt-1">
                        Компании видят ваш полный профиль, включая имя и текущее место работы, без предварительного мэтча.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="pt-2 space-y-3">
                <Button type="submit" className="w-full" size="lg">
                  Создать профиль и отправить на верификацию
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  После верификации командой GradeUp (до 24 ч) вы получите первые мэтчи
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Privacy note */}
        <div className="mt-6 p-4 rounded-lg border bg-background text-sm space-y-1">
          <p className="font-medium flex items-center gap-2">
            <span>🔒</span> Конфиденциальность
          </p>
          <p className="text-muted-foreground text-xs">
            Компании видят только профессиональную информацию. Ваше имя, контакты и текущее место работы
            остаются скрытыми до тех пор, пока обе стороны не подтвердят взаимный интерес.
          </p>
        </div>
      </div>
    </div>
  );
}
