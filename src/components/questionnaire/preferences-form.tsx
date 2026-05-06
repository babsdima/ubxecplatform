"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import {
  savePreferences,
  type PreferencesInput,
} from "@/lib/questionnaire/actions-e23";
import { RankingCards } from "./ranking-cards";

const STATUS = [
  { v: "active", l: "Активно ищу новую роль" },
  { v: "open", l: "Открыт к предложениям" },
  { v: "passive", l: "Не ищу, но готов обсуждать top roles" },
  { v: "not_available", l: "Не доступен сейчас" },
];

const READINESS = [
  { v: "immediate", l: "Могу выйти немедленно" },
  { v: "1_month", l: "1 месяц" },
  { v: "2_3_months", l: "2–3 месяца" },
  { v: "3_6_months", l: "3–6 месяцев" },
  { v: "6_plus", l: "6+ месяцев" },
];

const TARGET_ROLES = [
  { v: "CEO", l: "CEO" },
  { v: "CFO", l: "CFO" },
  { v: "COO", l: "COO" },
  { v: "CTO", l: "CTO" },
  { v: "CDTO", l: "CDTO" },
  { v: "CMO", l: "CMO" },
  { v: "CPO", l: "CPO" },
  { v: "CHRO", l: "CHRO" },
  { v: "MD", l: "Managing Director" },
  { v: "VP", l: "VP / SVP" },
  { v: "board", l: "Board Member" },
  { v: "interim", l: "Interim / Project" },
];

const COMPANY_TYPES = [
  { v: "public", l: "Публичная" },
  { v: "private", l: "Частная" },
  { v: "pe_backed", l: "PE-backed" },
  { v: "startup", l: "Стартап" },
  { v: "state", l: "Госкомпания" },
  { v: "family", l: "Семейный бизнес" },
];

const REVENUE_RANGES = [
  { v: "<100M", l: "< 100M ₽" },
  { v: "100M_500M", l: "100M – 500M" },
  { v: "500M_1B", l: "500M – 1B" },
  { v: "1B_5B", l: "1 – 5B" },
  { v: "5B_10B", l: "5 – 10B" },
  { v: "10B_50B", l: "10 – 50B" },
  { v: "50B+", l: "> 50B" },
];

const GEOGRAPHY = [
  { v: "moscow", l: "Москва" },
  { v: "spb", l: "Санкт-Петербург" },
  { v: "regions_rf", l: "Регионы РФ" },
  { v: "cis", l: "СНГ" },
  { v: "international", l: "Международно" },
  { v: "remote", l: "Удалённо" },
];

const RELOCATION = [
  { v: "ready", l: "Готов" },
  { v: "discuss", l: "Готов обсуждать" },
  { v: "not_ready", l: "Не готов" },
];

const TOTAL_CASH = [
  { v: "5_10M", l: "5–10 млн ₽" },
  { v: "10_15M", l: "10–15 млн ₽" },
  { v: "15_25M", l: "15–25 млн ₽" },
  { v: "25_40M", l: "25–40 млн ₽" },
  { v: "40_60M", l: "40–60 млн ₽" },
  { v: "60M+", l: "60+ млн ₽" },
];

const EQUITY = [
  { v: "critical", l: "Критично" },
  { v: "desirable", l: "Желательно" },
  { v: "not_important", l: "Не важно" },
];

const DEALBREAKERS = [
  { v: "sanctioned", l: "Компании под санкциями" },
  { v: "government", l: "Государственные структуры" },
  { v: "small_revenue", l: "Компании с маленькой выручкой" },
  { v: "no_pnl", l: "Роли без P&L ответственности" },
  { v: "relocation_required", l: "Необходимость релокации" },
  { v: "frequent_travel", l: "Частые командировки (>30%)" },
  { v: "no_strategy", l: "Компании без чёткой стратегии" },
  { v: "micromgmt", l: "Сильный микроменеджмент сверху" },
];

const PRIORITIES = [
  { v: "scale_pnl", l: "Масштаб бизнеса и P&L" },
  { v: "autonomy", l: "Свобода принятия решений" },
  { v: "team_culture", l: "Сильная команда и культура" },
  { v: "compensation", l: "Компенсация и финансовые условия" },
  { v: "mission", l: "Миссия и impact компании" },
  { v: "learning", l: "Возможность для обучения и роста" },
  { v: "balance", l: "Баланс работы и личной жизни" },
  { v: "status", l: "Статус и visibility позиции" },
];

type Industry = { id: string; nameRu: string };

type Props = {
  industries: Industry[];
  initial: PreferencesInput;
};

