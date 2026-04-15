import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminNav } from "@/components/layout/admin-nav";
import { AdminFilters } from "@/components/admin-filters";
import { Suspense } from "react";

async function toggleVerify(companyId: string, isVerified: boolean) {
  "use server";
  await prisma.companyProfile.update({
    where: { id: companyId },
    data: { isVerified },
  });
}

const VERIFIED_OPTIONS = [
  { value: "verified", label: "Верифицированы" },
  { value: "unverified", label: "Не верифицированы" },
];

export default async function AdminCompanies({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/");

  const { status, q } = await searchParams;

  const verifiedFilter =
    status === "verified" ? true : status === "unverified" ? false : undefined;

  const companies = await prisma.companyProfile.findMany({
    where: {
      ...(verifiedFilter !== undefined ? { isVerified: verifiedFilter } : {}),
      ...(q
        ? {
            OR: [
              { user: { email: { contains: q } } },
              { companyName: { contains: q } },
              { industry: { contains: q } },
            ],
          }
        : {}),
    },
    include: { user: true, mandates: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminNav active="companies" />

      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Компании ({companies.length})</h1>

        <Suspense>
          <AdminFilters
            statusOptions={VERIFIED_OPTIONS}
            searchPlaceholder="Поиск по email, названию, отрасли..."
          />
        </Suspense>

        <div className="space-y-4">
          {companies.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">Ничего не найдено</p>
          ) : (
            companies.map((c) => {
              async function verify() {
                "use server";
                await toggleVerify(c.id, true);
              }
              async function unverify() {
                "use server";
                await toggleVerify(c.id, false);
              }

              return (
                <Card key={c.id}>
                  <CardHeader className="flex flex-row items-start justify-between pb-3">
                    <div>
                      <CardTitle className="text-base">{c.companyName}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {c.user.email} · {c.industry} · {c.size}
                      </p>
                    </div>
                    <Badge variant={c.isVerified ? "default" : "secondary"}>
                      {c.isVerified ? "Верифицирована" : "Не верифицирована"}
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm">{c.description}</p>
                    {c.website && (
                      <a href={c.website} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline">{c.website}</a>
                    )}
                    <p className="text-xs text-muted-foreground">{c.mandates.length} позиций</p>

                    <div className="flex gap-3 pt-1">
                      {!c.isVerified ? (
                        <form action={verify}>
                          <Button type="submit" size="sm">Верифицировать</Button>
                        </form>
                      ) : (
                        <form action={unverify}>
                          <Button type="submit" size="sm" variant="outline">Снять верификацию</Button>
                        </form>
                      )}
                    </div>
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
