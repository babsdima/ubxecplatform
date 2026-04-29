import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { CandidateNav } from "@/components/layout/candidate-nav";
import { SalaryBenchmark } from "@/components/salary-benchmark";
import { ArrowRight, FileText, Sparkles, Star, BarChart2, CheckCircle2, Circle } from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  PENDING:  { label: "На верификации", cls: "bg-amber-50 text-amber-700 border border-amber-200" },
  VERIFIED: { label: "Верифицирован",  cls: "badge-verified" },
  REJECTED: { label: "Отклонён",       cls: "bg-red-50 text-red-600 border border-red-200" },
};

const FORMAT_LABEL: Record<string, string> = {
  "full-time": "Найм в штат",
  mentor:      "Ментор",
  consultant:  "Консультант",
  board:       "Advisory Board",
};

const MATCH_TYPE_LABEL: Record<string, string> = {
  "full-time": "Найм",
  mentor:      "Ментор",
  consultant:  "Консультант",
  board:       "Board",
};

function StatCard({
  value,
  label,
  color,
  href,
  pulse,
}: {
  value: number;
  label: string;
  color?: string;
  href: string;
  pulse?: boolean;
}) {
  return (
    <Link href={href} className="block group">
      <div className="pc p-6 h-full transition-all duration-200 group-hover:shadow-[0_2px_8px_rgba(0,0,0,0.08),0_8px_24px_rgba(0,0,0,0.06)] group-hover:-translate-y-0.5">
        <p className={`stat-num ${color ?? "text-slate-800"}`}>{value}</p>
        <p className="text-sm text-slate-500 mt-1.5 font-medium">{label}</p>
        <p className={`text-xs text-slate-400 mt-2 flex items-center gap-1 transition-opacity ${pulse ? "opacity-100 text-slate-600" : "opacity-0 group-hover:opacity-100"}`}>
          Открыть <ArrowRight className="w-3 h-3" />
        </p>
      </div>
    </Link>
  );
}

