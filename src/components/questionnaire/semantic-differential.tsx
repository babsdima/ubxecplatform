"use client";

import { motion } from "framer-motion";
import type { SemanticDifferentialQuestion } from "@/lib/questionnaire/types";

type Props = {
  question: SemanticDifferentialQuestion;
  value?: number; // 1-7
  onSelect: (value: number) => void;
  disabled?: boolean;
};

export function SemanticDifferential({
  question,
  value,
  onSelect,
  disabled,
}: Props) {
  const points = [1, 2, 3, 4, 5, 6, 7];

  return (
    <div className="space-y-4">
      <p className="text-base text-slate-800 font-medium">{question.question}</p>
      <div className="grid grid-cols-7 gap-1.5">
        {points.map((p) => {
          const isSelected = value === p;
          return (
            <motion.button
              key={p}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(p)}
              whileHover={{ scale: disabled ? 1 : 1.06 }}
              whileTap={{ scale: disabled ? 1 : 0.94 }}
              className={`
                aspect-square rounded-lg border flex items-center justify-center text-sm font-semibold transition-colors
                ${isSelected
                  ? "border-emerald-500 bg-emerald-500 text-white shadow"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"}
                ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}
              `}
            >
              {p}
            </motion.button>
          );
        })}
      </div>
      <div className="flex justify-between text-[11px] text-slate-600 px-0.5 leading-tight gap-3">
        <span className="max-w-[45%]">{question.leftLabel}</span>
        <span className="max-w-[45%] text-right">{question.rightLabel}</span>
      </div>
    </div>
  );
}
