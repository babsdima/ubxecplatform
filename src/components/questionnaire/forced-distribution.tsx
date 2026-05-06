"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { saveE1Distribution } from "@/lib/questionnaire/actions";
import {
  E1_GROUP_SIZE,
  type E1Distribution,
  type E1Examples,
} from "@/lib/questionnaire/blocks";

type Competency = {
  id: string;
  nameRu: string;
  description: string;
  domain: string;
};

type Group = "top5" | "middle5" | "bottom5";

const GROUP_META: Record<Group, { label: string; subtitle: string; color: string; bg: string }> = {
  top5: {
    label: "Сильнейшие",
    subtitle: "Top 5",
    color: "text-emerald-700",
    bg: "bg-emerald-50 border-emerald-200",
  },
  middle5: {
    label: "Уверенные",
    subtitle: "Middle 5",
    color: "text-amber-700",
    bg: "bg-amber-50 border-amber-200",
  },
  bottom5: {
    label: "Зоны развития",
    subtitle: "Bottom 5",
    color: "text-slate-600",
    bg: "bg-slate-50 border-slate-200",
  },
};

const DOMAIN_LABEL: Record<string, string> = {
  strategic: "Стратегия",
  people: "Люди",
  execution: "Исполнение",
  personal: "Личное",
};

type Props = {
  competencies: Competency[];
  initialDistribution: E1Distribution | null;
  initialExamples: E1Examples;
};

