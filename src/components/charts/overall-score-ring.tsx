"use client";

type Props = {
  /** 0-100 */
  score: number;
  size?: number;
  label?: string;
};

export function OverallScoreRing({ score, size = 96, label }: Props) {
  const color =
    score >= 80
      ? "#16a34a"
      : score >= 65
        ? "#65a30d"
        : score >= 50
          ? "#d97706"
          : score >= 35
            ? "#ea580c"
            : "#dc2626";
  const labelText =
    label ??
    (score >= 80
      ? "Strong Match"
      : score >= 65
        ? "Good Match"
        : score >= 50
          ? "Conditional"
          : score >= 35
            ? "Weak"
            : "Mismatch");

  const radius = size * 0.39;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (Math.max(0, Math.min(100, score)) / 100) * circ;
  const cx = size / 2;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90 absolute inset-0"
        >
          <circle
            cx={cx}
            cy={cx}
            r={radius}
            fill="none"
            stroke="rgba(0,0,0,0.06)"
            strokeWidth={5}
          />
          <circle
            cx={cx}
            cy={cx}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={5}
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.8s ease-out" }}
          />
        </svg>
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          <div
            className="font-bold tabular-nums"
            style={{
              fontSize: size * 0.27,
              color: "#0f172a",
              lineHeight: 1,
            }}
          >
            {score}
          </div>
          <div
            className="text-slate-400 font-mono"
            style={{ fontSize: size * 0.09 }}
          >
            %
          </div>
        </div>
      </div>
      <div
        className="text-[10px] font-bold uppercase tracking-[0.08em]"
        style={{ color }}
      >
        {labelText}
      </div>
    </div>
  );
}
