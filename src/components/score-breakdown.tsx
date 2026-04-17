"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

type Breakdown = {
  industry: number;
  role: number;
  salary: number;
  experience: number;
  location: number;
  format: number;
  assessment: number;
  total: number;
};

const FACTORS: { key: keyof Omit<Breakdown, "total">; label: string; max: number }[] = [
  { key: "industry",   label: "Отрасль",                max: 35 },
  { key: "role",       label: "Роль / функция",          max: 30 },
  { key: "salary",     label: "Компенсация",             max: 20 },
  { key: "experience", label: "Опыт",                   max: 10 },
  { key: "format",     label: "Формат взаимодействия",  max: 12 },
  { key: "location",   label: "Локация",                max: 5  },
  { key: "assessment", label: "Assessment-бонус",        max: 9  },
];

function Bar({ value, max }: { value: number; max: number }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const color =
    pct >= 80 ? "bg-green-500" :
    pct >= 50 ? "bg-primary" :
    pct >= 20 ? "bg-amber-400" :
    "bg-muted-foreground/40";
  return (
    <div className="flex items-center gap-2 min-w-0">
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[11px] tabular-nums w-8 text-right shrink-0">
        {value}/{max}
      </span>
    </div>
  );
}

export function ScoreBreakdownWidget({
  scoreBreakdown,
  score,
}: {
  scoreBreakdown: string | null | undefined;
  score: number;
}) {
  const [open, setOpen] = useState(false);

  if (!scoreBreakdown) return null;

  let bd: Breakdown;
  try {
    bd = JSON.parse(scoreBreakdown);
  } catch {
    return null;
  }

  return (
    <div className="border-t mt-2 pt-2">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        Разбивка score {score}%
      </button>

      {open && (
        <div className="mt-2 space-y-1.5">
          {FACTORS.map(({ key, label, max }) => (
            <div key={key} className="grid grid-cols-[1fr_140px] gap-2 items-center">
              <span className="text-xs text-muted-foreground truncate">{label}</span>
              <Bar value={bd[key]} max={max} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
