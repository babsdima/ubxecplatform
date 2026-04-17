import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CompanyNav } from "@/components/layout/company-nav";
import { TabFilters } from "@/components/tab-filters";
import { Suspense } from "react";
import { ArrowRight } from "lucide-react";

const STATUS_MAP: Record<string, string> = {
  ACTIVE: "Активен",
  DRAFT: "Черновик",
  CLOSED: "Закрыт",
};

const MANDATE_TYPE_LABEL: Record<string, string> = {
  "full-time": "Найм в штат",
  mentor: "Ментор",
  consultant: "Консультант",
  board: "Advisory Board",
};

const MANDATE_TYPE_COLOR: Record<string, string> = {
  "full-time": "bg-blue-50 text-blue-700 border-blue-200",
  mentor: "bg-purple-50 text-purple-700 border-purple-200",
  consultant: "bg-orange-50 text-orange-700 border-orange-200",
  board: "bg-teal-50 text-teal-700 border-teal-200",
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

  // Суммарно ждут ответа
  const totalAwaiting = allMandates.reduce(
    (s, m) => s + m.matches.filter((x) => x.candidateInterest && !x.companyInterest && x.status !== "MUTUAL").length,
    0
  );

  return (
    <div className="min-h-screen bg-muted/30">
      <CompanyNav active="mandates" />

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Позиции</h1>
            {totalAwaiting > 0 && (
              <p className="text-sm text-amber-700 mt-0.5">
                🔥 {totalAwaiting} {totalAwaiting === 1 ? "кандидат ждёт" : "кандидата ждут"} вашего ответа
              </p>
            )}
          </div>
          <Button asChild>
            <Link href="/company/mandates/new">+ Новая позиция</Link>
          </Button>
        </div>

        {allMandates.length > 0 && (
          <Suspense>
            <TabFilters tabs={tabs} />
          </Suspense>
        )}

        {filtered.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center space-y-4">
              <p className="text-muted-foreground">
                {filter
                  ? "Нет позиций в этой категории"
                  : "Создайте первую позицию, чтобы начать поиск кандидатов"}
              </p>
              {!filter && (
                <Button asChild>
                  <Link href="/company/mandates/new">Создать позицию</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filtered.map((mandate) => {
              const mutual = mandate.matches.filter((m) => m.status === "MUTUAL").length;
              const awaitingReply = mandate.matches.filter(
                (m) => m.candidateInterest && !m.companyInterest && m.status !== "MUTUAL"
              ).length;
              const typeLabel = MANDATE_TYPE_LABEL[mandate.mandateType] ?? mandate.mandateType;
              const typeColor = MANDATE_TYPE_COLOR[mandate.mandateType] ?? "bg-muted text-muted-foreground border";

              return (
                <Link key={mandate.id} href={`/company/mandates/${mandate.id}`} className="block group">
                  <Card className={`transition-shadow group-hover:shadow-md ${awaitingReply > 0 ? "border-amber-300" : ""}`}>
                    <CardHeader className="flex flex-row items-start justify-between pb-2">
                      <div className="flex-1 min-w-0 pr-4">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <CardTitle className="text-lg group-hover:text-primary transition-colors">
                            {mandate.title}
                          </CardTitle>
                          <span className={`text-xs px-2 py-0.5 rounded border font-medium ${typeColor}`}>
                            {typeLabel}
                          </span>
                          {mandate.isAnonymous && (
                            <span className="text-xs px-2 py-0.5 rounded border bg-muted text-muted-foreground">
                              🔒 Анонимно
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {mandate.industry} · {(mandate.salaryMin / 1_000_000).toFixed(1)}–
                          {(mandate.salaryMax / 1_000_000).toFixed(1)} млн руб/год
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {awaitingReply > 0 && (
                          <Badge variant="outline" className="text-amber-600 border-amber-400 text-xs">
                            🔥 {awaitingReply} ждут
                          </Badge>
                        )}
                        <Badge variant={mandate.status === "ACTIVE" ? "default" : "secondary"}>
                          {STATUS_MAP[mandate.status] ?? mandate.status}
                        </Badge>
                        <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{mandate.description}</p>
                      <div className="flex gap-4 text-sm">
                        <span className="text-muted-foreground">{mandate.matches.length} мэтчей</span>
                        {awaitingReply > 0 && (
                          <span className="text-amber-600 font-medium">{awaitingReply} ждут ответа</span>
                        )}
                        {mutual > 0 && (
                          <span className="text-green-600 font-medium">✓ {mutual} взаимных</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
