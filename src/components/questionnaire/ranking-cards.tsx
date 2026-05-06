"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

type Item = {
  /** Уникальный индекс в исходном массиве options */
  index: number;
  text: string;
};

type Props = {
  /** Контекст или вопрос (опц.) — отображается над cards */
  context?: string;
  items: Item[];
  /** Текущие ранги: ranks[i] = ранг option[i], или 0 если не выбрано */
  value?: number[];
  /** Сообщает обновлённый массив рангов (длины N, все заполнены 1..N когда все выбраны) */
  onChange: (ranks: number[]) => void;
  disabled?: boolean;
};

/**
 * Click-based ranking. Кандидат кликает по карточкам в порядке предпочтения:
 * первый клик → ранг 1, второй → 2, и т.д. Повторный клик по выбранной
 * карточке снимает выбор (и пересчитывает ранги остальных).
 *
 * Подходит и для триад (3 cards), и для квадов (4 cards).
 */
export function RankingCards({
  context,
  items,
  value,
  onChange,
  disabled,
}: Props) {
  const ranks = value ?? new Array(items.length).fill(0);
  const allRanked = ranks.every((r) => r > 0);

  // Порядок выбора: pickedOrder[k] = индекс option, занявшего ранг k+1
  const pickedOrder = useMemo(() => {
    const order: number[] = [];
    for (let rank = 1; rank <= items.length; rank++) {
      const idx = ranks.indexOf(rank);
      if (idx === -1) break;
      order.push(idx);
    }
    return order;
  }, [ranks, items.length]);

  const handleClick = (i: number) => {
    if (disabled) return;
    const currentRank = ranks[i];
    let newOrder: number[];

    if (currentRank > 0) {
      // Снять выбор: убрать i из pickedOrder
      newOrder = pickedOrder.filter((idx) => idx !== i);
    } else {
      // Добавить i в конец
      if (pickedOrder.length >= items.length) return;
      newOrder = [...pickedOrder, i];
    }

    // Пересчёт ranks
    const newRanks = new Array(items.length).fill(0);
    for (let k = 0; k < newOrder.length; k++) {
      newRanks[newOrder[k]] = k + 1;
    }
    onChange(newRanks);
  };

  return (
    <div className="space-y-4">
      {context && (
        <div className="px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700 italic">
          {context}
        </div>
      )}
      <p className="text-xs text-slate-500">
        {!allRanked ? (
          <>
            Кликните по утверждениям в порядке близости к вам:{" "}
            <span className="font-mono">1</span> — самое близкое,{" "}
            <span className="font-mono">{items.length}</span> — самое далёкое.
            Кликните повторно, чтобы снять выбор.
          </>
        ) : (
          <span className="text-emerald-700 font-medium">✓ Все варианты отранжированы</span>
        )}
      </p>
      <div className="space-y-3">
        {items.map((item, i) => {
          const rank = ranks[i] ?? 0;
          const isPicked = rank > 0;
          return (
            <motion.button
              key={i}
              type="button"
              disabled={disabled}
              onClick={() => handleClick(i)}
              whileHover={{ scale: disabled ? 1 : 1.005 }}
              whileTap={{ scale: disabled ? 1 : 0.995 }}
              className={`
                w-full text-left p-4 rounded-2xl border transition-colors flex items-start gap-3
                ${isPicked
                  ? "border-emerald-500 bg-emerald-50/40 shadow-sm"
                  : "border-slate-200 bg-white hover:border-slate-300"}
                ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}
              `}
            >
              <div
                className={`
                  shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-base font-bold transition-all
                  ${isPicked
                    ? "bg-emerald-500 text-white"
                    : "bg-slate-100 text-slate-400 border border-dashed border-slate-300"}
                `}
              >
                {rank > 0 ? rank : "—"}
              </div>
              <p className="text-[15px] leading-relaxed text-slate-800 pt-1.5 flex-1">
                {item.text}
              </p>
              {isPicked && (
                <span className="shrink-0 text-slate-400 hover:text-slate-600 mt-1.5">
                  <X className="w-4 h-4" />
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
