import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CompanyNav } from "@/components/layout/company-nav";
import { ArrowRight, Plus, Building2, CreditCard, Settings } from "lucide-react";

const MANDATE_TYPE_LABEL: Record<string, string> = {
  "full-time": "Найм в штат",
  mentor: "Ментор",
  consultant: "Консультант",
  board: "Advisory Board",
};

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

  // Кандидаты с интересом, ждущие ответа компании
  const awaitingAction = company.mandates.flatMap((m) =>
    m.matches
      .filter((x) => x.candidateInterest && !x.companyInterest && x.status !== "MUTUAL")
      .map((x) => ({ ...x, mandateTitle: m.title, mandateId: m.id }))
  );

  return (
    <div className="min-h-screen bg-muted/30">
      <CompanyNav active="dashboard" />

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{company.companyName}</h1>
            <p className="text-muted-foreground text-sm">{company.industry} · {company.size}</p>
          </div>
          <div className="flex items-center gap-2">
            {company.isVerified && <Badge>Верифицирована</Badge>}
            <Button asChild size="sm">
              <Link href="/company/mandates/new">+ Новая позиция</Link>
            </Button>
          </div>
        </div>

        {/* Urgent: awaiting action */}
        {awaitingAction.length > 0 && (
          <Card className="border-amber-300 bg-amber-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-amber-800 flex items-center gap-2">
                <span>🔥</span>
                {awaitingAction.length === 1
                  ? "1 кандидат ждёт вашего ответа"
                  : `${awaitingAction.length} кандидата ждут вашего ответа`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {awaitingAction.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <p className="text-sm text-amber-800">
                      Позиция: <strong>{item.mandateTitle}</strong>
                    </p>
                    <Button variant="outline" size="sm" className="h-7 text-xs border-amber-400 text-amber-700 hover:bg-amber-100" asChild>
                      <Link href={`/company/mandates/${item.mandateId}`}>Посмотреть</Link>
                    </Button>
                  </div>
                ))}
                {awaitingAction.length > 3 && (
                  <p className="text-xs text-amber-700">+{awaitingAction.length - 3} ещё</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mutual matches banner */}
        {mutualMatches > 0 && (
          <div className="bg-green-50 border border-green-300 rounded-lg px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-green-800">
              <span className="text-lg">✓</span>
              <span>
                <strong>{mutualMatches} взаимных мэтча</strong> — контакты кандидатов открыты
              </span>
            </div>
            <Button variant="outline" size="sm" className="border-green-400 text-green-700 hover:bg-green-100 text-xs h-7" asChild>
              <Link href="/company/mandates">Перейти к позициям</Link>
            </Button>
          </div>
        )}

        {/* Stat cards */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { href: "/company/mandates", value: totalMandates, label: "Позиций", color: "" },
            { href: "/company/mandates?filter=ACTIVE", value: activeM, label: "Активных", color: "text-primary" },
            { href: "/company/mandates", value: totalMatches, label: "Мэтчей всего", color: "" },
            { href: "/company/mandates", value: mutualMatches, label: "Взаимных", color: "text-green-600" },
          ].map(({ href, value, label, color }) => (
            <Link key={label} href={href} className="block group">
              <Card className="h-full transition-shadow group-hover:shadow-md">
                <CardContent className="pt-6 text-center">
                  <p className={`text-3xl font-bold ${color}`}>{value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{label}</p>
                  <p className="text-xs text-primary mt-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                    Смотреть <ArrowRight className="w-3 h-3" />
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {/* Mandates list */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Последние позиции</CardTitle>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/company/mandates">Все позиции</Link>
                </Button>
              </CardHeader>
              <CardContent>
                {company.mandates.length === 0 ? (
                  <div className="py-8 text-center space-y-3">
                    <p className="text-muted-foreground text-sm">Пока нет позиций.</p>
                    <Button asChild>
                      <Link href="/company/mandates/new">Создать первую позицию</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {company.mandates.map((m) => {
                      const candidateInterest = m.matches.filter(
                        (x) => x.candidateInterest && !x.companyInterest && x.status !== "MUTUAL"
                      ).length;
                      const mutual = m.matches.filter((x) => x.status === "MUTUAL").length;
                      return (
                        <Link
                          key={m.id}
                          href={`/company/mandates/${m.id}`}
                          className="flex items-center justify-between py-2.5 px-2 rounded-lg hover:bg-muted transition-colors border-b last:border-0"
                        >
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">{m.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {MANDATE_TYPE_LABEL[m.mandateType] ?? m.mandateType}
                              {" · "}
                              {m.matches.length} мэтчей
                              {candidateInterest > 0 && (
                                <span className="text-amber-600 font-medium"> · {candidateInterest} ждут ответа</span>
                              )}
                              {mutual > 0 && (
                                <span className="text-green-600 font-medium"> · {mutual} взаимных</span>
                              )}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 ml-3 shrink-0">
                            <Badge variant={m.status === "ACTIVE" ? "default" : "secondary"} className="text-xs">
                              {m.status === "ACTIVE" ? "Активен" : m.status === "DRAFT" ? "Черновик" : "Закрыт"}
                            </Badge>
                            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                          </div>
                        </Link>
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
              <CardTitle className="text-sm font-medium">Действия</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {[
                { href: "/company/mandates/new", icon: Plus, label: "Новая позиция" },
                { href: "/company/mandates", icon: Building2, label: "Все позиции" },
                { href: "/company/profile", icon: Settings, label: "Профиль компании" },
                { href: "/pricing", icon: CreditCard, label: "Тарифы" },
              ].map(({ href, icon: Icon, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{label}</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
