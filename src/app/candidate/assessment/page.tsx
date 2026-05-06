import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { CandidateNav } from "@/components/layout/candidate-nav";
import { CheckCircle2, Clock, ArrowRight, Sparkles, Brain } from "lucide-react";
import {
  BLOCK_A,
  BLOCK_B,
  BLOCK_C,
  BLOCK_D,
  BLOCK_E1_META,
} from "@/lib/questionnaire/blocks";

type BlockProgressView = {
  id: "A" | "B" | "C" | "D" | "E1" | "E2" | "E3";
  title: string;
  shortTitle: string;
  scaleCount: number;
  questionsCount: number;
  estimatedMinutes: [number, number];
  available: boolean;
  href?: string;
  state: "not_started" | "in_progress" | "completed";
  progressPct: number;
};

export default async function AssessmentPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const profile = await prisma.candidateProfile.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      questionnaireResponses: {
        select: { block: true, responses: true, completedAt: true },
      },
    },
  });
  if (!profile) redirect("/candidate/onboarding");

  // Helper: получить состояние блока
  const getBlockState = (
    blockId: string,
    totalQuestions: number,
  ): { state: BlockProgressView["state"]; progressPct: number } => {
    const record = profile.questionnaireResponses.find(
      (r) => r.block === blockId,
    );
    if (!record) return { state: "not_started", progressPct: 0 };
    if (record.completedAt) return { state: "completed", progressPct: 100 };
    const responses = (record.responses as Record<string, unknown>) ?? {};
    const answered = Object.keys(responses).length;
    return {
      state: answered > 0 ? "in_progress" : "not_started",
      progressPct:
        totalQuestions > 0 ? Math.round((answered / totalQuestions) * 100) : 0,
    };
  };

  const blockAState = getBlockState("A", BLOCK_A.questions.length);
  const blockBState = getBlockState("B", BLOCK_B.questions.length);
  const blockCState = getBlockState("C", BLOCK_C.questions.length);
  const blockDState = getBlockState("D", BLOCK_D.questions.length);
  const blockE1State = getBlockState("E1", 0);
  const blockE2State = getBlockState("E2", 0);
  const blockE3State = getBlockState("E3", 0);

  // Deep Profile (A → B → C → D)
  const deepBlocks: BlockProgressView[] = [
    {
      id: "A",
      title: BLOCK_A.title,
      shortTitle: "Личностный профиль",
      scaleCount: BLOCK_A.scales.length,
      questionsCount: BLOCK_A.questions.length,
      estimatedMinutes: BLOCK_A.estimatedMinutes,
      available: true,
      href: "/candidate/assessment/block-a",
      ...blockAState,
    },
    {
      id: "B",
      title: BLOCK_B.title,
      shortTitle: "Поведенческие риски",
      scaleCount: BLOCK_B.scales.length,
      questionsCount: BLOCK_B.questions.length,
      estimatedMinutes: BLOCK_B.estimatedMinutes,
      available: true,
      href: "/candidate/assessment/block-b",
      ...blockBState,
    },
    {
      id: "C",
      title: BLOCK_C.title,
      shortTitle: "Мотивация",
      scaleCount: BLOCK_C.scales.length,
      questionsCount: BLOCK_C.questions.length,
      estimatedMinutes: BLOCK_C.estimatedMinutes,
      available: true,
      href: "/candidate/assessment/block-c",
      ...blockCState,
    },
    {
      id: "D",
      title: BLOCK_D.title,
      shortTitle: "Культура и стиль",
      scaleCount: BLOCK_D.scales.length,
      questionsCount: BLOCK_D.questions.length,
      estimatedMinutes: BLOCK_D.estimatedMinutes,
      available: true,
      href: "/candidate/assessment/block-d",
      ...blockDState,
    },
  ];

  // Quick Profile (E.2 + E.3 + E.1)
  const quickBlocks: BlockProgressView[] = [
    {
      id: "E2",
      title: "E.2 — Track Record",
      shortTitle: "Карьерные факты",
      scaleCount: 0,
      questionsCount: 25,
      estimatedMinutes: [5, 8],
      available: true,
      href: "/candidate/assessment/block-e2",
      ...blockE2State,
    },
    {
      id: "E3",
      title: "E.3 — Карьерные предпочтения",
      shortTitle: "Что ищу в роли",
      scaleCount: 0,
      questionsCount: 15,
      estimatedMinutes: [3, 5],
      available: true,
      href: "/candidate/assessment/block-e3",
      ...blockE3State,
    },
    {
      id: "E1",
      title: BLOCK_E1_META.title,
      shortTitle: "15 компетенций",
      scaleCount: 15,
      questionsCount: 15,
      estimatedMinutes: BLOCK_E1_META.estimatedMinutes,
      available: true,
      href: "/candidate/assessment/block-e1",
      ...blockE1State,
    },
  ];

  const deepCompleted = deepBlocks.filter((b) => b.state === "completed").length;
  const quickCompleted = quickBlocks.filter((b) => b.state === "completed").length;

  return (
    <div className="dash-bg">
      <CandidateNav active="assessment" />

      {/* Header */}
      <div className="dash-hero">
        <div className="max-w-4xl mx-auto px-5 pt-10 pb-2 relative z-10">
          <p
            className="text-xs font-bold tracking-widest uppercase mb-2"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            Кандидат
          </p>
          <h1
            className="text-3xl font-bold tracking-tight"
            style={{
              fontFamily: "var(--font-playfair), Georgia, serif",
              color: "hsl(40 33% 96%)",
            }}
          >
            Оценка
          </h1>
          <p
            className="text-sm mt-1 leading-relaxed"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            Опросник из двух сессий. Чем точнее заполните — тем точнее мэтчинг и
            глубже Development Snapshot.
          </p>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-5 pt-6 pb-10 space-y-8 -mt-2">
        {/* Quick Profile */}
        <section>
          <SessionHeader
            icon={<Sparkles className="w-4 h-4" />}
            label="Сессия 1"
            title="Quick Profile"
            description="15–20 минут. Карьерные факты + предпочтения + самооценка компетенций. После завершения вы попадаете в матчинг."
            completed={quickCompleted}
            total={quickBlocks.length}
          />
          <div className="space-y-3 mt-4">
            {quickBlocks.map((b) => (
              <BlockCard key={b.id} block={b} />
            ))}
          </div>
        </section>

        {/* Deep Profile */}
        <section>
          <SessionHeader
            icon={<Brain className="w-4 h-4" />}
            label="Сессия 2"
            title="Deep Profile"
            description="25–35 минут. Психометрический профиль (личность, риски, мотивация, культура). Открывает Development Snapshot и повышает приоритет в мэтчинге."
            completed={deepCompleted}
            total={deepBlocks.length}
          />
          <div className="space-y-3 mt-4">
            {deepBlocks.map((b) => (
              <BlockCard key={b.id} block={b} />
            ))}
          </div>
        </section>

        {/* Info */}
        <div className="pc p-5 mt-2">
          <p className="text-[13px] leading-relaxed text-slate-600">
            <strong className="text-slate-900">Конфиденциальность:</strong> ваши
            ответы видны только вам и платформе для построения мэтчей. Компании
            видят агрегированный scorecard только после взаимного интереса.
            Вы в любой момент можете удалить данные.
          </p>
        </div>
      </main>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
//  Sub-components
// ────────────────────────────────────────────────────────────────────

function SessionHeader({
  icon,
  label,
  title,
  description,
  completed,
  total,
}: {
  icon: React.ReactNode;
  label: string;
  title: string;
  description: string;
  completed: number;
  total: number;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] uppercase text-emerald-700">
        {icon}
        {label}
      </div>
      <div className="flex items-baseline justify-between mt-1">
        <h2
          className="text-xl font-bold tracking-tight"
          style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
        >
          {title}
        </h2>
        <span className="text-xs font-mono text-slate-500">
          {completed} / {total} блоков
        </span>
      </div>
      <p className="text-[13px] text-slate-600 mt-1.5">{description}</p>
    </div>
  );
}

