import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { CandidateNav } from "@/components/layout/candidate-nav";
import { ArrowRight, Sparkles, Target } from "lucide-react";
import { SCALES_A, SCALES_B, SCALES_C } from "@/lib/questionnaire/blocks/scales";
import { StenBar } from "@/components/charts/sten-bar";
import { RadarChart } from "@/components/charts/radar-chart";
import { OcaiQuadrant } from "@/components/charts/ocai-quadrant";
import { StyleScale } from "@/components/charts/style-scale";
import { deriveStrengthsAndGrowth } from "@/lib/scoring/insights";

const A_DESC: Record<string, string> = {
  A1: "Сохраняете спокойствие и продуктивность под давлением",
  A2: "Высокая целеустремлённость и лидерская энергия",
  A3: "Комфорт в публичных и социальных ситуациях",
  A4: "Внимательны к чувствам других",
  A5: "Структурированы и системны в работе",
  A6: "Стратегически мыслите, видите большую картину",
  A7: "Активно учитесь и рефлексируете",
  A8: "Балансируете между прямотой и дипломатичностью",
  A9: "Уверенно отстаиваете позицию, убедительны",
  A10: "Комфортны в неопределённости и переменах",
};

const B_DESC: Record<string, string> = {
  B1: "Эмоциональная стабильность под давлением",
  B2: "Доступность и открытость в стрессе",
  B3: "Здоровый скептицизм vs цинизм",
  B4: "Признаёте вклад других",
  B5: "Внимание к деталям без микроменеджмента",
  B6: "Независимость суждений",
};

