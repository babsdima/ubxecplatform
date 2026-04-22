import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { logoutAction } from "@/lib/actions";

type ActiveTab = "dashboard" | "matches" | "profile" | "services" | "assessment";

export async function CandidateNav({ active }: { active: ActiveTab }) {
  const session = await auth();
  if (!session) return null;

  const profile = await prisma.candidateProfile.findUnique({
    where: { userId: session.user.id },
    select: {
      matches: {
        where: { status: "MUTUAL", candidateInterest: true },
        select: { id: true },
      },
    },
  });

  const newMutual = profile?.matches.length ?? 0;
  const pending = await prisma.match.count({
    where: {
      candidate: { userId: session.user.id },
      candidateInterest: false,
      status: { not: "MUTUAL" },
    },
  });

  const avatarLetter = (session.user.email ?? "U")[0].toUpperCase();

  const links: { href: string; label: string; tab: ActiveTab; badge?: number | boolean }[] = [
    { href: "/candidate/dashboard", label: "Дашборд", tab: "dashboard" },
    { href: "/candidate/matches", label: "Мэтчи", tab: "matches", badge: pending > 0 ? pending : newMutual > 0 ? true : undefined },
    { href: "/candidate/profile", label: "Профиль", tab: "profile" },
    { href: "/candidate/assessment", label: "Оценка", tab: "assessment" },
    { href: "/candidate/services", label: "Услуги", tab: "services" },
  ];

  return (
    <header className="pnav-dark">
      <div className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between gap-6">
        {/* Logo */}
        <Link
          href="/candidate/dashboard"
          className="font-bold text-xl tracking-tight shrink-0"
          style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "hsl(40 33% 96%)" }}
        >
          Ub<span style={{ color: "var(--accent)" }}>X</span>ec
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-0.5 flex-1">
          {links.map(({ href, label, tab, badge }) => {
            const isActive = active === tab;
            return (
              <Link
                key={href}
                href={href}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "text-white bg-white/10"
                    : "text-white/50 hover:text-white/90 hover:bg-white/06"
                }`}
              >
                {label}
                {badge !== undefined && (
                  typeof badge === "number" ? (
                    <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold leading-none"
                      style={{ background: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.9)" }}>
                      {badge > 9 ? "9+" : badge}
                    </span>
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
                  )
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right: logout + avatar */}
        <div className="flex items-center gap-3 shrink-0">
          <form action={logoutAction}>
            <button
              type="submit"
              className="text-xs font-medium nav-ghost-link transition-colors"
            >
              Выйти
            </button>
          </form>
          <div className="w-8 h-8 rounded-full text-sm font-semibold flex items-center justify-center select-none"
            style={{ background: "rgba(255,255,255,0.12)", color: "hsl(40 33% 90%)", border: "1px solid rgba(255,255,255,0.15)" }}>
            {avatarLetter}
          </div>
        </div>
      </div>
    </header>
  );
}
