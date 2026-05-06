import { prisma } from "@/lib/db";
import { TrendingUp, BarChart3, ArrowUp, ArrowDown, Minus, Info } from "lucide-react";

interface Props {
  /** Уровень кандидата (C-level, C-1 и т.д.) — пока используется для подсказок */
  level?: string | null;
  /** Текущая функция кандидата (массив из CandidateProfile.currentFunction) */
  functions?: string[];
  /** Legacy fallback: текстовое название роли (currentTitle) */
  currentTitle?: string | null;
  /** Размер компании (revenue range) — определяет benchmark size bucket */
  companyRevenue?: string | null;
  /** Желаемая компенсация кандидата, total cash в ₽ (legacy salaryMin/salaryMax) */
  candidateMinRub?: number | null;
  candidateMaxRub?: number | null;
}

// ────────────────────────────────────────────────────────────────────
//  Mapping функций кандидата → role в benchmark таблице
// ────────────────────────────────────────────────────────────────────

const FUNCTION_TO_ROLE: Record<string, string> = {
  general_management: "CEO",
  finance: "CFO",
  technology: "CTO",
  operations: "COO",
  hr: "CHRO",
  marketing: "CMO",
  product: "CPO",
  commercial: "CMO",
  strategy: "CEO",
};

// Если currentFunction пустой — fallback по currentTitle
function inferRoleFromTitle(title: string | null | undefined): string | null {
  if (!title) return null;
  const t = title.toUpperCase();
  if (t.startsWith("CEO") || t.includes("ГЕНЕРАЛЬН")) return "CEO";
  if (t.startsWith("CFO") || t.includes("ФИНАНСОВ") || t.includes("FINANCE")) return "CFO";
  if (t.startsWith("CTO") || t.includes("ТЕХНОЛОГ") || t.includes("TECHNOLOGY")) return "CTO";
  if (t.startsWith("COO") || t.includes("ОПЕРАЦИОН")) return "COO";
  if (t.startsWith("CHRO") || t.includes("HR") || t.includes("ПЕРСОНАЛ")) return "CHRO";
  if (t.startsWith("CMO") || t.includes("МАРКЕТИНГ") || t.includes("MARKET")) return "CMO";
  if (t.startsWith("CPO") || t.includes("PRODUCT")) return "CPO";
  return null;
}

function deriveCompanySize(revenue: string | null | undefined): "small" | "mid" | "large" | null {
  if (!revenue) return null;
  if (["<100M", "100M_500M", "500M_1B"].includes(revenue)) return "small";
  if (["1B_5B", "5B_10B"].includes(revenue)) return "mid";
  if (["10B_50B", "50B+"].includes(revenue)) return "large";
  return null;
}

const ROLE_LABEL: Record<string, string> = {
  CEO: "Chief Executive Officer",
  CFO: "Chief Financial Officer",
  CTO: "Chief Technology Officer",
  COO: "Chief Operating Officer",
  CHRO: "Chief Human Resources Officer",
  CMO: "Chief Marketing Officer",
  CPO: "Chief Product Officer",
};

const SIZE_LABEL: Record<string, string> = {
  small: "Малые компании (< 1 млрд ₽)",
  mid: "Средние (1–10 млрд ₽)",
  large: "Крупные (> 10 млрд ₽)",
};

export async function SalaryBenchmark({
  functions,
  currentTitle,
  companyRevenue,
  candidateMinRub,
  candidateMaxRub,
}: Props) {
  // Определяем role
  const role =
    (functions && functions.length > 0 && FUNCTION_TO_ROLE[functions[0]]) ||
    inferRoleFromTitle(currentTitle) ||
    null;

  const size = deriveCompanySize(companyRevenue);

  // Если roles или size не определены — empty state
  if (!role || !size) {
    return <PendingState reason={!role ? "role" : "size"} />;
  }

  // Lookup benchmark
  const benchmark = await prisma.marketSalaryBenchmark.findFirst({
    where: {
      role,
      companySize: size,
      industry: null, // v1 — общие цифры без отраслевой раскладки
    },
  });

  if (!benchmark) {
    return <PendingState reason="missing" role={role} size={size} />;
  }

  // Render с benchmark data
  return (
    <BenchmarkView
      benchmark={benchmark}
      role={role}
      size={size}
      candidateMinRub={candidateMinRub ?? null}
      candidateMaxRub={candidateMaxRub ?? null}
    />
  );
}

// ────────────────────────────────────────────────────────────────────
//  Main view: candidate's expectation vs market
// ────────────────────────────────────────────────────────────────────

type BenchData = {
  role: string;
  companySize: string;
  p25: number;
  median: number;
  p75: number;
  p90: number | null;
  source: string | null;
  asOfDate: Date;
};

