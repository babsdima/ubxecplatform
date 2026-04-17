import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InterestButton } from "@/components/interest-button";
import { CandidateNav } from "@/components/layout/candidate-nav";
import { TabFilters } from "@/components/tab-filters";
import { ScoreBreakdownWidget } from "@/components/score-breakdown";
import { Suspense } from "react";

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

export default async function CandidateMatches({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/auth/login");

  const { filter } = await searchParams;

  const profile = await prisma.candidateProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!profile) redirect("/candidate/onboarding");

  const allMatches = await prisma.match.findMany({
    where: { candidateProfileId: profile.id },
    include: {
      mandate: {
        include: {
          company: {
            select: {
              companyName: true,
              description: true,
              website: true,
              size: true,
              industry: true,
            },
          },
        },
      },
    },
    orderBy: [{ status: "asc" }, { score: "desc" }],
  });

  const filtered = (() => {
    switch (filter) {
      case "mutual":
        return allMatches.filter((m) => m.status === "MUTUAL");
      case "interested":
        return allMatches.filter((m) => m.candidateInterest && m.status !== "MUTUAL");
      case "new":
        return allMatches.filter((m) => !m.candidateInterest && m.status !== "MUTUAL");
      default:
        return allMatches;
    }
  })();

  const counts = {
    all: allMatches.length,
    new: allMatches.filter((m) => !m.candidateInterest && m.status !== "MUTUAL").length,
    interested: allMatches.filter((m) => m.candidateInterest && m.status !== "MUTUAL").length,
    mutual: allMatches.filter((m) => m.status === "MUTUAL").length,
  };

  const tabs = [
    { value: "", label: "Все", count: counts.all },
    { value: "new", label: "Новые", count: counts.new },
    { value: "interested", label: "Интерес отмечен", count: counts.interested },
    { value: "mutual", label: "Взаимные", count: counts.mutual },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      <CandidateNav active="matches" />

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Мои мэтчи</h1>
          {counts.mutual > 0 && (
            <span className="text-sm text-green-700 bg-green-50 border border-green-200 px-3 py-1 rounded-full font-medium">
              {counts.mutual} взаимных — контакты открыты
            </span>
          )}
        </div>

        {allMatches.length > 0 && (
          <Suspense>
            <TabFilters tabs={tabs} />
          </Suspense>
        )}

        {filtered.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              {profile.status !== "VERIFIED"
                ? "Мэтчи появятся после верификации вашего профиля"
                : filter
                ? "Нет мэтчей в этой категории"
                : "Мэтчей пока нет. Мы уведомим вас, когда появятся релевантные позиции"}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filtered.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function MatchCard({
  match,
}: {
  match: {
    id: string;
    score: number;
    scoreBreakdown: string | null;
    status: string;
    candidateInterest: boolean;
    companyInterest: boolean;
    revealedAt: Date | null;
    mandate: {
      title: string;
      industry: string;
      salaryMin: number;
      salaryMax: number;
      description: string;
      requirements: string;
      isAnonymous: boolean;
      mandateType: string;
      company: {
        companyName: string;
        description: string;
        website: string | null;
        size: string;
        industry: string;
      };
    };
  };
}) {
  const isMutual = match.status === "MUTUAL";
  const alreadyInterested = match.candidateInterest;
  const companyAlsoInterested = match.companyInterest;
  const typeLabel = MANDATE_TYPE_LABEL[match.mandate.mandateType] ?? match.mandate.mandateType;
  const typeColor = MANDATE_TYPE_COLOR[match.mandate.mandateType] ?? "bg-muted text-muted-foreground border";

  const companyName = isMutual || !match.mandate.isAnonymous
    ? match.mandate.company.companyName
    : null;

  return (
    <Card className={isMutual ? "border-green-400 shadow-sm" : ""}>
      <CardHeader className="flex flex-row items-start justify-between pb-3">
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <CardTitle className="text-lg">{match.mandate.title}</CardTitle>
            <span className={`text-xs px-2 py-0.5 rounded border font-medium ${typeColor}`}>
              {typeLabel}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {companyName ?? "Компания скрыта до взаимного интереса"}
            {" · "}
            {match.mandate.industry}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span className="text-2xl font-bold text-primary">{match.score}%</span>
          <span className="text-[10px] text-muted-foreground">совпадение</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Mutual reveal banner */}
        {isMutual && (
          <div className="bg-green-50 border border-green-300 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-green-600 text-lg">✓</span>
              <p className="font-semibold text-green-800">Взаимный интерес — контакты открыты</p>
              <Badge className="bg-green-600 text-xs ml-auto">Взаимный</Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-green-700 uppercase tracking-wide mb-1">Компания</p>
                <p className="font-medium text-green-900">{match.mandate.company.companyName}</p>
                <p className="text-green-700 text-xs mt-0.5">
                  {match.mandate.company.size} · {match.mandate.company.industry}
                </p>
              </div>
              {match.mandate.company.website && (
                <div>
                  <p className="text-xs text-green-700 uppercase tracking-wide mb-1">Сайт</p>
                  <a
                    href={match.mandate.company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-800 underline underline-offset-2 hover:text-green-600 text-sm break-all"
                  >
                    {match.mandate.company.website}
                  </a>
                </div>
              )}
            </div>
            {match.mandate.company.description && (
              <div>
                <p className="text-xs text-green-700 uppercase tracking-wide mb-1">О компании</p>
                <p className="text-sm text-green-800">{match.mandate.company.description}</p>
              </div>
            )}
          </div>
        )}

        {/* Company interest hint (not mutual yet) */}
        {companyAlsoInterested && !isMutual && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-sm text-amber-800 flex items-center gap-2">
            <span>🔥</span>
            <span><strong>Компания отметила интерес.</strong> Отметьте взаимно, чтобы открыть контакты.</span>
          </div>
        )}

        <p className="text-sm text-muted-foreground">{match.mandate.description}</p>

        {/* Requirements */}
        {match.mandate.requirements && (
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5">Требования</p>
            <p className="text-sm">{match.mandate.requirements}</p>
          </div>
        )}

        <div className="flex items-center justify-between pt-1 border-t">
          <p className="text-sm text-muted-foreground">
            {(match.mandate.salaryMin / 1_000_000).toFixed(1)}–
            {(match.mandate.salaryMax / 1_000_000).toFixed(1)} млн руб/год
          </p>
          {!alreadyInterested && !isMutual ? (
            <InterestButton matchId={match.id} role="candidate" />
          ) : alreadyInterested && !isMutual ? (
            <Badge variant="secondary">Вы отметили интерес</Badge>
          ) : null}
        </div>

        <ScoreBreakdownWidget scoreBreakdown={match.scoreBreakdown} score={match.score} />
      </CardContent>
    </Card>
  );
}
