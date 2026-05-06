"use client";

type Props = {
  label: string;
  /** 1-7 */
  value: number;
  leftLabel: string;
  rightLabel: string;
  /** Опц. preferences компании для overlay */
  target?: number;
};

export function StyleScale({ label, value, leftLabel, rightLabel, target }: Props) {
  const pct = Math.max(0, Math.min(100, ((value - 1) / 6) * 100));
  const targetPct = target !== undefined
    ? Math.max(0, Math.min(100, ((target - 1) / 6) * 100))
    : null;

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs font-semibold text-slate-700">{label}</span>
        <span className="text-[11px] font-mono text-slate-500">{value.toFixed(1)} / 7</span>
      </div>
      <div className="relative h-2 rounded-full bg-slate-100">
        {targetPct !== null && (
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-amber-500 ring-2 ring-amber-100"
            style={{ left: `calc(${targetPct}% - 6px)`, opacity: 0.55 }}
            title="Цель компании"
          />
        )}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-emerald-600 ring-2 ring-white shadow"
          style={{
            left: `calc(${pct}% - 7px)`,
            transition: "left 0.5s ease-out",
          }}
        />
      </div>
      <div className="flex justify-between text-[11px] text-slate-500 leading-tight gap-2">
        <span className="max-w-[45%]">{leftLabel}</span>
        <span className="max-w-[45%] text-right">{rightLabel}</span>
      </div>
    </div>
  );
}
