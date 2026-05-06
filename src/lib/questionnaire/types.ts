/**
 * GradeUp Questionnaire — Types
 *
 * Универсальные типы для всех 5 блоков опросника (A, B, C, D, E).
 * В Phase 2 используются только forced_choice и likert (Блоки A и B).
 * Остальные форматы добавятся в Phase 3.
 */

// ────────────────────────────────────────────────────────────────────
//  Question types
// ────────────────────────────────────────────────────────────────────

export type QuestionType =
  | "forced_choice"
  | "likert"
  | "forced_ranking_triad" // Block C
  | "forced_distribution" // Block E.1
  | "scenario_pair" // Block D
  | "scenario_quad" // Block D
  | "semantic_differential" // Block D
  | "multi_select" // Block E.2/E.3
  | "dropdown" // Block E.2/E.3
  | "text" // Block E.1 examples
  | "number"; // Block E.2

export type BlockId = "A" | "B" | "C" | "D" | "E1" | "E3";

// ────────────────────────────────────────────────────────────────────
//  Forced-choice (Block A, B): два варианта, кандидат выбирает один.
//  Каждый вариант относится к своей шкале (или полюсу одной шкалы).
// ────────────────────────────────────────────────────────────────────

export type ForcedChoiceOption = {
  /** Текст утверждения (от первого лица) */
  text: string;
  /** Шкала, в пользу которой засчитывается выбор (например "A1", "B2") */
  scale: string;
  /** "+" — выбор увеличивает шкалу; "-" — уменьшает (rare для FC, обычно "+") */
  direction?: "+" | "-";
};

export type ForcedChoiceQuestion = {
  id: string;
  type: "forced_choice";
  block: BlockId;
  /** Если оба options относятся к одной шкале с разными direction (полярные) */
  optionA: ForcedChoiceOption;
  optionB: ForcedChoiceOption;
};

// ────────────────────────────────────────────────────────────────────
//  Likert (Block A, B, C, D): шкала 1-5 («совсем не про меня» → «точно про меня»)
//  reverseScored: true → итоговое значение = 6 - raw
// ────────────────────────────────────────────────────────────────────

export type LikertQuestion = {
  id: string;
  type: "likert";
  block: BlockId;
  scale: string; // например "A1"
  text: string;
  reverseScored?: boolean;
};

// ────────────────────────────────────────────────────────────────────
//  Forced-ranking triad (Block C): три варианта, кандидат ранжирует 1/2/3
//  Каждый option относится к конкретному motivational driver.
// ────────────────────────────────────────────────────────────────────

export type TriadOption = {
  text: string;
  scale: string; // например "ACH", "POW"
};

export type ForcedRankingTriadQuestion = {
  id: string;
  type: "forced_ranking_triad";
  block: BlockId;
  options: [TriadOption, TriadOption, TriadOption];
};

// ────────────────────────────────────────────────────────────────────
//  Scenario pair / quad (Block D): варианты-сценарии, выбор одного / ranking
// ────────────────────────────────────────────────────────────────────

export type ScenarioOption = {
  text: string;
  scale: string; // например "D1" (clan), "D2" (market)
};

export type ScenarioPairQuestion = {
  id: string;
  type: "scenario_pair";
  block: BlockId;
  /** Контекст ситуации (опционально, отображается над вариантами) */
  context?: string;
  optionA: ScenarioOption;
  optionB: ScenarioOption;
};

export type ScenarioQuadQuestion = {
  id: string;
  type: "scenario_quad";
  block: BlockId;
  context?: string;
  options: [ScenarioOption, ScenarioOption, ScenarioOption, ScenarioOption];
};

// ────────────────────────────────────────────────────────────────────
//  Semantic differential (Block D): шкала 1-7 между двумя полюсами.
//  Полюс slider=1 → leftScale; slider=7 → rightScale.
//  Для шкал, где значение само по себе важно (D5/D6/D7/D8) — leftScale = rightScale,
//  но текст полюсов разный.
// ────────────────────────────────────────────────────────────────────

export type SemanticDifferentialQuestion = {
  id: string;
  type: "semantic_differential";
  block: BlockId;
  /** Шкала, в которую сохраняется значение 1-7 */
  scale: string;
  question: string; // вопрос, например "Мой стиль принятия решений:"
  leftLabel: string; // что на конце "1"
  rightLabel: string; // что на конце "7"
};

// ────────────────────────────────────────────────────────────────────
//  Union type для всех paginated question types (Блоки A, B, C, D)
// ────────────────────────────────────────────────────────────────────

export type Question =
  | ForcedChoiceQuestion
  | LikertQuestion
  | ForcedRankingTriadQuestion
  | ScenarioPairQuestion
  | ScenarioQuadQuestion
  | SemanticDifferentialQuestion;

// ────────────────────────────────────────────────────────────────────
//  Block описание
// ────────────────────────────────────────────────────────────────────

export type ScaleDef = {
  id: string; // "A1"
  nameRu: string; // "Эмоциональная устойчивость"
  shortDescription: string; // 1-line описание для introductions / результатов
};

export type QuestionnaireBlock = {
  id: BlockId;
  title: string;
  description: string;
  estimatedMinutes: [number, number]; // [min, max]
  scales: ScaleDef[];
  questions: Question[];
};

// ────────────────────────────────────────────────────────────────────
//  Response shape (как сохраняем в DB, JSON в QuestionnaireResponse.responses)
// ────────────────────────────────────────────────────────────────────

/**
 * Карта: questionId → значение ответа.
 *
 * Форматы значений по типу вопроса:
 * - forced_choice:           "A" | "B"
 * - likert:                  number 1-5 (raw)
 * - forced_ranking_triad:    [number, number, number] — индексы options после ranking; [1,2,3] = первый вариант на 1 месте
 * - scenario_pair:           "A" | "B"
 * - scenario_quad:           [number, number, number, number] — ranks 1-4
 * - semantic_differential:   number 1-7
 */
export type ResponsesMap = Record<string, ResponseValue>;

export type ResponseValue = string | number | number[];

// ────────────────────────────────────────────────────────────────────
//  Raw scores (после scoring блока, перед нормализацией в стены)
// ────────────────────────────────────────────────────────────────────

export type RawScores = Record<string, number>; // {A1: 11, A2: 9, ...}

// ────────────────────────────────────────────────────────────────────
//  Helpers
// ────────────────────────────────────────────────────────────────────

export function isForcedChoice(q: Question): q is ForcedChoiceQuestion {
  return q.type === "forced_choice";
}

export function isLikert(q: Question): q is LikertQuestion {
  return q.type === "likert";
}

export function isForcedRankingTriad(
  q: Question,
): q is ForcedRankingTriadQuestion {
  return q.type === "forced_ranking_triad";
}

export function isScenarioPair(q: Question): q is ScenarioPairQuestion {
  return q.type === "scenario_pair";
}

export function isScenarioQuad(q: Question): q is ScenarioQuadQuestion {
  return q.type === "scenario_quad";
}

export function isSemanticDifferential(
  q: Question,
): q is SemanticDifferentialQuestion {
  return q.type === "semantic_differential";
}
