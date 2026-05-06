import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { CompanyNav } from "@/components/layout/company-nav";
import { MandateCreator } from "@/components/employer/mandate-creator";

export default async function NewMandatePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const company = await prisma.companyProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, name: true, companyName: true, profileCompletion: true },
  });
  if (!company) redirect("/company/onboarding");

  const templates = await prisma.roleTemplate.findMany({
    orderBy: [{ role: "asc" }, { context: "asc" }],
  });

  return (
    <div className="dash-bg">
      <CompanyNav active="mandates" />

      <div className="dash-hero">
        <div className="max-w-3xl mx-auto px-5 pt-10 pb-2 relative z-10">
          <p
            className="text-xs font-bold tracking-widest uppercase mb-2"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            Новая вакансия
          </p>
          <h1
            className="text-3xl font-bold tracking-tight"
            style={{
              fontFamily: "var(--font-playfair), Georgia, serif",
              color: "hsl(40 33% 96%)",
            }}
          >
            Создание мандата
          </h1>
          <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
            Выберите шаблон роли и контекст. Шаблон pre-fill компетенции,
            personality preferences и motivation profile — отредактируете при необходимости.
          </p>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-5 pt-6 pb-12 -mt-2">
        <MandateCreator
          companyName={company.name ?? company.companyName ?? "Ваша компания"}
          templates={templates.map((t) => ({
            id: t.id,
            role: t.role,
            context: t.context,
            nameRu: t.nameRu,
            description: t.description ?? "",
          }))}
          profileCompletion={company.profileCompletion}
        />
      </main>
    </div>
  );
}
