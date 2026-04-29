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
    <div className="dash-bg">
      <CompanyNav active="profile" />

      {/* Dark header */}
      <div className="dash-hero">
        <div className="max-w-2xl mx-auto px-5 pt-10 pb-2 relative z-10 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-widest uppercase mb-2"
              style={{ color: "rgba(255,255,255,0.35)" }}>Компания</p>
            <h1
              className="text-3xl font-bold tracking-tight"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "hsl(40 33% 96%)" }}
            >
              Профиль компании
            </h1>
          </div>
          {company.isVerified ? (
            <span className="badge-verified mb-1 shrink-0">Верифицирована</span>
          ) : (
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full shrink-0 mb-1"
              style={{ background: "var(--warning-bg)", color: "var(--warning)", border: "1px solid var(--warning-border)" }}>
              На проверке
            </span>
          )}
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-5 pt-6 pb-10 -mt-2">
        {!company.isVerified && (
          <div className="mb-6 pc-amber p-4 pl-5">
            <p className="text-sm text-amber-800 font-medium">
              <strong>Верификация в процессе.</strong> Команда GradeUp проверит информацию о компании в течение 24 часов.
              Это не блокирует создание позиций и мэтчинг.
            </p>
          </div>
        )}
        <div className="pc p-6">
          <CompanyProfileForm company={company} userId={session.user.id} />
        </div>
      </main>
    </div>
  );
}
