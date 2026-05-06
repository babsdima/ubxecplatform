"use client";

import {
  Radar,
  RadarChart as ReRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

export type RadarDataset = {
  /** Имя datasetа (показывается в legend) */
  name: string;
  /** {scaleId: value 0-10}, scaleId должны совпадать с labels */
  values: Record<string, number>;
  color: string;
};

type Props = {
  datasets: RadarDataset[];
  /** Список шкал (axes) — order определяет порядок отображения */
  scales: { id: string; label: string }[];
  /** Максимум по оси (default 10) */
  maxValue?: number;
  height?: number;
  showLegend?: boolean;
};

const DEFAULT_COLORS = ["#16a34a", "#d97706", "#6b7280"];

export function RadarChart({
  datasets,
  scales,
  maxValue = 10,
  height = 280,
  showLegend = false,
}: Props) {
  // Recharts ожидает массив объектов: каждый элемент — одна "ось" со значениями всех datasets
  const data = scales.map(({ id, label }) => {
    const point: Record<string, string | number> = { axis: label };
    for (const ds of datasets) {
      point[ds.name] = ds.values[id] ?? 0;
    }
    return point;
  });

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ReRadarChart data={data} outerRadius="75%">
        <PolarGrid stroke="rgba(0,0,0,0.08)" />
        <PolarAngleAxis
          dataKey="axis"
          tick={{ fill: "#475569", fontSize: 11, fontFamily: "var(--font-inter)" }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, maxValue]}
          tick={false}
          axisLine={false}
        />
        {datasets.map((ds, i) => (
          <Radar
            key={ds.name}
            name={ds.name}
            dataKey={ds.name}
            stroke={ds.color || DEFAULT_COLORS[i] || DEFAULT_COLORS[0]}
            fill={ds.color || DEFAULT_COLORS[i] || DEFAULT_COLORS[0]}
            fillOpacity={0.12}
            strokeWidth={1.8}
          />
        ))}
        {showLegend && datasets.length > 1 && (
          <Legend
            iconSize={10}
            wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
          />
        )}
        <Tooltip
          cursor={false}
          contentStyle={{
            background: "white",
            border: "1px solid rgba(0,0,0,0.1)",
            borderRadius: 8,
            fontSize: 12,
          }}
        />
      </ReRadarChart>
    </ResponsiveContainer>
  );
}