function BenchmarkView({
  benchmark,
  role,
  size,
  candidateMinRub,
  candidateMaxRub,
}: {
  benchmark: BenchData;
  role: string;
  size: string;
  candidateMinRub: number | null;
  candidateMaxRub: number | null;
}) {
  const myMidRub = candidateMinRub && candidateMaxRub ? (candidateMinRub + candidateMaxRub) / 2 : null;
  const myMidM = myMidRub ? myMidRub / 1_000_000 : null;

  const max = benchmark.p90 ?? benchmark.p75 + (benchmark.p75 - benchmark.median);
  const min = benchmark.p25 * 0.6; // визуальный левый край (расширяем диапазон чуть ниже P25)
  const range = max - min;

  const myPos = myMidM !== null ? Math.max(0, Math.min(100, ((myMidM - min) / range) * 100)) : null;
  const p25Pos = ((benchmark.p25 - min) / range) * 100;
  const medianPos = ((benchmark.median - min) / range) * 100;
  const p75Pos = ((benchmark.p75 - min) / range) * 100;
  const p90Pos = benchmark.p90 ? ((benchmark.p90 - min) / range) * 100 : null;

  // Position interpretation
  let percentileRange: string;
  let positionLabel: string;
  let positionIcon = Minus;
  let positionColor = "text-amber-500";

  if (myMidM === null) {
    percentileRange = "не указана";
    positionLabel = "Укажите ожидаемую компенсацию в профиле";
  } else if (myMidM < benchmark.p25) {
    percentileRange = "ниже 25%";
    positionLabel = `На ${Math.round(((benchmark.median - myMidM) / benchmark.median) * 100)}% ниже медианы`;
    positionIcon = ArrowDown;
    positionColor = "text-rose-500";
  } else if (myMidM < benchmark.median) {
    percentileRange = "25–50%";
    positionLabel = "В нижней половине рынка";
    positionIcon = Minus;
    positionColor = "text-amber-600";
  } else if (myMidM < benchmark.p75) {
    percentileRange = "50–75%";
    positionLabel = "В верхней половине рынка";
    positionIcon = ArrowUp;
    positionColor = "text-emerald-600";
  } else if (benchmark.p90 && myMidM < benchmark.p90) {
    percentileRange = "75–90%";
    positionLabel = `На ${Math.round(((myMidM - benchmark.median) / benchmark.median) * 100)}% выше медианы`;
    positionIcon = ArrowUp;
    positionColor = "text-emerald-600";
  } else {
    percentileRange = "топ-10%";
    positionLabel = "В верхнем дециле — топ компенсации";
    positionIcon = ArrowUp;
    positionColor = "text-emerald-600";
  }

  const TrendIcon = positionIcon;

  return (
    <div className="rounded-xl border-2 border-dashed border-primary/20 bg-gradient-to-br from-primary/5 to-primary/[0.02] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-primary/10 bg-primary/5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
            <BarChart3 className="w-3.5 h-3.5 text-primary" />
          </div>
          <div>
            <p className="text-xs font-semibold text-primary uppercase tracking-wider">Бенчмарк рынка</p>
            <p className="text-[11px] text-muted-foreground leading-tight">
              {ROLE_LABEL[role] ?? role} · {SIZE_LABEL[size] ?? size}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Position summary */}
        <div className={`inline-flex items-center gap-1.5 text-sm font-medium ${positionColor}`}>
          <TrendIcon className="w-4 h-4" />
          {positionLabel}
        </div>

        {/* Track */}
        <div className="space-y-2">
          <div className="relative h-10">
            {/* Background gradient — left to right: rose (low) → amber → emerald (high) */}
            <div className="absolute top-3 left-0 right-0 h-2 rounded-full bg-gradient-to-r from-rose-100 via-amber-100 to-emerald-100" />

            {/* P25-P75 bracket */}
            <div
              className="absolute top-3 h-2 rounded-full bg-emerald-200/60"
              style={{ left: `${p25Pos}%`, width: `${p75Pos - p25Pos}%` }}
            />

            {/* Median tick */}
            <div className="absolute top-1 flex flex-col items-center" style={{ left: `${medianPos}%`, transform: "translateX(-50%)" }}>
              <div className="w-px h-6 bg-emerald-700/50" />
              <div className="text-[9px] text-emerald-700/80 mt-0.5 whitespace-nowrap">медиана</div>
            </div>

            {/* P25 + P75 ticks */}
            {[p25Pos, p75Pos, ...(p90Pos !== null ? [p90Pos] : [])].map((pos, idx) => (
              <div
                key={idx}
                className="absolute top-2 w-px h-4 bg-muted-foreground/30"
                style={{ left: `${pos}%`, transform: "translateX(-50%)" }}
              />
            ))}

            {/* My dot */}
            {myPos !== null && (
              <div
                className="absolute top-2 w-4 h-4 rounded-full bg-primary border-2 border-background shadow-md ring-2 ring-primary/20"
                style={{ left: `${myPos}%`, transform: "translateX(-50%)" }}
                title={myMidM ? `Вы: ${myMidM.toFixed(1)} млн` : ""}
              />
            )}
          </div>

          {/* Scale labels */}
          <div className="flex justify-between text-[11px] text-muted-foreground">
            <span>{Math.round(min)} млн</span>
            <span>{Math.round(max)} млн</span>
          </div>
        </div>

        {/* Key percentiles row */}
        <div className="grid grid-cols-4 gap-2">
          <BenchCell label="P25" value={benchmark.p25} />
          <BenchCell label="Медиана" value={benchmark.median} highlight />
          <BenchCell label="P75" value={benchmark.p75} />
          <BenchCell label="P90" value={benchmark.p90} />
        </div>

        {/* My value */}
        {myMidM !== null && (
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-2.5 text-center">
              <p className="text-[10px] text-muted-foreground mb-0.5">Ваш ориентир</p>
              <p className="text-sm font-bold text-primary">
                {myMidM.toFixed(1)}
                <span className="text-xs font-normal"> млн</span>
              </p>
            </div>
            <div className="bg-background/70 border border-border/50 rounded-lg p-2.5 text-center">
              <p className="text-[10px] text-muted-foreground mb-0.5">Перцентиль</p>
              <p className="text-sm font-bold">{percentileRange}</p>
            </div>
          </div>
        )}

        {/* Footer with source */}
        <div className="flex items-start gap-2 text-[11px] text-muted-foreground bg-background/50 rounded-lg px-3 py-2 border border-border/40">
          <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-muted-foreground/60" />
          <span className="leading-relaxed">
            {benchmark.source ?? "Курируемые рыночные данные"} · обновлено{" "}
            {benchmark.asOfDate.toISOString().slice(0, 10)} ·{" "}
            <span className="text-muted-foreground/70">total cash без equity</span>
          </span>
        </div>
      </div>
    </div>
  );
}

