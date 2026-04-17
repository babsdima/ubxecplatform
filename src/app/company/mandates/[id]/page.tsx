import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateMandateStatus } from "@/lib/actions";
import { InterestButton } from "@/components/interest-button";
import { CompanyNav } from "@/components/layout/company-nav";

const MANDATE_TYPE_LABEL: Record<string, string> = {
  "full-time": "Найм в штат",
  mentor: "Ментор",
  consultant: "Консультант / Advisor",
  board: "Advisory Board",
};

const MANDATE_TYPE_COLOR: Record<string, string> = {
  "full-time": "bg-blue-50 text-blue-700 border-blue-200",
  mentor: "bg-purple-50 text-purple-700 border-purple-200",
  consultant: "bg-orange-50 text-orange-700 border-orange-200",
  board: "bg-teal-50 text-teal-700 border-teal-200",
};

const ENGAGEMENT_TYPE_LABEL: Record<string, string> = {
  "full-time": "Найм в штат",
  mentor: "Ментор",
  consultant: "Консультант",
  board: "Advisory Board",
};

const ASSESSMENT_META: Record<string, { label: string; icon: string }> = {
  HOGAN: { label: "Hogan", icon: "🔬" },
  DISC: { label: "DISC", icon: "🎯" },
  MBTI: { label: "MBTI", icon: "🧩" },
};

