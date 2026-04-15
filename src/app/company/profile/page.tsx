import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { CompanyProfileForm } from "./profile-form";
import { CompanyNav } from "@/components/layout/company-nav";

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
        <h1 className="text-2xl font-bold mb-6">Профиль компании</h1>
        <CompanyProfileForm company={company} userId={session.user.id} />
      </main>
    </div>
  );
}
