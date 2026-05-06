import { prisma } from "@/lib/db";
import { TrendingUp, Users, BarChart3, ArrowUp, ArrowDown, Minus } from "lucide-react";

interface Props {
  candidateId: string;
  industry: string;
  salaryMin: number;
  salaryMax: number;
}

export async function SalaryBenchmark({ candidateId, industry, salaryMin, salaryMax }: Props) {
  const peers = await prisma.candidateProfile.findMany({
    where: {
      industry,
      status: "VERIFIED",
      id: { not: candidateId },
    },
    select: { salaryMin: true, salaryMax: true },
  });

  if (peers.length < 2) {
    return (
      <div className="rounded-xl border-2 border-dashed border-primary/20 bg-gradient-to-br from-primary/5 to-primary/[0.02] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-primary/10 bg-primary/5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
              <BarChart3 className="w-3.5 h-3.5 text-primary" />
            </div>
            <div>
              <p className="text-xs font-semibold text-primary uppercase tracking-wider">Данные рынка</p>
              <p className="text-[11px] text-muted-foreground leading-tight">Бенчмарк по доходам</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-background/60 px-2.5 py-1 rounded-full border border-border/50">
            <Users className="w-3 h-3" />
            {peers.length} в отрасли
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-start gap-2.5 text-xs text-muted-foreground bg-background/50 rounded-lg px-3 py-3 border border-border/40">
            <TrendingUp className="w-3.5 h-3.5 mt-0.5 shrink-0 text-primary/60" />
            <div className="space-y-1">
              <p className="text-foreground font-medium">Пока недостаточно данных по отрасли «{industry}»</p>
              <p className="leading-relaxed">
                Бенчмарк появится автоматически, когда в платформе будет минимум 2 верифицированных
                кандидата с такой же отраслью. Сейчас в пуле — {peers.length}.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const myMid = (salaryMin + salaryMax) / 2;
  const peerMids = peers
    .map((p) => (p.salaryMin + p.salaryMax) / 2)
    .sort((a, b) => a - b);

  const medianIdx = Math.floor(peerMids.length / 2);
  const median =
    peerMids.length % 2 === 0
      ? (peerMids[medianIdx - 1] + peerMids[medianIdx]) / 2
      : peerMids[medianIdx];

  const below = peerMids.filter((m) => m < myMid).length;
  const percentile = Math.round((below / peerMids.length) * 100);

  const allMids = [...peerMids, myMid];
  const minMid = Math.min(...allMids);
  const maxMid = Math.max(...allMids);
  const range = maxMid - minMid || 1;

  const myPos = Math.round(((myMid - minMid) / range) * 100);
  const medianPos = Math.round(((median - minMid) / range) * 100);

  const fmt = (v: number) => (v / 1_000_000).toFixed(1);

  const diff = myMid - median;
  const diffPct = Math.round(Math.abs(diff / median) * 100);

  const trend =
    diff > median * 0.05
      ? { icon: ArrowUp, label: `На ${diffPct}% выше медианы`, color: "text-emerald-600" }
      : diff < -median * 0.05
      ? { icon: ArrowDown, label: `На ${diffPct}% ниже медианы`, color: "text-rose-500" }
      : { icon: Minus, label: "На уровне медианы рынка", color: "text-amber-500" };

  const TrendIcon = trend.icon;

  const insight =
    percentile >= 75
      ? "Вы в топ-25% по компенсации в отрасли."
      : percentile >= 50
      ? "Вы в верхней половине рынка."
      : percentile >= 25
      ? "Вы в нижней половине рынка."
      : "Вы в нижнем квартиле по компенсации.";

  return (
    <div className="rounded-xl border-2 border-dashed border-primary/20 bg-gradient-to-br from-primary/5 to-primary/[0.02] overflow-hidden">
      {/* Header strip */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-primary/10 bg-primary/5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
            <BarChart3 className="w-3.5 h-3.5 text-primary" />
          </div>
          <div>
            <p className="text-xs font-semibold text-primary uppercase tracking-wider">Данные рынка</p>
            <p className="text-[11px] text-muted-foreground leading-tight">Бенчмарк по доходам</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-background/60 px-2.5 py-1 rounded-full border border-border/50">
          <Users className="w-3 h-3" />
          {peers.length} кандидатов · {industry}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Trend badge */}
        <div className={`inline-flex items-center gap-1.5 text-sm font-medium ${trend.color}`}>
          <TrendIcon className="w-4 h-4" />
          {trend.label}
        </div>

        {/* Track */}
        <div className="space-y-2">
          <div className="relative h-8">
            {/* Background gradient track */}
            <div className="absolute top-3 left-0 right-0 h-2 rounded-full bg-gradient-to-r from-rose-100 via-amber-100 to-emerald-100" />

            {/* Filled portion up to myPos */}
            <div
              className="absolute top-3 left-0 h-2 rounded-full bg-gradient-to-r from-primary/30 to-primary/60"
              style={{ width: `${myPos}%` }}
            />

            {/* Median line */}
            <div
              className="absolute top-1.5 flex flex-col items-center gap-0"
              style={{ left: `${medianPos}%`, transform: "translateX(-50%)" }}
            >
              <div className="w-px h-5 bg-muted-foreground/30" />
            </div>

            {/* Median label below */}
            <div
              className="absolute top-[22px] text-[10px] text-muted-foreground/70 whitespace-nowrap"
              style={{ left: `${medianPos}%`, transform: "translateX(-50%)" }}
            >
              медиана
            </div>

            {/* My dot */}
            <div
              className="absolute top-2 w-4 h-4 rounded-full bg-primary border-2 border-background shadow-md ring-2 ring-primary/20"
              style={{ left: `${myPos}%`, transform: "translateX(-50%)" }}
            />
          </div>

          <div className="flex justify-between text-[11px] text-muted-foreground pt-3">
            <span>{fmt(minMid)} млн</span>
            <span>{fmt(maxMid)} млн</span>
          </div>
        </div>

        {/* Metrics row */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-background/70 border border-border/50 rounded-lg p-2.5 text-center">
            <p className="text-[10px] text-muted-foreground mb-0.5">Ваш ориентир</p>
            <p className="text-sm font-bold">{fmt(myMid)}<span className="text-xs font-normal text-muted-foreground"> млн</span></p>
          </div>
          <div className="bg-background/70 border border-border/50 rounded-lg p-2.5 text-center">
            <p className="text-[10px] text-muted-foreground mb-0.5">Медиана</p>
            <p className="text-sm font-bold">{fmt(median)}<span className="text-xs font-normal text-muted-foreground"> млн</span></p>
          </div>
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-2.5 text-center">
            <p className="text-[10px] text-muted-foreground mb-0.5">Перцентиль</p>
            <p className="text-sm font-bold text-primary">{percentile}<span className="text-xs font-normal">%</span></p>
          </div>
        </div>

        {/* Insight */}
        <div className="flex items-start gap-2 text-xs text-muted-foreground bg-background/50 rounded-lg px-3 py-2 border border-border/40">
          <TrendingUp className="w-3.5 h-3.5 mt-0.5 shrink-0 text-primary/60" />
          <span>{insight} Данные основаны на анонимных профилях верифицированных кандидатов платформы.</span>
        </div>
      </div>
    </div>
  );
}
