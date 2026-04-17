import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { CompanyProfileForm } from "./profile-form";
import { CompanyNav } from "@/components/layout/company-nav";
import { Badge } from "@/components/ui/badge";

export default async function CompanyProfilePage() {
  const session = await auth();
  if (!session) redirect("/auth/login");

  const company = await prisma.companyProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!company) redirect("/company/onboarding");

  return (
    <div className="min-h-screen bg-muted/30">
      <CompanyNav active="profile" />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Профиль компании</h1>
          {company.isVerified ? (
            <Badge>Верифицирована</Badge>
          ) : (
            <Badge variant="secondary">Ожидает верификации</Badge>
          )}
        </div>
        {!company.isVerified && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
            <strong>Верификация в процессе.</strong> Команда UbXec проверит информацию о компании в течение 24 часов.
            Это не блокирует создание позиций и мэтчинг.
          </div>
        )}
        <CompanyProfileForm company={company} userId={session.user.id} />
      </main>
    </div>
  );
}
