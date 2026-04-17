import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { updateMandateStatus } from "@/lib/actions";
import { InterestButton } from "@/components/interest-button";
import { CompanyNav } from "@/components/layout/company-nav";
import { ScoreBreakdownWidget } from "@/components/score-breakdown";
import { ArrowLeft, CheckCircle2, Lock } from "lucide-react";

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

const ENGAGEMENT_TYPE_LABEL: Record<string, string> = {
  "full-time": "Найм в штат",
  mentor:      "Ментор",
  consultant:  "Консультант",
  board:       "Advisory Board",
};

const ASSESSMENT_META: Record<string, { label: string; icon: string }> = {
  HOGAN: { label: "Hogan", icon: "🔬" },
  DISC:  { label: "DISC",  icon: "🎯" },
  MBTI:  { label: "MBTI",  icon: "🧩" },
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
        orderBy: { score: "desc" },
      },
    },
  });
  if (!mandate) notFound();

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
  const typeColor = MANDATE_TYPE_COLOR[mandate.mandateType] ?? "bg-slate-100 text-slate-600";

  return (
    <div className="dash-bg">
      <CompanyNav active="mandates" />

      {/* Dark hero strip */}
      <div className="dash-hero">
        <div className="max-w-5xl mx-auto px-5 pt-8 pb-2 relative z-10">
          <Link
            href="/company/mandates"
            className="inline-flex items-center gap-1.5 text-xs font-medium mb-5 transition-colors"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            <ArrowLeft className="w-3 h-3" />
            Все позиции
          </Link>

          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${typeColor}`}>
                  {typeLabel}
                </span>
                {mandate.isAnonymous && (
                  <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium"
                    style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <Lock className="w-2.5 h-2.5" />
                    Конфиденциально
                  </span>
                )}
              </div>
              <h1
                className="text-3xl font-bold tracking-tight leading-snug"
                style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "hsl(40 33% 96%)" }}
              >
                {mandate.title}
              </h1>
              <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
                {mandate.industry}
                <span className="mx-1.5" style={{ color: "rgba(255,255,255,0.15)" }}>·</span>
                {(mandate.salaryMin / 1_000_000).toFixed(1)}–{(mandate.salaryMax / 1_000_000).toFixed(1)} млн руб/год
              </p>
            </div>
            <div className="flex items-center gap-2.5 shrink-0 mt-1">
              <span className={`text-[11px] font-semibold px-3 py-1.5 rounded-full ${
                mandate.status === "ACTIVE"
                  ? "bg-green-50 text-green-700 border border-green-100"
                  : mandate.status === "DRAFT"
                  ? "bg-slate-100 text-slate-500"
                  : "bg-red-50 text-red-500"
              }`}>
                {mandate.status === "ACTIVE" ? "Активен" : mandate.status === "CLOSED" ? "Закрыт" : "Черновик"}
              </span>
              {mandate.status === "ACTIVE" ? (
                <form action={async () => { "use server"; await updateMandateStatus(mandate.id, "CLOSED"); }}>
                  <button type="submit" className="text-xs font-medium rounded-lg px-3 py-1.5 transition-colors"
                    style={{ border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.6)", background: "rgba(255,255,255,0.04)" }}>
                    Закрыть
                  </button>
                </form>
              ) : (
                <form action={async () => { "use server"; await updateMandateStatus(mandate.id, "ACTIVE"); }}>
                  <button type="submit" className="text-xs font-medium rounded-lg px-3 py-1.5 transition-colors"
                    style={{ border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.6)", background: "rgba(255,255,255,0.04)" }}>
                    Открыть снова
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="mt-6 pt-5 grid grid-cols-1 sm:grid-cols-2 gap-5"
            style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            <div>
              <p className="text-xs font-bold tracking-widest uppercase mb-2"
                style={{ color: "rgba(255,255,255,0.25)" }}>Описание</p>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
                {mandate.description}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold tracking-widest uppercase mb-2"
                style={{ color: "rgba(255,255,255,0.25)" }}>Требования</p>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
                {mandate.requirements}
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-5 pt-6 pb-10 space-y-6 -mt-2">

        {/* Alerts */}
        {awaitingCount > 0 && (
          <div className="pc-amber p-4 pl-5">
            <p className="text-sm text-amber-800 font-medium">
              🔥 <strong>{awaitingCount} {awaitingCount === 1 ? "кандидат отметил" : "кандидата отметили"} интерес</strong> — ответьте, чтобы открыть контакты
            </p>
          </div>
        )}
        {mutualCount > 0 && (
          <div className="pc-green p-4 pl-5 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
            <p className="text-sm text-green-800 font-medium">
              <strong>{mutualCount} взаимных мэтча</strong> — контакты открыты, можно выходить на связь
            </p>
          </div>
        )}

        {/* Candidates section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2
                className="text-lg font-bold text-slate-900"
                style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
              >
                Кандидаты ({mandate.matches.length})
              </h2>
              <div className="flex items-center gap-3 mt-0.5 text-xs font-medium">
                {awaitingCount > 0 && <span className="text-amber-600">{awaitingCount} ждут ответа</span>}
                {mutualCount > 0 && <span className="text-green-600">{mutualCount} взаимных</span>}
              </div>
            </div>
          </div>

          {sortedMatches.length === 0 ? (
            <div className="pc p-12 text-center text-slate-500 text-sm">
              Мэтчи появятся автоматически по мере верификации кандидатов
            </div>
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
    scoreBreakdown: string | null;
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

  const scoreColor =
    match.score >= 80 ? "text-green-600" :
    match.score >= 60 ? "text-slate-800" :
    match.score >= 40 ? "text-amber-600" :
    "text-slate-400";

  return (
    <div className={isMutual ? "pc-green" : match.candidateInterest ? "pc" : "pc"}>
      {match.candidateInterest && !isMutual && (
        <div className="h-0.5 bg-gradient-to-r from-amber-400 to-amber-300 rounded-t-2xl" />
      )}
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              {isMutual && (
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-100">
                  Взаимный
                </span>
              )}
              {match.candidateInterest && !isMutual && (
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  🔥 Интерес кандидата
                </span>
              )}
            </div>
            <h3 className="text-base font-semibold text-slate-900 leading-snug">
              {isMutual && c.firstName
                ? `${c.firstName} ${c.lastName ?? ""}`.trim()
                : `Кандидат — ${c.currentTitle}`}
            </h3>
            <p className="text-sm text-slate-500 mt-0.5">
              {c.industry}
              <span className="mx-1.5 text-slate-300">·</span>
              {c.yearsExperience} лет опыта
              <span className="mx-1.5 text-slate-300">·</span>
              {c.functionalFocus}
            </p>
            {engagementFormats.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {engagementFormats.map((f) => (
                  <span key={f} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                    {f}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="shrink-0 text-right">
            <div className="flex items-center gap-2 justify-end">
              {completedAssessments.length > 0 && (
                <div className="flex gap-1">
                  {completedAssessments.map((a) => {
                    const meta = ASSESSMENT_META[a.type];
                    return meta ? (
                      <span
                        key={a.type}
                        className="text-sm"
                        title={`${meta.label} assessment пройден`}
                      >
                        {meta.icon}
                      </span>
                    ) : null;
                  })}
                </div>
              )}
              <p className={`text-2xl font-bold tabular-nums leading-none ${scoreColor}`}>{match.score}%</p>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5 text-right">совпадение</p>
          </div>
        </div>

        {/* Achievements */}
        <p className="text-sm text-slate-700 leading-relaxed mt-4">{c.achievements}</p>

        {/* Mutual: contact reveal */}
        {isMutual && (
          <div className="mt-5 pt-5 border-t border-green-100 space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <p className="text-sm font-semibold text-green-800">Взаимный интерес — контакты открыты</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <p className="eyebrow mb-1">Имя</p>
                <p className="text-sm font-semibold text-slate-800">
                  {c.firstName ? `${c.firstName} ${c.lastName ?? ""}`.trim() : c.currentTitle}
                </p>
              </div>
              {c.phone && (
                <div>
                  <p className="eyebrow mb-1">Телефон</p>
                  <a href={`tel:${c.phone}`} className="text-sm font-medium text-slate-800 hover:text-slate-600 hover:underline">
                    {c.phone}
                  </a>
                </div>
              )}
              {c.linkedinUrl && (
                <div className="sm:col-span-2">
                  <p className="eyebrow mb-1">LinkedIn</p>
                  <a
                    href={c.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-slate-700 underline underline-offset-2 hover:text-slate-900 break-all"
                  >
                    {c.linkedinUrl}
                  </a>
                </div>
              )}
              {!c.phone && !c.linkedinUrl && (
                <div className="sm:col-span-2">
                  <p className="text-xs text-slate-500">Кандидат ещё не добавил контактные данные.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Assessment results */}
        {completedAssessments.length > 0 && (
          <div className="mt-5 pt-5 border-t border-slate-50 space-y-3">
            <p className="eyebrow">Результаты оценки</p>
            {completedAssessments.map((a) => {
              const meta = ASSESSMENT_META[a.type];
              if (!meta) return null;
              return (
                <div key={a.type} className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 space-y-3">
                  <p className="text-sm font-semibold text-slate-800">{meta.icon} {meta.label}</p>
                  {a.summary && <p className="text-sm text-slate-600 leading-relaxed">{a.summary}</p>}
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    {a.strengths && (
                      <div className="bg-green-50 border border-green-100 rounded-lg p-2.5">
                        <p className="text-[11px] font-semibold text-green-700 mb-1">Сильные стороны</p>
                        <p className="text-xs text-green-800 leading-relaxed">{a.strengths}</p>
                      </div>
                    )}
                    {a.risks && (
                      <div className="bg-amber-50 border border-amber-100 rounded-lg p-2.5">
                        <p className="text-[11px] font-semibold text-amber-700 mb-1">Зоны развития</p>
                        <p className="text-xs text-amber-800 leading-relaxed">{a.risks}</p>
                      </div>
                    )}
                    {a.leadershipStyle && (
                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-2.5">
                        <p className="text-[11px] font-semibold text-blue-700 mb-1">Стиль лидерства</p>
                        <p className="text-xs text-blue-800 leading-relaxed">{a.leadershipStyle}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between gap-4">
          <p className="text-sm text-slate-500 font-medium">
            {(c.salaryMin / 1_000_000).toFixed(1)}–{(c.salaryMax / 1_000_000).toFixed(1)} млн
            <span className="mx-1.5 text-slate-300">·</span>
            {c.locationPref}
          </p>
          {!match.companyInterest && !isMutual ? (
            <InterestButton matchId={match.id} role="company" />
          ) : match.companyInterest && !isMutual ? (
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
