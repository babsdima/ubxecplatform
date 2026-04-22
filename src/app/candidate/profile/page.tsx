import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { CandidateProfileForm } from "./profile-form";
import { CandidateNav } from "@/components/layout/candidate-nav";

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  PENDING:  { label: "На верификации", cls: "bg-amber-50 text-amber-700 border border-amber-200" },
  VERIFIED: { label: "Верифицирован",  cls: "badge-verified" },
  REJECTED: { label: "Отклонён",       cls: "bg-red-50 text-red-600 border border-red-200" },
};

export default async function CandidateProfile() {
  const session = await auth();
  if (!session) redirect("/auth/login");

  const profile = await prisma.candidateProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!profile) redirect("/candidate/onboarding");

  const statusCfg = STATUS_CONFIG[profile.status] ?? { label: profile.status, cls: "bg-slate-100 text-slate-600" };

  return (
    <div className="dash-bg">
      <CandidateNav active="profile" />

      {/* Dark header */}
      <div className="dash-hero">
        <div className="max-w-2xl mx-auto px-5 pt-10 pb-2 relative z-10 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-widest uppercase mb-2"
              style={{ color: "rgba(255,255,255,0.35)" }}>Кандидат</p>
            <h1
              className="text-3xl font-bold tracking-tight"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "hsl(40 33% 96%)" }}
            >
              Профиль
            </h1>
          </div>
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full shrink-0 mb-1 ${statusCfg.cls}`}>
            {statusCfg.label}
          </span>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-5 pt-6 pb-10 -mt-2">
        {profile.status === "REJECTED" && profile.adminNote && (
          <div className="mb-6 pc p-4 border-l-2 border-red-400">
            <p className="text-sm text-red-700 font-medium">
              <strong>Причина отклонения:</strong> {profile.adminNote}
            </p>
          </div>
        )}
        <div className="pc p-6">
          <CandidateProfileForm profile={profile} userId={session.user.id} />
        </div>
      </main>
    </div>
  );
}
