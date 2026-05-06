"use client";

import { useState, useEffect } from "react";
import { OcaiQuadrant } from "./ocai-quadrant";

type Profile = { D1: number; D2: number; D3: number; D4: number };

type Props = {
  value: Profile;
  onChange: (next: Profile) => void;
  /** Опц. preview второго профиля (например To-Be vs As-Is overlay) */
  comparison?: { profile: Profile; label: string };
  comparisonAccent?: "amber" | "green";
};

const TYPES: { id: keyof Profile; label: string; description: string }[] = [
  {
    id: "D1",
    label: "Клан",
    description: "Дружественная атмосфера, лидеры-наставники, лояльность и традиции",
  },
  {
    id: "D2",
    label: "Рынок",
    description: "Ориентация на результат, конкуренция, лидеры-драйверы",
  },
  {
    id: "D3",
    label: "Адхократия",
    description: "Предпринимательская среда, риски, лидеры-новаторы",
  },
  {
    id: "D4",
    label: "Иерархия",
    description: "Структура, процессы, чёткие роли, лидеры-координаторы",
  },
];

export function OcaiEditor({ value, onChange, comparison }: Props) {
  // Локальное состояние для inputs (чтобы не терять промежуточные значения)
  const [local, setLocal] = useState(value);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  const total = local.D1 + local.D2 + local.D3 + local.D4;
  const ok = total === 100;

  const update = (id: keyof Profile, raw: string) => {
    const num = Math.max(0, Math.min(100, Number(raw) || 0));
    const next = { ...local, [id]: num };
    setLocal(next);
    if (next.D1 + next.D2 + next.D3 + next.D4 === 100) {
      onChange(next);
    }
  };

  // Авто-нормализация: распределить остаток равномерно
  const normalize = () => {
    if (total === 0) {
      const eq = { D1: 25, D2: 25, D3: 25, D4: 25 };
      setLocal(eq);
      onChange(eq);
      return;
    }
    const next = { ...local };
    let sum = 0;
    for (const k of ["D1", "D2", "D3", "D4"] as (keyof Profile)[]) {
      next[k] = Math.round((local[k] / total) * 100);
      sum += next[k];
    }
    // Ровняем до 100 через D1
    next.D1 += 100 - sum;
    setLocal(next);
    onChange(next);
  };

  return (
    <div className="grid md:grid-cols-2 gap-5">
      <div className="space-y-3">
        {TYPES.map((t) => (
          <div key={t.id}>
            <label className="flex items-baseline justify-between mb-1.5 gap-3">
              <div>
                <span className="text-sm font-semibold text-slate-800">{t.label}</span>
                <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                  {t.description}
                </p>
              </div>
              <input
                type="number"
                inputMode="numeric"
                value={local[t.id]}
                onChange={(e) => update(t.id, e.target.value)}
                min={0}
                max={100}
                className="w-16 h-9 px-2 rounded-md border border-slate-200 bg-white text-sm text-right font-mono focus:outline-none focus:border-emerald-500"
              />
            </label>
          </div>
        ))}
        <div
          className={`flex items-center justify-between text-xs px-3 py-2 rounded-lg ${
            ok
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-amber-50 text-amber-800 border border-amber-200"
          }`}
        >
          <span>
            Сумма: <span className="font-mono font-bold">{total}</span> / 100
          </span>
          {!ok && (
            <button
              type="button"
              onClick={normalize}
              className="text-xs font-semibold underline hover:no-underline"
            >
              Нормализовать
            </button>
          )}
        </div>
      </div>
      <div className="flex items-center justify-center">
        <OcaiQuadrant
          candidate={local}
          company={comparison?.profile}
          candidateLabel="Текущая"
          companyLabel={comparison?.label ?? "Сравнение"}
          size={240}
        />
      </div>
    </div>
  );
}
