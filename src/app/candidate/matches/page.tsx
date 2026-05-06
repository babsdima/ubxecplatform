import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { CandidateNav } from "@/components/layout/candidate-nav";
import { InterestButton } from "@/components/interest-button";
import { OverallScoreRing } from "@/components/charts/overall-score-ring";
import { ScoreBar } from "@/components/charts/score-bar";
import {
  Briefcase,
  Building2,
  MapPin,
  Wallet,
  AlertTriangle,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { triggerScoringForCandidate } from "@/lib/scoring/actions";

type ComponentScores = {
  competency: number;
  trackRecord: number;
  personality: number;
  risk: number;
  motivational: number;
  cultural: number;
};

type Flag = {
  scale: string;
  severity: "red" | "yellow";
  message: string;
};

const COMP_LABEL: Record<string, string> = {
  "5_10M": "5–10 млн ₽",
  "10_15M": "10–15 млн ₽",
  "15_25M": "15–25 млн ₽",
  "25_40M": "25–40 млн ₽",
  "40_60M": "40–60 млн ₽",
  "60M+": "60+ млн ₽",
};

export default async function CandidateMatches() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const profile = await prisma.candidateProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!profile) redirect("/candidate/onboarding");

  const matches = await prisma.match.findMany({
    where: {
      candidateProfileId: profile.id,
      score: { gte: 35 }, // отсекаем явные mismatch
    },
    include: {
      mandate: {
        include: {
          company: {
            select: {
              name: true,
              companyName: true,
              descriptionShort: true,
              industryPrimary: true,
              companyType: true,
            },
          },
        },
      },
    },
    orderBy: { score: "desc" },
  });

  const mutualMatches = matches.filter((m) => m.status === "MUTUAL");
  const pendingMatches = matches.filter(
    (m) => m.status !== "MUTUAL" && !m.candidateInterest,
  );
  const interestedMatches = matches.filter(
    (m) => m.candidateInterest && m.status !== "MUTUAL",
  );

  return (
    <div className="dash-bg">
      <CandidateNav active="matches" />

      <div className="dash-hero">
        <div className="max-w-4xl mx-auto px-5 pt-10 pb-2 relative z-10">
          <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: "rgba(255,255,255,0.35)" }}>
            Кандидат
          </p>
          <h1
            className="text-3xl font-bold tracking-tight"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "hsl(40 33% 96%)" }}
          >
            Мэтчи
          </h1>
          <p className="text-sm mt-1 leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>
            Подобранные роли. Выразите интерес — компания увидит ваш профиль анонимно.
            При взаимном интересе откроются контакты.
          </p>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-5 pt-6 pb-12 -mt-2 space-y-8">
        {/* Mutual matches */}
        {mutualMatches.length > 0 && (
          <section>
            <SectionHeader
              title="Взаимный интерес"
              subtitle={`${mutualMatches.length} • контакты раскрыты`}
              accent="green"
            />
            <div className="space-y-3 mt-3">
              {mutualMatches.map((m) => (
                <RoleCard key={m.id} match={m} mutual />
              ))}
            </div>
          </section>
        )}

        {/* Interested (waiting for company) */}
        {interestedMatches.length > 0 && (
          <section>
            <SectionHeader
              title="Вы выразили интерес"
              subtitle={`${interestedMatches.length} • ждём ответа компании`}
            />
            <div className="space-y-3 mt-3">
              {interestedMatches.map((m) => (
                <RoleCard key={m.id} match={m} pending />
              ))}
            </div>
          </section>
        )}

        {/* Pending (need decision) */}
        {pendingMatches.length > 0 ? (
          <section>
            <SectionHeader
              title="Подобранные роли"
              subtitle={`${pendingMatches.length} • ждут вашей реакции`}
            />
            <div className="space-y-3 mt-3">
              {pendingMatches.map((m) => (
                <RoleCard key={m.id} match={m} />
              ))}
            </div>
          </section>
        ) : matches.length === 0 ? (
          <EmptyState />
        ) : null}
      </main>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
//  Sub-components
// ────────────────────────────────────────────────────────────────────

type MatchCardProps = {
  match: {
    id: string;
    score: number;
    componentScores: unknown;
    flags: unknown;
    candidateInterest: boolean;
    status: string;
    mandate: {
      title: string;
      mainChallenge: string | null;
      budgetRange: string | null;
      relocationRequired: string | null;
      company: {
        name: string | null;
        companyName: string;
        descriptionShort: string | null;
        industryPrimary: string | null;
        companyType: string | null;
      };
    };
  };
  mutual?: boolean;
  pending?: boolean;
};

