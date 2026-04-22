import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { CompanyNav } from "@/components/layout/company-nav";
import { ArrowRight, Plus, Building2, CreditCard, Settings, CheckCircle2 } from "lucide-react";

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

export default async function CompanyDashboard() {
  const session = await auth();
  if (!session) redirect("/auth/login");

  const company = await prisma.companyProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      mandates: {
        include: { matches: true },
        orderBy: { createdAt: "desc" },
        take: 6,
      },
    },
  });

  if (!company) redirect("/company/onboarding");

  const totalMandates = company.mandates.length;
  const activeM = company.mandates.filter((m) => m.status === "ACTIVE").length;
  const totalMatches = company.mandates.reduce((s, m) => s + m.matches.length, 0);
  const mutualMatches = company.mandates.reduce(
    (s, m) => s + m.matches.filter((x) => x.status === "MUTUAL").length,
    0
  );

  const awaitingAction = company.mandates.flatMap((m) =>
    m.matches
      .filter((x) => x.candidateInterest && !x.companyInterest && x.status !== "MUTUAL")
      .map((x) => ({ ...x, mandateTitle: m.title, mandateId: m.id }))
  );

  return (
    <div className="dash-bg">
      <CompanyNav active="dashboard" />

      {/* ── Dark hero strip ─────────────────────────────────────────────── */}
      <div className="dash-hero">
        <div className="max-w-5xl mx-auto px-5 pt-10 relative z-10">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold tracking-widest uppercase mb-2"
                style={{ color: "rgba(255,255,255,0.35)" }}>
                {company.industry} · {company.size}
              </p>
              <h1
                className="text-3xl font-bold tracking-tight leading-snug"
                style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "hsl(40 33% 96%)" }}
              >
                {company.companyName}
              </h1>
              {company.website && (
                <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
                  {company.website}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0 mt-1">
              {company.isVerified ? (
                <span className="badge-verified">Верифицирована</span>
              ) : (
                <span className="text-xs font-semibold px-3 py-1.5 rounded-full"
                  style={{ background: "var(--warning-bg)", color: "var(--warning)", border: "1px solid var(--warning-border)" }}>
                  На проверке
                </span>
              )}
            </div>
          </div>

          {company.description && (
            <div className="mt-5 pt-5" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              <p className="text-xs font-bold tracking-widest uppercase mb-2"
                style={{ color: "rgba(255,255,255,0.25)" }}>
                О компании
              </p>
              <p className="text-sm leading-relaxed line-clamp-2" style={{ color: "rgba(255,255,255,0.55)" }}>
                {company.description}
              </p>
            </div>
          )}

          <div className="mt-6 flex items-center gap-3">
            <Link
              href="/company/mandates/new"
              className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
              style={{ background: "var(--accent)", color: "#fff" }}
            >
              <Plus className="w-3.5 h-3.5" />
              Новая позиция
            </Link>
            <Link
              href="/company/mandates"
              className="inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-xl transition-colors"
              style={{ border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.65)", background: "rgba(255,255,255,0.04)" }}
            >
              Все позиции
            </Link>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-5 pb-10 space-y-8 -mt-2">

        {/* Urgent: awaiting action */}
        {awaitingAction.length > 0 && (
          <div className="pc-amber p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-amber-800 mb-2">
                  {awaitingAction.length === 1
                    ? "1 кандидат заинтересован — ждёт вашего ответа"
                    : `${awaitingAction.length} кандидата заинтересованы — ждут вашего ответа`}
                </p>
                <div className="space-y-1.5">
                  {awaitingAction.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-4">
                      <p className="text-sm text-amber-700">
                        Позиция: <strong>{item.mandateTitle}</strong>
                      </p>
                      <Link
                        href={`/company/mandates/${item.mandateId}`}
                        className="text-xs font-semibold text-amber-700 border border-amber-300 rounded-lg px-3 py-1 hover:bg-amber-100 transition-colors shrink-0"
                      >
                        Посмотреть
                      </Link>
                    </div>
                  ))}
                  {awaitingAction.length > 3 && (
                    <p className="text-xs text-amber-600 mt-1">+{awaitingAction.length - 3} ещё</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mutual matches banner */}
        {mutualMatches > 0 && (
          <div className="pc-green p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 text-sm text-green-800">
              <CheckCircle2 className="w-4.5 h-4.5 text-green-600 shrink-0" />
              <span>
                <strong>{mutualMatches} взаимных мэтча</strong> — контакты кандидатов открыты
              </span>
            </div>
            <Link
              href="/company/mandates"
              className="text-xs font-semibold text-green-700 border border-green-300 rounded-lg px-3 py-1.5 hover:bg-green-100 transition-colors shrink-0"
            >
              Перейти к позициям
            </Link>
          </div>
        )}

        {/* Stat tiles */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard value={totalMandates} label="Позиций всего"   href="/company/mandates" />
          <StatCard value={activeM}       label="Активных"         href="/company/mandates?filter=ACTIVE" color={activeM > 0 ? "text-slate-900" : undefined} />
          <StatCard value={totalMatches}  label="Мэтчей всего"    href="/company/mandates" />
          <StatCard value={mutualMatches} label="Взаимных"         href="/company/mandates" color="text-green-600" pulse={mutualMatches > 0} />
        </div>

        {/* Mandates list + Quick actions */}
        <div className="grid md:grid-cols-3 gap-5">

          {/* Mandates list */}
          <div className="md:col-span-2 pc overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
              <p className="text-sm font-semibold text-slate-800">Последние позиции</p>
              <Link href="/company/mandates" className="text-xs text-slate-500 hover:text-slate-800 font-medium flex items-center gap-1 transition-colors">
                Все позиции <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {company.mandates.length === 0 ? (
              <div className="py-12 text-center space-y-3 px-6">
                <p className="text-slate-500 text-sm">Пока нет позиций.</p>
                <Link
                  href="/company/mandates/new"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Создать первую позицию
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {company.mandates.map((m) => {
                  const candidateInterest = m.matches.filter(
                    (x) => x.candidateInterest && !x.companyInterest && x.status !== "MUTUAL"
                  ).length;
                  const mutual = m.matches.filter((x) => x.status === "MUTUAL").length;
                  const typeColor = MANDATE_TYPE_COLOR[m.mandateType] ?? "bg-slate-100 text-slate-600";
                  return (
                    <Link
                      key={m.id}
                      href={`/company/mandates/${m.id}`}
                      className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50/60 transition-colors group"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-800 truncate">{m.title}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold mr-1.5 ${typeColor}`}>
                            {MANDATE_TYPE_LABEL[m.mandateType] ?? m.mandateType}
                          </span>
                          {m.matches.length} мэтчей
                          {candidateInterest > 0 && (
                            <span className="text-amber-600 font-medium"> · {candidateInterest} ждут ответа</span>
                          )}
                          {mutual > 0 && (
                            <span className="text-green-600 font-medium"> · {mutual} взаимных</span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-2.5 ml-4 shrink-0">
                        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                          m.status === "ACTIVE"
                            ? "bg-green-50 text-green-700 border border-green-100"
                            : m.status === "DRAFT"
                            ? "bg-slate-100 text-slate-500"
                            : "bg-red-50 text-red-500"
                        }`}>
                          {m.status === "ACTIVE" ? "Активен" : m.status === "DRAFT" ? "Черновик" : "Закрыт"}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600 transition-colors" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="pc p-6 space-y-1">
            <p className="eyebrow mb-4">Быстрые действия</p>
            {[
              { href: "/company/mandates/new", icon: Plus,      label: "Новая позиция" },
              { href: "/company/mandates",     icon: Building2, label: "Все позиции" },
              { href: "/company/profile",      icon: Settings,  label: "Профиль компании" },
              { href: "/pricing",              icon: CreditCard, label: "Тарифы" },
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
      </main>
    </div>
  );
}
