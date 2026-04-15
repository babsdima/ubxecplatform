import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { CandidateProfileForm } from "./profile-form";
import { CandidateNav } from "@/components/layout/candidate-nav";

export default async function CandidateProfile() {
  const session = await auth();
  if (!session) redirect("/auth/login");

  const profile = await prisma.candidateProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!profile) redirect("/candidate/onboarding");

  return (
    <div className="min-h-screen bg-muted/30">
      <CandidateNav active="profile" />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Редактировать профиль</h1>
        <CandidateProfileForm profile={profile} userId={session.user.id} />
      </main>
    </div>
  );
}
