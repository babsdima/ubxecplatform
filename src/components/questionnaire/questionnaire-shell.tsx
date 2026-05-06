"use client";

import { useState, useTransition, useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  saveQuestionResponse,
  completeBlock,
} from "@/lib/questionnaire/actions";
import {
  isForcedChoice,
  isForcedRankingTriad,
  isLikert,
  isScenarioPair,
  isScenarioQuad,
  isSemanticDifferential,
  type BlockId,
  type Question,
  type ResponseValue,
  type ResponsesMap,
} from "@/lib/questionnaire/types";
import { ForcedChoiceCard } from "./forced-choice-card";
import { LikertScale } from "./likert-scale";
import { ScenarioPair } from "./scenario-pair";
import { SemanticDifferential } from "./semantic-differential";
import { RankingCards } from "./ranking-cards";

type Props = {
  blockId: BlockId;
  blockTitle: string;
  questions: Question[];
  initialResponses: ResponsesMap;
  /** URL для навигации после завершения блока */
  nextHref: string;
};

export function QuestionnaireShell({
  blockId,
  blockTitle,
  questions,
  initialResponses,
  nextHref,
}: Props) {
  const router = useRouter();
  const [responses, setResponses] = useState<ResponsesMap>(initialResponses);
  const [isPending, startTransition] = useTransition();
  const [isCompleting, setIsCompleting] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const startedAt = useMemo(() => Date.now(), []);

  // Resume: открыть на первом неотвеченном вопросе (или 0 если все отвечены)
  const initialIndex = useMemo(() => {
    const idx = questions.findIndex(
      (q) => initialResponses[q.id] === undefined,
    );
    return idx === -1 ? 0 : idx;
  }, [questions, initialResponses]);

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const currentQuestion = questions[currentIndex];

  const totalAnswered = Object.keys(responses).length;
  const progress = Math.round((totalAnswered / questions.length) * 100);
  const isLastQuestion = currentIndex === questions.length - 1;
  const isAllAnswered = totalAnswered === questions.length;

  // Autosave при изменении ответа
  const handleAnswer = useCallback(
    (value: ResponseValue) => {
      if (!currentQuestion) return;
      const qid = currentQuestion.id;

      // Optimistic update
      setResponses((prev) => ({ ...prev, [qid]: value }));
      setSavingId(qid);

      startTransition(async () => {
        const result = await saveQuestionResponse(blockId, qid, value);
        setSavingId(null);
        if (!result.ok) {
          toast.error(`Не удалось сохранить ответ: ${result.error}`);
          return;
        }
        // Auto-advance: после короткой паузы на feedback
        setTimeout(() => {
          setCurrentIndex((i) => Math.min(i + 1, questions.length - 1));
        }, 280);
      });
    },
    [blockId, currentQuestion, questions.length],
  );

  // Keyboard nav
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && currentIndex > 0) {
        setCurrentIndex((i) => i - 1);
      } else if (e.key === "ArrowRight" && currentIndex < questions.length - 1) {
        // Только если на текущий есть ответ
        const qid = questions[currentIndex].id;
        if (responses[qid] !== undefined) {
          setCurrentIndex((i) => i + 1);
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [currentIndex, questions, responses]);

  const handleComplete = async () => {
    setIsCompleting(true);
    const elapsedSec = Math.round((Date.now() - startedAt) / 1000);
    const result = await completeBlock(blockId, elapsedSec);
    setIsCompleting(false);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(`Блок ${blockId} завершён!`);
    router.push(nextHref);
  };

  if (!currentQuestion) {
    return null;
  }

  const currentValue = responses[currentQuestion.id];

  return (
    <div className="dash-bg">
      {/* Header */}
      <div className="dash-hero">
        <div className="max-w-3xl mx-auto px-5 pt-8 pb-3 relative z-10">
          <div className="flex items-center justify-between mb-2">
            <p
              className="text-[11px] font-bold tracking-[0.18em] uppercase"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              Блок {blockId}
            </p>
            <div className="flex items-center gap-2 text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>
              {savingId && (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Сохранение
                </span>
              )}
              {!savingId && totalAnswered > 0 && (
                <span className="flex items-center gap-1.5">
                  <Check className="w-3 h-3" />
                  Сохранено
                </span>
              )}
            </div>
          </div>
          <h1
            className="text-2xl font-bold tracking-tight mb-3"
            style={{
              fontFamily: "var(--font-playfair), Georgia, serif",
              color: "hsl(40 33% 96%)",
            }}
          >
            {blockTitle}
          </h1>
          <div className="flex items-center gap-3 text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>
            <span className="font-mono">
              {currentIndex + 1} / {questions.length}
            </span>
            <div className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                className="h-full bg-emerald-400"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <span className="font-mono">{progress}%</span>
          </div>
        </div>
      </div>

      {/* Question card */}
      <main className="max-w-3xl mx-auto px-5 py-8 -mt-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.22 }}
            className="pc p-7 sm:p-8"
          >
            <p className="text-[11px] font-mono text-slate-400 mb-3">
              {currentQuestion.id}
            </p>

            {isForcedChoice(currentQuestion) && (
              <>
                <p className="text-base font-medium text-slate-700 mb-5">
                  Выберите утверждение, которое описывает вас точнее:
                </p>
                <ForcedChoiceCard
                  question={currentQuestion}
                  value={currentValue as "A" | "B" | undefined}
                  onSelect={handleAnswer}
                  disabled={isPending}
                />
              </>
            )}

            {isLikert(currentQuestion) && (
              <>
                <p className="text-lg leading-relaxed text-slate-800 mb-6">
                  {currentQuestion.text}
                </p>
                <LikertScale
                  value={currentValue as number | undefined}
                  onSelect={handleAnswer}
                  disabled={isPending}
                />
              </>
            )}

            {isScenarioPair(currentQuestion) && (
              <ScenarioPair
                question={currentQuestion}
                value={currentValue as "A" | "B" | undefined}
                onSelect={handleAnswer}
                disabled={isPending}
              />
            )}

            {isScenarioQuad(currentQuestion) && (
              <RankingCards
                context={currentQuestion.context}
                items={currentQuestion.options.map((o, i) => ({ index: i, text: o.text }))}
                value={currentValue as number[] | undefined}
                onChange={(ranks) => {
                  // auto-advance only when all ranked
                  setResponses((prev) => ({ ...prev, [currentQuestion.id]: ranks }));
                  if (ranks.every((r) => r > 0)) {
                    handleAnswer(ranks);
                  } else {
                    // partial — save without advance
                    setSavingId(currentQuestion.id);
                    startTransition(async () => {
                      await saveQuestionResponse(blockId, currentQuestion.id, ranks);
                      setSavingId(null);
                    });
                  }
                }}
                disabled={isPending}
              />
            )}

            {isForcedRankingTriad(currentQuestion) && (
              <RankingCards
                items={currentQuestion.options.map((o, i) => ({ index: i, text: o.text }))}
                value={currentValue as number[] | undefined}
                onChange={(ranks) => {
                  setResponses((prev) => ({ ...prev, [currentQuestion.id]: ranks }));
                  if (ranks.every((r) => r > 0)) {
                    handleAnswer(ranks);
                  } else {
                    setSavingId(currentQuestion.id);
                    startTransition(async () => {
                      await saveQuestionResponse(blockId, currentQuestion.id, ranks);
                      setSavingId(null);
                    });
                  }
                }}
                disabled={isPending}
              />
            )}

            {isSemanticDifferential(currentQuestion) && (
              <SemanticDifferential
                question={currentQuestion}
                value={currentValue as number | undefined}
                onSelect={handleAnswer}
                disabled={isPending}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            type="button"
            onClick={() => setCurrentIndex((i) => Math.max(i - 1, 0))}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Назад
          </button>

          {isLastQuestion ? (
            <button
              type="button"
              onClick={handleComplete}
              disabled={isCompleting || !isAllAnswered}
              className="px-5 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isCompleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Завершение
                </>
              ) : (
                <>
                  Завершить блок
                  <Check className="w-4 h-4" />
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={() =>
                setCurrentIndex((i) => Math.min(i + 1, questions.length - 1))
              }
              disabled={currentValue === undefined}
              className="flex items-center gap-2 text-sm text-slate-700 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Дальше
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Hint при незавершённом блоке */}
        {isLastQuestion && !isAllAnswered && (
          <p className="text-xs text-amber-700 text-center mt-4">
            Заполните все вопросы, чтобы завершить блок ({totalAnswered} из {questions.length})
          </p>
        )}
      </main>
    </div>
  );
}
