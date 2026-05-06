"use client";

type Props = {
  label: string;
  /** 0-100 */
  score: number;
  showWarning?: boolean;
};

export function ScoreBar({ label, score, showWarning }: Props) {
  const color =
    score >= 80
      ? "#16a34a"
      : score >= 60
        ? "#d97706"
        : score >= 40
          ? "#ea580c"
          : "#dc2626";

  return (
    <div className="flex items-center gap-3">
      <div className="w-32 text-xs text-slate-600 font-medium shrink-0">
        {label}
      </div>
      <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div
          className="h-full rounded-full transition-[width] duration-500"
          style={{ width: `${Math.max(0, Math.min(100, score))}%`, background: color }}
        />
      </div>
      <div
        className="w-9 text-right text-sm font-bold tabular-nums"
        style={{ color, fontFamily: "var(--font-inter)" }}
      >
        {score}
        {showWarning && <span className="ml-0.5 text-amber-500">⚠</span>}
      </div>
    </div>
  );
}