function BenchCell({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number | null;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-lg p-2.5 text-center ${
        highlight
          ? "bg-emerald-50 border border-emerald-200"
          : "bg-background/70 border border-border/50"
      }`}
    >
      <p className="text-[10px] text-muted-foreground mb-0.5">{label}</p>
      <p className={`text-sm font-bold ${highlight ? "text-emerald-700" : "text-foreground"}`}>
        {value !== null ? value : "—"}
        <span className="text-xs font-normal text-muted-foreground"> млн</span>
      </p>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
//  Empty / pending states
// ────────────────────────────────────────────────────────────────────

function PendingState({
  reason,
  role,
  size,
}: {
  reason: "role" | "size" | "missing";
  role?: string;
  size?: string;
}) {
  const messages: Record<string, { title: string; body: string }> = {
    role: {
      title: "Заполните функцию в track record",
      body: "Бенчмарк построен на роль (CEO/CFO/CTO/...). Откройте E.2 в опроснике и укажите вашу основную функцию.",
    },
    size: {
      title: "Укажите размер компании",
      body: "Бенчмарк зависит от размера компании. Заполните «выручка компании» в E.2 (Track Record).",
    },
    missing: {
      title: "Бенчмарк скоро будет",
      body: `Для роли ${ROLE_LABEL[role ?? ""] ?? role} в категории «${
        SIZE_LABEL[size ?? ""] ?? size
      }» данные ещё в подготовке.`,
    },
  };

  const m = messages[reason];

  return (
    <div className="rounded-xl border-2 border-dashed border-primary/20 bg-gradient-to-br from-primary/5 to-primary/[0.02] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-primary/10 bg-primary/5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
            <BarChart3 className="w-3.5 h-3.5 text-primary" />
          </div>
          <div>
            <p className="text-xs font-semibold text-primary uppercase tracking-wider">Бенчмарк рынка</p>
            <p className="text-[11px] text-muted-foreground leading-tight">По доходам топ-менеджеров</p>
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-start gap-2.5 text-xs text-muted-foreground bg-background/50 rounded-lg px-3 py-3 border border-border/40">
          <TrendingUp className="w-3.5 h-3.5 mt-0.5 shrink-0 text-primary/60" />
          <div className="space-y-1">
            <p className="text-foreground font-medium">{m.title}</p>
            <p className="leading-relaxed">{m.body}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
