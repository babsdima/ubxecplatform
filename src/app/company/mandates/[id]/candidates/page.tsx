import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { OverallScoreRing } from "@/components/charts/overall-score-ring";
import { ScoreBar } from "@/components/charts/score-bar";
import { InterestButton } from "@/components/interest-button";
import { triggerScoringForMandate } from "@/lib/scoring/actions";
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Briefcase,
  RefreshCw,
} from "lucide-react";

type ComponentScores = {
  competency: number;
  trackRecord: number;
  personality: number;
  risk: number;
  motivational: number;
  cultural: number;
};

type Flag = { scale: string; severity: "red" | "yellow"; message: string };

const PNL_LABEL: Record<string, string> = {
  "<500M": "<500M ₽",
  "500M_2B": "500M-2B ₽",
  "2B_10B": "2-10B ₽",
  "10B+": "10B+ ₽",
};

export default async function MandateCandidatesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const { id } = await params;

  // Authorization: только владелец компании или admin
  const mandate = await prisma.mandate.findUnique({
    where: { id },
    include: {
      company: {
        select: { name: true, companyName: true, userId: true },
      },
    },
  });
  if (!mandate) notFound();

  if (mandate.company.userId !== session.user.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });
    if (user?.role !== "ADMIN") {
      redirect("/company/dashboard");
    }
  }

  const matches = await prisma.match.findMany({
    where: {
      mandateId: id,
      score: { gte: 35 },
    },
    include: {
      candidate: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          currentLevel: true,
          industries: true,
          yearsManagement: true,
          maxPnl: true,
          maxReports: true,
          experienceContexts: true,
        },
      },
    },
    orderBy: { score: "desc" },
  });

  const mutual = matches.filter((m) => m.status === "MUTUAL");
  const interested = matches.filter(
    (m) => m.companyInterest && m.status !== "MUTUAL",
  );
  const candidateInterested = matches.filter(
    (m) =>
      m.candidateInterest && !m.companyInterest && m.status !== "MUTUAL",
  );
  const fresh = matches.filter(
    (m) => !m.candidateInterest && !m.companyInterest && m.status !== "MUTUAL",
  );

  return (
    <div className="dash-bg">
      <div className="dash-hero">
        <div className="max-w-5xl mx-auto px-5 pt-8 pb-3 relative z-10">
          <Link
            href={`/company/mandates/${id}`}
            className="inline-flex items-center gap-1.5 text-xs font-medium mb-3"
            style={{ color: "rgba(255,255,255,0.45)" }}
          >
            <ArrowLeft className="w-3 h-3" />
            К мандату
          </Link>
          <p
            className="text-[11px] font-bold tracking-widest uppercase mb-1"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            Кандидаты под мандат
          </p>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{
              fontFamily: "var(--font-playfair), Georgia, serif",
              color: "hsl(40 33% 96%)",
            }}
          >
            {mandate.title}
          </h1>
          <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.45)" }}>
            {matches.length} подходящих кандидатов · сортировка по overall score
          </p>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-5 pt-6 pb-12 -mt-2 space-y-8">
        {/* Mutual */}
        {mutual.length > 0 && (
          <Section title="Взаимный интерес" subtitle={`${mutual.length} • можно связаться`} accent="green">
            {mutual.map((m) => (
              <CandidateCard key={m.id} match={m} state="mutual" />
            ))}
          </Section>
        )}

        {/* Candidate expressed interest first */}
        {candidateInterested.length > 0 && (
          <Section
            title="Кандидат заинтересован"
            subtitle={`${candidateInterested.length} • ждут вашего решения`}
            accent="amber"
          >
            {candidateInterested.map((m) => (
              <CandidateCard key={m.id} match={m} state="candidate_first" />
            ))}
          </Section>
        )}

        {/* Company already expressed */}
        {interested.length > 0 && (
          <Section
            title="Вы выразили интерес"
            subtitle={`${interested.length} • ждём ответа кандидата`}
          >
            {interested.map((m) => (
              <CandidateCard key={m.id} match={m} state="company_first" />
            ))}
          </Section>
        )}

        {/* Fresh */}
        {fresh.length > 0 && (
          <Section
            title="Подходящие кандидаты"
            subtitle={`${fresh.length} • новые, ждут вашей реакции`}
          >
            {fresh.map((m) => (
              <CandidateCard key={m.id} match={m} state="fresh" />
            ))}
          </Section>
        )}

        {matches.length === 0 && (
          <div className="pc p-8 text-center">
            <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900">
              Кандидаты пока не подобраны
            </h3>
            <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto leading-relaxed">
              Возможно, мандат был создан недавно и ещё не запускалась скоринг.
              Или подходящих профилей в пуле пока нет.
            </p>
            <RescoreButton mandateId={id} />
          </div>
        )}

        {matches.length > 0 && (
          <div className="flex justify-end">
            <RescoreButton mandateId={id} />
          </div>
        )}
      </main>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
//  Sub-components
// ────────────────────────────────────────────────────────────────────

