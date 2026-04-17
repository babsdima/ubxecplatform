import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CandidateNav } from "@/components/layout/candidate-nav";
import { SalaryBenchmark } from "@/components/salary-benchmark";
import { ArrowRight, FileText, Sparkles, ShieldCheck, BarChart2, Star } from "lucide-react";

const statusLabel: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  PENDING: { label: "На верификации", variant: "secondary" },
  VERIFIED: { label: "Верифицирован", variant: "default" },
  REJECTED: { label: "Отклонён", variant: "destructive" },
};

const MANDATE_TYPE_LABEL: Record<string, string> = {
  "full-time": "Найм в штат",
  mentor: "Ментор",
  consultant: "Консультант",
  board: "Advisory Board",
};

function ProfileCompleteness({
  profile,
  assessmentsCount,
}: {
  profile: {
    phone: string | null;
    linkedinUrl: string | null;
    currentCompany: string | null;
    firstName: string | null;
    status: string;
  };
  assessmentsCount: number;
}) {
  const steps = [
    { label: "Профиль заполнен", done: true },
    { label: "Имя и фамилия", done: !!profile.firstName },
    { label: "Телефон", done: !!profile.phone },
    { label: "LinkedIn", done: !!profile.linkedinUrl },
    { label: "Текущая компания", done: !!profile.currentCompany },
    { label: "Assessment пройден", done: assessmentsCount > 0 },
    { label: "Профиль верифицирован", done: profile.status === "VERIFIED" },
  ];
  const done = steps.filter((s) => s.done).length;
  const pct = Math.round((done / steps.length) * 100);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Заполненность профиля</CardTitle>
          <span className="text-sm font-semibold text-primary">{pct}%</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1">
          {steps.map(({ label, done }) => (
            <div key={label} className="flex items-center gap-1.5 text-xs">
              <span className={done ? "text-green-600" : "text-muted-foreground"}>
                {done ? "✓" : "○"}
              </span>
              <span className={done ? "text-foreground" : "text-muted-foreground"}>{label}</span>
            </div>
          ))}
        </div>
        {pct < 100 && (
          <div className="flex gap-2 pt-1">
            {!profile.firstName && (
              <Button variant="outline" size="sm" asChild className="text-xs h-7">
                <Link href="/candidate/profile">Добавить контакты</Link>
              </Button>
            )}
            {assessmentsCount === 0 && (
              <Button variant="outline" size="sm" asChild className="text-xs h-7">
                <Link href="/candidate/assessment">Пройти оценку</Link>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
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
        take: 3,
      },
      assessments: { where: { status: "COMPLETED" } },
    },
  });

  if (!profile) redirect("/candidate/onboarding");

  const status = statusLabel[profile.status] ?? { label: profile.status, variant: "outline" as const };

  const allMatchesCount = await prisma.match.count({ where: { candidateProfileId: profile.id } });
  const mutualCount = await prisma.match.count({ where: { candidateProfileId: profile.id, status: "MUTUAL" } });
  const newCount = await prisma.match.count({
    where: { candidateProfileId: profile.id, candidateInterest: false, status: { not: "MUTUAL" } },
  });

  const engagementFormats = profile.engagementFormats
    ? profile.engagementFormats.split(",").map((f) => MANDATE_TYPE_LABEL[f] ?? f)
    : [];

  return (
    <div className="min-h-screen bg-muted/30">
      <CandidateNav active="dashboard" />

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {profile.status === "PENDING" && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
            <span className="text-amber-500 mt-0.5">⏳</span>
            <div className="text-sm text-amber-800">
              <strong>Профиль на проверке.</strong> Команда UbXec верифицирует профиль в течение 24 часов.
              После верификации вы получите мэтчи с релевантными позициями.
            </div>
          </div>
        )}
        {profile.status === "REJECTED" && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
            <span className="text-red-500 mt-0.5">✗</span>
            <div className="text-sm text-red-800">
              <strong>Профиль отклонён.</strong> {profile.adminNote ?? "Обратитесь к команде поддержки."}
            </div>
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
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Ключевые достижения</p>
              <p className="text-sm">{profile.achievements}</p>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Компенсация</p>
                <p>{(profile.salaryMin / 1_000_000).toFixed(1)}–{(profile.salaryMax / 1_000_000).toFixed(1)} млн руб/год</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Локация</p>
                <p>{profile.locationPref}</p>
              </div>
              {engagementFormats.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Форматы</p>
                  <div className="flex flex-wrap gap-1">
                    {engagementFormats.map((f) => (
                      <span key={f} className="text-xs bg-muted px-1.5 py-0.5 rounded">{f}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stat cards */}
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
                {newCount > 0 && (
                  <p className="text-xs text-primary mt-2 flex items-center justify-center gap-1 animate-pulse">
                    Посмотреть <ArrowRight className="w-3 h-3" />
                  </p>
                )}
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile completeness */}
          <ProfileCompleteness profile={profile} assessmentsCount={profile.assessments.length} />

          {/* Assessment status */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Оценка (Assessment)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {["HOGAN", "DISC", "MBTI"].map((type) => {
                const a = profile.assessments.find((x) => x.type === type);
                return (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <span>{type === "HOGAN" ? "🔬" : type === "DISC" ? "🎯" : "🧩"}</span>
                      <span>{type === "HOGAN" ? "Hogan" : type}</span>
                    </div>
                    {a ? (
                      <Badge variant="default" className="text-xs">Завершён</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">Не пройден</Badge>
                    )}
                  </div>
                );
              })}
              <Button variant="outline" size="sm" className="w-full mt-1" asChild>
                <Link href="/candidate/assessment">
                  {profile.assessments.length === 0 ? "Запросить оценку" : "Управлять оценками"}
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Benchmark */}
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
          <CardContent className="grid sm:grid-cols-4 gap-2">
            {[
              { href: "/candidate/profile", icon: FileText, label: "Редактировать профиль" },
              { href: "/candidate/matches", icon: Sparkles, label: "Все мэтчи" },
              { href: "/candidate/assessment", icon: Star, label: "Оценка" },
              { href: "/candidate/services", icon: BarChart2, label: "Услуги" },
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
                      {" · "}
                      {MANDATE_TYPE_LABEL[match.mandate.mandateType] ?? match.mandate.mandateType}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-muted-foreground">{match.score}%</span>
                    {match.status === "MUTUAL" ? (
                      <Badge className="bg-green-600 text-xs">Взаимно</Badge>
                    ) : match.candidateInterest ? (
                      <Badge variant="secondary" className="text-xs">Интерес</Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">Новый</Badge>
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
