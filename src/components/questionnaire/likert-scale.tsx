"use client";

import { motion } from "framer-motion";

type Props = {
  value?: number;
  onSelect: (value: number) => void;
  disabled?: boolean;
};

const POINTS: { value: number; label: string }[] = [
  { value: 1, label: "Совсем не про меня" },
  { value: 2, label: "Скорее не про меня" },
  { value: 3, label: "Нейтрально" },
  { value: 4, label: "Скорее про меня" },
  { value: 5, label: "Точно про меня" },
];

export function LikertScale({ value, onSelect, disabled }: Props) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-5 gap-2">
        {POINTS.map((p) => {
          const isSelected = value === p.value;
          return (
            <motion.button
              key={p.value}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(p.value)}
              whileHover={{ scale: disabled ? 1 : 1.04 }}
              whileTap={{ scale: disabled ? 1 : 0.96 }}
              className={`
                aspect-square rounded-xl border flex items-center justify-center text-lg font-semibold transition-colors
                ${isSelected
                  ? "border-emerald-500 bg-emerald-500 text-white shadow"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"}
                ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}
              `}
            >
              {p.value}
            </motion.button>
          );
        })}
      </div>
      <div className="flex justify-between text-[11px] text-slate-500 px-1">
        <span>{POINTS[0].label}</span>
        <span className="hidden sm:inline">{POINTS[2].label}</span>
        <span>{POINTS[4].label}</span>
      </div>
    </div>
  );
}
