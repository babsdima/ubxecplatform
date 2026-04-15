import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CompanyNav } from "@/components/layout/company-nav";
import { ArrowRight, Plus, Users, CreditCard } from "lucide-react";

export default async function CompanyDashboard() {
  const session = await auth();
  if (!session) redirect("/auth/login");

  const company = await prisma.companyProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      mandates: {
        include: { matches: true },
        orderBy: { createdAt: "desc" },
        take: 5,
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
  const newInterest = company.mandates.reduce(
    (s, m) =>
      s + m.matches.filter((x) => x.candidateInterest && !x.companyInterest && x.status !== "MUTUAL").length,
    0
  );

  return (
    <div className="min-h-screen bg-muted/30">
      <CompanyNav active="dashboard" />

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{company.companyName}</h1>
            <p className="text-muted-foreground text-sm">{company.industry}</p>
          </div>
          {company.isVerified && <Badge>Верифицирована</Badge>}
        </div>

        {/* Stat cards — clickable */}
        <div className="grid grid-cols-4 gap-4">
          <Link href="/company/mandates" className="block group">
            <Card className="h-full transition-shadow group-hover:shadow-md">
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold">{totalMandates}</p>
                <p className="text-sm text-muted-foreground mt-1">Позиций</p>
                <p className="text-xs text-primary mt-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                  Смотреть <ArrowRight className="w-3 h-3" />
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/company/mandates?filter=ACTIVE" className="block group">
            <Card className="h-full transition-shadow group-hover:shadow-md">
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold text-primary">{activeM}</p>
                <p className="text-sm text-muted-foreground mt-1">Активных</p>
                <p className="text-xs text-primary mt-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                  Смотреть <ArrowRight className="w-3 h-3" />
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/company/mandates" className="block group">
            <Card className="h-full transition-shadow group-hover:shadow-md">
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold">{totalMatches}</p>
                <p className="text-sm text-muted-foreground mt-1">Мэтчей</p>
                {newInterest > 0 && (
                  <p className="text-xs text-amber-600 font-medium mt-1">{newInterest} новых</p>
                )}
              </CardContent>
            </Card>
          </Link>

          <Link href="/company/mandates" className="block group">
            <Card className="h-full transition-shadow group-hover:shadow-md">
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold text-green-600">{mutualMatches}</p>
                <p className="text-sm text-muted-foreground mt-1">Взаимных</p>
                <p className="text-xs text-primary mt-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                  Смотреть <ArrowRight className="w-3 h-3" />
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {/* Mandates list */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Последние позиции</CardTitle>
                <Button size="sm" asChild>
                  <Link href="/company/mandates/new">+ Новая позиция</Link>
                </Button>
              </CardHeader>
              <CardContent>
                {company.mandates.length === 0 ? (
                  <p className="text-muted-foreground text-sm py-4 text-center">
                    Пока нет позиций.{" "}
                    <Link href="/company/mandates/new" className="underline">Создать первую</Link>
                  </p>
                ) : (
                  <div className="space-y-3">
                    {company.mandates.map((m) => {
                      const candidateInterest = m.matches.filter(
                        (x) => x.candidateInterest && !x.companyInterest && x.status !== "MUTUAL"
                      ).length;
                      return (
                        <div key={m.id} className="flex items-center justify-between py-2 border-b last:border-0">
                          <div>
                            <Link
                              href={`/company/mandates/${m.id}`}
                              className="font-medium text-sm hover:underline"
                            >
                              {m.title}
                            </Link>
                            <p className="text-xs text-muted-foreground">
                              {m.matches.length} мэтчей
                              {candidateInterest > 0 && (
                                <span className="text-amber-600 ml-1">· {candidateInterest} новых</span>
                              )}
                            </p>
                          </div>
                          <Badge variant={m.status === "ACTIVE" ? "default" : "secondary"}>
                            {m.status === "ACTIVE" ? "Активен" : m.status === "DRAFT" ? "Черновик" : "Закрыт"}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Быстрые действия</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/company/mandates/new"
                className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted transition-colors group">
                <div className="flex items-center gap-2.5">
                  <Plus className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Новая позиция</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              <Link href="/company/mandates"
                className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted transition-colors group">
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Все кандидаты</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              <Link href="/company/profile"
                className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted transition-colors group">
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Профиль компании</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              <Link href="/pricing"
                className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted transition-colors group">
                <div className="flex items-center gap-2.5">
                  <CreditCard className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Тарифы</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
