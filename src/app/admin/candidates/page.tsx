import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VerifyButtons } from "@/components/verify-buttons";
import { AdminNav } from "@/components/layout/admin-nav";
import { AdminFilters } from "@/components/admin-filters";
import { Suspense } from "react";

const statusLabel: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  PENDING: { label: "На проверке", variant: "secondary" },
  VERIFIED: { label: "Верифицирован", variant: "default" },
  REJECTED: { label: "Отклонён", variant: "destructive" },
};

const STATUS_OPTIONS = [
  { value: "PENDING", label: "На проверке" },
  { value: "VERIFIED", label: "Верифицированы" },
  { value: "REJECTED", label: "Отклонённые" },
];

export default async function AdminCandidates({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/");

  const { status, q } = await searchParams;

  const candidates = await prisma.candidateProfile.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(q
        ? {
            OR: [
              { user: { email: { contains: q } } },
              { firstName: { contains: q } },
              { lastName: { contains: q } },
              { currentTitle: { contains: q } },
            ],
          }
        : {}),
    },
    include: { user: true },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminNav active="candidates" />

      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Кандидаты ({candidates.length})</h1>

        <Suspense>
          <AdminFilters
            statusOptions={STATUS_OPTIONS}
            searchPlaceholder="Поиск по email, имени, должности..."
          />
        </Suspense>

        <div className="space-y-4">
          {candidates.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">Ничего не найдено</p>
          ) : (
            candidates.map((c) => {
              const s = statusLabel[c.status] ?? { label: c.status, variant: "outline" as const };

              return (
                <Card key={c.id}>
                  <CardHeader className="flex flex-row items-start justify-between pb-3">
                    <div>
                      <CardTitle className="text-base">
                        {c.firstName ? `${c.firstName} ${c.lastName ?? ""}`.trim() : c.currentTitle}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {c.user.email} · {c.currentTitle} · {c.industry}
                      </p>
                    </div>
                    <Badge variant={s.variant}>{s.label}</Badge>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Опыт</p>
                        <p>{c.yearsExperience} лет</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Компенсация</p>
                        <p>{(c.salaryMin / 1_000_000).toFixed(1)}–{(c.salaryMax / 1_000_000).toFixed(1)} млн</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Локация</p>
                        <p>{c.locationPref}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Достижения</p>
                      <p className="text-sm">{c.achievements}</p>
                    </div>

                    {c.status === "PENDING" && <VerifyButtons profileId={c.id} />}

                    {c.adminNote && (
                      <p className="text-xs text-muted-foreground italic">Заметка: {c.adminNote}</p>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
