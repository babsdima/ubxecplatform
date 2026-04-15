import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminNav } from "@/components/layout/admin-nav";

export default async function AdminDashboard() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/");

  const [candidates, companies, mandates, matches] = await Promise.all([
    prisma.candidateProfile.count(),
    prisma.companyProfile.count(),
    prisma.mandate.count(),
    prisma.match.count(),
  ]);

  const pendingCandidates = await prisma.candidateProfile.count({
    where: { status: "PENDING" },
  });
  const mutualMatches = await prisma.match.count({ where: { status: "MUTUAL" } });

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminNav active="dashboard" />

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <h1 className="text-2xl font-bold">Дашборд</h1>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Кандидатов", value: candidates, sub: `${pendingCandidates} ожидают верификации` },
            { label: "Компаний", value: companies, sub: "зарегистрировано" },
            { label: "Позиций", value: mandates, sub: "создано" },
          ].map(({ label, value, sub }) => (
            <Card key={label}>
              <CardContent className="pt-6">
                <p className="text-3xl font-bold">{value}</p>
                <p className="text-sm font-medium mt-1">{label}</p>
                <p className="text-xs text-muted-foreground">{sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-3xl font-bold">{matches}</p>
              <p className="text-sm font-medium mt-1">Всего мэтчей</p>
              <p className="text-xs text-muted-foreground">{mutualMatches} взаимных</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 flex flex-col gap-2">
              <p className="text-sm font-medium">Быстрые действия</p>
              <Link href="/admin/candidates" className="text-sm text-primary hover:underline">
                → Верификация кандидатов ({pendingCandidates})
              </Link>
              <Link href="/admin/companies" className="text-sm text-primary hover:underline">
                → Управление компаниями
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
