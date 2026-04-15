import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InterestButton } from "@/components/interest-button";
import { CandidateNav } from "@/components/layout/candidate-nav";
import { TabFilters } from "@/components/tab-filters";
import { Suspense } from "react";

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
    include: { mandate: { include: { company: true } } },
    orderBy: { score: "desc" },
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
        <h1 className="text-2xl font-bold mb-6">Мои мэтчи</h1>

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
      company: { companyName: string; description: string };
    };
  };
}) {
  const isMutual = match.status === "MUTUAL";
  const alreadyInterested = match.candidateInterest;

  return (
    <Card className={isMutual ? "border-green-500" : ""}>
      <CardHeader className="flex flex-row items-start justify-between pb-3">
        <div>
          <CardTitle className="text-lg">{match.mandate.title}</CardTitle>
          <p className="text-sm text-muted-foreground mt-0.5">
            {match.mandate.isAnonymous && !isMutual
              ? "Компания скрыта до взаимного интереса"
              : match.mandate.company.companyName}{" "}
            · {match.mandate.industry}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-primary">{match.score}%</span>
          {isMutual && <Badge className="bg-green-600">Взаимный интерес</Badge>}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm">{match.mandate.description}</p>

        {isMutual && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
            <strong>Контакты открыты!</strong> Компания заинтересована в вас. Свяжитесь напрямую или ждите их обращения.
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
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
      </CardContent>
    </Card>
  );
}