export function PreferencesForm({ industries, initial }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [data, setData] = useState<PreferencesInput>(initial);

  const update = (patch: Partial<PreferencesInput>) =>
    setData((prev) => ({ ...prev, ...patch }));

  // Конвертация top3Priorities (string[] длины 0-3) ↔ ranks для RankingCards
  const priorityRanks = (() => {
    const ranks = new Array(PRIORITIES.length).fill(0);
    for (let i = 0; i < (data.top3Priorities?.length ?? 0); i++) {
      const v = data.top3Priorities![i];
      const idx = PRIORITIES.findIndex((p) => p.v === v);
      if (idx >= 0) ranks[idx] = i + 1;
    }
    return ranks;
  })();

  const handlePriorityChange = (ranks: number[]) => {
    // Берём top 3 — но игнорируем ranks > 3 (RankingCards позволяет ранжировать все)
    const picked: { v: string; rank: number }[] = [];
    for (let i = 0; i < ranks.length; i++) {
      if (ranks[i] >= 1 && ranks[i] <= 3) {
        picked.push({ v: PRIORITIES[i].v, rank: ranks[i] });
      }
    }
    picked.sort((a, b) => a.rank - b.rank);
    update({ top3Priorities: picked.map((p) => p.v) });
  };

  const handleSubmit = () => {
    startTransition(async () => {
      const result = await savePreferences(data);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Сохранено!");
      router.push("/candidate/assessment");
    });
  };

  return (
    <div className="dash-bg">
      <div className="dash-hero">
        <div className="max-w-3xl mx-auto px-5 pt-10 pb-2 relative z-10">
          <p className="text-[11px] font-bold tracking-[0.18em] uppercase mb-2" style={{ color: "rgba(255,255,255,0.45)" }}>
            Блок E.3 · Preferences
          </p>
          <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "hsl(40 33% 96%)" }}>
            Что вы ищете в роли
          </h1>
          <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.55)" }}>
            Параметры, по которым вас матчат с вакансиями. Чем точнее — тем лучше.
          </p>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-5 py-6 space-y-5 -mt-2">
        <Section title="Статус и готовность">
          <Field label="Текущий статус">
            <SelectField value={data.activityStatus ?? ""} onChange={(v) => update({ activityStatus: v })} options={STATUS} />
          </Field>
          <Field label="Готовность к выходу">
            <SelectField value={data.readiness ?? ""} onChange={(v) => update({ readiness: v })} options={READINESS} />
          </Field>
        </Section>

        <Section title="Целевая роль">
          <Field label="Целевые позиции">
            <ToggleGroup values={data.targetRoles ?? []} onChange={(v) => update({ targetRoles: v })} options={TARGET_ROLES} />
          </Field>
          <Field label="Целевые отрасли">
            <ToggleGroup
              values={data.targetIndustries ?? []}
              onChange={(v) => update({ targetIndustries: v })}
              options={industries.map((i) => ({ v: i.id, l: i.nameRu }))}
            />
          </Field>
          <Field label="Тип компании">
            <ToggleGroup values={data.targetCompanyTypes ?? []} onChange={(v) => update({ targetCompanyTypes: v })} options={COMPANY_TYPES} />
          </Field>
          <Field label="Размер компании">
            <ToggleGroup values={data.targetRevenue ?? []} onChange={(v) => update({ targetRevenue: v })} options={REVENUE_RANGES} />
          </Field>
          <Field label="География">
            <ToggleGroup values={data.geography ?? []} onChange={(v) => update({ geography: v })} options={GEOGRAPHY} />
          </Field>
          <Field label="Релокация">
            <SelectField value={data.relocation ?? ""} onChange={(v) => update({ relocation: v })} options={RELOCATION} />
          </Field>
        </Section>

        <Section title="Компенсация">
          <Field label="Ожидаемый total cash (fixed + bonus)">
            <SelectField value={data.totalCashRange ?? ""} onChange={(v) => update({ totalCashRange: v })} options={TOTAL_CASH} />
          </Field>
          <Field label="Equity / опционы">
            <SelectField value={data.equityImportance ?? ""} onChange={(v) => update({ equityImportance: v })} options={EQUITY} />
          </Field>
        </Section>

        <Section title="Deal-breakers и приоритеты">
          <Field label="Что абсолютно неприемлемо">
            <ToggleGroup values={data.dealbreakers ?? []} onChange={(v) => update({ dealbreakers: v })} options={DEALBREAKERS} />
          </Field>
          <Field label="Топ-3 приоритета (выберите 3 самых важных в порядке)">
            <RankingCards
              items={PRIORITIES.map((p, i) => ({ index: i, text: p.l }))}
              value={priorityRanks}
              onChange={handlePriorityChange}
            />
            <p className="text-[11px] text-slate-500 mt-2">Кликайте только по 3 самым важным — они получат ранги 1, 2, 3.</p>
          </Field>
        </Section>

        <div className="flex items-center justify-between pt-3">
          <button
            type="button"
            onClick={() => router.push("/candidate/assessment")}
            className="text-sm text-slate-600 hover:text-slate-900"
          >
            ← К списку блоков
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
                Сохранить
                <Check className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}

// shared pieces
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="pc p-5 sm:p-6 space-y-4">
      <h2 className="text-sm font-bold tracking-[0.12em] uppercase text-slate-500">{title}</h2>
      {children}
    </div>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-slate-700">{label}</label>
      {children}
    </div>
  );
}
function SelectField({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { v: string; l: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:border-emerald-500"
    >
      <option value="">—</option>
      {options.map((o) => (
        <option key={o.v} value={o.v}>{o.l}</option>
      ))}
    </select>
  );
}
function ToggleGroup({
  values,
  onChange,
  options,
}: {
  values: string[];
  onChange: (v: string[]) => void;
  options: { v: string; l: string }[];
}) {
  const toggle = (v: string) => {
    if (values.includes(v)) onChange(values.filter((x) => x !== v));
    else onChange([...values, v]);
  };
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => {
        const active = values.includes(o.v);
        return (
          <button
            key={o.v}
            type="button"
            onClick={() => toggle(o.v)}
            className={`px-3 py-1.5 rounded-full text-[12px] font-medium border transition-colors ${
              active
                ? "bg-emerald-500 text-white border-emerald-500"
                : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
            }`}
          >
            {o.l}
          </button>
        );
      })}
    </div>
  );
}
