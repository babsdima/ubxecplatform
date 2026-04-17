import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { CandidateProfileForm } from "./profile-form";
import { CandidateNav } from "@/components/layout/candidate-nav";
import { Badge } from "@/components/ui/badge";

const statusLabel: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  PENDING: { label: "На верификации", variant: "secondary" },
  VERIFIED: { label: "Верифицирован", variant: "default" },
  REJECTED: { label: "Отклонён", variant: "destructive" },
};

export default async function CandidateProfile() {
  const session = await auth();
  if (!session) redirect("/auth/login");

  const profile = await prisma.candidateProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!profile) redirect("/candidate/onboarding");

  const status = statusLabel[profile.status] ?? { label: profile.status, variant: "outline" as const };

  return (
    <div className="min-h-screen bg-muted/30">
      <CandidateNav active="profile" />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Профиль</h1>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>
        {profile.status === "REJECTED" && profile.adminNote && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
            <strong>Причина отклонения:</strong> {profile.adminNote}
          </div>
        )}
        <CandidateProfileForm profile={profile} userId={session.user.id} />
      </main>
    </div>
  );
}
