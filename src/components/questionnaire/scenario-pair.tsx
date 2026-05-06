"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import type { ScenarioPairQuestion } from "@/lib/questionnaire/types";

type Props = {
  question: ScenarioPairQuestion;
  value?: "A" | "B";
  onSelect: (choice: "A" | "B") => void;
  disabled?: boolean;
};

export function ScenarioPair({ question, value, onSelect, disabled }: Props) {
  return (
    <div className="space-y-4">
      {question.context && (
        <div className="px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700 italic">
          {question.context}
        </div>
      )}
      <div className="grid sm:grid-cols-2 gap-4">
        {[
          { key: "A" as const, opt: question.optionA },
          { key: "B" as const, opt: question.optionB },
        ].map(({ key, opt }) => {
          const isSelected = value === key;
          return (
            <motion.button
              key={key}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(key)}
              whileHover={{ scale: disabled ? 1 : 1.01 }}
              whileTap={{ scale: disabled ? 1 : 0.99 }}
              className={`
                relative text-left p-5 rounded-2xl border transition-colors
                ${isSelected ? "border-emerald-500 bg-emerald-50/40 shadow-sm" : "border-slate-200 bg-white hover:border-slate-300"}
                ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}
              `}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                  <Check className="w-3.5 h-3.5" strokeWidth={3} />
                </div>
              )}
              <div className="flex items-start gap-3">
                <div
                  className={`
                    shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold tracking-wider
                    ${isSelected ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-500"}
                  `}
                >
                  {key}
                </div>
                <p className="text-[15px] leading-relaxed text-slate-800 pt-0.5">{opt.text}</p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