export default async function CandidateDashboard() {
  const session = await auth();
  if (!session) redirect("/auth/login");

  const profile = await prisma.candidateProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      matches: {
        include: { mandate: { include: { company: true } } },
        orderBy: { score: "desc" },
        take: 4,
      },
      assessments: { where: { status: "COMPLETED" } },
    },
  });
  if (!profile) redirect("/candidate/onboarding");

  const allCount  = await prisma.match.count({ where: { candidateProfileId: profile.id } });
  const mutual    = await prisma.match.count({ where: { candidateProfileId: profile.id, status: "MUTUAL" } });
  const newCount  = await prisma.match.count({
    where: { candidateProfileId: profile.id, candidateInterest: false, status: { not: "MUTUAL" } },
  });

  const statusCfg = STATUS_CONFIG[profile.status] ?? { label: profile.status, cls: "bg-slate-100 text-slate-600" };
  const formats = profile.engagementFormats?.split(",").map((f) => FORMAT_LABEL[f] ?? f) ?? [];

  // Profile completeness
  const steps = [
    { label: "Профиль заполнен",   done: true },
    { label: "Имя и фамилия",      done: !!profile.firstName },
    { label: "Телефон",            done: !!profile.phone },
    { label: "LinkedIn",           done: !!profile.linkedinUrl },
    { label: "Текущая компания",   done: !!profile.currentCompany },
    { label: "Assessment",         done: profile.assessments.length > 0 },
    { label: "Верификация",        done: profile.status === "VERIFIED" },
  ];
  const doneCount = steps.filter((s) => s.done).length;
  const pct = Math.round((doneCount / steps.length) * 100);

  return (
    <div className="dash-bg">
      <CandidateNav active="dashboard" />

      {/* ── Dark hero strip ─────────────────────────────────────────────── */}
      <div className="dash-hero">
        <div className="max-w-5xl mx-auto px-5 pt-10 relative z-10">

          {/* Status banners */}
          {profile.status === "PENDING" && (
            <div className="mb-5 rounded-xl border px-4 py-3"
              style={{ background: "rgba(217,119,6,0.12)", borderColor: "rgba(217,119,6,0.3)" }}>
              <p className="text-sm font-medium" style={{ color: "var(--warning-light)" }}>
                Профиль на проверке — команда GradeUp верифицирует его в течение 24 часов.
              </p>
            </div>
          )}
          {profile.status === "REJECTED" && (
            <div className="mb-5 rounded-xl border px-4 py-3"
              style={{ background: "rgba(220,38,38,0.12)", borderColor: "rgba(220,38,38,0.3)" }}>
              <p className="text-sm font-medium text-red-300">
                Профиль отклонён. {profile.adminNote ?? "Обратитесь к команде поддержки."}
              </p>
            </div>
          )}

          {/* Profile hero — dark style */}
          <div>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold tracking-widest uppercase mb-2"
                  style={{ color: "rgba(255,255,255,0.35)" }}>
                  {profile.industry} · {profile.yearsExperience} лет опыта
                </p>
                <h1
                  className="text-3xl font-bold tracking-tight leading-snug"
                  style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "hsl(40 33% 96%)" }}
                >
                  {profile.firstName
                    ? `${profile.firstName} ${profile.lastName ?? ""}`.trim()
                    : profile.currentTitle}
                </h1>
                {profile.firstName && (
                  <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.45)" }}>
                    {profile.currentTitle}
                  </p>
                )}
              </div>
              <span className={`text-xs font-semibold px-3 py-1.5 rounded-full shrink-0 ${statusCfg.cls}`}>
                {statusCfg.label}
              </span>
            </div>

            <div className="mt-5 pt-5" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              <p className="text-xs font-bold tracking-widest uppercase mb-2"
                style={{ color: "rgba(255,255,255,0.25)" }}>
                Ключевые достижения
              </p>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
                {profile.achievements}
              </p>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm"
              style={{ color: "rgba(255,255,255,0.55)" }}>
              <span className="font-medium" style={{ color: "rgba(255,255,255,0.8)" }}>
                {(profile.salaryMin / 1_000_000).toFixed(1)}–{(profile.salaryMax / 1_000_000).toFixed(1)} млн руб/год
              </span>
              <span style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
              <span>{profile.locationPref}</span>
              {formats.length > 0 && (
                <>
                  <span style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
                  <div className="flex flex-wrap gap-1.5">
                    {formats.map((f) => (
                      <span key={f} className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.65)", border: "1px solid rgba(255,255,255,0.1)" }}>
                        {f}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-5 pb-10 space-y-8 -mt-2">

        {/* Stat tiles */}
        <div className="grid grid-cols-3 gap-4">
          <StatCard value={allCount}  label="Мэтчей всего"    href="/candidate/matches"             />
          <StatCard value={mutual}    label="Взаимных"         href="/candidate/matches?filter=mutual" color="text-green-600" />
          <StatCard value={newCount}  label="Новых"            href="/candidate/matches?filter=new"    color={newCount > 0 ? "text-slate-900" : undefined} pulse={newCount > 0} />
        </div>

        {/* Two-column: completeness + assessments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Profile completeness */}
          <div className="pc p-6 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-800">Заполненность профиля</p>
              <span className="text-sm font-bold" style={{ color: "var(--accent)" }}>{pct}%</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, background: "hsl(var(--ink-600))" }}
              />
            </div>
            <div className="grid grid-cols-2 gap-y-2 gap-x-4">
              {steps.map(({ label, done }) => (
                <div key={label} className="flex items-center gap-2">
                  {done
                    ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                    : <Circle className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                  }
                  <span className={`text-xs ${done ? "text-slate-700" : "text-slate-400"}`}>{label}</span>
                </div>
              ))}
            </div>
            {pct < 100 && (
              <div className="flex gap-2 pt-1 flex-wrap">
                {!profile.firstName && (
                  <Link href="/candidate/profile"
                    className="text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg px-3 py-1.5 transition-colors hover:bg-slate-50">
                    + Контакты
                  </Link>
                )}
                {profile.assessments.length === 0 && (
                  <Link href="/candidate/assessment"
                    className="text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg px-3 py-1.5 transition-colors hover:bg-slate-50">
                    + Пройти оценку
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Assessment status */}
          <div className="pc p-6 space-y-4">
            <p className="text-sm font-semibold text-slate-800">Оценка (Assessment)</p>
            <div className="space-y-2.5">
              {[
                { type: "HOGAN", icon: "🔬", label: "Hogan Assessments" },
                { type: "DISC",  icon: "🎯", label: "DISC Profile" },
                { type: "MBTI",  icon: "🧩", label: "MBTI" },
              ].map(({ type, icon, label }) => {
                const done = profile.assessments.some((a) => a.type === type);
                return (
                  <div key={type} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                    <div className="flex items-center gap-2.5 text-sm">
                      <span className="text-base">{icon}</span>
                      <span className={done ? "text-slate-800 font-medium" : "text-slate-500"}>{label}</span>
                    </div>
                    {done ? (
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-100">
                        Завершён
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">Не пройден</span>
                    )}
                  </div>
                );
              })}
            </div>
            <Link
              href="/candidate/assessment"
              className="flex items-center justify-between w-full text-sm text-slate-600 hover:text-slate-900 font-medium pt-1 transition-colors"
            >
              {profile.assessments.length === 0 ? "Запросить тестирование" : "Управлять оценками"}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Salary benchmark */}
        <SalaryBenchmark
          candidateId={profile.id}
          industry={profile.industry}
          salaryMin={profile.salaryMin}
          salaryMax={profile.salaryMax}
        />

        {/* Quick actions */}
        <div className="pc p-6">
          <p className="eyebrow mb-4">Быстрые действия</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { href: "/candidate/profile",    icon: FileText,  label: "Редактировать профиль" },
              { href: "/candidate/matches",    icon: Sparkles,  label: "Все мэтчи" },
              { href: "/candidate/assessment", icon: Star,      label: "Оценка" },
              { href: "/candidate/services",   icon: BarChart2, label: "Услуги" },
            ].map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-slate-600 font-medium hover:bg-slate-50 hover:text-slate-900 transition-all group"
              >
                <Icon className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors shrink-0" />
                <span className="truncate">{label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent matches */}
        {profile.matches.length > 0 && (
          <div className="pc overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
              <p className="text-sm font-semibold text-slate-800">Последние мэтчи</p>
              <Link href="/candidate/matches" className="text-xs text-slate-500 hover:text-slate-800 font-medium flex items-center gap-1 transition-colors">
                Все мэтчи <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-slate-50">
              {profile.matches.map((m) => (
                <div key={m.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50/60 transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-800 truncate">{m.mandate.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {m.mandate.isAnonymous ? "Анонимная компания" : m.mandate.company.companyName}
                      <span className="mx-1.5">·</span>
                      {MATCH_TYPE_LABEL[m.mandate.mandateType] ?? m.mandate.mandateType}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 ml-4 shrink-0">
                    <span className="text-sm font-bold text-slate-500 tabular-nums">{m.score}%</span>
                    {m.status === "MUTUAL" ? (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-100">
                        Взаимно
                      </span>
                    ) : m.candidateInterest ? (
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                        Интерес
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                        Новый
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
