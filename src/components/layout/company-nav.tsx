import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { logoutAction } from "@/lib/actions";

export async function CompanyNav({ active }: { active: "dashboard" | "mandates" | "profile" }) {
  const session = await auth();
  if (!session) return null;

  const company = await prisma.companyProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  // Кандидаты отметили интерес, но компания ещё не ответила
  const pendingInterest = company
    ? await prisma.match.count({
        where: {
          mandate: { companyId: company.id },
          candidateInterest: true,
          companyInterest: false,
        },
      })
    : 0;

  // Новые взаимные мэтчи
  const newMutual = company
    ? await prisma.match.count({
        where: {
          mandate: { companyId: company.id },
          status: "MUTUAL",
        },
      })
    : 0;

  return (
    <header className="bg-background border-b sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/company/dashboard" className="font-bold text-lg">UbXec</Link>
        <nav className="flex gap-5 items-center">
          <NavLink href="/company/dashboard" active={active === "dashboard"}>
            Дашборд
          </NavLink>
          <NavLink href="/company/mandates" active={active === "mandates"}>
            <span className="flex items-center gap-1.5">
              Позиции
              {pendingInterest > 0 && (
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold bg-primary text-primary-foreground leading-none">
                  {pendingInterest > 9 ? "9+" : pendingInterest}
                </span>
              )}
              {newMutual > 0 && pendingInterest === 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
              )}
            </span>
          </NavLink>
          <NavLink href="/company/profile" active={active === "profile"}>
            Профиль
          </NavLink>
          <form action={logoutAction}>
            <button type="submit" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Выйти
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`text-sm transition-colors ${active ? "font-medium text-foreground" : "text-muted-foreground hover:text-foreground"}`}
    >
      {children}
    </Link>
  );
}