export function ForcedDistribution({
  competencies,
  initialDistribution,
  initialExamples,
}: Props) {
  const router = useRouter();
  const [assignments, setAssignments] = useState<Record<string, Group | null>>(
    () => {
      const init: Record<string, Group | null> = {};
      for (const c of competencies) init[c.id] = null;
      if (initialDistribution) {
        for (const id of initialDistribution.top5) init[id] = "top5";
        for (const id of initialDistribution.middle5) init[id] = "middle5";
        for (const id of initialDistribution.bottom5) init[id] = "bottom5";
      }
      return init;
    },
  );
  const [examples, setExamples] = useState<E1Examples>(initialExamples);
  const [step, setStep] = useState<"distribute" | "examples">("distribute");
  const [isPending, startTransition] = useTransition();

  const counts: Record<Group, number> = {
    top5: 0,
    middle5: 0,
    bottom5: 0,
  };
  for (const g of Object.values(assignments)) {
    if (g) counts[g] += 1;
  }
  const allValid =
    counts.top5 === E1_GROUP_SIZE &&
    counts.middle5 === E1_GROUP_SIZE &&
    counts.bottom5 === E1_GROUP_SIZE;

  const handleAssign = (compId: string, group: Group) => {
    const currentGroup = assignments[compId];
    // Проверка: можно ли добавить в эту группу (не превышаем 5)?
    if (currentGroup !== group) {
      if (counts[group] >= E1_GROUP_SIZE) {
        toast.error(`В "${GROUP_META[group].label}" уже ${E1_GROUP_SIZE} компетенций. Снимите одну.`);
        return;
      }
    }
    setAssignments((prev) => ({
      ...prev,
      [compId]: prev[compId] === group ? null : group,
    }));
  };

  const handleSubmit = () => {
    if (!allValid) return;
    const distribution: E1Distribution = {
      top5: [],
      middle5: [],
      bottom5: [],
    };
    for (const [id, g] of Object.entries(assignments)) {
      if (g) distribution[g].push(id);
    }
    startTransition(async () => {
      const result = await saveE1Distribution(distribution, examples);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Распределение сохранено!");
      router.push("/candidate/assessment");
    });
  };

  const proceedToExamples = () => {
    if (!allValid) return;
    setStep("examples");
  };

  // Группируем компетенции по доменам для UI
  const byDomain: Record<string, Competency[]> = {};
  for (const c of competencies) {
    byDomain[c.domain] ??= [];
    byDomain[c.domain].push(c);
  }

  if (step === "examples") {
    const top5Ids = Object.entries(assignments)
      .filter(([, g]) => g === "top5")
      .map(([id]) => id);
    const top5Comps = top5Ids
      .map((id) => competencies.find((c) => c.id === id))
      .filter((c): c is Competency => !!c);

    return (
      <div className="dash-bg">
        <div className="dash-hero">
          <div className="max-w-3xl mx-auto px-5 pt-10 pb-2 relative z-10">
            <p className="text-[11px] font-bold tracking-[0.18em] uppercase mb-2" style={{ color: "rgba(255,255,255,0.45)" }}>
              Блок E.1 · Шаг 2 из 2
            </p>
            <h1
              className="text-2xl font-bold tracking-tight"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "hsl(40 33% 96%)" }}
            >
              Примеры для ваших сильных сторон
            </h1>
            <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.55)" }}>
              Опционально: добавьте короткий пример из практики для каждой компетенции (до 500 символов).
            </p>
          </div>
        </div>

        <main className="max-w-3xl mx-auto px-5 py-6 space-y-4 -mt-2">
          {top5Comps.map((c) => (
            <div key={c.id} className="pc p-5">
              <div className="flex items-baseline justify-between gap-3 mb-2">
                <h3 className="text-base font-semibold text-slate-900">{c.nameRu}</h3>
                <span className="text-[10px] font-semibold tracking-wider uppercase text-slate-400">
                  {DOMAIN_LABEL[c.domain] ?? c.domain}
                </span>
              </div>
              <p className="text-[13px] text-slate-600 mb-3">{c.description}</p>
              <textarea
                value={examples[c.id] ?? ""}
                onChange={(e) =>
                  setExamples((prev) => ({ ...prev, [c.id]: e.target.value.slice(0, 500) }))
                }
                placeholder="Опишите конкретную ситуацию, где эта компетенция проявилась наиболее ярко (2–3 предложения)..."
                className="w-full p-3 rounded-lg border border-slate-200 text-sm resize-none focus:outline-none focus:border-emerald-500"
                rows={3}
                maxLength={500}
              />
              <p className="text-[10px] text-slate-400 mt-1 text-right">
                {(examples[c.id] ?? "").length}/500
              </p>
            </div>
          ))}

          <div className="flex items-center justify-between pt-3">
            <button
              type="button"
              onClick={() => setStep("distribute")}
              className="text-sm text-slate-600 hover:text-slate-900"
            >
              ← Назад к распределению
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isPending}
              className="px-5 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-40 transition-colors flex items-center gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Сохранение
                </>
              ) : (
                <>
                  Завершить блок
                  <Check className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dash-bg">
      <div className="dash-hero">
        <div className="max-w-4xl mx-auto px-5 pt-10 pb-3 relative z-10">
          <p className="text-[11px] font-bold tracking-[0.18em] uppercase mb-2" style={{ color: "rgba(255,255,255,0.45)" }}>
            Блок E.1 · Шаг 1 из 2
          </p>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "hsl(40 33% 96%)" }}
          >
            Самооценка компетенций
          </h1>
          <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.55)" }}>
            Распределите 15 компетенций по трём группам — ровно по 5 в каждой.
          </p>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-5 py-6 -mt-2 space-y-4">
        {/* Counters bar */}
        <div className="grid grid-cols-3 gap-3">
          {(["top5", "middle5", "bottom5"] as Group[]).map((g) => {
            const meta = GROUP_META[g];
            const isComplete = counts[g] === E1_GROUP_SIZE;
            return (
              <div
                key={g}
                className={`px-4 py-3 rounded-xl border ${meta.bg} ${isComplete ? "ring-2 ring-offset-1" : ""}`}
                style={{ "--tw-ring-color": isComplete ? "rgb(16 185 129)" : undefined } as React.CSSProperties}
              >
                <div className={`text-[10px] font-semibold tracking-wider uppercase ${meta.color}`}>
                  {meta.subtitle}
                </div>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className={`text-lg font-bold ${meta.color}`}>{counts[g]}</span>
                  <span className="text-xs text-slate-500">из {E1_GROUP_SIZE}</span>
                </div>
                <p className="text-xs text-slate-700 mt-1">{meta.label}</p>
              </div>
            );
          })}
        </div>

        {/* Domains */}
        {(["strategic", "people", "execution", "personal"] as const).map(
          (domain) => {
            const items = byDomain[domain] ?? [];
            if (items.length === 0) return null;
            return (
              <section key={domain} className="space-y-2">
                <h3 className="text-[11px] font-bold tracking-[0.18em] uppercase text-slate-500">
                  {DOMAIN_LABEL[domain]}
                </h3>
                <div className="space-y-2">
                  {items.map((c) => (
                    <CompetencyRow
                      key={c.id}
                      comp={c}
                      assignment={assignments[c.id]}
                      onAssign={handleAssign}
                    />
                  ))}
                </div>
              </section>
            );
          },
        )}

        {/* Submit */}
        <div className="flex items-center justify-end pt-4">
          <motion.button
            type="button"
            onClick={proceedToExamples}
            disabled={!allValid}
            whileHover={{ scale: allValid ? 1.02 : 1 }}
            whileTap={{ scale: allValid ? 0.98 : 1 }}
            className={`
              px-6 py-3 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors
              ${allValid
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"}
            `}
          >
            Дальше — примеры
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      </main>
    </div>
  );
}

function CompetencyRow({
  comp,
  assignment,
  onAssign,
}: {
  comp: Competency;
  assignment: Group | null;
  onAssign: (id: string, group: Group) => void;
}) {
  return (
    <div className="pc p-4">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="text-[15px] font-semibold text-slate-900">
            {comp.nameRu}
          </h4>
          <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">
            {comp.description}
          </p>
        </div>
        <div className="flex gap-1 shrink-0">
          {(["top5", "middle5", "bottom5"] as Group[]).map((g) => {
            const isActive = assignment === g;
            const meta = GROUP_META[g];
            return (
              <button
                key={g}
                type="button"
                onClick={() => onAssign(comp.id, g)}
                title={meta.label}
                className={`
                  px-3 py-1.5 rounded-md text-[11px] font-semibold tracking-wider uppercase transition-colors
                  ${isActive
                    ? `${meta.bg} ${meta.color} border-2 border-current`
                    : "bg-white text-slate-400 border border-slate-200 hover:border-slate-300"}
                `}
              >
                {meta.subtitle.replace("5", "")}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
