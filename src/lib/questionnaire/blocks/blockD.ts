/**
 * Block D — Culture & Working Style
 *
 * D.1 — Культурные предпочтения (Cameron-Quinn): 4 типа (Clan, Market, Adhocracy, Hierarchy)
 *   - 8 сценарных пар (по 2 на тип)
 *   - 3 сценарные четвёрки (все 4 конкурируют)
 *   - 4 Likert (по 1 на тип)
 *
 * D.2 — Рабочий стиль: 4 шкалы (pace, structure, risk, focus)
 *   - 8 semantic differential (2 на шкалу)
 *   - 4 Likert (1 на шкалу)
 *
 * Источник: Questionnaire_Blocks_CD_v1.md (Methodology v1).
 */

import type { Question, QuestionnaireBlock } from "../types";
import { SCALES_D } from "./scales";

const QUESTIONS: Question[] = [
  // ─────────────── D.1 Сценарные пары ───────────────
  {
    id: "SD-D1-01",
    type: "scenario_pair",
    block: "D",
    context: "Вы только что стали CEO. На стратегической сессии — что ставите первым?",
    optionA: { text: "Построить сильную команду и создать атмосферу доверия", scale: "D1" },
    optionB: { text: "Определить амбициозные цели по выручке и доле рынка", scale: "D2" },
  },
  {
    id: "SD-D1-02",
    type: "scenario_pair",
    block: "D",
    context: "Компания в кризисе. Нужно сократить бюджет на 20%. Ваш подход:",
    optionA: { text: "Обсудить с командой и вместе определить приоритеты", scale: "D1" },
    optionB: { text: "Быстро принять решение на основе данных и объявить команде", scale: "D2" },
  },
  {
    id: "SD-D2-01",
    type: "scenario_pair",
    block: "D",
    context: "Как вы определяете успех руководителя?",
    optionA: { text: "По измеримым бизнес-результатам: выручка, прибыль, доля рынка", scale: "D2" },
    optionB: { text: "По тому, насколько его команда инновационна и способна работать без него", scale: "D3" },
  },
  {
    id: "SD-D2-02",
    type: "scenario_pair",
    block: "D",
    context: "Два кандидата: один мягкий с отличными отношениями, другой жёсткий с выдающимися результатами. Кого выберете?",
    optionA: { text: "С выдающимися результатами", scale: "D2" },
    optionB: { text: "С отличными отношениями — в долгосрочной перспективе команда важнее", scale: "D1" },
  },
  {
    id: "SD-D3-01",
    type: "scenario_pair",
    block: "D",
    context: "Стратегия на 3 года:",
    optionA: { text: "Масштабировать то, что работает, и довести до совершенства", scale: "D4" },
    optionB: { text: "Рискнуть и выйти в новый сегмент, даже если не всё понятно", scale: "D3" },
  },
  {
    id: "SD-D3-02",
    type: "scenario_pair",
    block: "D",
    context: "Сотрудник предложил рискованную, но потенциально прорывную идею:",
    optionA: { text: "Дать ресурсы на эксперимент — даже если 70% провалятся, 30% окупят", scale: "D3" },
    optionB: { text: "Запросить детальный бизнес-кейс и только потом решать", scale: "D4" },
  },
  {
    id: "SD-D4-01",
    type: "scenario_pair",
    block: "D",
    context: "Вы перестраиваете процессы:",
    optionA: { text: "Задокументирую всё, определю KPI и зоны ответственности", scale: "D4" },
    optionB: { text: "Соберу команду лидеров и дам им свободу выстроить процессы", scale: "D1" },
  },
  {
    id: "SD-D4-02",
    type: "scenario_pair",
    block: "D",
    context: "Коллега предлагает «просто попробовать» без плана:",
    optionA: { text: "Это нормально — лучше быстро проверить гипотезу", scale: "D3" },
    optionB: { text: "Без плана запускать что-либо — пустая трата ресурсов", scale: "D4" },
  },

  // ─────────────── D.1 Сценарные четвёрки ───────────────
  {
    id: "SQ-01",
    type: "scenario_quad",
    block: "D",
    context: "Главный признак здоровой компании?",
    options: [
      { text: "Люди доверяют друг другу и готовы помогать", scale: "D1" },
      { text: "Компания стабильно побеждает конкурентов", scale: "D2" },
      { text: "Компания создаёт прорывные продукты", scale: "D3" },
      { text: "Процессы работают как часы", scale: "D4" },
    ],
  },
  {
    id: "SQ-02",
    type: "scenario_quad",
    block: "D",
    context: "За что вы бы уволили топ-менеджера?",
    options: [
      { text: "За токсичную атмосферу и разрушение команды", scale: "D1" },
      { text: "За систематическое невыполнение бизнес-целей", scale: "D2" },
      { text: "За сопротивление изменениям и убийство инноваций", scale: "D3" },
      { text: "За хаос в процессах и отсутствие контроля", scale: "D4" },
    ],
  },
  {
    id: "SQ-03",
    type: "scenario_quad",
    block: "D",
    context: "Идеальный CEO — это:",
    options: [
      { text: "Наставник, который развивает людей и строит культуру", scale: "D1" },
      { text: "Жёсткий стратег, который добивается результатов", scale: "D2" },
      { text: "Визионер, который ведёт в неизведанное", scale: "D3" },
      { text: "Системный управленец, который строит машину без сбоев", scale: "D4" },
    ],
  },

  // ─────────────── D.1 Likert (4 — по одному на тип) ───────────────
  { id: "LK-D-D1-01", type: "likert", block: "D", scale: "D1", text: "Для меня идеальная компания — та, где люди искренне заботятся друг о друге, а не только о KPI" },
  { id: "LK-D-D2-01", type: "likert", block: "D", scale: "D2", text: "Здоровая внутренняя конкуренция в компании — двигатель роста" },
  { id: "LK-D-D3-01", type: "likert", block: "D", scale: "D3", text: "Лучшие компании — те, которые готовы каннибализировать свой продукт ради будущего" },
  { id: "LK-D-D4-01", type: "likert", block: "D", scale: "D4", text: "Хорошая организация — та, где каждый чётко понимает свою роль и правила" },

  // ─────────────── D.2 Semantic Differential (8) ───────────────
  // Pace
  {
    id: "SD-PACE-01",
    type: "semantic_differential",
    block: "D",
    scale: "pace",
    question: "Мой стиль принятия решений:",
    leftLabel: "Быстро, на основе 60–70% информации",
    rightLabel: "Обстоятельно, собрав максимум данных",
  },
  {
    id: "SD-PACE-02",
    type: "semantic_differential",
    block: "D",
    scale: "pace",
    question: "На стратегической сессии я скорее:",
    leftLabel: "Предлагаю «давайте попробуем»",
    rightLabel: "Предлагаю «давайте сначала разберёмся»",
  },
  // Structure
  {
    id: "SD-STR-01",
    type: "semantic_differential",
    block: "D",
    scale: "structure",
    question: "Мне комфортнее в организации:",
    leftLabel: "Где роли гибкие и каждый берёт нужное",
    rightLabel: "Где каждый чётко знает свою зону",
  },
  {
    id: "SD-STR-02",
    type: "semantic_differential",
    block: "D",
    scale: "structure",
    question: "Планирование для меня:",
    leftLabel: "Примерный вектор с корректировкой по ходу",
    rightLabel: "Детальный план с milestone'ами",
  },
  // Risk
  {
    id: "SD-RSK-01",
    type: "semantic_differential",
    block: "D",
    scale: "risk",
    question: "При выборе стратегии ориентируюсь:",
    leftLabel: "На потенциальный upside, даже если риски высоки",
    rightLabel: "На минимизацию downside",
  },
  {
    id: "SD-RSK-02",
    type: "semantic_differential",
    block: "D",
    scale: "risk",
    question: "Ошибки для меня:",
    leftLabel: "Нормальная часть роста; лучше ошибаться быстро",
    rightLabel: "Сигнал о недостаточной подготовке",
  },
  // Focus
  {
    id: "SD-FOC-01",
    type: "semantic_differential",
    block: "D",
    scale: "focus",
    question: "Большую часть времени предпочитаю тратить:",
    leftLabel: "На встречи с клиентами, партнёрами и рынком",
    rightLabel: "На работу с командой и внутренней эффективностью",
  },
  {
    id: "SD-FOC-02",
    type: "semantic_differential",
    block: "D",
    scale: "focus",
    question: "Главный источник конкурентного преимущества:",
    leftLabel: "Понимание рынка лучше конкурентов",
    rightLabel: "Сильная команда и выстроенные процессы",
  },

  // (D.2 Likert убраны — semantic differential 1-7 даёт чистый scale-score
  //  без необходимости агрегации с Likert 1-5)
];

export const BLOCK_D: QuestionnaireBlock = {
  id: "D",
  title: "Блок D — Культура и стиль",
  description:
    "В какой среде вы продуктивнее всего работаете? Этот блок измеряет ваши предпочтения по типу культуры (Cameron-Quinn 4 квадранта) и рабочему стилю — для матчинга с компаниями.",
  estimatedMinutes: [5, 7],
  scales: SCALES_D,
  questions: QUESTIONS,
};
