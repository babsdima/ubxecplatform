/**
 * Генерация интерпретаций scaleScore для Development Snapshot.
 *
 * Деривация автоматических insights:
 * - top strengths из A-stens (>= 7)
 * - dev areas из B-stens (>= 7) и E.1 bottom 5
 * - культурный профиль (доминирующий квадрант)
 * - риск-зоны для делегирования / стиля управления
 *
 * Используется на /candidate/results.
 */

import { SCALES_A, SCALES_B } from "@/lib/questionnaire/blocks/scales";

export type Insight = {
  area: string;
  detail: string;
  action?: string;
};

export type StrengthsAndGrowth = {
  strengths: string[];
  growthAreas: Insight[];
  dominantCulture: { type: string; pct: number; description: string } | null;
};

const A_STRENGTH_TEXT: Record<string, string> = {
  A1: "Эмоциональная устойчивость — команда воспринимает вас как опору в кризисе",
  A2: "Высокая целеустремлённость и лидерская энергия",
  A3: "Сильная социальная энергия — комфорт в external-facing задачах",
  A4: "Эмпатия и дипломатичность — выстраиваете тёплые рабочие отношения",
  A5: "Дисциплина и системность — наводите порядок в процессах",
  A6: "Стратегическое мышление и любопытство — видите большую картину",
  A7: "Активная ориентация на обучение и рефлексию",
  A8: "Жёсткость и прямота — способны на непопулярные решения",
  A9: "Уверенность и влияние — отстаиваете позицию",
  A10: "Адаптивность — комфортны в неопределённости",
};

const B_GROWTH_DETAIL: Record<string, string> = {
  B1: "Реактивность — эмоциональные реакции под давлением могут влиять на команду",
  B2: "Замкнутость — в стрессе становитесь менее доступным",
  B3: "Конфронтация — склонность к чрезмерной критичности или подозрительности",
  B4: "Самопродвижение — потребность в признании может перевешивать командные интересы",
  B5: "Перфекционизм — риск микроменеджмента и боттлнека на себе",
  B6: "Конформность — может быть сложно отстаивать позицию перед руководством",
};

const B_GROWTH_ACTION: Record<string, string> = {
  B1: "Практика: 24-часовая пауза перед эмоциональными кадровыми решениями. Регулярный coaching по управлению стрессом.",
  B2: "Установите ритуал ежедневной 15-мин 1:1 с key team members в стрессовые периоды.",
  B3: "Делегируйте проверку работы — назначьте «доверенного редактора» вместо самопроверки. Тренируйте «принять допустимое качество».",
  B4: "Практика «команда первая»: на следующих 5 публичных выступлениях именно команда представляет результаты.",
  B5: "Определите 3 решения/неделю, которые передаёте без финальной проверки. Executive coaching с фокусом на делегирование.",
  B6: "Тренируйтесь формулировать несогласие в 1 предложении на каждой сессии с board. Поддержка mentor с executive опытом.",
};

const E1_GROWTH_TEXT: Record<string, string> = {
  "E1.01": "Стратегическое видение — formulate vision на 5+ лет",
  "E1.02": "Системное мышление — видение взаимосвязей между функциями",
  "E1.03": "Принятие решений в неопределённости — комфорт с 50–60% информации",
  "E1.04": "Финансовая грамотность и P&L management",
  "E1.05": "Построение и развитие команды",
  "E1.06": "Управление эффективностью — culture of accountability",
  "E1.07": "Влияние и stakeholder management — board и инвесторы",
  "E1.08": "Коммуникация и вдохновение организации",
  "E1.09": "Управление изменениями и трансформациями",
  "E1.10": "Операционная эффективность и масштабируемые процессы",
  "E1.11": "Ориентация на клиента и понимание рынка",
  "E1.12": "Инновации и цифровая трансформация",
  "E1.13": "Самоосознанность и обучаемость",
  "E1.14": "Устойчивость и управление энергией",
  "E1.15": "Этика и integrity",
};

const CULTURE_DESC: Record<string, string> = {
  D1: "Клан — продуктивны в среде с акцентом на людях, доверии, менторстве",
  D2: "Рынок — продуктивны в результат-ориентированной, конкурентной среде",
  D3: "Адхократия — продуктивны в инновационной, экспериментальной среде",
  D4: "Иерархия — продуктивны в структурированной, процессной среде",
};

const CULTURE_NAME: Record<string, string> = {
  D1: "Клан",
  D2: "Рынок",
  D3: "Адхократия",
  D4: "Иерархия",
};

export function deriveStrengthsAndGrowth(input: {
  aStens: Record<string, number> | null;
  bStens: Record<string, number> | null;
  e1Distribution: { top5: string[]; middle5: string[]; bottom5: string[] } | null;
  dCulturePct: { D1: number; D2: number; D3: number; D4: number } | null;
}): StrengthsAndGrowth {
  const strengths: string[] = [];
  const growthAreas: Insight[] = [];

  // Strengths из A: top 3 шкал >= 7
  if (input.aStens) {
    const sorted = SCALES_A.map((s) => ({
      id: s.id,
      score: input.aStens![s.id] ?? 5,
    }))
      .filter((s) => s.score >= 7)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
    for (const s of sorted) {
      const txt = A_STRENGTH_TEXT[s.id];
      if (txt) strengths.push(txt);
    }
  }

  // Strengths из E.1 top 5 — добавляем top 1-2 из top5 (если ещё мало стренгсов)
  if (input.e1Distribution?.top5 && strengths.length < 4) {
    for (const compId of input.e1Distribution.top5.slice(0, 2)) {
      const txt = E1_GROWTH_TEXT[compId];
      if (txt) strengths.push(`Самооценка: ${txt}`);
      if (strengths.length >= 4) break;
    }
  }

  // Growth: B-стены >= 7 (с recommendations)
  if (input.bStens) {
    for (const s of SCALES_B) {
      const score = input.bStens[s.id] ?? 5;
      if (score >= 7) {
        growthAreas.push({
          area: s.nameRu,
          detail: B_GROWTH_DETAIL[s.id] ?? "",
          action: B_GROWTH_ACTION[s.id],
        });
      }
    }
  }

  // Growth: E.1 bottom 5 — критичные из них для C-level
  const CRITICAL_BOTTOM = ["E1.07", "E1.09", "E1.04", "E1.01"];
  if (input.e1Distribution?.bottom5) {
    for (const compId of input.e1Distribution.bottom5) {
      if (CRITICAL_BOTTOM.includes(compId)) {
        growthAreas.push({
          area: E1_GROWTH_TEXT[compId] ?? compId,
          detail: "Вы определили эту компетенцию как зону развития. Для большинства C-level ролей она критична.",
          action:
            "Executive coaching, целевые stretch-assignments или executive education program (IMD, Сколково, INSEAD).",
        });
      }
    }
  }

  // Доминирующая культура
  let dominantCulture: StrengthsAndGrowth["dominantCulture"] = null;
  if (input.dCulturePct) {
    const types = Object.entries(input.dCulturePct).sort(
      ([, a], [, b]) => b - a,
    );
    const [topType, topPct] = types[0];
    dominantCulture = {
      type: CULTURE_NAME[topType] ?? topType,
      pct: topPct,
      description: CULTURE_DESC[topType] ?? "",
    };
  }

  return { strengths, growthAreas, dominantCulture };
}
