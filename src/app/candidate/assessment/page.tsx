import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { CandidateNav } from "@/components/layout/candidate-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requestAssessment } from "@/lib/actions";

const ASSESSMENT_TYPES = [
  {
    type: "HOGAN",
    name: "Hogan Assessments",
    description: "Оценка личностных характеристик, сильных сторон и потенциальных рисков в рабочей среде. Используется ведущими компаниями Fortune 500.",
    icon: "🔬",
    duration: "45–60 минут",
    what: ["Стиль лидерства", "Риски при стрессе", "Мотивация и ценности"],
  },
  {
    type: "DISC",
    name: "DISC Profile",
    description: "Модель поведенческого профиля. Определяет стиль коммуникации, принятия решений и взаимодействия в команде.",
    icon: "🎯",
    duration: "15–20 минут",
    what: ["Поведенческий стиль", "Стиль коммуникации", "Реакция на давление"],
  },
  {
    type: "MBTI",
    name: "MBTI (Myers-Briggs)",
    description: "Классификация психологических типов по Юнгу. Широко применяется для оценки управленческого потенциала и командной совместимости.",
    icon: "🧩",
    duration: "20–30 минут",
    what: ["Тип личности", "Стиль мышления", "Управленческий потенциал"],
  },
];

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  NOT_TAKEN: { label: "Не пройден", color: "secondary" },
  PENDING: { label: "Ожидает обработки", color: "outline" },
  COMPLETED: { label: "Завершён", color: "default" },
};

export default async function AssessmentPage() {
  const session = await auth();
  if (!session) redirect("/auth/login");

  const profile = await prisma.candidateProfile.findUnique({
    where: { userId: session.user.id },
    include: { assessments: true },
  });
  if (!profile) redirect("/candidate/onboarding");

  const assessmentMap = Object.fromEntries(profile.assessments.map((a) => [a.type, a]));

  return (
    <div className="min-h-screen bg-muted/30">
      <CandidateNav active="assessment" />

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Оценка (Assessment)</h1>
          <p className="text-muted-foreground mt-1">
            Прохождение assessments повышает привлекательность вашего профиля для компаний
            и позволяет получать более точные мэтчи.
          </p>
        </div>

        <div className="grid gap-5">
          {ASSESSMENT_TYPES.map(({ type, name, description, icon, duration, what }) => {
            const assessment = assessmentMap[type];
            const status = assessment?.status ?? "NOT_TAKEN";
            const statusInfo = STATUS_LABELS[status];
            const isCompleted = status === "COMPLETED";
            const isPending = status === "PENDING";

            return (
              <Card key={type} className={isCompleted ? "border-primary/30" : ""}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{icon}</span>
                      <div>
                        <CardTitle className="text-lg">{name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-0.5">Длительность: {duration}</p>
                      </div>
                    </div>
                    <Badge variant={statusInfo.color as "default" | "secondary" | "outline"}>
                      {statusInfo.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{description}</p>

                  <div className="flex flex-wrap gap-2">
                    {what.map((item) => (
                      <span key={item} className="text-xs bg-muted px-2 py-1 rounded-full">
                        {item}
                      </span>
                    ))}
                  </div>

                  {isCompleted && assessment && (
                    <div className="space-y-3 border-t pt-4">
                      <h4 className="text-sm font-semibold text-primary">Результаты</h4>
                      {assessment.summary && (
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Резюме</p>
                          <p className="text-sm">{assessment.summary}</p>
                        </div>
                      )}
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {assessment.strengths && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <p className="text-xs font-semibold text-green-700 mb-1">Сильные стороны</p>
                            <p className="text-sm text-green-800">{assessment.strengths}</p>
                          </div>
                        )}
                        {assessment.risks && (
                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                            <p className="text-xs font-semibold text-amber-700 mb-1">Зоны развития</p>
                            <p className="text-sm text-amber-800">{assessment.risks}</p>
                          </div>
                        )}
                      </div>
                      {assessment.leadershipStyle && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <p className="text-xs font-semibold text-blue-700 mb-1">Стиль лидерства</p>
                          <p className="text-sm text-blue-800">{assessment.leadershipStyle}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {isPending && (
                    <div className="bg-muted/60 rounded-lg p-3 text-sm text-muted-foreground">
                      Запрос получен. Команда UbXec свяжется с вами в течение 24 часов для организации тестирования.
                    </div>
                  )}

                  {!isCompleted && !isPending && (
                    <div className="flex items-center gap-3 pt-1">
                      <form
                        action={async () => {
                          "use server";
                          await requestAssessment(profile.id, type);
                        }}
                      >
                        <Button type="submit" size="sm">
                          Запросить тестирование
                        </Button>
                      </form>
                      <p className="text-xs text-muted-foreground">
                        Наши специалисты пришлют ссылку и помогут с прохождением
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <div>
                <p className="font-medium text-sm">Зачем проходить assessment?</p>
                <ul className="text-sm text-muted-foreground mt-1 space-y-0.5 list-disc list-inside">
                  <li>Кандидаты с assessments получают на 40% больше просмотров от компаний</li>
                  <li>Результаты помогают компаниям принять взвешенное решение быстрее</li>
                  <li>Вы лучше понимаете свои сильные стороны для переговоров</li>
                  <li>Assessments остаются в вашем профиле — актив на долгий срок</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
