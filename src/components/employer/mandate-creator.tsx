"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, ArrowRight, Briefcase, AlertCircle, Check } from "lucide-react";
import { toast } from "sonner";
import {
  createMandateFromTemplate,
  saveMandateSection,
  activateMandate,
  type MandatePatch,
} from "@/lib/employer/actions";

type Template = {
  id: string;
  role: string;
  context: string;
  nameRu: string;
  description: string;
};

const CONTEXT_LABELS: Record<string, string> = {
  growth: "Growth / Scale-up",
  turnaround: "Turnaround",
  pe_backed: "PE-backed",
  product_tech: "Product Tech",
  scaling: "Scaling Operations",
  transformation: "Transformation",
};

const PNL_OPTIONS = [
  { v: "none", l: "Без P&L" },
  { v: "<500M", l: "< 500M ₽" },
  { v: "500M_2B", l: "500M – 2B ₽" },
  { v: "2B_10B", l: "2 – 10B ₽" },
  { v: "10B+", l: "> 10B ₽" },
];

const BUDGET_OPTIONS = [
  { v: "5_10M", l: "5–10 млн ₽" },
  { v: "10_15M", l: "10–15 млн ₽" },
  { v: "15_25M", l: "15–25 млн ₽" },
  { v: "25_40M", l: "25–40 млн ₽" },
  { v: "40_60M", l: "40–60 млн ₽" },
  { v: "60M+", l: "60+ млн ₽" },
];

const RELOCATION = [
  { v: "yes", l: "Обязательна" },
  { v: "preferred", l: "Желательна" },
  { v: "no", l: "Нет" },
  { v: "remote_ok", l: "Remote ok" },
];

type Props = {
  companyName: string;
  templates: Template[];
  profileCompletion: number;
};