function RoleCard({ match, mutual, pending }: MatchCardProps) {
  const m = match.mandate;
  const components = (match.componentScores as ComponentScores | null) ?? null;
  const flags = (match.flags as Flag[] | null) ?? [];
  const company = m.company;

  const showCompanyName = mutual;
  const companyDisplayName = showCompanyName
    ? (company.name ?? company.companyName ?? "Компания")
    : `${companyTypeLabel(company.companyType)} · ${company.industryPrimary ?? "—"}`;

  return (
    <div className={mutual ? "pc-green p-5" : "pc p-5"}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-mono text-slate-400 mb-1.5">
            #{match.id.slice(-6).toUpperCase()}
            {mutual && <Lock className="w-3 h-3 inline ml-2 text-emerald-700" />}
          </p>
          <h3 className="text-lg font-bold text-slate-900 leading-tight">{m.title}</h3>
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            <Tag icon={<Building2 className="w-3 h-3" />}>{companyDisplayName}</Tag>
            {m.budgetRange && (
              <Tag icon={<Wallet className="w-3 h-3" />}>
                {COMP_LABEL[m.budgetRange] ?? m.budgetRange}
              </Tag>
            )}
            {m.relocationRequired && m.relocationRequired !== "no" && (
              <Tag icon={<MapPin className="w-3 h-3" />}>
                Релокация: {relocationLabel(m.relocationRequired)}
              </Tag>
            )}
          </div>
        </div>
        <OverallScoreRing score={match.score} size={84} />
      </div>

      {m.mainChallenge && (
        <div className="mt-4 p-3.5 rounded-lg bg-emerald-50 border border-emerald-200">
          <p className="text-[10px] font-bold tracking-wider uppercase text-emerald-700 mb-1">
            Главный вызов
          </p>
          <p className="text-[13.5px] text-slate-800 leading-relaxed">{m.mainChallenge}</p>
        </div>
      )}

      {components && (
        <div className="mt-4 space-y-1.5">
          <ScoreBar label="Компетенции" score={components.competency} />
          <ScoreBar label="Опыт и масштаб" score={components.trackRecord} />
          <ScoreBar label="Личностный fit" score={components.personality} />
          <ScoreBar label="Риск-профиль" score={components.risk} />
          <ScoreBar
            label="Мотивация"
            score={components.motivational}
            showWarning={components.motivational < 60}
          />
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
        {mutual ? (
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
            <CheckCircle2 className="w-4 h-4" />
            Контакты раскрыты
          </span>
        ) : pending ? (
          <span className="text-sm text-slate-500 italic">Ждём ответа компании</span>
        ) : (
          <InterestButton matchId={match.id} role="candidate" />
        )}
      </div>
    </div>
  );
}

function Tag({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] text-slate-600 px-2 py-0.5 rounded bg-slate-100">
      {icon}
      {children}
    </span>
  );
}

function SectionHeader({
  title,
  subtitle,
  accent,
}: {
  title: string;
  subtitle: string;
  accent?: "green";
}) {
  return (
    <div>
      <h2 className="text-xl font-bold tracking-tight" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
        {title}
      </h2>
      <p
        className={`text-xs mt-0.5 ${
          accent === "green" ? "text-emerald-700 font-medium" : "text-slate-500"
        }`}
      >
        {subtitle}
      </p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="pc p-8 text-center">
      <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
      <h3 className="text-lg font-bold text-slate-900">Подходящих ролей пока нет</h3>
      <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto leading-relaxed">
        Завершите все блоки опросника — это улучшит точность матчинга.
        Также роли могут появиться, когда компании опубликуют новые мандаты.
      </p>
      <div className="mt-5 flex justify-center gap-3">
        <Link
          href="/candidate/assessment"
          className="px-5 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700"
        >
          К опроснику
        </Link>
        <RescoreButton />
      </div>
    </div>
  );
}

async function triggerRescore() {
  "use server";
  await triggerScoringForCandidate();
}

function RescoreButton() {
  return (
    <form action={triggerRescore}>
      <button
        type="submit"
        className="px-5 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-sm font-semibold hover:border-slate-300"
      >
        Пересчитать мэтчи
      </button>
    </form>
  );
}

// ────────────────────────────────────────────────────────────────────
//  Helpers
// ────────────────────────────────────────────────────────────────────

function companyTypeLabel(t: string | null): string {
  switch (t) {
    case "public": return "Публичная компания";
    case "private": return "Частная компания";
    case "pe_backed": return "PE-портфельная";
    case "startup": return "Стартап";
    case "state": return "Госкомпания";
    case "family": return "Семейный бизнес";
    case "jv": return "Joint Venture";
    default: return "Компания";
  }
}

function relocationLabel(r: string): string {
  switch (r) {
    case "yes": return "обязательна";
    case "preferred": return "желательно";
    case "hybrid_ok": return "гибрид";
    case "remote_ok": return "remote ok";
    default: return r;
  }
}