export default async function MandatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session) redirect("/auth/login");

  const company = await prisma.companyProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!company) redirect("/company/onboarding");

  const mandate = await prisma.mandate.findUnique({
    where: { id, companyId: company.id },
    include: {
      matches: {
        include: {
          candidate: {
            include: {
              assessments: { where: { status: "COMPLETED" } },
            },
          },
        },
        // Mutual first, then by score desc — done in JS below
        orderBy: { score: "desc" },
      },
    },
  });
  if (!mandate) notFound();

  // Sort: mutual + candidateInterest first, then by score
  const sortedMatches = [...mandate.matches].sort((a, b) => {
    const priority = (m: typeof a) =>
      m.status === "MUTUAL" ? 3 : m.candidateInterest ? 2 : 1;
    return priority(b) - priority(a) || b.score - a.score;
  });

  const mutualCount = mandate.matches.filter((m) => m.status === "MUTUAL").length;
  const awaitingCount = mandate.matches.filter(
    (m) => m.candidateInterest && !m.companyInterest && m.status !== "MUTUAL"
  ).length;

  const typeLabel = MANDATE_TYPE_LABEL[mandate.mandateType] ?? mandate.mandateType;
  const typeColor = MANDATE_TYPE_COLOR[mandate.mandateType] ?? "bg-muted text-muted-foreground border";

  return (
    <div className="min-h-screen bg-muted/30">
      <CompanyNav active="mandates" />

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link href="/company/mandates" className="text-sm text-muted-foreground hover:text-foreground">
              ← Все позиции
            </Link>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <h1 className="text-2xl font-bold">{mandate.title}</h1>
              <span className={`text-xs px-2 py-0.5 rounded border font-medium ${typeColor}`}>
                {typeLabel}
              </span>
              {mandate.isAnonymous && (
                <span className="text-xs px-2 py-0.5 rounded border bg-muted text-muted-foreground">
                  🔒 Конфиденциально
                </span>
              )}
            </div>
            <p className="text-muted-foreground mt-1">
              {mandate.industry} · {(mandate.salaryMin / 1_000_000).toFixed(1)}–
              {(mandate.salaryMax / 1_000_000).toFixed(1)} млн руб/год
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant={mandate.status === "ACTIVE" ? "default" : "secondary"}>
              {mandate.status === "ACTIVE" ? "Активен" : mandate.status === "CLOSED" ? "Закрыт" : "Черновик"}
            </Badge>
            {mandate.status === "ACTIVE" ? (
              <form action={async () => { "use server"; await updateMandateStatus(mandate.id, "CLOSED"); }}>
                <Button type="submit" size="sm" variant="outline">Закрыть позицию</Button>
              </form>
            ) : (
              <form action={async () => { "use server"; await updateMandateStatus(mandate.id, "ACTIVE"); }}>
                <Button type="submit" size="sm" variant="outline">Открыть снова</Button>
              </form>
            )}
          </div>
        </div>

        {/* Alerts */}
        {awaitingCount > 0 && (
          <div className="bg-amber-50 border border-amber-300 rounded-lg px-4 py-3 text-sm text-amber-800 flex items-center gap-2">
            <span>🔥</span>
            <span>
              <strong>{awaitingCount} {awaitingCount === 1 ? "кандидат отметил" : "кандидата отметили"} интерес</strong> — ответьте, чтобы открыть контакты
            </span>
          </div>
        )}
        {mutualCount > 0 && (
          <div className="bg-green-50 border border-green-300 rounded-lg px-4 py-3 text-sm text-green-800 flex items-center gap-2">
            <span>✓</span>
            <span><strong>{mutualCount} взаимных мэтча</strong> — контакты открыты, можно выходить на связь</span>
          </div>
        )}

        {/* Mandate details */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Описание</p>
                <p className="text-sm">{mandate.description}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Требования</p>
                <p className="text-sm">{mandate.requirements}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Candidates */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              Кандидаты ({mandate.matches.length})
            </h2>
            <div className="flex gap-2 text-sm text-muted-foreground">
              {awaitingCount > 0 && (
                <span className="text-amber-600 font-medium">{awaitingCount} ждут ответа</span>
              )}
              {mutualCount > 0 && (
                <span className="text-green-600 font-medium">{mutualCount} взаимных</span>
              )}
            </div>
          </div>

          {sortedMatches.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground text-sm">
                Мэтчи появятся автоматически по мере верификации кандидатов
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {sortedMatches.map((match) => (
                <CandidateMatchCard key={match.id} match={match} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function CandidateMatchCard({
  match,
}: {
  match: {
    id: string;
    score: number;
    status: string;
    candidateInterest: boolean;
    companyInterest: boolean;
    revealedAt: Date | null;
    candidate: {
      currentTitle: string;
      industry: string;
      yearsExperience: number;
      achievements: string;
      salaryMin: number;
      salaryMax: number;
      locationPref: string;
      functionalFocus: string;
      engagementFormats: string;
      firstName: string | null;
      lastName: string | null;
      phone: string | null;
      linkedinUrl: string | null;
      assessments: {
        type: string;
        status: string;
        summary: string | null;
        strengths: string | null;
        risks: string | null;
        leadershipStyle: string | null;
      }[];
    };
  };
}) {
  const isMutual = match.status === "MUTUAL";
  const c = match.candidate;
  const completedAssessments = c.assessments.filter((a) => a.status === "COMPLETED");
  const engagementFormats = c.engagementFormats
    ? c.engagementFormats.split(",").map((f) => ENGAGEMENT_TYPE_LABEL[f] ?? f)
    : [];

  return (
    <Card className={isMutual ? "border-green-400 shadow-sm" : match.candidateInterest ? "border-amber-300" : ""}>
      <CardHeader className="flex flex-row items-start justify-between pb-3">
        <div className="flex-1 min-w-0 pr-4">
          <CardTitle className="text-base">
            {isMutual && c.firstName
              ? `${c.firstName} ${c.lastName ?? ""}`.trim()
              : `Кандидат — ${c.currentTitle}`}
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-0.5">
            {c.industry} · {c.yearsExperience} лет опыта · {c.functionalFocus}
          </p>
          {engagementFormats.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {engagementFormats.map((f) => (
                <span key={f} className="text-xs bg-muted border px-1.5 py-0.5 rounded">{f}</span>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <div className="flex items-center gap-2">
            {completedAssessments.length > 0 && (
              <div className="flex gap-1">
                {completedAssessments.map((a) => {
                  const meta = ASSESSMENT_META[a.type];
                  return meta ? (
                    <span
                      key={a.type}
                      className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium"
                      title={`${meta.label} assessment пройден`}
                    >
                      {meta.icon}
                    </span>
                  ) : null;
                })}
              </div>
            )}
            <span className="text-2xl font-bold text-primary">{match.score}%</span>
          </div>
          {isMutual && <Badge className="bg-green-600 text-xs">Взаимный</Badge>}
          {match.candidateInterest && !isMutual && (
            <Badge variant="outline" className="text-amber-600 border-amber-400 text-xs">🔥 Интерес</Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="text-sm">{c.achievements}</p>

        {/* Mutual: contact reveal */}
        {isMutual && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
            <p className="font-semibold text-green-800 text-sm flex items-center gap-1.5">
              <span>✓</span> Взаимный интерес — контакты открыты
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-green-700 uppercase tracking-wide mb-1">Имя</p>
                <p className="text-green-900 font-medium">
                  {c.firstName ? `${c.firstName} ${c.lastName ?? ""}`.trim() : c.currentTitle}
                </p>
              </div>
              {c.phone && (
                <div>
                  <p className="text-xs text-green-700 uppercase tracking-wide mb-1">Телефон</p>
                  <a href={`tel:${c.phone}`} className="text-green-800 font-medium hover:underline">
                    {c.phone}
                  </a>
                </div>
              )}
              {c.linkedinUrl && (
                <div className="sm:col-span-2">
                  <p className="text-xs text-green-700 uppercase tracking-wide mb-1">LinkedIn</p>
                  <a
                    href={c.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-800 underline underline-offset-2 hover:text-green-600 text-sm break-all"
                  >
                    {c.linkedinUrl}
                  </a>
                </div>
              )}
              {!c.phone && !c.linkedinUrl && (
                <div className="sm:col-span-2">
                  <p className="text-xs text-green-700">Кандидат ещё не добавил контактные данные.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Assessment results */}
        {completedAssessments.length > 0 && (
          <div className="space-y-3 border-t pt-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
              Результаты оценки
            </p>
            {completedAssessments.map((a) => {
              const meta = ASSESSMENT_META[a.type];
              if (!meta) return null;
              return (
                <div key={a.type} className="rounded-lg border bg-muted/30 p-3 space-y-2">
                  <p className="text-sm font-semibold">{meta.icon} {meta.label}</p>
                  {a.summary && <p className="text-sm text-muted-foreground">{a.summary}</p>}
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    {a.strengths && (
                      <div className="bg-green-50 border border-green-200 rounded p-2">
                        <p className="text-[11px] font-semibold text-green-700 mb-0.5">Сильные стороны</p>
                        <p className="text-xs text-green-800">{a.strengths}</p>
                      </div>
                    )}
                    {a.risks && (
                      <div className="bg-amber-50 border border-amber-200 rounded p-2">
                        <p className="text-[11px] font-semibold text-amber-700 mb-0.5">Зоны развития</p>
                        <p className="text-xs text-amber-800">{a.risks}</p>
                      </div>
                    )}
                    {a.leadershipStyle && (
                      <div className="bg-blue-50 border border-blue-200 rounded p-2">
                        <p className="text-[11px] font-semibold text-blue-700 mb-0.5">Стиль лидерства</p>
                        <p className="text-xs text-blue-800">{a.leadershipStyle}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer row */}
        <div className="flex items-center justify-between pt-2 border-t">
          <p className="text-sm text-muted-foreground">
            {(c.salaryMin / 1_000_000).toFixed(1)}–{(c.salaryMax / 1_000_000).toFixed(1)} млн · {c.locationPref}
          </p>
          {!match.companyInterest && !isMutual ? (
            <InterestButton matchId={match.id} role="company" />
          ) : match.companyInterest && !isMutual ? (
            <Badge variant="secondary">Вы отметили интерес</Badge>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
