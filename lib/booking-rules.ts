import { getISOWeek, getISOWeekYear, parseISO } from "date-fns";

export const BOOKING_RULES = {
  MAX_PER_DAY: 1,
  MAX_PER_WEEK: 2,
} as const;

/**
 * Returnerer ISO uge-nøgle: "2024-W33"
 */
export function getWeekKey(date: string): string {
  const parsed = parseISO(date);
  const week = getISOWeek(parsed);
  const year = getISOWeekYear(parsed);
  return `${year}-W${String(week).padStart(2, "0")}`;
}

/**
 * Tjekker om en dag allerede er fuldt booket (max 1 pr. dag).
 */
export function isDayFull(
  date: string,
  confirmedBookingDates: string[]
): boolean {
  return confirmedBookingDates.filter((d) => d === date).length >= BOOKING_RULES.MAX_PER_DAY;
}

/**
 * Tjekker om en uge allerede er fuldt booket (max 2 pr. uge).
 */
export function isWeekFull(
  date: string,
  confirmedBookingDates: string[]
): boolean {
  const weekKey = getWeekKey(date);
  const bookingsThisWeek = confirmedBookingDates.filter(
    (d) => getWeekKey(d) === weekKey
  );
  return bookingsThisWeek.length >= BOOKING_RULES.MAX_PER_WEEK;
}
