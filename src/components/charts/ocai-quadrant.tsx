"use client";

/**
 * Cameron-Quinn Competing Values Framework Quadrant
 *
 * 4 культуры:
 *   - D1 Clan       (top-left:    Internal + Flexible)
 *   - D2 Market     (bottom-right: External + Stable)
 *   - D3 Adhocracy  (top-right:    External + Flexible)
 *   - D4 Hierarchy  (bottom-left:  Internal + Stable)
 *
 * Поддерживает overlay двух профилей (например candidate vs company As-Is).
 */

type Profile = {
  D1: number; // %, sums to 100
  D2: number;
  D3: number;
  D4: number;
};

type Props = {
  candidate?: Profile;
  company?: Profile;
  candidateLabel?: string;
  companyLabel?: string;
  size?: number;
};

export function OcaiQuadrant({
  candidate,
  company,
  candidateLabel = "Кандидат",
  companyLabel = "Компания",
  size = 280,
}: Props) {
  const half = size / 2;
  const padding = 28;
  const innerSize = size - padding * 2;
  const innerHalf = innerSize / 2;

  // Координаты точек в каждом квадранте по % шкалы
  // D1 Clan: top-left, точка идёт от центра (cx, cy) влево и вверх на (innerHalf * pct/100)
  // D2 Market: bottom-right
  // D3 Adhocracy: top-right
  // D4 Hierarchy: bottom-left
  const profileToPoints = (p: Profile) => {
    const cx = half;
    const cy = half;
    return [
      { axis: "D1", x: cx - (innerHalf * p.D1) / 100, y: cy - (innerHalf * p.D1) / 100 },
      { axis: "D3", x: cx + (innerHalf * p.D3) / 100, y: cy - (innerHalf * p.D3) / 100 },
      { axis: "D2", x: cx + (innerHalf * p.D2) / 100, y: cy + (innerHalf * p.D2) / 100 },
      { axis: "D4", x: cx - (innerHalf * p.D4) / 100, y: cy + (innerHalf * p.D4) / 100 },
    ];
  };

  const candPoints = candidate ? profileToPoints(candidate) : null;
  const compPoints = company ? profileToPoints(company) : null;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background quadrant frame */}
        <rect
          x={padding}
          y={padding}
          width={innerSize}
          height={innerSize}
          fill="none"
          stroke="rgba(0,0,0,0.08)"
          strokeWidth={1}
        />
        {/* Cross */}
        <line
          x1={padding}
          y1={half}
          x2={size - padding}
          y2={half}
          stroke="rgba(0,0,0,0.06)"
          strokeWidth={1}
        />
        <line
          x1={half}
          y1={padding}
          x2={half}
          y2={size - padding}
          stroke="rgba(0,0,0,0.06)"
          strokeWidth={1}
        />

        {/* Reference rings (25%, 50%, 75%) */}
        {[25, 50, 75].map((pct) => {
          const r = (innerHalf * pct) / 100;
          return (
            <circle
              key={pct}
              cx={half}
              cy={half}
              r={r}
              fill="none"
              stroke="rgba(0,0,0,0.04)"
              strokeWidth={1}
              strokeDasharray="2 3"
            />
          );
        })}

        {/* Quadrant labels */}
        <text
          x={padding + 4}
          y={padding + 14}
          fill="#475569"
          fontSize={11}
          fontWeight={600}
          fontFamily="var(--font-inter)"
        >
          Clan
        </text>
        <text
          x={size - padding - 4}
          y={padding + 14}
          fill="#475569"
          fontSize={11}
          fontWeight={600}
          textAnchor="end"
          fontFamily="var(--font-inter)"
        >
          Adhocracy
        </text>
        <text
          x={size - padding - 4}
          y={size - padding - 6}
          fill="#475569"
          fontSize={11}
          fontWeight={600}
          textAnchor="end"
          fontFamily="var(--font-inter)"
        >
          Market
        </text>
        <text
          x={padding + 4}
          y={size - padding - 6}
          fill="#475569"
          fontSize={11}
          fontWeight={600}
          fontFamily="var(--font-inter)"
        >
          Hierarchy
        </text>

        {/* Company polygon */}
        {compPoints && (
          <polygon
            points={compPoints.map((p) => `${p.x},${p.y}`).join(" ")}
            fill="rgba(217, 119, 6, 0.12)"
            stroke="#d97706"
            strokeWidth={1.5}
            strokeDasharray="4 4"
          />
        )}
        {/* Candidate polygon */}
        {candPoints && (
          <polygon
            points={candPoints.map((p) => `${p.x},${p.y}`).join(" ")}
            fill="rgba(22, 163, 74, 0.18)"
            stroke="#16a34a"
            strokeWidth={1.8}
          />
        )}
        {/* Points */}
        {candPoints?.map((p, i) => (
          <circle
            key={`cand-${i}`}
            cx={p.x}
            cy={p.y}
            r={3}
            fill="#16a34a"
          />
        ))}
        {compPoints?.map((p, i) => (
          <circle
            key={`comp-${i}`}
            cx={p.x}
            cy={p.y}
            r={2.5}
            fill="#d97706"
          />
        ))}
      </svg>
      {(candidate || company) && (
        <div className="flex items-center gap-4 text-[11px] text-slate-600">
          {candidate && (
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-emerald-600 rounded-full" />
              {candidateLabel}
            </span>
          )}
          {company && (
            <span className="flex items-center gap-1.5">
              <span
                className="w-3 h-0.5 rounded-full"
                style={{ background: "#d97706", borderTop: "1px dashed #d97706" }}
              />
              {companyLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