export default async function ResultsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const profile = await prisma.candidateProfile.findUnique({
    where: { userId: session.user.id },
    include: { scaleScore: true },
  });
  if (!profile) redirect("/candidate/onboarding");

  const ss = profile.scaleScore;

  // Если ничего не пройдено — placeholder
  if (!ss || (!ss.aStens && !ss.bStens && !ss.cIpsative && !ss.dCulturePct && !ss.e1Distribution)) {
    return <EmptyState />;
  }

  const aStens = (ss.aStens as Record<string, number> | null) ?? null;
  const bStens = (ss.bStens as Record<string, number> | null) ?? null;
  const cIpsative = (ss.cIpsative as Record<string, number> | null) ?? null;
  const dCulturePct = (ss.dCulturePct as { D1: number; D2: number; D3: number; D4: number } | null) ?? null;
  const dStyle = (ss.dStyle as { pace: number; structure: number; risk: number; focus: number } | null) ?? null;
  const e1Distribution =
    (ss.e1Distribution as { top5: string[]; middle5: string[]; bottom5: string[] } | null) ?? null;

  const insights = deriveStrengthsAndGrowth({
    aStens,
    bStens,
    e1Distribution,
    dCulturePct,
  });

  // Radar для motivation
  const motivationRadarDataset =
    cIpsative
      ? [
          {
            name: "Ваш профиль",
            values: cIpsative,
            color: "#16a34a",
          },
        ]
      : [];

  return (
    <div className="dash-bg">
      <CandidateNav active="results" />

      <div className="dash-hero">
        <div className="max-w-4xl mx-auto px-5 pt-10 pb-2 relative z-10">
          <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: "rgba(255,255,255,0.35)" }}>
            Development Snapshot
          </p>
          <h1
            className="text-3xl font-bold tracking-tight"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "hsl(40 33% 96%)" }}
          >
            Ваша карта лидерства
          </h1>
          <p className="text-sm mt-1 leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>
            Персональный профиль на основе пройденных блоков. Используйте для планирования развития
            и выбора следующей роли.
          </p>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-5 pt-6 pb-12 -mt-2 space-y-6">
        {/* Strengths */}
        {insights.strengths.length > 0 && (
          <Section title="Ваши сильные стороны" icon={<Sparkles className="w-4 h-4" />}>
            <div className="space-y-2.5">
              {insights.strengths.map((s, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-emerald-600 text-base mt-0.5 shrink-0">◆</span>
                  <p className="text-[15px] text-slate-800 leading-relaxed">{s}</p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Personality (Block A) */}
        {aStens && (
          <Section title="Личностный профиль">
            <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
              {SCALES_A.map((s) => (
                <StenBar
                  key={s.id}
                  label={s.nameRu}
                  score={aStens[s.id] ?? 5}
                  description={A_DESC[s.id]}
                />
              ))}
            </div>
          </Section>
        )}

        {/* Behavioral Risks (Block B) */}
        {bStens && (
          <Section title="Поведенческие тенденции под давлением">
            <p className="text-sm text-slate-600 mb-4">
              Это не диагнозы. У каждого руководителя они проявляются в разной степени —
              осознание помогает эффективнее ими управлять.
            </p>
            <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
              {SCALES_B.map((s) => (
                <StenBar
                  key={s.id}
                  label={s.nameRu}
                  score={bStens[s.id] ?? 5}
                  description={B_DESC[s.id]}
                />
              ))}
            </div>
            {/* Highlight elevated risks */}
            {Object.values(bStens).some((v) => v >= 7) && (
              <div className="mt-4 p-3.5 rounded-lg bg-amber-50 border border-amber-200">
                <p className="text-[13px] text-amber-800 leading-relaxed">
                  <strong className="font-semibold">Зона внимания:</strong> у вас есть шкалы со значением 7+ —
                  обратите внимание на разделе <em>«Зоны развития»</em> ниже, там есть конкретные действия.
                </p>
              </div>
            )}
          </Section>
        )}

        {/* Motivation (Block C) */}
        {cIpsative && (
          <Section title="Мотивационный профиль">
            <div className="grid md:grid-cols-2 gap-6 items-center">
              <div>
                <RadarChart
                  datasets={motivationRadarDataset}
                  scales={SCALES_C.map((s) => ({ id: s.id, label: s.nameRu }))}
                  height={280}
                />
              </div>
              <div className="space-y-2">
                <p className="text-xs text-slate-500 mb-2">Топ-3 ваших драйвера:</p>
                {Object.entries(cIpsative)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 3)
                  .map(([scale, val]) => {
                    const s = SCALES_C.find((x) => x.id === scale);
                    return (
                      <div key={scale} className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                        <div className="flex items-baseline justify-between">
                          <span className="text-sm font-semibold text-emerald-900">{s?.nameRu}</span>
                          <span className="text-xs font-mono text-emerald-700">{val.toFixed(1)} / 10</span>
                        </div>
                        <p className="text-[12px] text-slate-700 mt-1">{s?.shortDescription}</p>
                      </div>
                    );
                  })}
              </div>
            </div>
          </Section>
        )}

        {/* Culture (Block D) */}
        {(dCulturePct || dStyle) && (
          <Section title="Культурные предпочтения и рабочий стиль">
            <div className="grid md:grid-cols-2 gap-6">
              {dCulturePct && (
                <div>
                  <p className="text-xs text-slate-500 mb-2">Профиль по Cameron-Quinn:</p>
                  <OcaiQuadrant candidate={dCulturePct} candidateLabel="Ваш профиль" size={260} />
                  {insights.dominantCulture && (
                    <div className="mt-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <div className="text-sm font-semibold text-slate-900">
                        {insights.dominantCulture.type} ({insights.dominantCulture.pct}%)
                      </div>
                      <p className="text-[12px] text-slate-600 mt-0.5 leading-relaxed">
                        {insights.dominantCulture.description}
                      </p>
                    </div>
                  )}
                </div>
              )}
              {dStyle && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-500">Рабочий стиль:</p>
                  <StyleScale label="Темп" value={dStyle.pace} leftLabel="Быстрый" rightLabel="Вдумчивый" />
                  <StyleScale label="Структура" value={dStyle.structure} leftLabel="Гибкая" rightLabel="Чёткая" />
                  <StyleScale label="Риск" value={dStyle.risk} leftLabel="Высокая толерантность" rightLabel="Низкая" />
                  <StyleScale label="Фокус" value={dStyle.focus} leftLabel="Внешний" rightLabel="Внутренний" />
                </div>
              )}
            </div>
          </Section>
        )}

        {/* Growth */}
        {insights.growthAreas.length > 0 && (
          <Section title="Зоны развития и рекомендации" icon={<Target className="w-4 h-4" />}>
            <div className="space-y-3">
              {insights.growthAreas.map((g, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl border border-slate-200 bg-white"
                >
                  <h4 className="text-sm font-bold text-slate-900">{g.area}</h4>
                  <p className="text-[13px] text-slate-700 mt-1.5 leading-relaxed">{g.detail}</p>
                  {g.action && (
                    <div className="mt-3 p-2.5 rounded-lg bg-emerald-50">
                      <p className="text-[10px] font-bold tracking-wider uppercase text-emerald-700">
                        Рекомендация
                      </p>
                      <p className="text-[12px] text-slate-800 mt-1 leading-relaxed">{g.action}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Empty state hint */}
        {(!aStens || !bStens || !cIpsative || !dCulturePct || !e1Distribution) && (
          <div className="pc p-5">
            <p className="text-sm text-slate-700">
              Чтобы получить полную карту, пройдите все блоки опросника.
            </p>
            <Link
              href="/candidate/assessment"
              className="inline-flex items-center gap-2 mt-3 text-emerald-700 font-medium text-sm hover:text-emerald-800"
            >
              Перейти к опроснику
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* CTA */}
        <div className="pc p-5 text-center">
          <h3 className="text-base font-bold text-slate-900">Хотите детальный план развития?</h3>
          <p className="text-[13px] text-slate-600 mt-1">
            Индивидуальная консультация с executive coach на основе вашего профиля
          </p>
          <button
            type="button"
            disabled
            className="mt-3 px-5 py-2.5 rounded-lg bg-slate-100 text-slate-400 text-sm font-semibold cursor-not-allowed"
          >
            Записаться на консультацию (скоро)
          </button>
        </div>
      </main>
    </div>
  );
}

function Section({
  title,
  children,
  icon,
}: {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="pc p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        {icon && <span className="text-emerald-700">{icon}</span>}
        <h2 className="text-[11px] font-bold tracking-[0.18em] uppercase text-slate-500">
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="dash-bg">
      <CandidateNav active="results" />
      <div className="dash-hero">
        <div className="max-w-4xl mx-auto px-5 pt-10 pb-2 relative z-10">
          <h1
            className="text-3xl font-bold tracking-tight"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "hsl(40 33% 96%)" }}
          >
            Development Snapshot
          </h1>
          <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
            Профиль появится после прохождения опросника.
          </p>
        </div>
      </div>
      <main className="max-w-3xl mx-auto px-5 pt-10 pb-12">
        <div className="pc p-8 text-center">
          <Target className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900">Пока ничего нет</h3>
          <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto leading-relaxed">
            Пройдите блоки A–D и E.1, чтобы получить полную карту лидерства с сильными сторонами,
            рекомендациями по развитию и подходящими типами ролей.
          </p>
          <Link
            href="/candidate/assessment"
            className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors"
          >
            Начать опросник
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </main>
    </div>
  );
}
