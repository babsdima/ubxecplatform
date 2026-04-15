import Link from "next/link";
import { prisma } from "@/lib/db";
import { logoutAction } from "@/lib/actions";

export async function AdminNav({ active }: { active: "dashboard" | "candidates" | "companies" }) {
  const pendingCandidates = await prisma.candidateProfile.count({
    where: { status: "PENDING" },
  });

  return (
    <header className="bg-background border-b sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/admin" className="font-bold text-lg">UbXec Admin</Link>
        <nav className="flex gap-5 items-center">
          <NavLink href="/admin" active={active === "dashboard"}>Дашборд</NavLink>
          <NavLink href="/admin/candidates" active={active === "candidates"}>
            <span className="flex items-center gap-1.5">
              Кандидаты
              {pendingCandidates > 0 && (
                <span className="inline-flex items-center justify-center min-w-4 h-4 px-1 rounded-full text-[10px] font-bold bg-amber-500 text-white leading-none">
                  {pendingCandidates > 99 ? "99+" : pendingCandidates}
                </span>
              )}
            </span>
          </NavLink>
          <NavLink href="/admin/companies" active={active === "companies"}>Компании</NavLink>
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