type CandidateMatchData = {
  id: string;
  score: number;
  componentScores: unknown;
  flags: unknown;
  candidateInterest: boolean;
  companyInterest: boolean;
  status: string;
  candidate: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    currentLevel: string | null;
    industries: unknown;
    yearsManagement: number | null;
    maxPnl: string | null;
    maxReports: number | null;
    experienceContexts: unknown;
  };
};

function CandidateCard({
  match,
  state,
}: {
  match: CandidateMatchData;
  state: "mutual" | "candidate_first" | "company_first" | "fresh";
}) {
  const c = match.candidate;
  const components = (match.componentScores as ComponentScores | null) ?? null;
  const flags = (match.flags as Flag[] | null) ?? [];
  const industries = ((c.industries as string[] | null) ?? []).slice(0, 3);
  const contexts = ((c.experienceContexts as string[] | null) ?? []).slice(0, 4);

  const showName = state === "mutual";
  const displayName = showName
    ? `${c.firstName ?? ""} ${c.lastName ?? ""}`.trim() || "Кандидат"
    : `Кандидат #${c.id.slice(-6).toUpperCase()}`;

  const cardClass = state === "mutual" ? "pc-green p-5" : "pc p-5";

  return (
    <div className={cardClass}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-mono text-slate-400 mb-1.5">
            #{match.id.slice(-6).toUpperCase()}
          </p>
          <h3 className="text-lg font-bold text-slate-900">{displayName}</h3>
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            {c.currentLevel && <Tag>{c.currentLevel}</Tag>}
            {c.yearsManagement && <Tag>{c.yearsManagement} лет управления</Tag>}
            {c.maxPnl && c.maxPnl !== "none" && (
              <Tag>P&L {PNL_LABEL[c.maxPnl] ?? c.maxPnl}</Tag>
            )}
            {c.maxReports && <Tag>{c.maxReports}+ команда</Tag>}
          </div>
          {industries.length > 0 && (
            <p className="text-[11px] text-slate-500 mt-2">
              Отрасли: {industries.join(", ")}
            </p>
          )}
          {contexts.length > 0 && (
            <p className="text-[11px] text-slate-500 mt-0.5">
              Контексты: {contexts.join(", ")}
            </p>
          )}
        </div>
        <OverallScoreRing score={match.score} size={84} />
      </div>

      {components && (
        <div className="mt-4 space-y-1.5">
          <ScoreBar label="Компетенции" score={components.competency} />
          <ScoreBar label="Опыт и масштаб" score={components.trackRecord} />
          <ScoreBar label="Личностный fit" score={components.personality} />
          <ScoreBar label="Риск-профиль" score={components.risk} />
          <ScoreBar label="Мотивация" score={components.motivational} />
          <ScoreBar label="Культурный fit" score={components.cultural} />
        </div>
      )}

      {flags.length > 0 && (
        <div className="mt-4 space-y-1.5">
          {flags.map((f, i) => (
            <div
              key={i}
              className={`flex items-start gap-2 p-2.5 rounded-lg text-[12px] ${
                f.severity === "red"
                  ? "bg-red-50 text-red-800 border border-red-100"
                  : "bg-amber-50 text-amber-800 border border-amber-100"
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span className="leading-snug">{f.message}</span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center justify-end gap-2">
        {state === "mutual" ? (
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
            <CheckCircle2 className="w-4 h-4" />
            Контакты раскрыты
          </span>
        ) : state === "company_first" ? (
          <span className="text-sm text-slate-500 italic">
            Ждём ответа кандидата
          </span>
        ) : (
          <InterestButton matchId={match.id} role="company" />
        )}
      </div>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] text-slate-600 px-2 py-0.5 rounded bg-slate-100">
      {children}
    </span>
  );
}

function Section({
  title,
  subtitle,
  accent,
  children,
}: {
  title: string;
  subtitle: string;
  accent?: "green" | "amber";
  children: React.ReactNode;
}) {
  return (
    <section>
      <div>
        <h2
          className="text-xl font-bold tracking-tight"
          style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
        >
          {title}
        </h2>
        <p
          className={`text-xs mt-0.5 ${
            accent === "green"
              ? "text-emerald-700 font-medium"
              : accent === "amber"
                ? "text-amber-700 font-medium"
                : "text-slate-500"
          }`}
        >
          {subtitle}
        </p>
      </div>
      <div className="space-y-3 mt-3">{children}</div>
    </section>
  );
}

async function rescore(formData: FormData) {
  "use server";
  const id = formData.get("mandateId");
  if (typeof id === "string") {
    await triggerScoringForMandate(id);
  }
}

function RescoreButton({ mandateId }: { mandateId: string }) {
  return (
    <form action={rescore}>
      <input type="hidden" name="mandateId" value={mandateId} />
      <button
        type="submit"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 text-sm font-semibold hover:border-slate-300 transition-colors"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        Пересчитать кандидатов
      </button>
    </form>
  );
}
