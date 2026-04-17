import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { InterestButton } from "@/components/interest-button";
import { CandidateNav } from "@/components/layout/candidate-nav";
import { TabFilters } from "@/components/tab-filters";
import { ScoreBreakdownWidget } from "@/components/score-breakdown";
import { Suspense } from "react";
import { CheckCircle2, Lock } from "lucide-react";

const MANDATE_TYPE_LABEL: Record<string, string> = {
  "full-time": "Найм в штат",
  mentor:      "Ментор",
  consultant:  "Консультант",
  board:       "Advisory Board",
};

const MANDATE_TYPE_COLOR: Record<string, string> = {
  "full-time": "bg-slate-100 text-slate-600",
  mentor:      "bg-violet-50 text-violet-600",
  consultant:  "bg-blue-50 text-blue-600",
  board:       "bg-amber-50 text-amber-700",
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
      case "mutual":     return allMatches.filter((m) => m.status === "MUTUAL");
      case "interested": return allMatches.filter((m) => m.candidateInterest && m.status !== "MUTUAL");
      case "new":        return allMatches.filter((m) => !m.candidateInterest && m.status !== "MUTUAL");
      default:           return allMatches;
    }
  })();

  const counts = {
    all:       allMatches.length,
    new:       allMatches.filter((m) => !m.candidateInterest && m.status !== "MUTUAL").length,
    interested: allMatches.filter((m) => m.candidateInterest && m.status !== "MUTUAL").length,
    mutual:    allMatches.filter((m) => m.status === "MUTUAL").length,
  };

  const tabs = [
    { value: "",           label: "Все",              count: counts.all },
    { value: "new",        label: "Новые",            count: counts.new },
    { value: "interested", label: "Интерес отмечен",  count: counts.interested },
    { value: "mutual",     label: "Взаимные",         count: counts.mutual },
  ];

  return (
    <div className="dash-bg">
      <CandidateNav active="matches" />

      {/* Dark page header */}
      <div className="dash-hero">
        <div className="max-w-5xl mx-auto px-5 pt-10 pb-2 relative z-10 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-widest uppercase mb-2"
              style={{ color: "hsl(38 52% 55%)" }}>Кандидат</p>
            <h1
              className="text-3xl font-bold tracking-tight"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "hsl(40 33% 96%)" }}
            >
              Мои мэтчи
            </h1>
            <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
              {counts.all} позиций · {counts.mutual} взаимных
            </p>
          </div>
          {counts.mutual > 0 && (
            <span className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full font-medium shrink-0"
              style={{ background: "rgba(22,163,74,0.15)", color: "#4ade80", border: "1px solid rgba(22,163,74,0.3)" }}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              {counts.mutual} взаимных
            </span>
          )}
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-5 pt-6 pb-10 -mt-2">

        {allMatches.length > 0 && (
          <Suspense>
            <TabFilters tabs={tabs} />
          </Suspense>
        )}

        {filtered.length === 0 ? (
          <div className="pc p-12 text-center text-slate-500">
            {profile.status !== "VERIFIED"
              ? "Мэтчи появятся после верификации вашего профиля"
              : filter
              ? "Нет мэтчей в этой категории"
              : "Мэтчей пока нет. Мы уведомим вас, когда появятся релевантные позиции"}
          </div>
        ) : (
          <div className="space-y-4 mt-4">
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
  const typeColor = MANDATE_TYPE_COLOR[match.mandate.mandateType] ?? "bg-slate-100 text-slate-600";

  const companyName = isMutual || !match.mandate.isAnonymous
    ? match.mandate.company.companyName
    : null;

  const scoreColor =
    match.score >= 80 ? "text-green-600" :
    match.score >= 60 ? "text-slate-800" :
    match.score >= 40 ? "text-amber-600" :
    "text-slate-400";

  return (
    <div className={isMutual ? "pc-green" : "pc"}>
      <div className="p-6">
        {/* Header row */}
        <div className="flex items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${typeColor}`}>
                {typeLabel}
              </span>
              {match.mandate.isAnonymous && !isMutual && (
                <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">
                  <Lock className="w-2.5 h-2.5" />
                  Анонимно
                </span>
              )}
              {isMutual && (
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-100">
                  Взаимный
                </span>
              )}
            </div>
            <h3 className="text-base font-semibold text-slate-900 leading-snug">{match.mandate.title}</h3>
            <p className="text-sm text-slate-500 mt-0.5">
              {companyName ?? "Компания скрыта до взаимного интереса"}
              <span className="mx-1.5 text-slate-300">·</span>
              {match.mandate.industry}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className={`text-2xl font-bold tabular-nums leading-none ${scoreColor}`}>{match.score}%</p>
            <p className="text-[10px] text-slate-400 mt-0.5">совпадение</p>
          </div>
        </div>

        {/* Mutual reveal */}
        {isMutual && (
          <div className="mt-5 pt-5 border-t border-green-100 space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <p className="text-sm font-semibold text-green-800">Взаимный интерес — контакты открыты</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <p className="eyebrow mb-1">Компания</p>
                <p className="text-sm font-semibold text-slate-800">{match.mandate.company.companyName}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {match.mandate.company.size} · {match.mandate.company.industry}
                </p>
              </div>
              {match.mandate.company.website && (
                <div>
                  <p className="eyebrow mb-1">Сайт</p>
                  <a
                    href={match.mandate.company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-slate-700 underline underline-offset-2 hover:text-slate-900 break-all"
                  >
                    {match.mandate.company.website}
                  </a>
                </div>
              )}
            </div>
            {match.mandate.company.description && (
              <div>
                <p className="eyebrow mb-1">О компании</p>
                <p className="text-sm text-slate-700 leading-relaxed">{match.mandate.company.description}</p>
              </div>
            )}
          </div>
        )}

        {/* Company interest hint */}
        {companyAlsoInterested && !isMutual && (
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 text-sm text-amber-800 flex items-center gap-2">
            <span className="text-base">🔥</span>
            <span><strong>Компания уже отметила интерес.</strong> Отметьте взаимно, чтобы открыть контакты.</span>
          </div>
        )}

        {/* Description */}
        <p className="text-sm text-slate-600 leading-relaxed mt-4">{match.mandate.description}</p>

        {/* Requirements */}
        {match.mandate.requirements && (
          <div className="mt-3 bg-slate-50 rounded-xl p-3.5">
            <p className="eyebrow mb-1.5">Требования</p>
            <p className="text-sm text-slate-700 leading-relaxed">{match.mandate.requirements}</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between gap-4">
          <p className="text-sm font-medium text-slate-600">
            {(match.mandate.salaryMin / 1_000_000).toFixed(1)}–
            {(match.mandate.salaryMax / 1_000_000).toFixed(1)} млн руб/год
          </p>
          {!alreadyInterested && !isMutual ? (
            <InterestButton matchId={match.id} role="candidate" />
          ) : alreadyInterested && !isMutual ? (
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-100 text-slate-500">
              Интерес отмечен
            </span>
          ) : null}
        </div>

        <ScoreBreakdownWidget scoreBreakdown={match.scoreBreakdown} score={match.score} />
      </div>
    </div>
  );
}
