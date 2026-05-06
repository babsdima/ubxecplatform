"use client";

import { useState, useTransition } from "react";
import { Loader2, Check, ArrowLeft, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import {
  saveCompanyProfileSection,
  type CompanyProfilePatch,
} from "@/lib/employer/actions";
import { OcaiEditor } from "@/components/charts/ocai-editor";
import { StyleScale } from "@/components/charts/style-scale";

// ────────────────────────────────────────────────────────────────────
//  Constants
// ────────────────────────────────────────────────────────────────────

const COMPANY_TYPES = [
  { v: "public", l: "Публичная" },
  { v: "private", l: "Частная" },
  { v: "pe_backed", l: "PE-backed" },
  { v: "startup", l: "Стартап" },
  { v: "state", l: "Госкомпания" },
  { v: "family", l: "Семейный бизнес" },
  { v: "jv", l: "Joint Venture" },
];

const REVENUE = [
  { v: "<100M", l: "< 100 млн ₽" },
  { v: "100M_500M", l: "100M – 500M" },
  { v: "500M_1B", l: "500M – 1B" },
  { v: "1B_5B", l: "1 – 5B" },
  { v: "5B_10B", l: "5 – 10B" },
  { v: "10B_50B", l: "10 – 50B" },
  { v: "50B+", l: "50B+" },
];

const EMPLOYEES = [
  { v: "<50", l: "< 50" },
  { v: "50_200", l: "50–200" },
  { v: "200_1000", l: "200–1 000" },
  { v: "1000_5000", l: "1 000–5 000" },
  { v: "5000+", l: "5 000+" },
];

const STAGES = [
  { v: "pre_revenue", l: "Pre-revenue startup" },
  { v: "early_growth", l: "Early growth" },
  { v: "scale_up", l: "Scale-up" },
  { v: "mature", l: "Mature / stable" },
  { v: "transformation", l: "Transformation" },
  { v: "turnaround", l: "Turnaround" },
  { v: "pre_exit", l: "Pre-exit" },
  { v: "post_ma", l: "Post-M&A integration" },
];

const CHALLENGES = [
  { v: "growth", l: "Рост выручки / доли рынка" },
  { v: "profitability", l: "Выход на прибыльность" },
  { v: "scale_ops", l: "Масштабирование операций" },
  { v: "talent", l: "Привлечение и retention талантов" },
  { v: "digital", l: "Digital / IT трансформация" },
  { v: "geo_expansion", l: "Выход на новые рынки" },
  { v: "exit_prep", l: "Подготовка к M&A exit / IPO" },
  { v: "ma_integration", l: "Интеграция приобретений" },
  { v: "cost_optimize", l: "Оптимизация затрат / реструктуризация" },
  { v: "biz_model", l: "Смена бизнес-модели" },
  { v: "regulatory", l: "Регуляторные / compliance вызовы" },
  { v: "governance", l: "Построение governance и процессов" },
  { v: "team_renewal", l: "Обновление управленческой команды" },
];

const LEADERSHIP_STYLES = [
  { v: "visionary", l: "Visionary — задают направление и вдохновляют" },
  { v: "coaching", l: "Coaching — развивают людей и потенциал" },
  { v: "democratic", l: "Democratic — вовлекают команду в решения" },
  { v: "pacesetting", l: "Pacesetting — высокие стандарты личным примером" },
  { v: "commanding", l: "Commanding — чёткие указания и контроль" },
  { v: "affiliative", l: "Affiliative — эмоциональные связи и гармония" },
];

const LEADER_EXPECTATIONS = [
  { v: "first_100_days_wins", l: "Способность быстро показать результат" },
  { v: "team_building", l: "Способность выстроить сильную команду" },
  { v: "process_order", l: "Способность навести порядок в процессах" },
  { v: "strategic_vision", l: "Стратегическое видение и long-term thinking" },
  { v: "board_management", l: "Работа с board / акционерами" },
  { v: "culture_change", l: "Способность трансформировать культуру" },
  { v: "industry_expertise", l: "Глубокая отраслевая экспертиза" },
  { v: "innovation", l: "Инновационное мышление и digital mindset" },
  { v: "ethics", l: "Этичность и integrity" },
  { v: "inspiring", l: "Способность вдохновлять и мотивировать" },
];

const WORK_FORMAT = [
  { v: "office", l: "Офис 100%" },
  { v: "hybrid_2_3", l: "Гибрид (2–3 дня в офисе)" },
  { v: "hybrid_1", l: "Гибрид (1 день)" },
  { v: "remote_first", l: "Remote-first" },
  { v: "remote", l: "Полностью remote" },
];

const TRAVEL = [
  { v: "none", l: "Нет" },
  { v: "rare", l: "Редко (<10%)" },
  { v: "moderate", l: "Умеренно (10–30%)" },
  { v: "frequent", l: "Часто (30–50%)" },
  { v: "very_frequent", l: "Очень часто (>50%)" },
];

const CULTURAL_MARKERS = [
  { v: "flat_structure", l: "Плоская структура — к CEO можно подойти в коридоре" },
  { v: "hierarchy_clear", l: "Чёткая иерархия — каждый знает свою зону" },
  { v: "open_space", l: "Open space / гибридный формат" },
  { v: "fully_remote", l: "Полностью удалённая команда" },
  { v: "startup_pace", l: "Часто работаем по выходным — startup pace" },
  { v: "wlb", l: "Ценим work-life balance" },
  { v: "fast_decisions", l: "Решения принимаются быстро, иногда на интуиции" },
  { v: "data_driven", l: "Решения на основе тщательного анализа данных" },
  { v: "collegial", l: "Решения принимаются коллегиально" },
  { v: "top_down", l: "Решения принимаются top-down — CEO/основатель" },
  { v: "fail_fast", l: "Ошибки — нормальная часть роста, мы fail fast" },
  { v: "zero_defect", l: "Стремимся к zero-defect и предотвращаем ошибки" },
  { v: "strong_culture", l: "Сильная корпоративная культура и традиции" },
  { v: "diversity", l: "Ценим diversity и разные точки зрения" },
  { v: "competitive", l: "Конкурентная среда — побеждает сильнейший" },
  { v: "team_oriented", l: "Командная среда — побеждаем вместе" },
  { v: "trust", l: "Отношения на доверии — мало формального контроля" },
  { v: "transparency", l: "Прозрачность — все видят все метрики" },
  { v: "industry_leader", l: "Хотим стать лидером отрасли" },
  { v: "new_market", l: "Хотим создать принципиально новый рынок" },
  { v: "stable_growth", l: "Хотим стабильно расти и приносить value" },
  { v: "world_changer", l: "Хотим изменить индустрию / мир" },
];

// ────────────────────────────────────────────────────────────────────
//  Wizard component
// ────────────────────────────────────────────────────────────────────

type Industry = { id: string; nameRu: string };
type CompanyData = CompanyProfilePatch & { id?: string };

const STEPS = [
  { id: 1, label: "О компании", short: "CP.1" },
  { id: 2, label: "Стадия", short: "CP.2" },
  { id: 3, label: "Культура", short: "CP.3" },
  { id: 4, label: "Лидерство", short: "CP.4" },
  { id: 5, label: "Среда", short: "CP.5" },
  { id: 6, label: "Ценности", short: "CP.6" },
  { id: 7, label: "Команда", short: "CP.7" },
  { id: 8, label: "Privacy", short: "CP.8" },
];

type Props = {
  industries: Industry[];
  initial: CompanyData;
  initialStep?: number;
  /** % completion из БД */
  initialCompletion?: number;
};

export function CompanyProfileWizard({
  industries,
  initial,
  initialStep = 1,
  initialCompletion = 0,
}: Props) {
  const [step, setStep] = useState(initialStep);
  const [data, setData] = useState<CompanyData>(initial);
  const [isPending, startTransition] = useTransition();
  const [completion, setCompletion] = useState(initialCompletion);

  const update = (patch: Partial<CompanyData>) =>
    setData((prev) => ({ ...prev, ...patch }));

  const persist = (patch: CompanyProfilePatch, options?: { goNext?: boolean; goPrev?: boolean }) => {
    startTransition(async () => {
      const result = await saveCompanyProfileSection(patch);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Сохранено");
      // Переоцениваем completion грубо (auto-update от server-side)
      // в любом случае reload data при навигации. Здесь just feedback.
      setCompletion(Math.min(100, completion + 5));
      if (options?.goNext) setStep((s) => Math.min(STEPS.length, s + 1));
      if (options?.goPrev) setStep((s) => Math.max(1, s - 1));
    });
  };

  const handleSaveStep = (goNext: boolean = true) => {
    // В каждом шаге собираем relevant patch
    const patch = collectPatchForStep(step, data);
    persist(patch, { goNext });
  };

  return (
    <div className="dash-bg">
      {/* Header with stepper */}
      <div className="dash-hero">
        <div className="max-w-4xl mx-auto px-5 pt-8 pb-3 relative z-10">
          <p
            className="text-[11px] font-bold tracking-[0.18em] uppercase mb-2"
            style={{ color: "rgba(255,255,255,0.45)" }}
          >
            Профиль компании · Шаг {step} из {STEPS.length}
          </p>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{
              fontFamily: "var(--font-playfair), Georgia, serif",
              color: "hsl(40 33% 96%)",
            }}
          >
            {STEPS[step - 1].label}
          </h1>
          {/* Progress */}
          <div className="mt-4 flex items-center gap-2">
            {STEPS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setStep(s.id)}
                className={`flex-1 h-1 rounded-full transition-colors ${
                  s.id === step
                    ? "bg-emerald-400"
                    : s.id < step
                      ? "bg-emerald-300/60"
                      : "bg-white/15"
                }`}
                title={s.label}
              />
            ))}
          </div>
          <div className="flex items-center justify-between mt-2 text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>
            <span>
              Заполнено: <span className="font-mono font-bold">{completion}%</span>
            </span>
            {data.name && <span className="font-medium">{data.name}</span>}
          </div>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-5 py-6 -mt-2 space-y-5">
        {step === 1 && <Step1Identity data={data} update={update} industries={industries} />}
        {step === 2 && <Step2Stage data={data} update={update} />}
        {step === 3 && <Step3Culture data={data} update={update} />}
        {step === 4 && <Step4Leadership data={data} update={update} />}
        {step === 5 && <Step5Environment data={data} update={update} />}
        {step === 6 && <Step6Values data={data} update={update} />}
        {step === 7 && <Step7Team data={data} update={update} />}
        {step === 8 && <Step8Confidentiality data={data} update={update} />}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-3">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1}
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4" />
            Назад
          </button>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleSaveStep(false)}
              disabled={isPending}
              className="text-sm text-slate-600 hover:text-slate-900 disabled:opacity-30"
            >
              Сохранить
            </button>
            {step < STEPS.length ? (
              <button
                type="button"
                onClick={() => handleSaveStep(true)}
                disabled={isPending}
                className="px-5 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-40 transition-colors flex items-center gap-2"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Сохранить и далее
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSaveStep(false)}
                disabled={isPending}
                className="px-5 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-40 transition-colors flex items-center gap-2"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Завершить
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
//  Step components
// ────────────────────────────────────────────────────────────────────

function Step1Identity({
  data,
  update,
  industries,
}: {
  data: CompanyData;
  update: (p: Partial<CompanyData>) => void;
  industries: Industry[];
}) {
  return (
    <Section>
      <Field label="Название компании">
        <input
          type="text"
          value={data.name ?? ""}
          onChange={(e) => update({ name: e.target.value })}
          className="ui-input"
        />
      </Field>
      <Field label="Краткое описание (max 300 символов)">
        <textarea
          value={data.descriptionShort ?? ""}
          onChange={(e) => update({ descriptionShort: e.target.value.slice(0, 300) })}
          className="ui-textarea"
          rows={2}
          placeholder="Elevator pitch — одно-два предложения о компании"
        />
      </Field>
      <Field label="Развёрнутое описание (max 1500)">
        <textarea
          value={data.descriptionFull ?? ""}
          onChange={(e) => update({ descriptionFull: e.target.value.slice(0, 1500) })}
          className="ui-textarea"
          rows={4}
        />
      </Field>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Основная отрасль">
          <Select
            value={data.industryPrimary ?? ""}
            onChange={(v) => update({ industryPrimary: v })}
            options={industries.map((i) => ({ v: i.id, l: i.nameRu }))}
          />
        </Field>
        <Field label="Тип компании">
          <Select
            value={data.companyType ?? ""}
            onChange={(v) => update({ companyType: v })}
            options={COMPANY_TYPES}
          />
        </Field>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Выручка">
          <Select
            value={data.revenueRange ?? ""}
            onChange={(v) => update({ revenueRange: v })}
            options={REVENUE}
          />
        </Field>
        <Field label="Сотрудников">
          <Select
            value={data.employeeCount ?? ""}
            onChange={(v) => update({ employeeCount: v })}
            options={EMPLOYEES}
          />
        </Field>
      </div>
      <Field label="HQ (город)">
        <input
          type="text"
          value={data.hqCity ?? ""}
          onChange={(e) => update({ hqCity: e.target.value })}
          className="ui-input"
        />
      </Field>
      <Field label="Дополнительные отрасли">
        <ToggleGroup
          values={data.industriesSecondary ?? []}
          onChange={(v) => update({ industriesSecondary: v })}
          options={industries.map((i) => ({ v: i.id, l: i.nameRu }))}
        />
      </Field>
    </Section>
  );
}

function Step2Stage({
  data,
  update,
}: {
  data: CompanyData;
  update: (p: Partial<CompanyData>) => void;
}) {
  const top3 = data.growthChallenges?.top3 ?? [];

  const toggleChallenge = (v: string) => {
    if (top3.includes(v)) {
      update({
        growthChallenges: { top3: top3.filter((x) => x !== v) },
      });
    } else if (top3.length < 3) {
      update({
        growthChallenges: { top3: [...top3, v] },
      });
    } else {
      toast.error("Выберите не более 3 главных вызовов");
    }
  };

  return (
    <Section>
      <Field label="Стадия жизненного цикла">
        <Select
          value={data.stage ?? ""}
          onChange={(v) => update({ stage: v })}
          options={STAGES}
        />
      </Field>
      <Field label={`Главные вызовы (top 3) — выбрано ${top3.length}/3`}>
        <div className="flex flex-wrap gap-1.5">
          {CHALLENGES.map((c) => {
            const idx = top3.indexOf(c.v);
            const active = idx >= 0;
            return (
              <button
                key={c.v}
                type="button"
                onClick={() => toggleChallenge(c.v)}
                className={`px-3 py-1.5 rounded-full text-[12px] font-medium border transition-colors ${
                  active
                    ? "bg-emerald-500 text-white border-emerald-500"
                    : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                }`}
              >
                {active && (
                  <span className="font-bold mr-1">{idx + 1}.</span>
                )}
                {c.l}
              </button>
            );
          })}
        </div>
      </Field>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Рост выручки за год">
          <Select
            value={data.revenueGrowth ?? ""}
            onChange={(v) => update({ revenueGrowth: v })}
            options={[
              { v: "decline", l: "Снижение" },
              { v: "0_10", l: "0–10%" },
              { v: "10_25", l: "10–25%" },
              { v: "25_50", l: "25–50%" },
              { v: "50_100", l: "50–100%" },
              { v: "100+", l: "100%+" },
            ]}
          />
        </Field>
        <Field label="Планы роста">
          <Select
            value={data.growthPlan ?? ""}
            onChange={(v) => update({ growthPlan: v })}
            options={[
              { v: "decline", l: "Сокращение" },
              { v: "stable", l: "Стабилизация" },
              { v: "moderate", l: "Умеренный рост" },
              { v: "aggressive", l: "Агрессивный рост" },
            ]}
          />
        </Field>
      </div>
    </Section>
  );
}

function Step3Culture({
  data,
  update,
}: {
  data: CompanyData;
  update: (p: Partial<CompanyData>) => void;
}) {
  const asIs = data.cultureAsIs ?? { D1: 25, D2: 25, D3: 25, D4: 25 };
  const toBe = data.cultureToBe ?? { D1: 25, D2: 25, D3: 25, D4: 25 };
  const style = data.workingStyle ?? { pace: 4, structure: 4, risk: 4, focus: 4 };

  return (
    <Section>
      <div>
        <h3 className="text-base font-bold text-slate-900 mb-2">Текущая культура (As-Is)</h3>
        <p className="text-xs text-slate-600 mb-3">
          Распределите 100 баллов между четырьмя типами по фактической ситуации.
        </p>
        <OcaiEditor value={asIs} onChange={(v) => update({ cultureAsIs: v })} />
      </div>

      <div className="border-t border-slate-100 pt-5">
        <h3 className="text-base font-bold text-slate-900 mb-2">Желаемая культура (To-Be)</h3>
        <p className="text-xs text-slate-600 mb-3">
          К чему стремится компания в ближайшие 2–3 года?
        </p>
        <OcaiEditor
          value={toBe}
          onChange={(v) => update({ cultureToBe: v })}
          comparison={{ profile: asIs, label: "As-Is" }}
        />
      </div>

      <div className="border-t border-slate-100 pt-5">
        <h3 className="text-base font-bold text-slate-900 mb-3">Рабочий стиль компании</h3>
        <div className="space-y-4">
          <StyleScale label="Темп" value={style.pace} leftLabel="Быстрый, итеративный" rightLabel="Вдумчивый, аналитический" />
          <SliderField
            value={style.pace}
            onChange={(v) => update({ workingStyle: { ...style, pace: v } })}
          />
          <StyleScale label="Структура" value={style.structure} leftLabel="Гибкая, ad hoc" rightLabel="Чёткая, формализованная" />
          <SliderField
            value={style.structure}
            onChange={(v) => update({ workingStyle: { ...style, structure: v } })}
          />
          <StyleScale label="Риск" value={style.risk} leftLabel="Высокий appetite" rightLabel="Conservative" />
          <SliderField
            value={style.risk}
            onChange={(v) => update({ workingStyle: { ...style, risk: v } })}
          />
          <StyleScale label="Фокус" value={style.focus} leftLabel="Внешний (рынок)" rightLabel="Внутренний (люди, процессы)" />
          <SliderField
            value={style.focus}
            onChange={(v) => update({ workingStyle: { ...style, focus: v } })}
          />
        </div>
      </div>

      <div className="border-t border-slate-100 pt-5">
        <h3 className="text-base font-bold text-slate-900 mb-2">Культурные маркеры</h3>
        <p className="text-xs text-slate-600 mb-3">
          Выберите 5–8 утверждений, лучше всего описывающих компанию.
        </p>
        <ToggleGroup
          values={data.culturalMarkers ?? []}
          onChange={(v) => update({ culturalMarkers: v })}
          options={CULTURAL_MARKERS}
        />
      </div>
    </Section>
  );
}

function Step4Leadership({
  data,
  update,
}: {
  data: CompanyData;
  update: (p: Partial<CompanyData>) => void;
}) {
  const ranking = data.leadershipStyleRanking ?? [];
  const top3Exp = data.leaderExpectationsTop3 ?? [];

  const toggleStyle = (v: string) => {
    const exists = ranking.find(([k]) => k === v);
    if (exists) {
      const next = ranking.filter(([k]) => k !== v).map(([k], idx) => [k, idx + 1] as [string, number]);
      update({ leadershipStyleRanking: next });
    } else {
      const next = [...ranking, [v, ranking.length + 1] as [string, number]];
      update({ leadershipStyleRanking: next });
    }
  };

  const toggleExp = (v: string) => {
    if (top3Exp.includes(v)) {
      update({ leaderExpectationsTop3: top3Exp.filter((x) => x !== v) });
    } else if (top3Exp.length < 3) {
      update({ leaderExpectationsTop3: [...top3Exp, v] });
    } else {
      toast.error("Не более 3 ожиданий");
    }
  };

  return (
    <Section>
      <Field label="Какой стиль лидерства преобладает (отметьте характерные)">
        <div className="space-y-2">
          {LEADERSHIP_STYLES.map((s) => {
            const item = ranking.find(([k]) => k === s.v);
            const active = !!item;
            return (
              <button
                key={s.v}
                type="button"
                onClick={() => toggleStyle(s.v)}
                className={`w-full text-left p-3 rounded-lg border flex items-start gap-3 transition-colors ${
                  active
                    ? "border-emerald-500 bg-emerald-50/40"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div
                  className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    active
                      ? "bg-emerald-500 text-white"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {active && item ? item[1] : "—"}
                </div>
                <span className="text-[14px] text-slate-800">{s.l}</span>
              </button>
            );
          })}
        </div>
      </Field>
      <Field label={`Топ-3 ожидания от руководителя — ${top3Exp.length}/3`}>
        <div className="flex flex-wrap gap-1.5">
          {LEADER_EXPECTATIONS.map((e) => {
            const idx = top3Exp.indexOf(e.v);
            const active = idx >= 0;
            return (
              <button
                key={e.v}
                type="button"
                onClick={() => toggleExp(e.v)}
                className={`px-3 py-1.5 rounded-full text-[12px] font-medium border transition-colors ${
                  active
                    ? "bg-emerald-500 text-white border-emerald-500"
                    : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                }`}
              >
                {active && <span className="font-bold mr-1">{idx + 1}.</span>}
                {e.l}
              </button>
            );
          })}
        </div>
      </Field>
    </Section>
  );
}

function Step5Environment({
  data,
  update,
}: {
  data: CompanyData;
  update: (p: Partial<CompanyData>) => void;
}) {
  return (
    <Section>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Формат работы">
          <Select
            value={data.workFormat ?? ""}
            onChange={(v) => update({ workFormat: v })}
            options={WORK_FORMAT}
          />
        </Field>
        <Field label="Командировки">
          <Select
            value={data.travelFrequency ?? ""}
            onChange={(v) => update({ travelFrequency: v })}
            options={TRAVEL}
          />
        </Field>
      </div>
      <Field label="Позиционирование на рынке зарплат">
        <Select
          value={data.compPositioning ?? ""}
          onChange={(v) => update({ compPositioning: v })}
          options={[
            { v: "below_market", l: "Ниже рынка" },
            { v: "at_market", l: "На уровне рынка" },
            { v: "above_market", l: "Выше рынка (top 25%)" },
            { v: "leader", l: "Лидер рынка (top 10%)" },
          ]}
        />
      </Field>
      <Field label="Кто принимает решение о найме C-level">
        <ToggleGroup
          values={data.hiringDecisionMakers ?? []}
          onChange={(v) => update({ hiringDecisionMakers: v })}
          options={[
            { v: "ceo", l: "CEO" },
            { v: "board", l: "Совет директоров" },
            { v: "shareholder", l: "Акционер лично" },
            { v: "chro", l: "CHRO" },
            { v: "committee", l: "Комитет по назначениям" },
          ]}
        />
      </Field>
    </Section>
  );
}

function Step6Values({
  data,
  update,
}: {
  data: CompanyData;
  update: (p: Partial<CompanyData>) => void;
}) {
  const values = data.values ?? [];

  const addValue = () => {
    if (values.length >= 5) return;
    update({ values: [...values, { name: "", description: "" }] });
  };

  const updateValue = (i: number, patch: Partial<{ name: string; description: string }>) => {
    const next = values.map((v, idx) => (idx === i ? { ...v, ...patch } : v));
    update({ values: next });
  };

  const removeValue = (i: number) => {
    update({ values: values.filter((_, idx) => idx !== i) });
  };

  return (
    <Section>
      <Field label={`Ценности компании (до 5) — ${values.length}/5`}>
        <div className="space-y-3">
          {values.map((v, i) => (
            <div key={i} className="border border-slate-200 rounded-lg p-3 space-y-2 bg-white">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={v.name}
                  onChange={(e) => updateValue(i, { name: e.target.value.slice(0, 30) })}
                  placeholder="Название"
                  className="ui-input flex-1"
                />
                <button
                  type="button"
                  onClick={() => removeValue(i)}
                  className="text-xs text-slate-500 hover:text-red-600 px-2"
                >
                  Удалить
                </button>
              </div>
              <textarea
                value={v.description}
                onChange={(e) => updateValue(i, { description: e.target.value.slice(0, 200) })}
                placeholder="Что это значит на практике?"
                className="ui-textarea w-full"
                rows={2}
              />
            </div>
          ))}
          {values.length < 5 && (
            <button
              type="button"
              onClick={addValue}
              className="w-full px-4 py-2.5 rounded-lg border border-dashed border-slate-300 text-sm text-slate-600 hover:border-slate-400 hover:text-slate-900"
            >
              + Добавить ценность
            </button>
          )}
        </div>
      </Field>

      <Field label="EVP (Employer Value Proposition) — max 500">
        <textarea
          value={data.evp ?? ""}
          onChange={(e) => update({ evp: e.target.value.slice(0, 500) })}
          className="ui-textarea"
          rows={4}
          placeholder="Почему талантливый руководитель должен выбрать вашу компанию?"
        />
      </Field>

      <Field label="Известные challenges (внутренний — для assessor) — max 500">
        <textarea
          value={data.honestChallenges ?? ""}
          onChange={(e) => update({ honestChallenges: e.target.value.slice(0, 500) })}
          className="ui-textarea"
          rows={3}
          placeholder="Что нового руководителя может удивить в первые 3 месяца?"
        />
        <p className="text-[11px] text-slate-500 mt-1">
          Конфиденциально — не показывается кандидатам, видно только assessor'у в Tier 2.
        </p>
      </Field>
    </Section>
  );
}

function Step7Team({
  data,
  update,
}: {
  data: CompanyData;
  update: (p: Partial<CompanyData>) => void;
}) {
  const team = data.cLevelTeam ?? [];

  const addRole = () => {
    update({ cLevelTeam: [...team, { role: "", filled: true, tenure: "1_2", source: "external" }] });
  };

  const updateRole = (i: number, patch: Partial<{ role: string; filled: boolean; tenure: string; source: string }>) => {
    const next = team.map((t, idx) => (idx === i ? { ...t, ...patch } : t));
    update({ cLevelTeam: next });
  };

  const removeRole = (i: number) => {
    update({ cLevelTeam: team.filter((_, idx) => idx !== i) });
  };

  return (
    <Section>
      <Field label="Текущий состав C-level">
        <div className="space-y-2">
          {team.map((t, i) => (
            <div key={i} className="border border-slate-200 rounded-lg p-3 grid grid-cols-12 gap-2 items-center">
              <input
                type="text"
                value={t.role}
                onChange={(e) => updateRole(i, { role: e.target.value })}
                placeholder="CEO / CFO / ..."
                className="ui-input col-span-3"
              />
              <select
                value={t.filled ? "yes" : "no"}
                onChange={(e) => updateRole(i, { filled: e.target.value === "yes" })}
                className="ui-input col-span-3"
              >
                <option value="yes">Заполнена</option>
                <option value="no">Вакансия</option>
              </select>
              <select
                value={t.tenure ?? ""}
                onChange={(e) => updateRole(i, { tenure: e.target.value })}
                className="ui-input col-span-3"
              >
                <option value="<1">&lt;1 года</option>
                <option value="1_2">1–2 года</option>
                <option value="2_5">2–5 лет</option>
                <option value="5+">5+ лет</option>
              </select>
              <select
                value={t.source ?? ""}
                onChange={(e) => updateRole(i, { source: e.target.value })}
                className="ui-input col-span-2"
              >
                <option value="external">Извне</option>
                <option value="internal">Внутренний</option>
                <option value="founder">Основатель</option>
              </select>
              <button
                type="button"
                onClick={() => removeRole(i)}
                className="col-span-1 text-xs text-slate-500 hover:text-red-600"
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addRole}
            className="w-full px-4 py-2 rounded-lg border border-dashed border-slate-300 text-sm text-slate-600 hover:border-slate-400"
          >
            + Добавить роль
          </button>
        </div>
      </Field>
      <Field label="Динамика команды">
        <ToggleGroup
          values={data.teamDynamics ?? []}
          onChange={(v) => update({ teamDynamics: v })}
          options={[
            { v: "unified", l: "Сплочённая" },
            { v: "competitive", l: "Конкурентная" },
            { v: "political", l: "Политизированная" },
            { v: "fragmented", l: "Разобщённая" },
            { v: "forming", l: "Формирующаяся" },
            { v: "founder_controlled", l: "Под контролем founder/CEO" },
          ]}
        />
      </Field>
    </Section>
  );
}

function Step8Confidentiality({
  data,
  update,
}: {
  data: CompanyData;
  update: (p: Partial<CompanyData>) => void;
}) {
  return (
    <Section>
      <Field label="Показывать название компании до взаимного интереса?">
        <Select
          value={data.showName ? "yes" : "no"}
          onChange={(v) => update({ showName: v === "yes" })}
          options={[
            { v: "no", l: "Нет (только codename)" },
            { v: "yes", l: "Да" },
          ]}
        />
      </Field>
      <Field label="Codename (если скрыто)">
        <input
          type="text"
          value={data.codename ?? ""}
          onChange={(e) => update({ codename: e.target.value })}
          placeholder='Auto: "Tech-компания, PE-backed, revenue 1–5B ₽"'
          className="ui-input"
        />
      </Field>
      <Field label="Уведомлять кандидатов об отказе?">
        <Select
          value={data.notifyRejected ? "yes" : "no"}
          onChange={(v) => update({ notifyRejected: v === "yes" })}
          options={[
            { v: "yes", l: "Да (generic message)" },
            { v: "no", l: "Нет" },
          ]}
        />
      </Field>
    </Section>
  );
}

// ────────────────────────────────────────────────────────────────────
//  collectPatchForStep
// ────────────────────────────────────────────────────────────────────

function collectPatchForStep(step: number, data: CompanyData): CompanyProfilePatch {
  // Просто возвращаем data — server-side игнорирует undefined
  // и обновит только заполненные поля.
  return data;
}

// ────────────────────────────────────────────────────────────────────
//  Common form pieces
// ────────────────────────────────────────────────────────────────────

function Section({ children }: { children: React.ReactNode }) {
  return <div className="pc p-5 sm:p-6 space-y-5">{children}</div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-slate-700">{label}</label>
      {children}
    </div>
  );
}

function Select({
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
      className="ui-input"
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

function SliderField({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <input
      type="range"
      min={1}
      max={7}
      step={0.5}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full accent-emerald-600"
    />
  );
}
