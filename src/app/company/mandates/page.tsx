import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { CompanyNav } from "@/components/layout/company-nav";
import { TabFilters } from "@/components/tab-filters";
import { Suspense } from "react";
import { ArrowRight, Lock, Plus } from "lucide-react";

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

export default async function MandatesPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/auth/login");

  const { filter } = await searchParams;

  const company = await prisma.companyProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      mandates: {
        include: { matches: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!company) redirect("/company/onboarding");

  const allMandates = company.mandates;

  const filtered = (() => {
    switch (filter) {
      case "ACTIVE": return allMandates.filter((m) => m.status === "ACTIVE");
      case "DRAFT":  return allMandates.filter((m) => m.status === "DRAFT");
      case "CLOSED": return allMandates.filter((m) => m.status === "CLOSED");
      default:       return allMandates;
    }
  })();

  const counts = {
    all:    allMandates.length,
    ACTIVE: allMandates.filter((m) => m.status === "ACTIVE").length,
    DRAFT:  allMandates.filter((m) => m.status === "DRAFT").length,
    CLOSED: allMandates.filter((m) => m.status === "CLOSED").length,
  };

  const tabs = [
    { value: "",       label: "Все",       count: counts.all },
    { value: "ACTIVE", label: "Активные",  count: counts.ACTIVE },
    { value: "DRAFT",  label: "Черновики", count: counts.DRAFT },
    { value: "CLOSED", label: "Закрытые",  count: counts.CLOSED },
  ];

  const totalAwaiting = allMandates.reduce(
    (s, m) => s + m.matches.filter((x) => x.candidateInterest && !x.companyInterest && x.status !== "MUTUAL").length,
    0
  );

  return (
    <div className="dash-bg">
      <CompanyNav active="mandates" />

      {/* Dark page header */}
      <div className="dash-hero">
        <div className="max-w-5xl mx-auto px-5 pt-10 pb-2 relative z-10 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-widest uppercase mb-2"
              style={{ color: "rgba(255,255,255,0.35)" }}>Компания</p>
            <h1
              className="text-3xl font-bold tracking-tight"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "hsl(40 33% 96%)" }}
            >
              Позиции
            </h1>
            {totalAwaiting > 0 ? (
              <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.6)" }}>
                🔥 {totalAwaiting} {totalAwaiting === 1 ? "кандидат ждёт" : "кандидата ждут"} ответа
              </p>
            ) : (
              <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
                {counts.all} позиций · {counts.ACTIVE} активных
              </p>
            )}
          </div>
          <Link
            href="/company/mandates/new"
            className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl transition-colors shrink-0"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            <Plus className="w-3.5 h-3.5" />
            Новая позиция
          </Link>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-5 pt-6 pb-10 -mt-2">

        {allMandates.length > 0 && (
          <Suspense>
            <TabFilters tabs={tabs} />
          </Suspense>
        )}

        {filtered.length === 0 ? (
          <div className="pc p-12 text-center space-y-4 mt-4">
            <p className="text-slate-500 text-sm">
              {filter
                ? "Нет позиций в этой категории"
                : "Создайте первую позицию, чтобы начать поиск кандидатов"}
            </p>
            {!filter && (
              <Link
                href="/company/mandates/new"
                className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Создать позицию
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            {filtered.map((mandate) => {
              const mutual = mandate.matches.filter((m) => m.status === "MUTUAL").length;
              const awaitingReply = mandate.matches.filter(
                (m) => m.candidateInterest && !m.companyInterest && m.status !== "MUTUAL"
              ).length;
              const typeLabel = MANDATE_TYPE_LABEL[mandate.mandateType] ?? mandate.mandateType;
              const typeColor = MANDATE_TYPE_COLOR[mandate.mandateType] ?? "bg-slate-100 text-slate-600";

              return (
                <Link key={mandate.id} href={`/company/mandates/${mandate.id}`} className="block group">
                  <div className={`pc transition-all duration-200 group-hover:shadow-[0_2px_8px_rgba(0,0,0,0.08),0_8px_24px_rgba(0,0,0,0.06)] group-hover:-translate-y-0.5 overflow-hidden ${awaitingReply > 0 ? "border-amber-200" : ""}`}>
                    {awaitingReply > 0 && (
                      <div className="h-0.5 bg-gradient-to-r from-amber-400 to-amber-300" />
                    )}
                    {mutual > 0 && awaitingReply === 0 && (
                      <div className="h-0.5 bg-gradient-to-r from-green-500 to-green-400" />
                    )}
                    <div className="p-6">
                      {/* Top row */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1.5">
                            <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${typeColor}`}>
                              {typeLabel}
                            </span>
                            {mandate.isAnonymous && (
                              <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">
                                <Lock className="w-2.5 h-2.5" />
                                Анонимно
                              </span>
                            )}
                          </div>
                          <h3 className="text-base font-semibold text-slate-900 group-hover:text-slate-700 transition-colors leading-snug">
                            {mandate.title}
                          </h3>
                          <p className="text-sm text-slate-500 mt-0.5">
                            {mandate.industry}
                            <span className="mx-1.5 text-slate-300">·</span>
                            {(mandate.salaryMin / 1_000_000).toFixed(1)}–{(mandate.salaryMax / 1_000_000).toFixed(1)} млн руб/год
                          </p>
                        </div>
                        <div className="flex items-center gap-2.5 shrink-0">
                          {awaitingReply > 0 && (
                            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                              🔥 {awaitingReply} ждут
                            </span>
                          )}
                          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                            mandate.status === "ACTIVE"
                              ? "bg-green-50 text-green-700 border border-green-100"
                              : mandate.status === "DRAFT"
                              ? "bg-slate-100 text-slate-500"
                              : "bg-red-50 text-red-500"
                          }`}>
                            {mandate.status === "ACTIVE" ? "Активен" : mandate.status === "DRAFT" ? "Черновик" : "Закрыт"}
                          </span>
                          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors" />
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-slate-600 leading-relaxed mt-3 line-clamp-2">{mandate.description}</p>

                      {/* Stats footer */}
                      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-50 text-xs font-medium">
                        <span className="text-slate-400">{mandate.matches.length} мэтчей</span>
                        {awaitingReply > 0 && (
                          <span className="text-amber-600">{awaitingReply} ждут ответа</span>
                        )}
                        {mutual > 0 && (
                          <span className="text-green-600">✓ {mutual} взаимных</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