export function MandateCreator({ companyName, templates, profileCompletion }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState<"template" | "details">("template");
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [skipTemplate, setSkipTemplate] = useState(false);

  // Details form state
  const [title, setTitle] = useState("");
  const [pnlRange, setPnlRange] = useState("");
  const [budget, setBudget] = useState("");
  const [team, setTeam] = useState<number | null>(null);
  const [mainChallenge, setMainChallenge] = useState("");
  const [relocation, setRelocation] = useState("no");
  const [activate, setActivate] = useState(true);

  const handleSelectTemplate = (t: Template) => {
    setSelectedTemplate(t);
    setSkipTemplate(false);
    setTitle(t.nameRu);
    setStep("details");
  };

  const handleSkipTemplate = () => {
    setSelectedTemplate(null);
    setSkipTemplate(true);
    setTitle("");
    setStep("details");
  };

  const handleCreate = () => {
    if (!title.trim()) {
      toast.error("Укажите название мандата");
      return;
    }

    startTransition(async () => {
      const create = await createMandateFromTemplate({
        templateId: selectedTemplate?.id,
        title: title.trim(),
      });
      if (!create.ok) {
        toast.error(create.error);
        return;
      }
      const id = create.mandateId;

      // Update with form fields
      const patch: MandatePatch = {
        pnlRange: pnlRange || undefined,
        budgetRange: budget || undefined,
        totalTeam: team,
        mainChallenge: mainChallenge.trim() || undefined,
        relocationRequired: relocation || undefined,
      };
      const saved = await saveMandateSection(id, patch);
      if (!saved.ok) {
        toast.error(saved.error);
        return;
      }

      if (activate) {
        const act = await activateMandate(id);
        if (!act.ok) {
          toast.error(act.error);
          return;
        }
        toast.success(`Мандат активирован. Подобрано ${act.scored} кандидатов.`);
        router.push(`/company/mandates/${id}/candidates`);
      } else {
        toast.success("Мандат создан как DRAFT");
        router.push(`/company/mandates/${id}`);
      }
    });
  };

  if (step === "template") {
    // Группировка шаблонов по role
    const grouped: Record<string, Template[]> = {};
    for (const t of templates) {
      grouped[t.role] ??= [];
      grouped[t.role].push(t);
    }

    return (
      <div className="space-y-5">
        {profileCompletion < 50 && (
          <div className="pc p-4 flex items-start gap-3 border-l-4 border-l-amber-500">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-[13px]">
              <p className="font-semibold text-slate-900">
                Профиль компании заполнен на {profileCompletion}%
              </p>
              <p className="text-slate-600 mt-0.5">
                Cultural matching работает точнее когда{" "}
                <Link href="/company/profile?step=3" className="text-emerald-700 underline">
                  заполнена культура (CP.3)
                </Link>
                .
              </p>
            </div>
          </div>
        )}

        {Object.entries(grouped).map(([role, items]) => (
          <section key={role}>
            <h2 className="text-xs font-bold tracking-[0.18em] uppercase text-slate-500 mb-2">
              {role}
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {items.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleSelectTemplate(t)}
                  className="pc p-4 text-left hover:shadow-md transition-shadow group"
                >
                  <div className="flex items-baseline justify-between gap-2 mb-1">
                    <h3 className="text-sm font-bold text-slate-900">{t.nameRu}</h3>
                    <span className="text-[10px] font-mono text-slate-400 shrink-0">
                      {CONTEXT_LABELS[t.context] ?? t.context}
                    </span>
                  </div>
                  <p className="text-[12px] text-slate-600 leading-relaxed line-clamp-3">
                    {t.description}
                  </p>
                  <div className="mt-3 flex items-center gap-1.5 text-emerald-700 text-xs font-medium">
                    Использовать
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </button>
              ))}
            </div>
          </section>
        ))}

        <button
          type="button"
          onClick={handleSkipTemplate}
          className="w-full pc p-4 border-dashed text-center text-sm text-slate-600 hover:text-slate-900 hover:border-slate-300"
        >
          Создать без шаблона (пустой мандат)
        </button>
      </div>
    );
  }

  // Details step
  return (
    <div className="space-y-5">
      <div className="pc p-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Briefcase className="w-4 h-4 text-emerald-700 shrink-0" />
          <div className="min-w-0">
            <p className="text-xs text-slate-500">{companyName}</p>
            <p className="text-sm font-semibold truncate">
              {selectedTemplate
                ? `Шаблон: ${selectedTemplate.nameRu}`
                : "Без шаблона"}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setStep("template")}
          className="text-xs text-slate-600 hover:text-slate-900 shrink-0"
        >
          Сменить
        </button>
      </div>

      <div className="pc p-5 sm:p-6 space-y-4">
        <Field label="Название вакансии">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="ui-input"
            placeholder="Например: CFO — PE-портфельная компания финтех"
          />
        </Field>

        <Field label="Главный вызов (max 500 символов)">
          <textarea
            value={mainChallenge}
            onChange={(e) => setMainChallenge(e.target.value.slice(0, 500))}
            className="ui-textarea"
            rows={3}
            placeholder="Что должен сделать руководитель в первые 12–18 месяцев?"
          />
        </Field>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="P&L ответственность">
            <select
              value={pnlRange}
              onChange={(e) => setPnlRange(e.target.value)}
              className="ui-input"
            >
              <option value="">—</option>
              {PNL_OPTIONS.map((o) => (
                <option key={o.v} value={o.v}>{o.l}</option>
              ))}
            </select>
          </Field>
          <Field label="Команда (всего)">
            <input
              type="number"
              value={team ?? ""}
              onChange={(e) =>
                setTeam(e.target.value === "" ? null : Number(e.target.value))
              }
              className="ui-input"
            />
          </Field>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Бюджет компенсации">
            <select
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="ui-input"
            >
              <option value="">—</option>
              {BUDGET_OPTIONS.map((o) => (
                <option key={o.v} value={o.v}>{o.l}</option>
              ))}
            </select>
          </Field>
          <Field label="Релокация">
            <select
              value={relocation}
              onChange={(e) => setRelocation(e.target.value)}
              className="ui-input"
            >
              {RELOCATION.map((o) => (
                <option key={o.v} value={o.v}>{o.l}</option>
              ))}
            </select>
          </Field>
        </div>

        {selectedTemplate && (
          <div className="border-t border-slate-100 pt-4">
            <div className="flex items-start gap-2.5 text-[13px] text-slate-700">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-900">Pre-filled из шаблона:</p>
                <p className="text-slate-600 mt-0.5 leading-relaxed">
                  Must-have / Important / Nice-to-Have компетенции, personality preferences,
                  risk tolerance, motivation top 3 — всё подставлено по умолчанию для типичной
                  роли «{selectedTemplate.nameRu}». Сможете отредактировать на странице
                  мандата после создания.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="border-t border-slate-100 pt-4">
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={activate}
              onChange={(e) => setActivate(e.target.checked)}
              className="w-4 h-4 accent-emerald-600"
            />
            Сразу активировать (запустить scoring против всех кандидатов)
          </label>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setStep("template")}
          className="text-sm text-slate-600 hover:text-slate-900"
        >
          ← Назад к шаблонам
        </button>
        <button
          type="button"
          onClick={handleCreate}
          disabled={isPending}
          className="px-5 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-40 transition-colors flex items-center gap-2"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Создание...
            </>
          ) : (
            <>
              {activate ? "Создать и активировать" : "Создать как DRAFT"}
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
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
