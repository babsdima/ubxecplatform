import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { logoutAction } from "@/lib/actions";

export async function CandidateNav({ active }: { active: "dashboard" | "matches" | "profile" | "services" | "assessment" }) {
  const session = await auth();
  if (!session) return null;

  const profile = await prisma.candidateProfile.findUnique({
    where: { userId: session.user.id },
    select: {
      _count: false,
      matches: {
        where: { status: "MUTUAL", candidateInterest: true },
        select: { id: true },
      },
    },
  });

  // Новые взаимные мэтчи (оба интереса, ещё не "просмотренные" — считаем все MUTUAL)
  const newMutual = profile?.matches.length ?? 0;

  // Непросмотренные мэтчи — все где кандидат ещё не отметил интерес
  const pending = await prisma.match.count({
    where: {
      candidate: { userId: session.user.id },
      candidateInterest: false,
      status: { not: "MUTUAL" },
    },
  });

  return (
    <header className="bg-background border-b sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/candidate/dashboard" className="font-bold text-lg">UbXec</Link>
        <nav className="flex gap-5 items-center">
          <NavLink href="/candidate/dashboard" active={active === "dashboard"}>
            Дашборд
          </NavLink>
          <NavLink href="/candidate/matches" active={active === "matches"}>
            <span className="flex items-center gap-1.5">
              Мэтчи
              {pending > 0 && (
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold bg-primary text-primary-foreground leading-none">
                  {pending > 9 ? "9+" : pending}
                </span>
              )}
              {newMutual > 0 && pending === 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
              )}
            </span>
          </NavLink>
          <NavLink href="/candidate/profile" active={active === "profile"}>
            Профиль
          </NavLink>
          <NavLink href="/candidate/assessment" active={active === "assessment"}>
            Оценка
          </NavLink>
          <NavLink href="/candidate/services" active={active === "services"}>
            Услуги
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