function BlockCard({ block }: { block: BlockProgressView }) {
  const isCompleted = block.state === "completed";
  const isInProgress = block.state === "in_progress";

  const cardClass = isCompleted ? "pc-green" : "pc";

  const content = (
    <div className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono text-slate-400">
              Блок {block.id}
            </span>
            {!block.available && (
              <span className="text-[10px] font-semibold tracking-wider uppercase text-slate-400">
                скоро
              </span>
            )}
          </div>
          <h3 className="text-base font-semibold text-slate-900">
            {block.shortTitle}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {block.questionsCount} вопросов · {block.estimatedMinutes[0]}–
            {block.estimatedMinutes[1]} мин
            {block.scaleCount > 0 && ` · ${block.scaleCount} шкал`}
          </p>
        </div>
        <StatusBadge state={block.state} />
      </div>

      {isInProgress && (
        <div className="mt-3">
          <div className="h-1 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-emerald-500"
              style={{ width: `${block.progressPct}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5 font-mono">
            {block.progressPct}% выполнено
          </p>
        </div>
      )}

      {block.available && (
        <div className="mt-4 flex items-center gap-2 text-emerald-700 text-sm font-medium">
          {isCompleted ? "Просмотреть результаты" : isInProgress ? "Продолжить" : "Начать"}
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      )}
    </div>
  );

  if (block.available && block.href) {
    return (
      <Link href={block.href} className={`block ${cardClass} hover:shadow-md transition-shadow`}>
        {content}
      </Link>
    );
  }
  return <div className={cardClass}>{content}</div>;
}

function StatusBadge({ state }: { state: BlockProgressView["state"] }) {
  if (state === "completed") {
    return (
      <span className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-green-50 text-green-700 border border-green-100">
        <CheckCircle2 className="w-3 h-3" />
        Завершён
      </span>
    );
  }
  if (state === "in_progress") {
    return (
      <span className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
        <Clock className="w-3 h-3" />В процессе
      </span>
    );
  }
  return (
    <span className="shrink-0 text-xs font-medium px-3 py-1.5 rounded-full bg-slate-100 text-slate-500">
      Не пройден
    </span>
  );
}
