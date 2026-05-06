"use client";

type Props = {
  label: string;
  /** Sten 1-10 */
  score: number;
  description?: string;
  /** Опц.: преферированный диапазон (например для personality fit overlay) */
  preferredRange?: [number, number];
};

export function StenBar({ label, score, description, preferredRange }: Props) {
  const pct = Math.max(0, Math.min(100, (score / 10) * 100));
  const color =
    score >= 7 ? "#16a34a" : score >= 4 ? "#d97706" : "#ea580c";

  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm text-slate-700 font-medium">{label}</span>
        <span
          className="text-base font-bold tabular-nums"
          style={{ color, fontFamily: "var(--font-inter)" }}
        >
          {score}
        </span>
      </div>
      <div className="relative h-2 rounded-full bg-slate-100 overflow-hidden">
        {preferredRange && (
          <div
            className="absolute inset-y-0 bg-emerald-100"
            style={{
              left: `${(preferredRange[0] / 10) * 100}%`,
              width: `${((preferredRange[1] - preferredRange[0]) / 10) * 100}%`,
            }}
          />
        )}
        <div
          className="relative h-full rounded-full transition-[width] duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      {description && (
        <p className="text-[11px] text-slate-500 leading-snug">{description}</p>
      )}
    </div>
  );
}
