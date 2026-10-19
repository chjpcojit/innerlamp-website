import type { CalendarListItem, HomeBlockMonth } from '$lib/types/calendar';
import { compareOccurrences } from './calendar-order';

/** Rows per month card. */
export const HOME_BLOCK_ROWS = 3;
/** Month cards in the block: the current month only (owner decision 2026-10-18). */
export const HOME_BLOCK_MONTHS = 1;

/**
 * Rows of one month card: the occurrences of that month, every group (no group filter), not past
 * (`solar_date >= today`, `YYYY-MM-DD`), nearest first in BR-CAL-12 order, at most
 * `HOME_BLOCK_ROWS` (owner decision 2026-10-18, replaces the BR-CAL-15 tiers and its Buddhist-only
 * filter). `more` is the month's total minus the rows shown, days already passed included: 6 in the month, 3 shown
 * → 3.
 */
export function pickHomeRows(
	monthItems: CalendarListItem[],
	today: string
): { shown: CalendarListItem[]; more: number } {
	const shown = monthItems
		.filter((item) => item.solar_date >= today)
		.sort(compareOccurrences)
		.slice(0, HOME_BLOCK_ROWS);
	return { shown, more: monthItems.length - shown.length };
}

/** Month cards from `start` (year, month 1–12) for `months` months, crossing the year end. */
export function buildHomeBlock(
	items: CalendarListItem[],
	start: { year: number; month: number },
	today: string,
	months = HOME_BLOCK_MONTHS
): HomeBlockMonth[] {
	return Array.from({ length: months }, (_, i) => {
		const index = start.year * 12 + (start.month - 1) + i;
		const year = Math.floor(index / 12);
		const month = (index % 12) + 1;
		const prefix = `${year}-${String(month).padStart(2, '0')}-`;
		const { shown, more } = pickHomeRows(
			items.filter((e) => e.solar_date.startsWith(prefix)),
			today
		);
		return { year, month, shown, more, failed: false };
	});
}
