import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CandidateNav } from "@/components/layout/candidate-nav";
import { SalaryBenchmark } from "@/components/salary-benchmark";
import { ArrowRight, FileText, Sparkles } from "lucide-react";

const statusLabel: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  PENDING: { label: "На верификации", variant: "secondary" },
  VERIFIED: { label: "Верифицирован", variant: "default" },
  REJECTED: { label: "Отклонён", variant: "destructive" },
};

export default async function CandidateDashboard() {
  const session = await auth();
  if (!session) redirect("/auth/login");

  const profile = await prisma.candidateProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      matches: {
        include: { mandate: { include: { company: true } } },
        orderBy: { score: "desc" },
        take: 3,
      },
    },
  });

  if (!profile) redirect("/candidate/onboarding");

  const status = statusLabel[profile.status] ?? { label: profile.status, variant: "outline" as const };

  const allMatchesCount = await prisma.match.count({ where: { candidateProfileId: profile.id } });
  const mutualCount = await prisma.match.count({ where: { candidateProfileId: profile.id, status: "MUTUAL" } });
  const newCount = await prisma.match.count({
    where: { candidateProfileId: profile.id, candidateInterest: false, status: { not: "MUTUAL" } },
  });

  return (
    <div className="min-h-screen bg-muted/30">
      <CandidateNav active="dashboard" />

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {profile.status === "PENDING" && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
            <strong>Профиль на проверке.</strong> После верификации вы начнёте получать мэтчи с релевантными позициями.
          </div>
        )}
        {profile.status === "REJECTED" && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
            <strong>Профиль отклонён.</strong> {profile.adminNote}
          </div>
        )}

        {/* Profile card */}
        <Card>
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle className="text-xl">{profile.currentTitle}</CardTitle>
              <p className="text-muted-foreground text-sm mt-1">
                {profile.industry} · {profile.yearsExperience} лет опыта
              </p>
            </div>
            <Badge variant={status.variant}>{status.label}</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Ключевые достижения</p>
              <p className="text-sm">{profile.achievements}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Компенсация</p>
                <p>{(profile.salaryMin / 1_000_000).toFixed(1)}–{(profile.salaryMax / 1_000_000).toFixed(1)} млн руб/год</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Локация</p>
                <p>{profile.locationPref}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stat cards — clickable */}
        <div className="grid grid-cols-3 gap-4">
          <Link href="/candidate/matches" className="block group">
            <Card className="h-full transition-shadow group-hover:shadow-md">
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold">{allMatchesCount}</p>
                <p className="text-sm text-muted-foreground mt-1">Мэтчей всего</p>
                <p className="text-xs text-primary mt-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                  Смотреть <ArrowRight className="w-3 h-3" />
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/candidate/matches?filter=mutual" className="block group">
            <Card className="h-full transition-shadow group-hover:shadow-md">
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold text-green-600">{mutualCount}</p>
                <p className="text-sm text-muted-foreground mt-1">Взаимный интерес</p>
                <p className="text-xs text-primary mt-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                  Смотреть <ArrowRight className="w-3 h-3" />
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/candidate/matches?filter=new" className="block group">
            <Card className="h-full transition-shadow group-hover:shadow-md">
              <CardContent className="pt-6 text-center">
                <p className={`text-3xl font-bold ${newCount > 0 ? "text-primary" : ""}`}>{newCount}</p>
                <p className="text-sm text-muted-foreground mt-1">Новых мэтчей</p>
                <p className="text-xs text-primary mt-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                  Смотреть <ArrowRight className="w-3 h-3" />
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Benchmark — full width, visually distinct */}
        <SalaryBenchmark
          candidateId={profile.id}
          industry={profile.industry}
          salaryMin={profile.salaryMin}
          salaryMax={profile.salaryMax}
        />

        {/* Quick actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Быстрые действия</CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-3 gap-2">
            <Link href="/candidate/profile"
              className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted transition-colors group">
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Редактировать профиль</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            <Link href="/candidate/matches"
              className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted transition-colors group">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Все мэтчи</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            <Link href="/candidate/services"
              className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted transition-colors group">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Дополнительные услуги</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          </CardContent>
        </Card>

        {/* Recent matches */}
        {profile.matches.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Последние мэтчи</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href="/candidate/matches">Все мэтчи</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {profile.matches.map((match) => (
                <div key={match.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium text-sm">{match.mandate.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {match.mandate.isAnonymous ? "Анонимная компания" : match.mandate.company.companyName}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-muted-foreground">{match.score}%</span>
                    {match.status === "MUTUAL" && (
                      <Badge variant="default" className="bg-green-600">Взаимно</Badge>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
