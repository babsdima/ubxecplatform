import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { CandidateNav } from "@/components/layout/candidate-nav";
import { requestAssessment } from "@/lib/actions";
import { CheckCircle2, Clock } from "lucide-react";

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
    <div className="dash-bg">
      <CandidateNav active="assessment" />

      {/* Dark header */}
      <div className="dash-hero">
        <div className="max-w-4xl mx-auto px-5 pt-10 pb-2 relative z-10">
          <p className="text-xs font-bold tracking-widest uppercase mb-2"
            style={{ color: "rgba(255,255,255,0.35)" }}>Кандидат</p>
          <h1
            className="text-3xl font-bold tracking-tight"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "hsl(40 33% 96%)" }}
          >
            Оценка (Assessment)
          </h1>
          <p className="text-sm mt-1 leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>
            Прохождение assessments повышает привлекательность профиля и точность мэтчинга
          </p>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-5 pt-6 pb-10 space-y-5 -mt-2">

        {/* Assessment cards */}
        <div className="space-y-5">
          {ASSESSMENT_TYPES.map(({ type, name, description, icon, duration, what }) => {
            const assessment = assessmentMap[type];
            const status = assessment?.status ?? "NOT_TAKEN";
            const isCompleted = status === "COMPLETED";
            const isPending = status === "PENDING";

            return (
              <div key={type} className={isCompleted ? "pc-green" : "pc"}>
                <div className="p-6">
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <span className="text-3xl">{icon}</span>
                      <div>
                        <h3 className="text-base font-semibold text-slate-900">{name}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Длительность: {duration}</p>
                      </div>
                    </div>
                    <div className="shrink-0">
                      {isCompleted ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-green-50 text-green-700 border border-green-100">
                          <CheckCircle2 className="w-3 h-3" />
                          Завершён
                        </span>
                      ) : isPending ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3 h-3" />
                          Ожидает
                        </span>
                      ) : (
                        <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-slate-100 text-slate-500">
                          Не пройден
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-slate-600 leading-relaxed mt-3">{description}</p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {what.map((item) => (
                      <span key={item} className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-medium">
                        {item}
                      </span>
                    ))}
                  </div>

                  {/* Pending notice */}
                  {isPending && (
                    <div className="mt-4 bg-amber-50 border border-amber-100 rounded-xl p-3.5 text-sm text-amber-700">
                      Запрос получен. Команда UbXec свяжется с вами в течение 24 часов для организации тестирования.
                    </div>
                  )}

                  {/* Results */}
                  {isCompleted && assessment && (
                    <div className="mt-5 pt-5 border-t border-green-100 space-y-3">
                      <p className="eyebrow">Результаты</p>
                      {assessment.summary && (
                        <p className="text-sm text-slate-700 leading-relaxed">{assessment.summary}</p>
                      )}
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {assessment.strengths && (
                          <div className="bg-green-50 border border-green-100 rounded-xl p-3">
                            <p className="text-[11px] font-semibold text-green-700 mb-1">Сильные стороны</p>
                            <p className="text-sm text-green-800 leading-relaxed">{assessment.strengths}</p>
                          </div>
                        )}
                        {assessment.risks && (
                          <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                            <p className="text-[11px] font-semibold text-amber-700 mb-1">Зоны развития</p>
                            <p className="text-sm text-amber-800 leading-relaxed">{assessment.risks}</p>
                          </div>
                        )}
                      </div>
                      {assessment.leadershipStyle && (
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                          <p className="text-[11px] font-semibold text-blue-700 mb-1">Стиль лидерства</p>
                          <p className="text-sm text-blue-800 leading-relaxed">{assessment.leadershipStyle}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* CTA */}
                  {!isCompleted && !isPending && (
                    <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-3">
                      <form
                        action={async () => {
                          "use server";
                          await requestAssessment(profile.id, type);
                        }}
                      >
                        <button
                          type="submit"
                          className="text-sm font-semibold px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors"
                        >
                          Запросить тестирование
                        </button>
                      </form>
                      <p className="text-xs text-slate-400">
                        Наши специалисты пришлют ссылку и помогут с прохождением
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Why assessment tip */}
        <div className="pc p-6">
          <div className="flex items-start gap-4">
            <span className="text-2xl shrink-0">💡</span>
            <div>
              <p className="text-sm font-semibold text-slate-800 mb-2">Зачем проходить assessment?</p>
              <ul className="text-sm text-slate-600 space-y-1.5">
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 mt-0.5">·</span>
                  Кандидаты с assessments получают на 40% больше просмотров от компаний
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 mt-0.5">·</span>
                  Результаты помогают компаниям принять взвешенное решение быстрее
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 mt-0.5">·</span>
                  Вы лучше понимаете свои сильные стороны для переговоров
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 mt-0.5">·</span>
                  Assessments остаются в вашем профиле — актив на долгий срок
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
