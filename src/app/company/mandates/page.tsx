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

const statusMap: Record<string, string> = {
  ACTIVE: "Активен",
  DRAFT: "Черновик",
  CLOSED: "Закрыт",
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

  return (
    <div className="min-h-screen bg-muted/30">
      <CompanyNav active="mandates" />

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Позиции</h1>
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
            <CardContent className="py-12 text-center text-muted-foreground">
              {filter
                ? "Нет позиций в этой категории"
                : "Создайте первую позицию, чтобы начать поиск кандидатов"}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filtered.map((mandate) => {
              const mutual = mandate.matches.filter((m) => m.status === "MUTUAL").length;
              const interested = mandate.matches.filter(
                (m) => m.candidateInterest && !m.companyInterest && m.status !== "MUTUAL"
              ).length;

              return (
                <Card key={mandate.id}>
                  <CardHeader className="flex flex-row items-start justify-between pb-2">
                    <div>
                      <Link href={`/company/mandates/${mandate.id}`}>
                        <CardTitle className="text-lg hover:underline cursor-pointer">
                          {mandate.title}
                        </CardTitle>
                      </Link>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {mandate.industry} · {(mandate.salaryMin / 1_000_000).toFixed(1)}–
                        {(mandate.salaryMax / 1_000_000).toFixed(1)} млн руб/год
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {interested > 0 && (
                        <Badge variant="outline" className="text-amber-600 border-amber-400 text-xs">
                          {interested} новых
                        </Badge>
                      )}
                      <Badge variant={mandate.status === "ACTIVE" ? "default" : "secondary"}>
                        {statusMap[mandate.status] ?? mandate.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">{mandate.description}</p>
                    <div className="flex gap-4 mt-3 text-sm">
                      <span className="text-muted-foreground">{mandate.matches.length} мэтчей</span>
                      {mutual > 0 && (
                        <span className="text-green-600 font-medium">{mutual} взаимных</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
