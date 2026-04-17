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
              assessments: {
                where: { status: "COMPLETED" },
              },
            },
          },
        },
        orderBy: { score: "desc" },
      },
    },
  });
  if (!mandate) notFound();

  return (
    <div className="min-h-screen bg-muted/30">
      <CompanyNav active="mandates" />

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <Link href="/company/mandates" className="text-sm text-muted-foreground hover:text-foreground">
              ← Все позиции
            </Link>
            <h1 className="text-2xl font-bold mt-2">{mandate.title}</h1>
            <p className="text-muted-foreground">
              {mandate.industry} · {(mandate.salaryMin / 1_000_000).toFixed(1)}–
              {(mandate.salaryMax / 1_000_000).toFixed(1)} млн руб/год
            </p>
          </div>
          <div className="flex items-center gap-3">
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

        <Card>
          <CardContent className="pt-6 space-y-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Описание</p>
              <p className="text-sm">{mandate.description}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Требования</p>
              <p className="text-sm">{mandate.requirements}</p>
            </div>
          </CardContent>
        </Card>

        <div>
          <h2 className="text-lg font-semibold mb-4">
            Кандидаты ({mandate.matches.length})
          </h2>
          {mandate.matches.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground text-sm">
                Мэтчи появятся автоматически по мере верификации кандидатов
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {mandate.matches.map((match) => (
                <CandidateMatchCard key={match.id} match={match} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

const ASSESSMENT_META: Record<string, { label: string; icon: string }> = {
  HOGAN: { label: "Hogan", icon: "🔬" },
  DISC: { label: "DISC", icon: "🎯" },
  MBTI: { label: "MBTI", icon: "🧩" },
};

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
      firstName: string | null;
      lastName: string | null;
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

  return (
    <Card className={isMutual ? "border-green-500" : ""}>
      <CardHeader className="flex flex-row items-start justify-between pb-3">
        <div>
          <CardTitle className="text-base">
            {isMutual && c.firstName
              ? `${c.firstName} ${c.lastName ?? ""}`.trim()
              : `Кандидат — ${c.currentTitle}`}
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-0.5">
            {c.industry} · {c.yearsExperience} лет опыта
          </p>
        </div>
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
                    {meta.icon} {meta.label}
                  </span>
                ) : null;
              })}
            </div>
          )}
          <span className="text-2xl font-bold text-primary">{match.score}%</span>
          {isMutual && <Badge className="bg-green-600">Взаимный</Badge>}
          {match.candidateInterest && !isMutual && (
            <Badge variant="outline" className="text-amber-600 border-amber-400">Интерес</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm">{c.achievements}</p>

        {completedAssessments.length > 0 && (
          <div className="space-y-3 border-t pt-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Результаты оценки</p>
            {completedAssessments.map((a) => {
              const meta = ASSESSMENT_META[a.type];
              if (!meta) return null;
              return (
                <div key={a.type} className="rounded-lg border bg-muted/30 p-3 space-y-2">
                  <p className="text-sm font-semibold">
                    {meta.icon} {meta.label}
                  </p>
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

        {isMutual && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
            <strong>Взаимный интерес!</strong> Можно выходить на контакт напрямую.
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
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
