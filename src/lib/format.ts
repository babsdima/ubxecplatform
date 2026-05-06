/**
 * Форматирование данных для UI: деньги, даты, числа.
 *
 * Конвенции:
 * - Русские форматы: ₽ с пробелами в тысячах, DD.MM.YYYY
 * - Все функции возвращают string (или null если входные данные невалидны)
 */

const RU_NUMBER_FORMAT = new Intl.NumberFormat("ru-RU");
const RU_DATE_FORMAT = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

/**
 * Форматирует сумму в рублях: 15000000 → "15 000 000 ₽"
 */
export function formatMoneyRub(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || !Number.isFinite(amount)) {
    return "—";
  }
  return `${RU_NUMBER_FORMAT.format(amount)} ₽`;
}

/**
 * Компактный формат: 15000000 → "15 млн ₽", 1500000000 → "1.5 млрд ₽"
 */
export function formatMoneyRubCompact(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || !Number.isFinite(amount)) {
    return "—";
  }
  if (amount >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toFixed(1).replace(".0", "")} млрд ₽`;
  }
  if (amount >= 1_000_000) {
    return `${Math.round(amount / 1_000_000)} млн ₽`;
  }
  if (amount >= 1_000) {
    return `${Math.round(amount / 1_000)} тыс ₽`;
  }
  return `${amount} ₽`;
}

/**
 * Форматирует диапазон зарплаты: (15M, 25M) → "15–25 млн ₽"
 */
export function formatSalaryRange(min: number | null, max: number | null): string {
  if (!min && !max) return "—";
  if (min && max && min === max) return formatMoneyRubCompact(min);
  if (min && !max) return `от ${formatMoneyRubCompact(min)}`;
  if (!min && max) return `до ${formatMoneyRubCompact(max)}`;
  return `${formatMoneyRubCompact(min)} – ${formatMoneyRubCompact(max)}`;
}

/**
 * Форматирует дату: Date | string → "01.05.2026"
 */
export function formatDate(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return "—";
  return RU_DATE_FORMAT.format(date);
}

/**
 * Относительная дата: "сегодня", "вчера", "3 дня назад", "01.05.2026"
 */
export function formatRelativeDate(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return "—";

  const diff = Date.now() - date.getTime();
  const dayMs = 24 * 60 * 60 * 1000;
  const days = Math.floor(diff / dayMs);

  if (days < 1) return "сегодня";
  if (days === 1) return "вчера";
  if (days < 7) return `${days} ${declensionDays(days)} назад`;
  if (days < 30) return `${Math.floor(days / 7)} нед. назад`;
  return formatDate(date);
}

function declensionDays(n: number): string {
  // Русское склонение: 1 день, 2-4 дня, 5-20 дней
  const last = n % 10;
  const lastTwo = n % 100;
  if (lastTwo >= 11 && lastTwo <= 14) return "дней";
  if (last === 1) return "день";
  if (last >= 2 && last <= 4) return "дня";
  return "дней";
}

/**
 * Форматирует число: 1234 → "1 234"
 */
export function formatNumber(n: number | null | undefined): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return "—";
  return RU_NUMBER_FORMAT.format(n);
}

/**
 * Конвертация диапазона зарплаты ("15_25M") в человеческий формат.
 */
export function formatCompRange(range: string | null | undefined): string {
  if (!range) return "—";
  const map: Record<string, string> = {
    "5_10M": "5–10 млн ₽",
    "10_15M": "10–15 млн ₽",
    "15_25M": "15–25 млн ₽",
    "25_40M": "25–40 млн ₽",
    "40_60M": "40–60 млн ₽",
    "60M+": "60+ млн ₽",
  };
  return map[range] ?? range;
}

/**
 * P&L диапазон → человеческий
 */
export function formatPnl(range: string | null | undefined): string {
  if (!range) return "—";
  const map: Record<string, string> = {
    none: "Без P&L",
    "<500M": "< 500 млн ₽",
    "500M_2B": "500 млн – 2 млрд ₽",
    "2B_10B": "2 – 10 млрд ₽",
    "10B+": "> 10 млрд ₽",
  };
  return map[range] ?? range;
}

/**
 * Выручка компании → человеческий
 */
export function formatRevenue(range: string | null | undefined): string {
  if (!range) return "—";
  const map: Record<string, string> = {
    "<100M": "< 100 млн ₽",
    "100M_500M": "100 – 500 млн ₽",
    "500M_1B": "500 млн – 1 млрд ₽",
    "1B_5B": "1 – 5 млрд ₽",
    "5B_10B": "5 – 10 млрд ₽",
    "10B_50B": "10 – 50 млрд ₽",
    "50B+": "> 50 млрд ₽",
  };
  return map[range] ?? range;
}
