"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import {
  saveTrackRecord,
  type TrackRecordInput,
} from "@/lib/questionnaire/actions-e23";

const LEVELS = [
  { v: "C-level", l: "C-level (CEO/CFO/CTO/COO/CHRO/CMO)" },
  { v: "C-1", l: "C-1 (VP / SVP / Director)" },
  { v: "C-2", l: "C-2 (Head of)" },
  { v: "board", l: "Board Member / Independent Director" },
];

const REVENUE = [
  { v: "<100M", l: "< 100 млн ₽" },
  { v: "100M_500M", l: "100M – 500M ₽" },
  { v: "500M_1B", l: "500M – 1B ₽" },
  { v: "1B_5B", l: "1 – 5 млрд ₽" },
  { v: "5B_10B", l: "5 – 10 млрд ₽" },
  { v: "10B_50B", l: "10 – 50 млрд ₽" },
  { v: "50B+", l: "> 50 млрд ₽" },
];

const PNL = [
  { v: "none", l: "Без P&L ответственности" },
  { v: "<500M", l: "< 500 млн ₽" },
  { v: "500M_2B", l: "500M – 2B ₽" },
  { v: "2B_10B", l: "2 – 10 млрд ₽" },
  { v: "10B+", l: "> 10 млрд ₽" },
];

const FUNCTIONS = [
  { v: "general_management", l: "General Management" },
  { v: "finance", l: "Финансы" },
  { v: "operations", l: "Операции" },
  { v: "technology", l: "Технологии" },
  { v: "commercial", l: "Коммерция / Продажи" },
  { v: "hr", l: "HR / People" },
  { v: "product", l: "Продукт" },
  { v: "marketing", l: "Маркетинг" },
  { v: "strategy", l: "Стратегия" },
  { v: "legal", l: "Legal" },
];

const CONTEXTS = [
  { v: "startup", l: "Startup (0→1)" },
  { v: "scale_up", l: "Scale-up (быстрый рост)" },
  { v: "turnaround", l: "Turnaround / кризисное управление" },
  { v: "ma_buy", l: "M&A (buy side)" },
  { v: "ma_sell", l: "M&A (sell side / подготовка к продаже)" },
  { v: "pe_integration", l: "Интеграция после M&A" },
  { v: "ipo_pre", l: "IPO / pre-IPO подготовка" },
  { v: "digital_transformation", l: "Digital / IT трансформация" },
  { v: "geo_expansion", l: "Выход на новые рынки / geographic expansion" },
  { v: "restructuring", l: "Реструктуризация / оптимизация затрат" },
  { v: "board_work", l: "Работа с советом директоров" },
  { v: "pe_portfolio", l: "Управление PE-портфельной компанией" },
  { v: "state_gr", l: "Управление госкомпанией / GR" },
];

const INTL = [
  { v: "multi_country_teams", l: "Управлял командами в нескольких странах" },
  { v: "abroad_work", l: "Работал за рубежом" },
  { v: "international_hq", l: "Отчитывался перед international HQ" },
];

type Industry = { id: string; nameRu: string; category: string | null };

type Props = {
  industries: Industry[];
  initial: TrackRecordInput;
};

export function TrackRecordForm({ industries, initial }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [data, setData] = useState<TrackRecordInput>(initial);

  const update = (patch: Partial<TrackRecordInput>) =>
    setData((prev) => ({ ...prev, ...patch }));

  const handleSubmit = () => {
    startTransition(async () => {
      const result = await saveTrackRecord(data);
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
            Блок E.2 · Track Record
          </p>
          <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "hsl(40 33% 96%)" }}>
            Карьерные факты
          </h1>
          <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.55)" }}>
            Структурированные параметры опыта. Используются для матчинга и hard-фильтров.
          </p>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-5 py-6 space-y-5 -mt-2">
        <Section title="Текущая / последняя позиция">
          <Field label="Уровень">
            <SelectField
              value={data.currentLevel ?? ""}
              onChange={(v) => update({ currentLevel: v })}
              options={LEVELS}
              placeholder="Выберите уровень"
            />
          </Field>
          <Field label="Функция">
            <ToggleGroup
              values={data.currentFunction ?? []}
              onChange={(v) => update({ currentFunction: v })}
              options={FUNCTIONS}
            />
          </Field>
          <Field label="Выручка компании">
            <SelectField
              value={data.companyRevenue ?? ""}
              onChange={(v) => update({ companyRevenue: v })}
              options={REVENUE}
              placeholder="Диапазон"
            />
          </Field>
          <Field label="P&L ответственность">
            <SelectField
              value={data.pnlRange ?? ""}
              onChange={(v) => update({ pnlRange: v })}
              options={PNL}
              placeholder="Диапазон P&L"
            />
          </Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Прямые подчинённые">
              <NumberField
                value={data.directReports ?? null}
                onChange={(v) => update({ directReports: v })}
              />
            </Field>
            <Field label="Полная команда">
              <NumberField
                value={data.totalReports ?? null}
                onChange={(v) => update({ totalReports: v })}
              />
            </Field>
          </div>
        </Section>

        <Section title="Опыт (агрегировано)">
          <Field label="Лет управленческого опыта">
            <NumberField
              value={data.yearsManagement ?? null}
              onChange={(v) => update({ yearsManagement: v })}
            />
          </Field>
          <Field label="Максимальный P&L за карьеру">
            <SelectField
              value={data.maxPnl ?? ""}
              onChange={(v) => update({ maxPnl: v })}
              options={PNL}
              placeholder="Максимум за всю карьеру"
            />
          </Field>
          <Field label="Максимальная команда (всего)">
            <NumberField
              value={data.maxReports ?? null}
              onChange={(v) => update({ maxReports: v })}
            />
          </Field>
          <Field label="Отрасли с опытом 2+ года">
            <ToggleGroup
              values={data.industries ?? []}
              onChange={(v) => update({ industries: v })}
              options={industries.map((i) => ({ v: i.id, l: i.nameRu }))}
            />
          </Field>
          <Field label="Опыт в контекстах">
            <ToggleGroup
              values={data.experienceContexts ?? []}
              onChange={(v) => update({ experienceContexts: v })}
              options={CONTEXTS}
            />
          </Field>
          <Field label="Международный опыт">
            <ToggleGroup
              values={data.internationalExp ?? []}
              onChange={(v) => update({ internationalExp: v })}
              options={INTL}
            />
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

// ────────────────────────────────────────────────────────────────────
//  Sub-components
// ────────────────────────────────────────────────────────────────────

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
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { v: string; l: string }[];
  placeholder?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:border-emerald-500"
    >
      <option value="">{placeholder ?? "—"}</option>
      {options.map((o) => (
        <option key={o.v} value={o.v}>
          {o.l}
        </option>
      ))}
    </select>
  );
}

function NumberField({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (v: number | null) => void;
}) {
  return (
    <input
      type="number"
      inputMode="numeric"
      value={value ?? ""}
      onChange={(e) =>
        onChange(e.target.value === "" ? null : Number(e.target.value))
      }
      className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:border-emerald-500"
    />
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
    if (values.includes(v)) {
      onChange(values.filter((x) => x !== v));
    } else {
      onChange([...values, v]);
    }
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
